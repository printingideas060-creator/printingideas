const HEADER_ALIASES = {
  date: ["date", "sale date", "sales date", "transaction date"],
  service: ["service", "item", "product", "service type", "item name"],
  description: ["description", "details", "particulars", "remarks"],
  quantity: ["quantity", "qty", "units", "count"],
  priceEach: ["price each", "unit price", "price per unit", "rate", "price"],
  total: ["total", "amount", "sales amount", "subtotal"],
  paid: ["paid", "payment status", "status"],
};

function normalizeHeader(value) {
  return String(value ?? "").trim().toLowerCase().replace(/[^a-z0-9]+/g, " ");
}

function findHeaderRow(rows) {
  const aliases = new Set(Object.values(HEADER_ALIASES).flat());
  let bestIndex = -1;
  let bestScore = 0;

  rows.slice(0, 15).forEach((row, index) => {
    const score = row.reduce((count, cell) => count + (aliases.has(normalizeHeader(cell)) ? 1 : 0), 0);
    if (score > bestScore) {
      bestScore = score;
      bestIndex = index;
    }
  });

  return bestScore >= 3 ? bestIndex : -1;
}

function findColumn(headers, field) {
  const aliases = HEADER_ALIASES[field];
  return headers.findIndex((header) => aliases.includes(normalizeHeader(header)));
}

function parseDate(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
  }
  if (typeof value === "number") {
    const parsed = new Date(Date.UTC(1899, 11, 30) + value * 24 * 60 * 60 * 1000);
    if (!Number.isNaN(parsed.getTime())) {
      return `${parsed.getUTCFullYear()}-${String(parsed.getUTCMonth() + 1).padStart(2, "0")}-${String(parsed.getUTCDate()).padStart(2, "0")}`;
    }
  }

  const text = String(value ?? "").trim();
  const isoDate = text.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (isoDate) return `${isoDate[1]}-${String(isoDate[2]).padStart(2, "0")}-${String(isoDate[3]).padStart(2, "0")}`;
  const localDate = text.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (localDate) return `${localDate[3]}-${String(localDate[1]).padStart(2, "0")}-${String(localDate[2]).padStart(2, "0")}`;
  return "";
}

function parseNumber(value) {
  if (typeof value === "number") return value;
  const normalized = String(value ?? "").replace(/[₱$,\s]/g, "").trim();
  return normalized ? Number(normalized) : Number.NaN;
}

function parsePaid(value) {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (["no", "n", "unpaid", "pending", "false"].includes(normalized)) return false;
  if (["yes", "y", "paid", "true"].includes(normalized)) return true;
  return true;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (character === '"') {
      if (quoted && text[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && text[index + 1] === "\n") index += 1;
      row.push(cell);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += character;
    }
  }

  if (quoted) throw new Error("The CSV file contains an unterminated quoted value.");
  row.push(cell);
  if (row.some((value) => value.trim())) rows.push(row);
  return rows;
}

export async function parseSalesSheet(file) {
  const isCsv = /\.csv$/i.test(file.name);
  let sheetRows;
  if (isCsv) {
    sheetRows = parseCsv((await file.text()).replace(/^\uFEFF/, ""));
  } else if (/\.xlsx$/i.test(file.name)) {
    const { default: readExcelFile } = await import("read-excel-file/browser");
    const workbook = await readExcelFile(file);
    const salesSheets = workbook.filter(({ sheet }) => /sales/i.test(sheet));

    if (salesSheets.length !== 1) {
      throw new Error(salesSheets.length
        ? "The workbook has multiple sheets with “sales” in the name. Keep only one sales sheet and try again."
        : "No sheet with “sales” in its name was found. Upload the workbook or export the Sales sheet as a CSV file.");
    }
    sheetRows = salesSheets[0].data;
  } else {
    throw new Error("Choose an Excel workbook (.xlsx) or a CSV file exported from the Sales sheet.");
  }

  const headerIndex = findHeaderRow(sheetRows);
  if (headerIndex < 0) {
    throw new Error("Could not identify the sales columns. Include headers for date, service or description, quantity, and price or total.");
  }

  const headers = sheetRows[headerIndex];
  const columns = Object.fromEntries(
    Object.keys(HEADER_ALIASES).map((field) => [field, findColumn(headers, field)]),
  );
  const hasServiceOrDescription = columns.service >= 0 || columns.description >= 0;
  if (
    columns.date < 0
    || columns.quantity < 0
    || (columns.priceEach < 0 && columns.total < 0)
    || !hasServiceOrDescription
  ) {
    throw new Error("The Sales sheet must have date, service or description, quantity, and price or total columns.");
  }

  const sales = sheetRows.slice(headerIndex + 1).flatMap((row, index) => {
    if (!row.some((cell) => String(cell ?? "").trim())) return [];

    const date = parseDate(row[columns.date]);
    const quantity = parseNumber(row[columns.quantity]);
    const total = columns.total >= 0 ? parseNumber(row[columns.total]) : Number.NaN;
    const priceEach = columns.priceEach >= 0
      ? parseNumber(row[columns.priceEach])
      : total / quantity;
    const serviceValue = columns.service >= 0 ? String(row[columns.service] ?? "").trim() : "";
    const descriptionValue = columns.description >= 0 ? String(row[columns.description] ?? "").trim() : "";
    const service = serviceValue || descriptionValue;
    const description = descriptionValue || serviceValue;

    if (!date || !service || !Number.isInteger(quantity) || quantity <= 0 || !Number.isFinite(priceEach) || priceEach < 0) {
      throw new Error(`Invalid sales data on row ${headerIndex + index + 2}. Check the date, service, quantity, and price values.`);
    }

    return [{
      date,
      service,
      description,
      quantity,
      priceEach,
      paid: columns.paid >= 0 ? parsePaid(row[columns.paid]) : true,
    }];
  });

  if (!sales.length) throw new Error("The Sales sheet has no sales rows to import.");
  return sales;
}
