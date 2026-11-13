export const INITIAL_SUPPLIES = [
  { name: "Ink GI-790 Set", price: 1556 },
  { name: "A4 Paper", price: 300 },
  { name: "Short Paper", price: 300 },
  { name: "Long Paper", price: 300 },
  { name: "Satin RC Photo", price: 400 },
  { name: "Glossy Photo", price: 400 },
  { name: "Matte Sticker", price: 400 },
];

export const INITIAL_SERVICES = [
  { name: "Print", price: 4 },
  { name: "Xerox", price: 3 },
  { name: "Scan", price: 15 },
  { name: "Photo Print", price: 20 },
  { name: "Resume Making", price: 30 },
  { name: "Other", price: 5 },
];

// Examples only; no source spreadsheet was present in the workspace.
export const SAMPLE_NOVEMBER_SALES = [
  { id: "sample-print-1", date: "2026-11-02", service: "Print", description: "Sample ledger entry", quantity: 25, priceEach: 4, paid: true },
  { id: "sample-xerox-1", date: "2026-11-03", service: "Xerox", description: "Sample ledger entry", quantity: 18, priceEach: 3, paid: true },
  { id: "sample-resume-1", date: "2026-11-04", service: "Resume Making", description: "Sample ledger entry", quantity: 1, priceEach: 30, paid: false },
];

export const INITIAL_TRENDS = [
  {
    id: "die-cut-stickers",
    title: "Die-Cut Glossy Stickers",
    category: "Small-batch favorite",
    materials: "135gsm photo sticker + cold laminates",
    weight: 135,
    paperCost: 9,
    inkCost: 4,
    srp: 35,
    preset: "Photo Paper Plus Glossy II",
    quality: "High",
    colorPreset: "Vivid",
    searchInterest: { shopee: 78, tiktok: 84 },
    note: "Let the ink dry fully before applying a cold laminate, then cut.",
  },
  {
    id: "photocards",
    title: "K-Pop / Event Photocards",
    category: "Events & fandom",
    materials: "230gsm double-sided glossy + 3D star top",
    weight: 230,
    paperCost: 10,
    inkCost: 5,
    srp: 50,
    preset: "Photo Paper Plus Glossy II",
    quality: "High",
    colorPreset: "Vivid",
    searchInterest: { shopee: 92, tiktok: 96 },
    note: "Test duplex alignment on plain paper before printing final batches.",
  },
  {
    id: "memo-pads",
    title: "Aesthetic Memo Pads",
    category: "Desk & stationery",
    materials: "80gsm bond paper + padding glue",
    weight: 80,
    paperCost: 2,
    inkCost: 1,
    srp: 25,
    preset: "Plain Paper",
    quality: "Standard",
    colorPreset: "Neutral",
    searchInterest: { shopee: 72, tiktok: 79 },
    note: "Align a printed stack and bind one edge with padding glue.",
  },
  {
    id: "card-skins",
    title: "Custom Card Skins / Decals",
    category: "Personalized accessories",
    materials: "Vinyl sticker + matte laminate",
    weight: 135,
    paperCost: 8,
    inkCost: 4,
    srp: 45,
    preset: "Photo Paper Plus Glossy II",
    quality: "High",
    colorPreset: "Neutral",
    searchInterest: { shopee: 74, tiktok: 88 },
    note: "Confirm the printable vinyl is compatible with inkjet printers.",
  },
];

export const PRINTER_PAYMENT = 1700;
export const MAX_MEDIA_WEIGHT = 275;
