import { useEffect, useState } from "react";
import { Edit2, Save } from "lucide-react";

export default function PriceTable({ title, items, onSave, icon: Icon }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(items);

  useEffect(() => setDraft(items), [items]);

  function save() {
    onSave(draft.map((item) => ({ ...item, price: Math.max(0, Number(item.price) || 0) })));
    setEditing(false);
  }

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="rounded-xl bg-slate-800 p-2 text-emerald-300"><Icon size={18} /></span>
          <h3 className="font-semibold text-slate-100">{title}</h3>
        </div>
        {editing ? (
          <button onClick={save} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-400 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-300">
            <Save size={15} /> Save
          </button>
        ) : (
          <button onClick={() => setEditing(true)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:border-emerald-400 hover:text-emerald-200">
            <Edit2 size={14} /> Edit
          </button>
        )}
      </div>
      <div className="divide-y divide-slate-800">
        {draft.map((item, index) => (
          <div key={item.name} className="flex items-center justify-between gap-3 py-2.5 text-sm">
            <span className="text-slate-300">{item.name}</span>
            {editing ? (
              <label className="flex items-center gap-2 text-slate-400">
                ₱
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.price}
                  onChange={(event) => setDraft((current) => current.map((entry, itemIndex) => itemIndex === index ? { ...entry, price: event.target.value } : entry))}
                  className="w-24 rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-right text-slate-100 outline-none focus:border-emerald-400"
                  aria-label={`${item.name} price`}
                />
              </label>
            ) : <span className="font-medium text-slate-100">{new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(item.price)}</span>}
          </div>
        ))}
      </div>
    </section>
  );
}
