import { useMemo } from "react";
import { CalendarDays, Check, Printer, ReceiptText, TrendingUp } from "lucide-react";
import { PRINTER_PAYMENT } from "../../data/initialData";

const money = (amount) => new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  maximumFractionDigits: 2,
}).format(Number(amount) || 0);

function SummaryCard({ label, value, detail, icon: Icon, tone = "emerald" }) {
  const tones = {
    emerald: "text-emerald-300 bg-emerald-400/10",
    amber: "text-amber-300 bg-amber-400/10",
    blue: "text-sky-300 bg-sky-400/10",
  };
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-100">{value}</p>
          <p className="mt-1 text-xs text-slate-500">{detail}</p>
        </div>
        <span className={`rounded-xl p-2.5 ${tones[tone]}`}><Icon size={19} /></span>
      </div>
    </div>
  );
}

export default function FinancialSummary({ sales, month, onMonthChange }) {
  const monthlySales = useMemo(
    () => sales.filter((sale) => sale.date?.slice(0, 7) === month),
    [sales, month],
  );
  const totalSales = monthlySales.reduce((sum, sale) => sum + Number(sale.quantity) * Number(sale.priceEach), 0);
  const paidSales = monthlySales
    .filter((sale) => sale.paid)
    .reduce((sum, sale) => sum + Number(sale.quantity) * Number(sale.priceEach), 0);
  const unpaidSales = totalSales - paidSales;
  const netProfit = totalSales - PRINTER_PAYMENT;

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-emerald-300">Financial Tracker</p>
          <h2 className="mt-1 text-xl font-bold">Monthly overview</h2>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-400">
          <CalendarDays size={16} />
          <input type="month" value={month} onChange={(event) => onMonthChange(event.target.value)} className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 [color-scheme:dark]" />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Total Paid Sales" value={money(paidSales)} detail="Collected this month" icon={Check} />
        <SummaryCard label="Unpaid Sales" value={money(unpaidSales)} detail="Outstanding this month" icon={ReceiptText} tone="amber" />
        <SummaryCard label="Printer Amortization" value={money(PRINTER_PAYMENT)} detail="Monthly payment" icon={Printer} tone="blue" />
        <SummaryCard label="Net Profit" value={money(netProfit)} detail="Total sales less printer payment" icon={TrendingUp} tone={netProfit < 0 ? "amber" : "emerald"} />
      </div>
    </section>
  );
}
