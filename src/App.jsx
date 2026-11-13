import { useState } from "react";
import { DollarSign, TrendingUp } from "lucide-react";
import Header from "./components/Layout/Header";
import logoUrl from "./assets/printing-ideas-logo.png";
import FinancialSummary from "./components/Financials/FinancialSummary";
import SalesLogTable from "./components/Financials/SalesLogTable";
import ServicesPriceTable from "./components/Financials/ServicesPriceTable";
import SuppliesPriceTable from "./components/Financials/SuppliesPriceTable";
import TrendList from "./components/Trends/TrendList";
import { useAppContext } from "./context/AppContext";

export default function App() {
  const [activeTab, setActiveTab] = useState("financials");
  const [month, setMonth] = useState("2026-11");
  const {
    sales,
    supplies,
    services,
    syncStatus,
    networkStatus,
    storageError,
    cloudError,
    user,
    authReady,
    signIn,
    logOut,
    saveSupplies,
    saveServices,
  } = useAppContext();

  if (!authReady || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-100">
        <section className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/70 p-8 text-center shadow-xl">
          <img
            src={logoUrl}
            alt="Printing Ideas logo"
            className="mx-auto mb-5 h-20 w-20 rounded-2xl object-cover"
          />
          <h1 className="text-2xl font-bold tracking-tight">Printing Ideas</h1>
          <p className="mt-2 text-sm text-slate-400">
            Sign in with printingideas060@gmail.com to access this app.
          </p>
          {cloudError && (
            <div role="alert" className="mt-5 rounded-xl border border-amber-500/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
              {cloudError}
            </div>
          )}
          <button
            onClick={signIn}
            disabled={!authReady}
            className="mt-6 w-full rounded-lg bg-emerald-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-wait disabled:opacity-50"
          >
            {authReady ? "Login with Google" : "Checking access…"}
          </button>
        </section>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Header
          syncStatus={syncStatus}
          networkStatus={networkStatus}
          user={user}
          authReady={authReady}
          onSignIn={signIn}
          onSignOut={logOut}
        />
        {cloudError && <div role="alert" className="mb-5 rounded-xl border border-amber-500/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">{cloudError}</div>}
        {storageError && <div role="alert" className="mb-5 rounded-xl border border-amber-500/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">{storageError}</div>}

        <nav className="mb-7 flex flex-wrap gap-2 rounded-xl border border-slate-800 bg-slate-900/60 p-1.5" aria-label="Main navigation">
          <button onClick={() => setActiveTab("financials")} aria-current={activeTab === "financials" ? "page" : undefined} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${activeTab === "financials" ? "bg-emerald-400 text-slate-950" : "text-slate-400 hover:text-slate-100"}`}>
            <DollarSign size={16} /> Financial Tracker
          </button>
          <button onClick={() => setActiveTab("trends")} aria-current={activeTab === "trends" ? "page" : undefined} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${activeTab === "trends" ? "bg-emerald-400 text-slate-950" : "text-slate-400 hover:text-slate-100"}`}>
            <TrendingUp size={16} /> Printing Trends &amp; Presets
          </button>
        </nav>

        {activeTab === "financials" ? (
          <main className="space-y-8">
            <FinancialSummary sales={sales} month={month} onMonthChange={setMonth} />
            <section className="grid gap-5 lg:grid-cols-2">
              <SuppliesPriceTable items={supplies} onSave={saveSupplies} />
              <ServicesPriceTable items={services} onSave={saveServices} />
            </section>
            <SalesLogTable month={month} />
          </main>
        ) : <TrendList />}
      </div>
    </div>
  );
}
