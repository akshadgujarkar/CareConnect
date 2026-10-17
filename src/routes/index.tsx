import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import {
  HeartPulse,
  AlertTriangle,
  CalendarCheck,
  Building2,
  Filter,
  CheckCircle2,
  Loader2,
  PlusCircle,
  FolderKanban,
  MessageSquare,
  User as UserIcon,
  LayoutDashboard,
  MapPin,
  CalendarDays,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { useMockStore } from "@/hooks/useMockStore";
import {
  MockStore,
  type Camp,
  type HealthcareDemandArea,
  type Language,
  type Role,
} from "@/data/mockStore";
import { getTranslation } from "@/lib/i18n";
import { checkAndTriggerDueReminders } from "@/lib/reminderEngine";

import { AppHeader } from "@/components/layout/AppHeader";
import { DemandAreaInspector } from "@/components/organizer/DemandAreaInspector";
import { GenerateCampForm } from "@/components/organizer/GenerateCampForm";
import { MyCampsView } from "@/components/organizer/MyCampsView";
import { OrganizerQueries } from "@/components/organizer/OrganizerQueries";
import { OrganizerProfileView } from "@/components/organizer/OrganizerProfileView";

import { NearbyCampList } from "@/components/user/NearbyCampList";
import { CampDetailsModal } from "@/components/user/CampDetailsModal";
import { MyRegistrationsView } from "@/components/user/MyRegistrationsView";

const MapView = lazy(() => import("@/components/health/MapView"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CareConnect — Healthcare Camp Discovery & Management Platform" },
      {
        name: "description",
        content:
          "Discover rural medical camps, screen healthcare demand gaps, and register with automated 8:00 PM reminders.",
      },
      { property: "og:title", content: "CareConnect Healthcare Camp Platform" },
      {
        property: "og:description",
        content: "Connecting NGOs, doctors, and rural beneficiaries for community health camps.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type OrganizerTab = "dashboard" | "generate" | "my-camps" | "queries" | "profile";

const AREA_PRESETS: { name: string; lat: number; lng: number }[] = [
  { name: "All Pune Rural District", lat: 18.55, lng: 73.95 },
  { name: "Kesnand – Wagholi Belt", lat: 18.6, lng: 74.02 },
  { name: "Shikrapur Rural Cluster", lat: 18.69, lng: 74.13 },
  { name: "Theur – Kolwadi", lat: 18.53, lng: 74.05 },
  { name: "Alandi & Khed Sector", lat: 18.677, lng: 73.896 },
  { name: "Hadapsar & Manjari", lat: 18.512, lng: 73.95 },
  { name: "Pirangut Valley & Hills", lat: 18.51, lng: 73.68 },
];

const CATEGORIES = [
  "All",
  "Diabetes Screening",
  "HIV Testing and Awareness",
  "General Health Checkup",
  "Eye Checkup",
  "Child Immunization",
  "Cancer Screening & Women's Health",
  "Blood Donation",
];

function Index() {
  const {
    currentUser,
    organizerProfile,
    camps,
    registrations,
    notifications,
    conversations,
    demandAreas,
    facilities,
  } = useMockStore();

  const lang = currentUser.preferredLanguage;
  const t = getTranslation(lang);

  // UI Navigation states
  const [organizerTab, setOrganizerTab] = useState<OrganizerTab>("dashboard");
  const [selectedDemandArea, setSelectedDemandArea] = useState<HealthcareDemandArea | null>(null);
  const [prefillArea, setPrefillArea] = useState<HealthcareDemandArea | null>(null);

  // User Dashboard Filters
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [upcomingOnly, setUpcomingOnly] = useState(true);
  const [selectedAreaPreset, setSelectedAreaPreset] = useState(AREA_PRESETS[0]);

  // Selected Camp for Modal / Focus
  const [activeCampForModal, setActiveCampForModal] = useState<Camp | null>(null);
  const [focusedCampOnMap, setFocusedCampOnMap] = useState<Camp | null>(null);

  // Map focus coordinates
  const [mapCenter, setMapCenter] = useState<[number, number]>([18.55, 73.95]);
  const [mapZoom, setMapZoom] = useState(11);

  // Global Toast
  const [toast, setToast] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 300);
    // Check if any scheduled 8:00 PM reminders are due
    checkAndTriggerDueReminders();
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Sync map center when user changes area preset
  const handleAreaChange = (areaName: string) => {
    const found = AREA_PRESETS.find((a) => a.name === areaName) || AREA_PRESETS[0];
    setSelectedAreaPreset(found);
    setMapCenter([found.lat, found.lng]);
    setMapZoom(areaName === "All Pune Rural District" ? 11 : 12.5);
  };

  // Filtered camps for User Discovery
  const filteredCamps = useMemo(() => {
    return camps.filter((c) => {
      const matchCat = selectedCategory === "All" || c.category === selectedCategory;
      const matchVerified = !verifiedOnly || c.verified;
      const matchUpcoming = !upcomingOnly || c.status === "upcoming";
      return matchCat && matchVerified && matchUpcoming;
    });
  }, [camps, selectedCategory, verifiedOnly, upcomingOnly]);

  // User's own registrations
  const userRegistrations = useMemo(() => {
    return registrations.filter((r) => r.userId === currentUser.id);
  }, [registrations, currentUser.id]);

  // Derived KPIs for Organizer Dashboard
  const organizerKPIs = useMemo(() => {
    const totalCreated = camps.length;
    const upcomingCount = camps.filter((c) => c.status === "upcoming").length;
    const totalBeneficiaries = registrations.filter(
      (r) => r.status === "active" || r.status === "attended",
    ).length;
    const openForReg = camps.filter(
      (c) => c.status === "upcoming" && c.registrationsCount < c.capacity,
    ).length;
    const highGapsCount = demandAreas.filter((g) => g.demandLevel === "High").length;

    return {
      totalCreated,
      upcomingCount,
      totalBeneficiaries,
      openForReg,
      highGapsCount,
    };
  }, [camps, registrations, demandAreas]);

  // Handler when organizer selects "Generate Camp for this Area"
  const handleGenerateCampForArea = (area: HealthcareDemandArea) => {
    setPrefillArea(area);
    setOrganizerTab("generate");
  };

  const handleCampClickFromList = (camp: Camp) => {
    setFocusedCampOnMap(camp);
    setMapCenter([camp.latitude, camp.longitude]);
    setMapZoom(13.5);
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors">
      {/* Top Application Header with Role Switcher & Language Selector */}
      <AppHeader
        currentUser={currentUser}
        notifications={notifications}
        onRoleSwitch={(role: Role) => {
          MockStore.switchRole(role);
          setToast(
            `Switched view to ${role === "organizer" ? "Camp Generator (Organizer)" : "Resident User (Beneficiary)"}`,
          );
        }}
        onLanguageChange={(l: Language) => {
          MockStore.setUserLanguage(l);
          setToast(
            `Language updated to ${l === "en" ? "English" : l === "hi" ? "हिंदी" : "मराठी"}`,
          );
        }}
        onSelectCamp={(campId) => {
          const c = MockStore.getCampById(campId);
          if (c) setActiveCampForModal(c);
        }}
        onToast={setToast}
      />

      {/* ============================================================== */}
      {/* EXPERIENCE 1: CAMP GENERATOR DASHBOARD (ORGANIZER)             */}
      {/* ============================================================== */}
      {currentUser.role === "organizer" ? (
        <main className="mx-auto max-w-[1600px] p-4 md:p-6 space-y-6">
          {/* Organizer Secondary Navigation Bar */}
          <nav className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => setOrganizerTab("dashboard")}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                  organizerTab === "dashboard"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>{t.navDashboard}</span>
              </button>

              <button
                onClick={() => {
                  setPrefillArea(null);
                  setOrganizerTab("generate");
                }}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                  organizerTab === "generate"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <PlusCircle className="h-4 w-4" />
                <span>{t.navGenerateCamp}</span>
              </button>

              <button
                onClick={() => setOrganizerTab("my-camps")}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                  organizerTab === "my-camps"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <FolderKanban className="h-4 w-4" />
                <span>{t.navMyCamps}</span>
                <span className="rounded-full bg-primary/20 px-1.5 py-0.2 text-[10px] text-foreground">
                  {camps.length}
                </span>
              </button>

              <button
                onClick={() => setOrganizerTab("queries")}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                  organizerTab === "queries"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <MessageSquare className="h-4 w-4" />
                <span>{t.navQueries}</span>
                {conversations.some((c) => c.unreadCountOrganizer > 0) && (
                  <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                )}
              </button>

              <button
                onClick={() => setOrganizerTab("profile")}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                  organizerTab === "profile"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <UserIcon className="h-4 w-4" />
                <span>{t.navProfile}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground hidden sm:inline-block">
                Logged in as: <b>{organizerProfile.organizationName}</b>
              </span>
            </div>
          </nav>

          {/* TAB 1: Dashboard Overview (Map + KPIs + Demand Inspector) */}
          {organizerTab === "dashboard" && (
            <div className="space-y-6">
              {/* Dynamic KPI Summary Cards */}
              <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <div className="rounded-2xl border bg-card p-4 shadow-soft">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-muted-foreground">{t.kpiTotalCamps}</p>
                    <div className="rounded-lg bg-blue-100 p-2 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                      <FolderKanban className="h-4 w-4" />
                    </div>
                  </div>
                  <p className="mt-2 text-2xl font-bold text-foreground">
                    {organizerKPIs.totalCreated}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Across Pune district</p>
                </div>

                <div className="rounded-2xl border bg-card p-4 shadow-soft">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-muted-foreground">
                      {t.kpiUpcomingCamps}
                    </p>
                    <div className="rounded-lg bg-emerald-100 p-2 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      <CalendarCheck className="h-4 w-4" />
                    </div>
                  </div>
                  <p className="mt-2 text-2xl font-bold text-foreground">
                    {organizerKPIs.upcomingCount}
                  </p>
                  <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                    Active & Published
                  </p>
                </div>

                <div className="rounded-2xl border bg-card p-4 shadow-soft">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-muted-foreground">
                      {t.kpiTotalRegistrations}
                    </p>
                    <div className="rounded-lg bg-teal-100 p-2 text-teal-700 dark:bg-teal-950 dark:text-teal-300">
                      <HeartPulse className="h-4 w-4" />
                    </div>
                  </div>
                  <p className="mt-2 text-2xl font-bold text-foreground">
                    {organizerKPIs.totalBeneficiaries}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Confirmed bookings</p>
                </div>

                <div className="rounded-2xl border bg-card p-4 shadow-soft">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-muted-foreground">
                      {t.kpiActiveOpenings}
                    </p>
                    <div className="rounded-lg bg-indigo-100 p-2 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                      <CalendarDays className="h-4 w-4" />
                    </div>
                  </div>
                  <p className="mt-2 text-2xl font-bold text-foreground">
                    {organizerKPIs.openForReg}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Accepting signups</p>
                </div>

                <div className="rounded-2xl border bg-card p-4 shadow-soft">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-muted-foreground">{t.kpiDemandAreas}</p>
                    <div className="rounded-lg bg-rose-100 p-2 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                  </div>
                  <p className="mt-2 text-2xl font-bold text-foreground">
                    {organizerKPIs.highGapsCount}
                  </p>
                  <p className="text-[11px] text-rose-600 font-semibold mt-0.5">
                    Need immediate camps
                  </p>
                </div>
              </section>

              {/* Main Interactive Map & Inspector Layout */}
              <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
                {/* Map Container */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        {t.mapTitle}
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        Click red/amber demand zones to inspect rural access gaps and prefill a new
                        camp.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setPrefillArea(null);
                        setOrganizerTab("generate");
                      }}
                      className="btn-primary flex items-center gap-1.5 text-xs py-1.5 px-3 font-semibold"
                    >
                      <PlusCircle className="h-3.5 w-3.5" />
                      <span>{t.navGenerateCamp}</span>
                    </button>
                  </div>

                  <div className="relative h-[540px] overflow-hidden rounded-2xl border bg-card shadow-soft">
                    {mounted ? (
                      <Suspense fallback={<MapLoading />}>
                        <MapView
                          mode="organizer"
                          camps={camps}
                          facilities={facilities}
                          demandAreas={demandAreas}
                          selectedCamp={focusedCampOnMap}
                          selectedDemandArea={selectedDemandArea}
                          onSelectDemandArea={(area) => setSelectedDemandArea(area)}
                          onSelectCamp={(camp) => setActiveCampForModal(camp)}
                          center={mapCenter}
                          zoom={mapZoom}
                          lang={lang}
                        />
                      </Suspense>
                    ) : (
                      <MapLoading />
                    )}
                  </div>
                </div>

                {/* Right Side Panel: Legend & Demand Area Inspector */}
                <aside className="space-y-4">
                  {/* Selected Area Inspector Card */}
                  {selectedDemandArea ? (
                    <DemandAreaInspector
                      area={selectedDemandArea}
                      onClose={() => setSelectedDemandArea(null)}
                      onGenerateCampForArea={handleGenerateCampForArea}
                      lang={lang}
                    />
                  ) : (
                    <div className="rounded-2xl border bg-card p-5 shadow-soft border-dashed text-center">
                      <Sparkles className="mx-auto mb-2 h-8 w-8 text-primary/60" />
                      <h3 className="text-sm font-bold text-foreground">
                        Interactive Healthcare Demand Inspector
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        Click on any highlighted circle on the map to inspect underserved rural
                        areas, priority scores, and missing diagnostic services.
                      </p>
                    </div>
                  )}

                  {/* Map Legend */}
                  <div className="rounded-2xl border bg-card p-4 shadow-soft space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Map Indicators & Layers
                    </h3>
                    <ul className="space-y-2 text-xs">
                      <li className="flex items-center gap-2.5">
                        <span className="dot dot-gap" />
                        <span className="font-medium">{t.legendHighGap}</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <span className="dot dot-med" />
                        <span className="font-medium">{t.legendMedGap}</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <span className="dot dot-facility" />
                        <span className="font-medium">{t.legendFacility}</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <span className="dot dot-camp" />
                        <span className="font-medium">{t.legendVerifiedCamp}</span>
                      </li>
                    </ul>
                    <p className="text-[11px] text-muted-foreground border-t pt-2 leading-snug">
                      Data aggregated from Zilla Parishad Rural Health Audits and National Health
                      Mission surveys.
                    </p>
                  </div>
                </aside>
              </div>
            </div>
          )}

          {/* TAB 2: Generate Camp Workflow */}
          {organizerTab === "generate" && (
            <GenerateCampForm
              prefillArea={prefillArea}
              onSuccess={(newCamp) => {
                setToast(
                  `Camp "${newCamp.name}" published successfully! Discoverable by local residents.`,
                );
                setOrganizerTab("my-camps");
              }}
              onCancel={() => setOrganizerTab("dashboard")}
              lang={lang}
            />
          )}

          {/* TAB 3: My Camps Management */}
          {organizerTab === "my-camps" && (
            <MyCampsView
              camps={camps}
              registrations={registrations}
              onSelectCampOnMap={(camp) => {
                setFocusedCampOnMap(camp);
                setMapCenter([camp.latitude, camp.longitude]);
                setMapZoom(13.5);
                setOrganizerTab("dashboard");
              }}
              onToast={setToast}
              lang={lang}
            />
          )}

          {/* TAB 4: Participant Queries */}
          {organizerTab === "queries" && (
            <OrganizerQueries conversations={conversations} onToast={setToast} lang={lang} />
          )}

          {/* TAB 5: Profile & Settings */}
          {organizerTab === "profile" && (
            <OrganizerProfileView
              profile={organizerProfile}
              lang={lang}
              onLanguageChange={(l) => {
                MockStore.setUserLanguage(l);
                setToast(`Interface language switched to ${l}`);
              }}
              onToast={setToast}
            />
          )}
        </main>
      ) : (
        /* ============================================================== */
        /* EXPERIENCE 2: HEALTHCARE CAMP USER DASHBOARD (RURAL RESIDENT)  */
        /* ============================================================== */
        <main className="mx-auto max-w-[1600px] p-4 md:p-6 space-y-6">
          {/* User Locality Selector & Search Header */}
          <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border bg-card p-4 md:p-5 shadow-soft">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 px-2.5 py-0.5 text-xs font-bold">
                  {t.userBadge}
                </span>
                <h2 className="text-base font-bold text-foreground sm:text-lg">{t.userMapTitle}</h2>
              </div>
              <p className="text-xs text-muted-foreground">
                Find free verified doctor checkups, diabetes screenings, vaccinations, and eye tests
                near your village.
              </p>
            </div>

            {/* Locality Selector Dropdown */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-muted-foreground shrink-0 flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                Select Locality:
              </label>
              <select
                className="input text-xs bg-background max-w-[220px]"
                value={selectedAreaPreset.name}
                onChange={(e) => handleAreaChange(e.target.value)}
              >
                {AREA_PRESETS.map((ap) => (
                  <option key={ap.name} value={ap.name}>
                    {ap.name}
                  </option>
                ))}
              </select>
            </div>
          </section>

          {/* Interactive User Map & Nearby Camps List Layout */}
          <section className="grid gap-5 lg:grid-cols-[240px_1fr] xl:grid-cols-[250px_1fr_370px]">
            {/* Filters Sidebar (Left) */}
            <aside className="space-y-5 rounded-2xl border bg-card p-5 shadow-soft h-fit">
              <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
                <Filter className="h-4 w-4 text-primary" />
                {t.filterCategory}
              </h3>

              <div className="flex flex-wrap gap-1.5 lg:flex-col">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`rounded-xl px-3 py-2 text-xs font-semibold text-left transition ${
                      selectedCategory === cat
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="border-t pt-4 space-y-3 text-xs">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="font-medium text-foreground">{t.filterUpcomingOnly}</span>
                  <input
                    type="checkbox"
                    checked={upcomingOnly}
                    onChange={(e) => setUpcomingOnly(e.target.checked)}
                    className="h-4 w-4 rounded accent-primary cursor-pointer"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="font-medium text-foreground">{t.filterVerifiedOnly}</span>
                  <input
                    type="checkbox"
                    checked={verifiedOnly}
                    onChange={(e) => setVerifiedOnly(e.target.checked)}
                    className="h-4 w-4 rounded accent-primary cursor-pointer"
                  />
                </label>
              </div>

              {/* User Map Legend */}
              <div className="border-t pt-4 space-y-2 text-xs">
                <p className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider">
                  Camp Markers
                </p>
                <ul className="space-y-1.5">
                  <li className="flex items-center gap-2">
                    <span className="dot dot-camp" />
                    <span>Verified Health Camp</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="dot dot-unverified" />
                    <span>Pending Verification</span>
                  </li>
                </ul>
              </div>
            </aside>

            {/* Interactive User Map (Center) */}
            <div className="relative h-[480px] overflow-hidden rounded-2xl border bg-card shadow-soft lg:h-[calc(100vh-270px)] lg:min-h-[520px]">
              {mounted ? (
                <Suspense fallback={<MapLoading />}>
                  <MapView
                    mode="user"
                    camps={filteredCamps}
                    selectedCamp={focusedCampOnMap}
                    onSelectCamp={(camp) => {
                      setFocusedCampOnMap(camp);
                    }}
                    onRegister={(camp) => setActiveCampForModal(camp)}
                    center={mapCenter}
                    zoom={mapZoom}
                    lang={lang}
                  />
                </Suspense>
              ) : (
                <MapLoading />
              )}
            </div>

            {/* Nearby Camps List (Right) */}
            <aside className="flex flex-col rounded-2xl border bg-card shadow-soft lg:h-[calc(100vh-270px)] lg:min-h-[520px] overflow-hidden">
              <div className="flex items-center justify-between border-b p-4 bg-card">
                <div>
                  <h3 className="text-sm font-bold text-foreground">{t.navNearbyCamps}</h3>
                  <p className="text-[11px] text-muted-foreground">
                    Sorted by proximity to {selectedAreaPreset.name.split(" ")[0]}
                  </p>
                </div>
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                  {filteredCamps.length} found
                </span>
              </div>

              <div className="flex-1 overflow-y-auto">
                <NearbyCampList
                  camps={filteredCamps}
                  selectedCamp={focusedCampOnMap}
                  onSelectCamp={handleCampClickFromList}
                  onRegister={(camp) => setActiveCampForModal(camp)}
                  userLat={selectedAreaPreset.lat}
                  userLng={selectedAreaPreset.lng}
                  lang={lang}
                />
              </div>
            </aside>
          </section>

          {/* SECTION 4: My Registrations & 8:00 PM Reminders */}
          <MyRegistrationsView
            registrations={userRegistrations}
            camps={camps}
            onSelectCamp={(camp) => {
              handleCampClickFromList(camp);
              setActiveCampForModal(camp);
            }}
            onToast={setToast}
            lang={lang}
          />
        </main>
      )}

      {/* Camp Details & Registration Modal */}
      {activeCampForModal && (
        <CampDetailsModal
          camp={activeCampForModal}
          currentUser={currentUser}
          onClose={() => setActiveCampForModal(null)}
          onSuccess={(msg) => setToast(msg)}
          lang={lang}
        />
      )}

      {/* Global Interactive Notification Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[3000] flex max-w-md items-center gap-2.5 rounded-2xl bg-foreground px-4 py-3 text-xs font-medium text-background shadow-2xl animate-in slide-in-from-bottom-4">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}

function MapLoading() {
  return (
    <div className="grid h-full w-full place-items-center bg-muted/40">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        Loading interactive map…
      </div>
    </div>
  );
}
