import { useMemo, useState } from "react";
import { ExternalLink, Sparkles } from "lucide-react";
import { MAX_MEDIA_WEIGHT } from "../../data/initialData";

const COLOR_PRESETS = {
  Vivid: "Saturated color for bold graphics and sticker designs.",
  Neutral: "Balanced color for portraits, product designs, and natural tones.",
  Soft: "Gentle contrast for pastel artwork and muted palettes.",
};

export default function TrendCard({ trend }) {
  const [colorPreset, setColorPreset] = useState(trend.colorPreset);
  const [paperCost, setPaperCost] = useState(trend.paperCost);
  const [inkCost, setInkCost] = useState(trend.inkCost);
  const totalCost = useMemo(() => (Number(paperCost) || 0) + (Number(inkCost) || 0), [paperCost, inkCost]);
  const safeQuery = encodeURIComponent(trend.title);
  const weightSupported = trend.weight <= MAX_MEDIA_WEIGHT;

  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 transition hover:border-slate-700">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs text-slate-400">{trend.category}</span>
          <h3 className="mt-3 text-lg font-bold">{trend.title}</h3>
          <p className="mt-1 text-sm text-slate-400">{trend.materials}</p>
        </div>
        <span className="rounded-xl bg-emerald-400/10 p-2.5 text-emerald-300"><Sparkles size={19} /></span>
      </div>

      <div className="my-4 grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-slate-950/70 p-3">
          <label className="text-xs text-slate-500">Paper cost / sheet
            <input type="number" min="0" step="0.01" value={paperCost} onChange={(event) => setPaperCost(event.target.value)} className="mt-1 w-full bg-transparent text-sm font-semibold text-slate-100 outline-none" />
          </label>
        </div>
        <div className="rounded-xl bg-slate-950/70 p-3">
          <label className="text-xs text-slate-500">Ink cost / sheet
            <input type="number" min="0" step="0.01" value={inkCost} onChange={(event) => setInkCost(event.target.value)} className="mt-1 w-full bg-transparent text-sm font-semibold text-slate-100 outline-none" />
          </label>
        </div>
        <div className="rounded-xl bg-slate-950/70 p-3">
          <p className="text-xs text-slate-500">Estimated cost</p>
          <p className="mt-1 text-sm font-semibold text-emerald-300">{new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(totalCost)}</p>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-slate-950/70 p-3">
          <p className="text-xs text-slate-500">Suggested SRP / sheet</p>
          <p className="mt-1 font-semibold text-slate-100">{new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(trend.srp)}</p>
        </div>
        <div className="rounded-xl bg-slate-950/70 p-3">
          <p className="text-xs text-slate-500">Paper weight</p>
          <p className={`mt-1 font-semibold ${weightSupported ? "text-slate-100" : "text-rose-300"}`}>
            {trend.weight}gsm · {weightSupported ? "Within guideline" : "Check compatibility"}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">G3010 print setup</p>
            <p className="mt-1 text-sm font-medium text-slate-200">{trend.preset} / {trend.quality} Quality</p>
          </div>
          <label className="text-xs text-slate-400">Color preset
            <select value={colorPreset} onChange={(event) => setColorPreset(event.target.value)} className="ml-2 rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-slate-200">
              {Object.keys(COLOR_PRESETS).map((preset) => <option key={preset}>{preset}</option>)}
            </select>
          </label>
        </div>
        <p className="mt-2 text-xs text-slate-400">{COLOR_PRESETS[colorPreset]} GI-790 dye ink. Confirm media and driver settings with the printer manual.</p>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm leading-relaxed text-slate-400">{trend.note}</p>
        <div className="flex shrink-0 gap-3 text-xs">
          <a href={`https://shopee.ph/search?keyword=${safeQuery}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-slate-300 hover:text-emerald-300" aria-label={`Search ${trend.title} on Shopee`}>
            Shopee <span className="text-emerald-300">{trend.searchInterest.shopee}/100</span> <ExternalLink size={12} />
          </a>
          <a href={`https://www.tiktok.com/search?q=${safeQuery}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-slate-300 hover:text-emerald-300" aria-label={`Search ${trend.title} on TikTok`}>
            TikTok <span className="text-emerald-300">{trend.searchInterest.tiktok}/100</span> <ExternalLink size={12} />
          </a>
        </div>
      </div>
      <p className="mt-2 text-[11px] text-slate-600">Search-interest scores are illustrative estimates, not live platform metrics.</p>
    </article>
  );
}
