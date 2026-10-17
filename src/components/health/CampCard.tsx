import { BadgeCheck, CalendarDays, MapPin, Clock } from "lucide-react";
import { formatDate, type Camp } from "@/data/health";

export function CampCard({ camp, onRegister }: { camp: Camp; onRegister: (c: Camp) => void }) {
  return (
    <article className="group rounded-xl border bg-card p-4 shadow-soft transition hover:-translate-y-0.5 hover:shadow-elevated">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold leading-snug">{camp.name}</h3>
        {camp.verified ? (
          <span className="badge-verified">
            <BadgeCheck className="h-3.5 w-3.5" />
            Verified
          </span>
        ) : (
          <span className="badge-muted">Pending</span>
        )}
      </div>
      <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
        <p className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-primary" />
          {formatDate(camp.date)}
        </p>
        <p className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          {camp.time}
        </p>
        <p className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          {camp.location}
        </p>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {camp.services.map((s) => (
          <span
            key={s}
            className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground"
          >
            {s}
          </span>
        ))}
      </div>
      <button onClick={() => onRegister(camp)} className="btn-primary mt-4 w-full">
        Register Interest
      </button>
    </article>
  );
}
