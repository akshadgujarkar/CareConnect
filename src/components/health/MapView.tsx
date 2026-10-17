import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, CircleMarker, Circle, Popup } from "react-leaflet";
import { MAP_CENTER, formatDate, type Camp, type Facility, type Gap } from "@/data/health";

interface Props {
  facilities: Facility[]; camps: Camp[]; gaps: Gap[]; onRegister: (c: Camp) => void;
}
const typeRadius = { Hospital: 11, CHC: 9, PHC: 7 };

export default function MapView({ facilities, camps, gaps, onRegister }: Props) {
  return (
    <MapContainer center={MAP_CENTER} zoom={11} className="h-full w-full" scrollWheelZoom>
      <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {gaps.map((g) => (
        <Circle key={g.id} center={[g.lat, g.lng]} radius={g.severity === "High" ? 2600 : 1800}
          pathOptions={{ className: g.severity === "High" ? "mk-gap-high" : "mk-gap-med" }}>
          <Popup>
            <div className="popup">
              <span className="chip chip-gap">{g.severity} Access Gap</span>
              <h3>{g.area}</h3>
              <p>{g.note}</p>
              <p><b>Population:</b> {g.population.toLocaleString()} · <b>Nearest facility:</b> {g.nearestFacilityKm} km</p>
              <p><b>Missing:</b> {g.missing.join(", ")}</p>
            </div>
          </Popup>
        </Circle>
      ))}
      {facilities.map((f) => (
        <CircleMarker key={f.id} center={[f.lat, f.lng]} radius={typeRadius[f.type]}
          pathOptions={{ className: `mk-facility mk-${f.type.toLowerCase()}` }}>
          <Popup>
            <div className="popup">
              <span className="chip chip-facility">{f.type}</span>
              <h3>{f.name}</h3>
              <p>📍 {f.location} · 🕒 {f.hours}</p>
              <p><b>Services:</b> {f.services.join(", ")}</p>
              <div className="popup-actions">
                <a className="pbtn pbtn-primary" href={`tel:${f.phone}`}>Call</a>
                <a className="pbtn" target="_blank" rel="noreferrer" href={`https://www.google.com/maps/dir/?api=1&destination=${f.lat},${f.lng}`}>Directions</a>
              </div>
            </div>
          </Popup>
        </CircleMarker>
      ))}
      {camps.map((c) => (
        <CircleMarker key={c.id} center={[c.lat, c.lng]} radius={9}
          pathOptions={{ className: c.verified ? "mk-camp" : "mk-camp-unverified" }}>
          <Popup>
            <div className="popup">
              <span className="chip chip-camp">{c.verified ? "✓ Verified Camp" : "Unverified Camp"}</span>
              <h3>{c.name}</h3>
              <p>📅 {formatDate(c.date)} · {c.time}</p>
              <p>📍 {c.location}</p>
              <p><b>Services:</b> {c.services.join(", ")}</p>
              <div className="popup-actions">
                <button className="pbtn pbtn-primary" onClick={() => onRegister(c)}>Register Interest</button>
                <a className="pbtn" target="_blank" rel="noreferrer" href={`https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lng}`}>Directions</a>
              </div>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
