import SyncBadge from "./SyncBadge";
import logoUrl from "../../assets/printing-ideas-logo.png";

export default function Header({ syncStatus, networkStatus, user, authReady, onSignIn, onSignOut }) {
  return (
    <header className="mb-8 border-b border-slate-800 pb-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-700 bg-white">
            <img
              src={logoUrl}
              alt="Printing Ideas logo"
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Printing Ideas</h1>
            <p className="mt-1 text-sm text-slate-400">Canon G3010 Print Hub &amp; Real-Time Trend Tracker</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SyncBadge status={syncStatus} networkStatus={networkStatus} />
          {user?.isAnonymous ? (
            <button
              onClick={onSignIn}
              className="rounded-lg border border-emerald-500/30 px-3 py-2 text-sm text-emerald-200 transition hover:border-emerald-400"
            >
              Link Google account
            </button>
          ) : user ? (
            <button
              onClick={onSignOut}
              className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:border-emerald-400 hover:text-emerald-200"
            >
              Sign out{user.displayName ? ` · ${user.displayName}` : ""}
            </button>
          ) : (
            <button
              onClick={onSignIn}
              disabled={!authReady}
              className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:border-emerald-400 hover:text-emerald-200 disabled:cursor-wait disabled:opacity-50"
            >
              Sign in with Google
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
