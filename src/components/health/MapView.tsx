import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Circle, Popup, useMap } from "react-leaflet";
import {
  type Camp,
  type Facility,
  type HealthcareDemandArea,
  type Language,
} from "@/data/mockStore";
import { getTranslation } from "@/lib/i18n";
import { formatCampDate } from "@/lib/reminderEngine";

interface Props {
  mode: "organizer" | "user";
  camps: Camp[];
  facilities?: Facility[];
  demandAreas?: HealthcareDemandArea[];
  selectedCamp?: Camp | null;
  selectedDemandArea?: HealthcareDemandArea | null;
  onSelectCamp?: (c: Camp) => void;
  onSelectDemandArea?: (a: HealthcareDemandArea) => void;
  onRegister?: (c: Camp) => void;
  center?: [number, number];
  zoom?: number;
  lang?: Language;
}

const facilityRadius: Record<string, number> = { Hospital: 12, CHC: 9, PHC: 7 };

const categoryColors: Record<string, string> = {
  "Diabetes Screening": "#0284c7", // Sky blue
  "Child Immunization": "#10b981", // Emerald
  "Cancer Screening & Women's Health": "#ec4899", // Pink
  "Eye Checkup": "#8b5cf6", // Purple
  "HIV Testing and Awareness": "#f59e0b", // Amber
  "General Health Checkup": "#06b6d4", // Cyan
  "Blood Donation": "#ef4444", // Red
};

function MapFlyTo({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
}

export default function MapView({
  mode,
  camps,
  facilities = [],
  demandAreas = [],
  selectedCamp,
  selectedDemandArea,
  onSelectCamp,
  onSelectDemandArea,
  onRegister,
  center = [18.55, 73.95],
  zoom = 11,
  lang = "en",
}: Props) {
  const t = getTranslation(lang);

  return (
    <MapContainer center={center} zoom={zoom} className="h-full w-full" scrollWheelZoom>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapFlyTo center={center} zoom={zoom} />

      {/* Organizer Mode: Demand Areas (High/Medium Severity Coverage Gaps) */}
      {mode === "organizer" &&
        demandAreas.map((g) => {
          const isSelected = selectedDemandArea?.id === g.id;
          return (
            <Circle
              key={g.id}
              center={[g.lat, g.lng]}
              radius={g.radiusMeters}
              eventHandlers={{
                click: () => onSelectDemandArea?.(g),
              }}
              pathOptions={{
                color: g.demandLevel === "High" ? "#dc2626" : "#f59e0b",
                fillColor: g.demandLevel === "High" ? "#ef4444" : "#fbbf24",
                fillOpacity: isSelected ? 0.38 : 0.22,
                weight: isSelected ? 3 : 1.5,
                dashArray: g.demandLevel === "High" ? undefined : "6, 6",
              }}
            >
              <Popup>
                <div className="popup max-w-xs font-sans text-xs">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide ${
                        g.demandLevel === "High"
                          ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                      }`}
                    >
                      {g.demandLevel} Demand Area (Score: {g.priorityScore}/100)
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-foreground leading-tight">{g.areaName}</h3>
                  <p className="mt-1 text-muted-foreground">{g.notes}</p>
                  <div className="mt-2 space-y-0.5 border-t pt-1.5 text-foreground">
                    <p>
                      <b>Population at Risk:</b> {g.population.toLocaleString("en-IN")}
                    </p>
                    <p>
                      <b>Nearest Facility:</b> {g.nearestFacilityKm} km away
                    </p>
                    <p>
                      <b>Missing Services:</b> {g.missingServices.join(", ")}
                    </p>
                  </div>
                  <button
                    onClick={() => onSelectDemandArea?.(g)}
                    className="mt-2.5 w-full rounded bg-primary py-1.5 font-medium text-primary-foreground hover:bg-primary/90 text-[11px]"
                  >
                    View Healthcare Gap Details
                  </button>
                </div>
              </Popup>
            </Circle>
          );
        })}

      {/* Public Facilities (PHCs, CHCs, Hospitals) */}
      {mode === "organizer" &&
        facilities.map((f) => (
          <CircleMarker
            key={f.id}
            center={[f.lat, f.lng]}
            radius={facilityRadius[f.type] || 8}
            pathOptions={{
              color: "#1d4ed8",
              fillColor: "#3b82f6",
              fillOpacity: 0.85,
              weight: 2,
            }}
          >
            <Popup>
              <div className="popup font-sans text-xs">
                <span className="inline-block px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold mb-1">
                  {f.type} · Public Health Centre
                </span>
                <h3 className="text-sm font-bold text-foreground">{f.name}</h3>
                <p className="text-muted-foreground">
                  📍 {f.location} · 🕒 {f.hours}
                </p>
                <p className="mt-1">
                  <b>Available Services:</b> {f.services.join(", ")}
                </p>
                <div className="popup-actions mt-2 flex gap-2">
                  <a className="pbtn pbtn-primary" href={`tel:${f.phone}`}>
                    📞 Call {f.phone}
                  </a>
                  <a
                    className="pbtn"
                    target="_blank"
                    rel="noreferrer"
                    href={`https://www.google.com/maps/dir/?api=1&destination=${f.lat},${f.lng}`}
                  >
                    Directions
                  </a>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}

      {/* Active Camps (Available in both Organizer and User views) */}
      {camps.map((c) => {
        const isSelected = selectedCamp?.id === c.id;
        const color = categoryColors[c.category] || "#0d9488";

        return (
          <CircleMarker
            key={c.id}
            center={[c.latitude, c.longitude]}
            radius={isSelected ? 13 : 9}
            eventHandlers={{
              click: () => onSelectCamp?.(c),
            }}
            pathOptions={{
              color: isSelected ? "#000000" : color,
              fillColor: color,
              fillOpacity: 0.95,
              weight: isSelected ? 3.5 : 2,
            }}
          >
            <Popup>
              <div className="popup font-sans text-xs max-w-[270px]">
                <div className="flex items-center justify-between gap-1.5 mb-1">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                      c.verified
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    {c.verified ? "✓ Verified Camp" : "Pending Verification"}
                  </span>
                  <span className="text-[10px] font-medium text-muted-foreground uppercase">
                    {c.status}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-foreground leading-snug">{c.name}</h3>
                <p className="mt-1 text-muted-foreground font-medium">
                  📅 {formatCampDate(c.date)} · {c.startTime} - {c.endTime}
                </p>
                <p className="text-muted-foreground text-[11px] mt-0.5">📍 {c.address}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  <b>{t.organizer}:</b> {c.organizerName}
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {c.services.map((s) => (
                    <span
                      key={s}
                      className="px-1.5 py-0.5 rounded bg-muted text-[10px] text-muted-foreground font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>
                <div className="popup-actions mt-3 flex flex-col gap-1.5">
                  <button
                    className="pbtn pbtn-primary w-full text-center"
                    onClick={() => {
                      onSelectCamp?.(c);
                      onRegister?.(c);
                    }}
                  >
                    {mode === "organizer" ? "Manage Camp Details" : t.btnViewDetails}
                  </button>
                  <a
                    className="pbtn text-center"
                    target="_blank"
                    rel="noreferrer"
                    href={`https://www.google.com/maps/dir/?api=1&destination=${c.latitude},${c.longitude}`}
                  >
                    {t.btnDirections}
                  </a>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
