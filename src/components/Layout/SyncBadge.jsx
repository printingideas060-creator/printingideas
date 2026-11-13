import { Cloud, CloudOff, Wifi, WifiOff } from "lucide-react";

const SYNC_LABELS = {
  online: "Synced",
  connecting: "Syncing",
  offline: "Cloud sync unavailable",
};

export default function SyncBadge({ status, networkStatus }) {
  const isOnline = networkStatus === "online";
  const isSyncing = status === "connecting";

  return (
    <>
      <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${
        isOnline
          ? "border-emerald-500/30 bg-emerald-400/10 text-emerald-300"
          : "border-slate-700 bg-slate-900 text-slate-400"
      }`}>
        {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
        {isOnline ? "Online" : "Offline"}
      </span>
      <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${
        status === "online"
          ? "border-emerald-500/30 bg-emerald-400/10 text-emerald-300"
          : isSyncing
            ? "border-amber-500/30 bg-amber-400/10 text-amber-300"
            : "border-slate-700 bg-slate-900 text-slate-400"
      }`}>
        {status === "online" ? <Cloud size={14} /> : <CloudOff size={14} />}
        {SYNC_LABELS[status] || SYNC_LABELS.offline}
      </span>
    </>
  );
}
