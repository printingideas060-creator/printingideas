import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";

export default function AddSalesModal({ services, onClose, onAdd }) {
  const [error, setError] = useState("");
  const [form, setForm] = useState(() => {
    const today = new Date();
    const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    return { date, service: services[0]?.name || "Print", description: "", quantity: 1, priceEach: services[0]?.price ?? 0, paid: true };
  });

  useEffect(() => {
    const selected = services.find((service) => service.name === form.service);
    if (selected) setForm((current) => ({ ...current, priceEach: selected.price }));
  }, [services, form.service]);

  function submit(event) {
    event.preventDefault();
    const quantity = Number(form.quantity);
    const priceEach = Number(form.priceEach);
    if (!form.date || !form.service || !Number.isInteger(quantity) || quantity <= 0 || !Number.isFinite(priceEach) || priceEach < 0) {
      setError("Enter a valid date, positive whole-number quantity, and non-negative unit price.");
      return;
    }

    onAdd({
      ...form,
      quantity,
      priceEach,
      description: form.description.trim() || form.service,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center overflow-y-auto bg-black/70 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="sale-dialog-title" className="my-auto w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-2xl sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 id="sale-dialog-title" className="text-lg font-bold">Add sales log</h2>
            <p className="mt-1 text-sm text-slate-400">Total is quantity × price each.</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white" aria-label="Close"><X size={18} /></button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <label className="block text-sm text-slate-300">Date
            <input required type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-slate-100 [color-scheme:dark] outline-none focus:border-emerald-400" />
          </label>
          <label className="block text-sm text-slate-300">Service
            <select value={form.service} onChange={(event) => {
              const service = services.find((item) => item.name === event.target.value);
              setForm({ ...form, service: event.target.value, priceEach: service?.price ?? 0 });
            }} className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-slate-100 outline-none focus:border-emerald-400">
              {services.map((service) => <option key={service.name} value={service.name}>{service.name}</option>)}
            </select>
          </label>
          <label className="block text-sm text-slate-300">Description
            <input value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Optional details" className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-slate-100 placeholder:text-slate-600 outline-none focus:border-emerald-400" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm text-slate-300">Quantity
              <input required type="number" min="1" step="1" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-slate-100 outline-none focus:border-emerald-400" />
            </label>
            <label className="block text-sm text-slate-300">Price each (₱)
              <input required type="number" min="0" step="0.01" value={form.priceEach} onChange={(event) => setForm({ ...form, priceEach: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-slate-100 outline-none focus:border-emerald-400" />
            </label>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input type="checkbox" checked={form.paid} onChange={(event) => setForm({ ...form, paid: event.target.checked })} className="h-4 w-4 accent-emerald-400" /> Paid
          </label>
          <div className="flex items-center justify-between rounded-xl bg-slate-950 px-4 py-3">
            <span className="text-sm text-slate-400">Calculated total</span>
            <span className="text-lg font-bold text-emerald-300">{new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format((Number(form.quantity) || 0) * (Number(form.priceEach) || 0))}</span>
          </div>
          {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800">Cancel</button>
            <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-300"><Plus size={15} /> Save sale</button>
          </div>
        </form>
      </section>
    </div>
  );
}
