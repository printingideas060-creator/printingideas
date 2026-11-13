import { useRef, useState } from "react";
import { Plus, ReceiptText, Trash2, Upload } from "lucide-react";
import AddSalesModal from "./AddSalesModal";
import { useAppContext } from "../../context/AppContext";
import { parseSalesSheet } from "../../utils/salesImport";

const money = (amount) => new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  maximumFractionDigits: 2,
}).format(Number(amount) || 0);

export default function SalesLogTable({ month }) {
  const { sales, services, addSale, importSales, toggleSalePaid, deleteSale } = useAppContext();
  const [modalOpen, setModalOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState("");
  const [importError, setImportError] = useState("");
  const fileInputRef = useRef(null);
  const monthlySales = sales.filter((sale) => sale.date?.slice(0, 7) === month);

  async function handleImport(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setImporting(true);
    setImportMessage("");
    setImportError("");
    try {
      const importedSales = await parseSalesSheet(file);
      await importSales(importedSales);
      setImportMessage(`Imported ${importedSales.length} sales from the Sales sheet.`);
    } catch (error) {
      console.error("Could not import the sales spreadsheet.", error);
      setImportError(error instanceof Error ? error.message : "Could not import the sales spreadsheet.");
    } finally {
      setImporting(false);
    }
  }

  return (
    <>
      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 p-5">
          <div>
            <h2 className="text-lg font-bold">Sales Log</h2>
            <p className="mt-1 text-sm text-slate-400">Quick entry, payment status, and monthly sales.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.csv"
              onChange={handleImport}
              className="hidden"
              aria-label="Upload sales spreadsheet"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-emerald-400 disabled:cursor-wait disabled:opacity-50"
            >
              <Upload size={16} /> {importing ? "Importing…" : "Import sales sheet"}
            </button>
            <button onClick={() => setModalOpen(true)} className="inline-flex items-center gap-2 rounded-lg bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300">
              <Plus size={16} /> Add sale
            </button>
          </div>
        </div>
        {(importMessage || importError) && (
          <p role={importError ? "alert" : "status"} className={`border-b border-slate-800 px-5 py-3 text-sm ${importError ? "text-rose-300" : "text-emerald-300"}`}>
            {importError || importMessage}
          </p>
        )}
        <p className="border-b border-slate-800 px-5 py-3 text-xs text-slate-500">
          Upload an .xlsx workbook to import only its Sales sheet, or a CSV exported from that sheet. Imported sales are added to the existing log.
        </p>
        {monthlySales.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <ReceiptText className="mx-auto text-slate-600" size={30} />
            <p className="mt-3 font-medium text-slate-300">No sales for this month yet</p>
            <p className="mt-1 text-sm text-slate-500">Add a sale to start tracking your ledger.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-950/60 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Service / Description</th>
                  <th className="px-5 py-3 text-right font-medium">Qty</th>
                  <th className="px-5 py-3 text-right font-medium">Price each</th>
                  <th className="px-5 py-3 text-right font-medium">Total</th>
                  <th className="px-5 py-3 text-center font-medium">Payment</th>
                  <th className="px-5 py-3 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {monthlySales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-800/30">
                    <td className="whitespace-nowrap px-5 py-4 text-slate-400">{sale.date}</td>
                    <td className="px-5 py-4">
                      <span className="font-medium text-slate-100">{sale.service}</span>
                      <span className="ml-2 text-slate-500">{sale.description}</span>
                    </td>
                    <td className="px-5 py-4 text-right text-slate-300">{sale.quantity}</td>
                    <td className="px-5 py-4 text-right text-slate-300">{money(sale.priceEach)}</td>
                    <td className="px-5 py-4 text-right font-semibold text-slate-100">{money(Number(sale.quantity) * Number(sale.priceEach))}</td>
                    <td className="px-5 py-4 text-center">
                      <button onClick={() => toggleSalePaid(sale.id)} className={`rounded-full border px-3 py-1 text-xs font-medium transition ${sale.paid ? "border-emerald-500/30 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/20" : "border-amber-500/30 bg-amber-400/10 text-amber-300 hover:bg-amber-400/20"}`}>
                        {sale.paid ? "Paid · Y" : "Unpaid · N"}
                      </button>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button onClick={() => deleteSale(sale.id)} className="rounded-lg p-2 text-slate-500 hover:bg-rose-400/10 hover:text-rose-300" aria-label={`Delete ${sale.description}`}>
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {sales.some((sale) => String(sale.id).startsWith("sample-")) && (
          <p className="border-t border-slate-800 px-5 py-3 text-xs text-slate-500">November 2026 entries are examples because no spreadsheet was supplied. Replace or delete as needed.</p>
        )}
      </section>
      {modalOpen && <AddSalesModal services={services} onClose={() => setModalOpen(false)} onAdd={addSale} />}
    </>
  );
}
