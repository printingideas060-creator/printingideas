import { Sparkles } from "lucide-react";
import { INITIAL_TRENDS, MAX_MEDIA_WEIGHT } from "../../data/initialData";
import TrendCard from "./TrendCard";

export default function TrendList() {
  return (
    <main>
      <div className="mb-6 flex items-start gap-3">
        <span className="rounded-xl bg-emerald-400/10 p-2.5 text-emerald-300"><Sparkles size={20} /></span>
        <div>
          <p className="text-sm font-medium text-emerald-300">Canon PIXMA G3010 compatible ideas</p>
          <h2 className="mt-1 text-xl font-bold">Printing Trends &amp; Presets</h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-400">Explore product ideas, compare estimated materials cost, and check driver presets and marketplace search interest.</p>
        </div>
      </div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm">
          <span className="text-slate-500">Ink compatibility</span>
          <p className="mt-1 font-semibold text-slate-100">GI-790 Dye Ink</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm">
          <span className="text-slate-500">Media weight guideline</span>
          <p className="mt-1 font-semibold text-slate-100">Up to {MAX_MEDIA_WEIGHT}gsm</p>
        </div>
        <p className="max-w-xl text-xs text-slate-500">Check specific media thickness, feed path, and printer-manufacturer guidance before printing. Marketplace interest figures below are estimates, not live data.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {INITIAL_TRENDS.map((trend) => <TrendCard key={trend.id} trend={trend} />)}
      </div>
    </main>
  );
}
