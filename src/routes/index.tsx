import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { HeartPulse, AlertTriangle, CalendarCheck, Building2, Filter, CalendarX, CheckCircle2, Loader2 } from "lucide-react";
import { facilities, camps, gaps, SERVICES, isUpcoming, type Camp, type Service } from "@/data/health";
import { CampCard } from "@/components/health/CampCard";
import { RegisterModal } from "@/components/health/RegisterModal";
import { MyCheckups } from "@/components/health/MyCheckups";

const MapView = lazy(() => import("@/components/health/MapView"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Community Health Access Platform — Find camps & care near you" },
      { name: "description", content: "Map local healthcare access gaps and connect with verified health camps and public facilities." },
      { property: "og:title", content: "Community Health Access Platform" },
      { property: "og:description", content: "Verified health camps, public facilities and access gaps on one map." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type ServiceFilter = "All" | Service;

function Index() {
  const [service, setService] = useState<ServiceFilter>("All");
  const [verifiedOnly, setVerifiedOnly] = useState(true);
  const [upcomingOnly, setUpcomingOnly] = useState(true);
  const [selected, setSelected] = useState<Camp | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [regKey, setRegKey] = useState(0);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 400); return () => clearTimeout(t); }, []);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 3500); return () => clearTimeout(t); }, [toast]);

  const match = (s: Service[]) => service === "All" || s.includes(service);
  const fCamps = useMemo(() => camps.filter((c) => match(c.services) && (!verifiedOnly || c.verified) && (!upcomingOnly || isUpcoming(c)))
    .sort((a, b) => a.date.localeCompare(b.date)), [service, verifiedOnly, upcomingOnly]);
  const fFacilities = useMemo(() => facilities.filter((f) => match(f.services)), [service]);
  const fGaps = useMemo(() => gaps.filter((g) => service === "All" || g.missing.includes(service)), [service]);

  const stats = [
    { label: "High Access Gaps", value: gaps.filter((g) => g.severity === "High").length, icon: AlertTriangle, tone: "stat-gap" },
    { label: "Upcoming Verified Camps", value: camps.filter((c) => c.verified && isUpcoming(c)).length, icon: CalendarCheck, tone: "stat-camp" },
    { label: "Public Facilities", value: facilities.length, icon: Building2, tone: "stat-facility" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-[1000] border-b bg-card/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] items-center gap-3 px-4 py-3 md:px-6">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-brand text-primary-foreground shadow-soft"><HeartPulse className="h-5 w-5" /></div>
          <div>
            <h1 className="text-base font-bold tracking-tight md:text-lg">Community Health Access Platform</h1>
            <p className="text-xs text-muted-foreground">Closing care gaps · Pune District pilot</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] space-y-5 p-4 md:p-6">
        <section className="grid gap-4 sm:grid-cols-3">
          {stats.map(({ label, value, icon: Icon, tone }) => (
            <div key={label} className="flex items-center gap-4 rounded-2xl border bg-card p-5 shadow-soft transition hover:shadow-elevated">
              <div className={`grid h-12 w-12 place-items-center rounded-xl ${tone}`}><Icon className="h-6 w-6" /></div>
              <div><p className="text-3xl font-bold">{value}</p><p className="text-sm text-muted-foreground">{label}</p></div>
            </div>
          ))}
        </section>

        <section className="grid gap-5 lg:grid-cols-[240px_1fr] xl:grid-cols-[250px_1fr_330px]">
          <aside className="h-fit space-y-6 rounded-2xl border bg-card p-5 shadow-soft">
            <h2 className="flex items-center gap-2 font-semibold"><Filter className="h-4 w-4 text-primary" />Filters</h2>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Service Type</p>
              <div className="flex flex-wrap gap-2 lg:flex-col">
                {(["All", ...SERVICES] as ServiceFilter[]).map((s) => (
                  <button key={s} onClick={() => setService(s)} className={service === s ? "pill pill-active" : "pill"}>{s}</button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <Toggle label="Verified camps only" checked={verifiedOnly} onChange={setVerifiedOnly} />
              <Toggle label="Upcoming camps only" checked={upcomingOnly} onChange={setUpcomingOnly} />
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Legend</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2"><span className="dot dot-facility" />Public Facility (PHC/CHC/Hospital)</li>
                <li className="flex items-center gap-2"><span className="dot dot-camp" />Verified Health Camp</li>
                <li className="flex items-center gap-2"><span className="dot dot-unverified" />Unverified Camp</li>
                <li className="flex items-center gap-2"><span className="dot dot-gap" />High Access Gap</li>
                <li className="flex items-center gap-2"><span className="dot dot-med" />Medium Access Gap</li>
              </ul>
              <p className="mt-2 text-xs text-muted-foreground">Bigger blue marker = larger facility.</p>
            </div>
          </aside>

          <div className="relative h-[460px] overflow-hidden rounded-2xl border shadow-soft lg:h-[calc(100vh-260px)] lg:min-h-[520px]">
            {mounted ? (
              <Suspense fallback={<MapLoading />}>
                <MapView facilities={fFacilities} camps={fCamps} gaps={fGaps} onRegister={setSelected} />
              </Suspense>
            ) : <MapLoading />}
          </div>

          <aside className="flex flex-col rounded-2xl lg:col-span-2 xl:col-span-1 border bg-card shadow-soft lg:h-[calc(100vh-260px)] lg:min-h-[520px]">
            <div className="flex items-center justify-between border-b p-4">
              <h2 className="font-semibold">Health Camps</h2>
              <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-accent-foreground">{fCamps.length} found</span>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {!mounted ? [0, 1, 2].map((i) => <div key={i} className="h-48 animate-pulse rounded-xl bg-muted" />) :
                fCamps.length === 0 ? (
                  <div className="flex flex-col items-center py-12 text-center text-muted-foreground">
                    <CalendarX className="mb-3 h-10 w-10" />
                    <p className="font-medium text-foreground">No camps match</p>
                    <p className="text-sm">Try a different service or turn off a toggle.</p>
                  </div>
                ) : fCamps.map((c) => <CampCard key={c.id} camp={c} onRegister={setSelected} />)}
            </div>
          </aside>
        </section>
        <MyCheckups refreshKey={regKey} onToast={setToast} />
      </main>

      {selected && <RegisterModal camp={selected} onClose={() => setSelected(null)} onSuccess={(m) => { setToast(m); setRegKey((k) => k + 1); }} />}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[3000] flex items-center gap-2 rounded-xl bg-success px-4 py-3 text-sm font-medium text-success-foreground shadow-elevated animate-in slide-in-from-bottom-4">
          <CheckCircle2 className="h-5 w-5" />{toast}
        </div>
      )}
    </div>
  );
}

function MapLoading() {
  return <div className="grid h-full w-full place-items-center bg-muted"><div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" />Loading map…</div></div>;
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="flex w-full items-center justify-between text-sm">
      <span>{label}</span>
      <span className={`switch ${checked ? "switch-on" : ""}`}><span className="switch-thumb" /></span>
    </button>
  );
}
