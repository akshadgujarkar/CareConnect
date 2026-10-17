export type Service = "Vaccination" | "Screening" | "General Health";
export const SERVICES: Service[] = ["Vaccination", "Screening", "General Health"];

export interface Facility {
  id: string; name: string; type: "PHC" | "CHC" | "Hospital";
  lat: number; lng: number; location: string; services: Service[]; hours: string; phone: string;
}
export interface Camp {
  id: string; name: string; date: string; time: string; location: string;
  lat: number; lng: number; services: Service[]; verified: boolean; organizer: string;
}
export interface Gap {
  id: string; area: string; lat: number; lng: number; severity: "High" | "Medium";
  population: number; nearestFacilityKm: number; missing: Service[]; note: string;
}

export const MAP_CENTER: [number, number] = [18.55, 73.95];

export const facilities: Facility[] = [
  { id: "f1", name: "Sassoon General Hospital", type: "Hospital", lat: 18.5286, lng: 73.8743, location: "Pune City", services: ["Vaccination", "Screening", "General Health"], hours: "24x7", phone: "020-26128000" },
  { id: "f2", name: "PHC Wagholi", type: "PHC", lat: 18.5793, lng: 73.9787, location: "Wagholi, Haveli", services: ["Vaccination", "General Health"], hours: "9 AM – 5 PM", phone: "020-27051234" },
  { id: "f3", name: "CHC Hadapsar", type: "CHC", lat: 18.5089, lng: 73.926, location: "Hadapsar", services: ["Vaccination", "Screening", "General Health"], hours: "8 AM – 8 PM", phone: "020-26871122" },
  { id: "f4", name: "PHC Loni Kalbhor", type: "PHC", lat: 18.4855, lng: 74.0236, location: "Loni Kalbhor", services: ["Vaccination", "General Health"], hours: "9 AM – 5 PM", phone: "020-26913344" },
  { id: "f5", name: "District Hospital Aundh", type: "Hospital", lat: 18.5602, lng: 73.8077, location: "Aundh", services: ["Screening", "General Health"], hours: "24x7", phone: "020-25897766" },
  { id: "f6", name: "CHC Chakan", type: "CHC", lat: 18.7606, lng: 73.8636, location: "Chakan, Khed", services: ["Vaccination", "Screening", "General Health"], hours: "8 AM – 8 PM", phone: "02135-249900" },
  { id: "f7", name: "PHC Uruli Kanchan", type: "PHC", lat: 18.4846, lng: 74.1393, location: "Uruli Kanchan", services: ["Vaccination"], hours: "9 AM – 4 PM", phone: "020-26926655" },
];

export const camps: Camp[] = [
  { id: "c1", name: "Free Diabetes & BP Screening", date: "2026-10-22", time: "9:00 AM – 2:00 PM", location: "Gram Panchayat Hall, Kesnand", lat: 18.6, lng: 74.02, services: ["Screening"], verified: true, organizer: "Pune Zilla Parishad" },
  { id: "c2", name: "Child Immunization Drive", date: "2026-10-25", time: "10:00 AM – 4:00 PM", location: "Anganwadi Centre, Manjari", lat: 18.515, lng: 73.98, services: ["Vaccination"], verified: true, organizer: "NHM Maharashtra" },
  { id: "c3", name: "Women's Health Camp", date: "2026-10-28", time: "9:30 AM – 1:30 PM", location: "ZP School, Theur", lat: 18.53, lng: 74.05, services: ["Screening", "General Health"], verified: true, organizer: "Rotary Club Pune East" },
  { id: "c4", name: "General OPD & Eye Check", date: "2026-11-02", time: "8:00 AM – 12:00 PM", location: "Community Hall, Alandi", lat: 18.677, lng: 73.896, services: ["General Health", "Screening"], verified: false, organizer: "Local NGO (pending)" },
  { id: "c5", name: "Flu & HPV Vaccination", date: "2026-11-05", time: "10:00 AM – 3:00 PM", location: "Market Yard, Shikrapur", lat: 18.69, lng: 74.13, services: ["Vaccination"], verified: true, organizer: "District Health Office" },
  { id: "c6", name: "TB Screening Outreach", date: "2026-10-10", time: "9:00 AM – 1:00 PM", location: "Bus Stand, Uruli Kanchan", lat: 18.49, lng: 74.13, services: ["Screening"], verified: true, organizer: "NTEP Pune" },
];

export const gaps: Gap[] = [
  { id: "g1", area: "Kesnand – Bakori Belt", lat: 18.61, lng: 74.04, severity: "High", population: 18400, nearestFacilityKm: 9.2, missing: ["Screening"], note: "No screening services within 9 km." },
  { id: "g2", area: "Shikrapur Rural Cluster", lat: 18.7, lng: 74.12, severity: "High", population: 22100, nearestFacilityKm: 14.5, missing: ["Vaccination", "Screening"], note: "Low child immunization coverage (61%)." },
  { id: "g3", area: "Theur – Kolwadi", lat: 18.54, lng: 74.07, severity: "Medium", population: 9600, nearestFacilityKm: 6.8, missing: ["General Health"], note: "OPD available only 3 days/week." },
  { id: "g4", area: "Pirangut Hills", lat: 18.51, lng: 73.68, severity: "High", population: 12800, nearestFacilityKm: 12.1, missing: ["Vaccination", "General Health"], note: "Poor road connectivity in monsoon." },
  { id: "g5", area: "Rahu – Pimpalgaon", lat: 18.45, lng: 74.2, severity: "Medium", population: 7300, nearestFacilityKm: 8.4, missing: ["Screening"], note: "No cancer screening in 20 km." },
];

export const TODAY = new Date("2026-10-17");
export const isUpcoming = (c: Camp) => new Date(c.date) >= TODAY;
export const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
