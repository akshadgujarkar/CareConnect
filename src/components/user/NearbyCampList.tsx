import { CalendarDays, Clock, MapPin, BadgeCheck, Users, ArrowRight } from "lucide-react";
import { type Camp, type Language, MockStore } from "@/data/mockStore";
import { getTranslation } from "@/lib/i18n";
import { formatCampDate } from "@/lib/reminderEngine";

interface Props {
  camps: Camp[];
  selectedCamp?: Camp | null;
  onSelectCamp: (camp: Camp) => void;
  onRegister: (camp: Camp) => void;
  userLat?: number;
  userLng?: number;
  lang?: Language;
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function NearbyCampList({
  camps,
  selectedCamp,
  onSelectCamp,
  onRegister,
  userLat = 18.55,
  userLng = 73.95,
  lang = "en",
}: Props) {
  const t = getTranslation(lang);

  if (camps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
        <CalendarDays className="h-10 w-10 text-muted-foreground/60 mb-2" />
        <p className="font-semibold text-foreground text-sm">{t.noCampsFound}</p>
        <p className="text-xs text-muted-foreground mt-1">{t.tryDifferentFilter}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-3">
      {camps.map((camp) => {
        const isSelected = selectedCamp?.id === camp.id;
        const activeRegs = MockStore.getCampRegistrations(camp.id).filter(
          (r) => r.status === "active",
        );
        const isFull = camp.capacity > 0 && activeRegs.length >= camp.capacity;
        const distanceKm = calculateDistance(userLat, userLng, camp.latitude, camp.longitude);

        return (
          <article
            key={camp.id}
            onClick={() => onSelectCamp(camp)}
            className={`cursor-pointer rounded-2xl border bg-card p-4 shadow-xs transition hover:shadow-elevated hover:-translate-y-0.5 ${
              isSelected
                ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                : "hover:border-primary/50"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                {camp.category}
              </span>
              <div className="flex items-center gap-1.5">
                {camp.verified && (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    Verified
                  </span>
                )}
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                  ~{distanceKm} km
                </span>
              </div>
            </div>

            <h3 className="mt-2 text-sm font-bold text-foreground leading-snug">{camp.name}</h3>

            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{camp.description}</p>

            <div className="mt-2.5 space-y-1 text-xs text-muted-foreground">
              <p className="flex items-center gap-2 font-medium text-foreground">
                <CalendarDays className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>
                  {formatCampDate(camp.date)} · {camp.startTime} - {camp.endTime}
                </span>
              </p>
              <p className="flex items-center gap-2 line-clamp-1">
                <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>{camp.address}</span>
              </p>
            </div>

            <div className="mt-3 flex items-center justify-between border-t pt-2.5 text-xs">
              <span className="text-[11px] text-muted-foreground">
                {isFull ? (
                  <span className="text-rose-600 font-bold">Capacity Full</span>
                ) : (
                  <span>
                    <b>{Math.max(0, camp.capacity - activeRegs.length)}</b> spots left
                  </span>
                )}
              </span>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRegister(camp);
                }}
                className="btn-primary flex items-center gap-1.5 text-xs py-1.5 px-3 font-semibold"
              >
                <span>{t.btnViewDetails}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
