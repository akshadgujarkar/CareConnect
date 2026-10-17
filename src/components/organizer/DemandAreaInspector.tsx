import {
  AlertTriangle,
  Users,
  MapPin,
  Stethoscope,
  ArrowRight,
  X,
  ShieldAlert,
} from "lucide-react";
import { type HealthcareDemandArea, type Language } from "@/data/mockStore";
import { getTranslation } from "@/lib/i18n";

interface Props {
  area: HealthcareDemandArea | null;
  onClose: () => void;
  onGenerateCampForArea: (area: HealthcareDemandArea) => void;
  lang?: Language;
}

export function DemandAreaInspector({ area, onClose, onGenerateCampForArea, lang = "en" }: Props) {
  if (!area) return null;
  const t = getTranslation(lang);

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-soft border-primary/20 relative animate-in fade-in slide-in-from-bottom-2">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 rounded-full p-1 text-muted-foreground hover:bg-muted"
        aria-label="Close"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-2 mb-2">
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
            area.demandLevel === "High"
              ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
              : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
          }`}
        >
          <ShieldAlert className="h-3.5 w-3.5" />
          {area.demandLevel} Priority Healthcare Gap ({area.priorityScore}/100)
        </span>
        <span className="text-xs text-muted-foreground">Source: {area.dataSource}</span>
      </div>

      <h3 className="text-lg font-bold text-foreground">{area.areaName}</h3>
      <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{area.notes}</p>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border bg-muted/40 p-3">
          <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Users className="h-3.5 w-3.5 text-primary" />
            {t.areaPopulation}
          </p>
          <p className="mt-1 text-base font-bold text-foreground">
            {area.population.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="rounded-xl border bg-muted/40 p-3">
          <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            {t.nearestFacility}
          </p>
          <p className="mt-1 text-base font-bold text-foreground">{area.nearestFacilityKm} km</p>
        </div>
        <div className="rounded-xl border bg-muted/40 p-3 col-span-2 sm:col-span-1">
          <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Stethoscope className="h-3.5 w-3.5 text-primary" />
            Primary Need
          </p>
          <p className="mt-1 text-sm font-bold text-foreground truncate">
            {area.healthcareCategory}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t.missingServices}
        </p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {area.missingServices.map((s) => (
            <span
              key={s}
              className="rounded-lg bg-red-50 text-red-800 dark:bg-red-950/50 dark:text-red-300 border border-red-200 dark:border-red-900 px-2.5 py-1 text-xs font-semibold"
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2 pt-2 border-t">
        <button
          onClick={() => onGenerateCampForArea(area)}
          className="btn-primary flex items-center gap-2 text-xs font-semibold"
        >
          <span>{t.generateCampInArea}</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
