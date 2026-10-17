/**
 * CareConnect Unified Relational Mock Store
 *
 * Implements all specification entities with relational integrity:
 * - Users & Organizer Profiles
 * - Camps & Demand Areas & Facilities
 * - Registrations & 8:00 PM Pre-Camp Reminders
 * - Camp-specific Conversations & Messages
 * - In-app Notifications
 *
 * Persisted in localStorage with real-time broadcast to all listening components.
 */

export type Role = "organizer" | "user";
export type Language = "en" | "hi" | "mr";
export type CampStatus = "upcoming" | "completed" | "cancelled" | "draft";
export type RegistrationStatus = "active" | "cancelled" | "attended";
export type NotificationType = "new_camp" | "registration_confirmed" | "reminder" | "schedule_change" | "chat_reply";
export type OrganizerType = "NGO" | "Doctor" | "Hospital" | "Government";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  preferredLanguage: Language;
  selectedArea: string;
  lat: number;
  lng: number;
}

export interface OrganizerProfile {
  id: string;
  userId: string;
  organizerType: OrganizerType;
  organizationName: string;
  contactPhone: string;
  contactEmail: string;
  description: string;
  verified: boolean;
}

export interface Camp {
  id: string;
  organizerId: string;
  organizerName: string;
  organizerType: OrganizerType;
  name: string;
  category: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  registrationDeadline?: string;
  capacity: number;
  registrationsCount: number;
  status: CampStatus;
  verified: boolean;
  services: string[];
  contactPhone: string;
  eligibility: string;
  instructions: string;
  createdAt: string;
  updatedAt: string;
}

export interface Registration {
  id: string;
  campId: string;
  campName: string;
  campDate: string;
  campTime: string;
  campAddress: string;
  userId: string;
  userName: string;
  userPhone: string;
  userEmail: string;
  userMessage?: string;
  registeredAt: string;
  status: RegistrationStatus;
  reminderScheduledAt: string; // Timestamp for 8:00 PM day before camp
  reminderStatus: "scheduled" | "sent" | "cancelled";
  remindersSent: {
    channel: "sms" | "email" | "in_app";
    at: string;
  }[];
}

export interface Notification {
  id: string;
  recipientUserId: string;
  relatedCampId?: string;
  relatedRegistrationId?: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  readAt: string | null;
}

export interface Conversation {
  id: string;
  campId: string;
  campName: string;
  userId: string;
  userName: string;
  organizerId: string;
  organizerName: string;
  createdAt: string;
  updatedAt: string;
  unreadCountOrganizer: number;
  unreadCountUser: number;
}

export interface Message {
  id: string;
  conversationId: string;
  campId: string;
  senderId: string;
  senderName: string;
  senderRole: Role;
  messageText: string;
  createdAt: string;
  readAt: string | null;
}

export interface HealthcareDemandArea {
  id: string;
  areaName: string;
  lat: number;
  lng: number;
  radiusMeters: number;
  healthcareCategory: string;
  demandLevel: "High" | "Medium";
  priorityScore: number; // 1-100
  population: number;
  nearestFacilityKm: number;
  missingServices: string[];
  dataSource: string;
  notes: string;
  lastUpdated: string;
}

export interface Facility {
  id: string;
  name: string;
  type: "PHC" | "CHC" | "Hospital";
  lat: number;
  lng: number;
  location: string;
  services: string[];
  hours: string;
  phone: string;
}

// ---------------- INITIAL SEED DATA ----------------

export const INITIAL_DEMAND_AREAS: HealthcareDemandArea[] = [
  {
    id: "g1",
    areaName: "Kesnand – Bakori Belt",
    lat: 18.61,
    lng: 74.04,
    radiusMeters: 2600,
    healthcareCategory: "Diabetes Screening",
    demandLevel: "High",
    priorityScore: 92,
    population: 18400,
    nearestFacilityKm: 9.2,
    missingServices: ["Diabetes Screening", "Hypertension Check"],
    dataSource: "Zilla Parishad Rural Health Survey 2025",
    notes: "High concentration of agricultural workers with no screening facility within 9 km.",
    lastUpdated: "2026-09-15",
  },
  {
    id: "g2",
    areaName: "Shikrapur Rural Cluster",
    lat: 18.7,
    lng: 74.12,
    radiusMeters: 2800,
    healthcareCategory: "Child Immunization",
    demandLevel: "High",
    priorityScore: 88,
    population: 22100,
    nearestFacilityKm: 14.5,
    missingServices: ["Child Immunization", "Maternal Care", "HIV Testing and Awareness"],
    dataSource: "National Health Mission Coverage Report",
    notes: "Child immunization coverage lagging at 61%. High requirement for maternal outreach.",
    lastUpdated: "2026-08-30",
  },
  {
    id: "g3",
    areaName: "Theur – Kolwadi",
    lat: 18.54,
    lng: 74.07,
    radiusMeters: 1800,
    healthcareCategory: "General Health Checkup",
    demandLevel: "Medium",
    priorityScore: 74,
    population: 9600,
    nearestFacilityKm: 6.8,
    missingServices: ["General OPD", "Geriatric Care"],
    dataSource: "District Health Officer Audit",
    notes: "Sub-centre OPD operational only 2 mornings per week. Elderly population needs attention.",
    lastUpdated: "2026-10-01",
  },
  {
    id: "g4",
    areaName: "Pirangut Valley & Hills",
    lat: 18.51,
    lng: 73.68,
    radiusMeters: 2500,
    healthcareCategory: "Eye Checkup & Vision",
    demandLevel: "High",
    priorityScore: 85,
    population: 12800,
    nearestFacilityKm: 12.1,
    missingServices: ["Eye Checkup", "Cataract Screening", "Vaccination"],
    dataSource: "Community Health Worker Logs",
    notes: "Hilly terrain restricts mobility; cataract backlog identified among seniors.",
    lastUpdated: "2026-09-20",
  },
  {
    id: "g5",
    areaName: "Rahu – Pimpalgaon",
    lat: 18.45,
    lng: 74.2,
    radiusMeters: 1900,
    healthcareCategory: "Cancer Screening & Women's Health",
    demandLevel: "Medium",
    priorityScore: 68,
    population: 7300,
    nearestFacilityKm: 8.4,
    missingServices: ["Oral Cancer Screening", "Cervical Screening"],
    dataSource: "Regional Cancer Centre Outreach Data",
    notes: "High prevalence of tobacco use; early screening camp urgently recommended.",
    lastUpdated: "2026-07-12",
  },
];

export const INITIAL_FACILITIES: Facility[] = [
  { id: "f1", name: "Sassoon General Hospital", type: "Hospital", lat: 18.5286, lng: 73.8743, location: "Pune City", services: ["General Health", "Screening", "Vaccination", "Emergency", "Surgery"], hours: "24x7", phone: "020-26128000" },
  { id: "f2", name: "PHC Wagholi", type: "PHC", lat: 18.5793, lng: 73.9787, location: "Wagholi, Haveli", services: ["Vaccination", "General Health", "Maternal Care"], hours: "9:00 AM – 5:00 PM", phone: "020-27051234" },
  { id: "f3", name: "CHC Hadapsar", type: "CHC", lat: 18.5089, lng: 73.926, location: "Hadapsar", services: ["Screening", "General Health", "Vaccination", "Laboratory"], hours: "8:00 AM – 8:00 PM", phone: "020-26871122" },
  { id: "f4", name: "PHC Loni Kalbhor", type: "PHC", lat: 18.4855, lng: 74.0236, location: "Loni Kalbhor", services: ["Vaccination", "General Health"], hours: "9:00 AM – 5:00 PM", phone: "020-26913344" },
  { id: "f5", name: "District Hospital Aundh", type: "Hospital", lat: 18.5602, lng: 73.8077, location: "Aundh", services: ["General Health", "Screening", "Specialist OPD"], hours: "24x7", phone: "020-25897766" },
  { id: "f6", name: "CHC Chakan", type: "CHC", lat: 18.7606, lng: 73.8636, location: "Chakan, Khed", services: ["Vaccination", "Screening", "General Health"], hours: "8:00 AM – 8:00 PM", phone: "02135-249900" },
  { id: "f7", name: "PHC Uruli Kanchan", type: "PHC", lat: 18.4846, lng: 74.1393, location: "Uruli Kanchan", services: ["Vaccination", "General Health"], hours: "9:00 AM – 4:00 PM", phone: "020-26926655" },
];

export const INITIAL_ORGANIZER_USER: User = {
  id: "u_org_1",
  name: "Dr. Aruna Shinde",
  email: "dr.aruna@rotaryeast.org",
  phone: "9822012345",
  role: "organizer",
  preferredLanguage: "en",
  selectedArea: "Pune Rural & East",
  lat: 18.53,
  lng: 74.05,
};

export const INITIAL_RESIDENT_USER: User = {
  id: "u_user_1",
  name: "Ramesh Jadhav",
  email: "ramesh.jadhav@example.com",
  phone: "9876543210",
  role: "user",
  preferredLanguage: "mr",
  selectedArea: "Kesnand – Wagholi",
  lat: 18.58,
  lng: 74.01,
};

export const INITIAL_ORGANIZER_PROFILE: OrganizerProfile = {
  id: "org_prof_1",
  userId: "u_org_1",
  organizerType: "NGO",
  organizationName: "Rotary Club Pune East Healthcare Foundation",
  contactPhone: "+91 98220 12345",
  contactEmail: "care@rotarypuneeast.org",
  description: "Non-profit community healthcare mission organizing free diagnostics, eye checkups, and diabetes camps across rural Pune.",
  verified: true,
};

export const INITIAL_CAMPS: Camp[] = [
  {
    id: "c1",
    organizerId: "org_prof_1",
    organizerName: "Rotary Club Pune East Healthcare Foundation",
    organizerType: "NGO",
    name: "Free Diabetes & BP Comprehensive Screening",
    category: "Diabetes Screening",
    description: "Full blood sugar check (random & fasting advice), HbA1c consultation, blood pressure monitoring, and free 1-month prescription consultation with certified physicians.",
    address: "Gram Panchayat Community Hall, Kesnand, Taluka Haveli, Pune 412207",
    latitude: 18.605,
    longitude: 74.025,
    date: "2026-10-22",
    startTime: "09:00",
    endTime: "14:00",
    registrationDeadline: "2026-10-21",
    capacity: 150,
    registrationsCount: 2,
    status: "upcoming",
    verified: true,
    services: ["Diabetes Screening", "General Health Checkup"],
    contactPhone: "+91 98220 12345",
    eligibility: "Open to all adults aged 18 and above. Bring previous prescriptions if any.",
    instructions: "Please arrive in comfortable clothing. Fasting 8 hours prior is recommended for accurate glucose reading.",
    createdAt: "2026-10-01T10:00:00Z",
    updatedAt: "2026-10-01T10:00:00Z",
  },
  {
    id: "c2",
    organizerId: "org_prof_1",
    organizerName: "National Health Mission & Rotary East",
    organizerType: "Government",
    name: "Child Immunization & Pediatric Nutrition Drive",
    category: "Child Immunization",
    description: "Scheduled national childhood vaccinations (BCG, Polio, Pentavalent, Measles-Rubella), height/weight growth monitoring, and free vitamin A supplements.",
    address: "Anganwadi Main Centre, Near Primary School, Manjari, Pune 412307",
    latitude: 18.515,
    longitude: 73.98,
    date: "2026-10-25",
    startTime: "10:00",
    endTime: "16:00",
    registrationDeadline: "2026-10-24",
    capacity: 100,
    registrationsCount: 1,
    status: "upcoming",
    verified: true,
    services: ["Child Immunization", "Pediatric Care"],
    contactPhone: "+91 98220 12345",
    eligibility: "Infants and children from age 0 to 12 years. Mother/guardian must accompany.",
    instructions: "Please bring the child's immunization card (MCP card) if already issued.",
    createdAt: "2026-10-05T09:30:00Z",
    updatedAt: "2026-10-05T09:30:00Z",
  },
  {
    id: "c3",
    organizerId: "org_prof_1",
    organizerName: "Rotary Club Pune East Healthcare Foundation",
    organizerType: "NGO",
    name: "Women's Health & Cervical Awareness Outreach",
    category: "Cancer Screening & Women's Health",
    description: "Specialized maternal and women's health consultation, anemia screening, cervical cancer awareness session, and confidential doctor consultations.",
    address: "ZP School Ground Hall, Theur, Taluka Haveli, Pune 412110",
    latitude: 18.53,
    longitude: 74.05,
    date: "2026-10-28",
    startTime: "09:30",
    endTime: "13:30",
    registrationDeadline: "2026-10-27",
    capacity: 120,
    registrationsCount: 0,
    status: "upcoming",
    verified: true,
    services: ["Cancer Screening", "General Health Checkup"],
    contactPhone: "+91 98220 12345",
    eligibility: "Women of all age groups. Female gynecologists and nurses on site.",
    instructions: "Free sanitary kits and multivitamins provided to all attendees.",
    createdAt: "2026-10-07T11:00:00Z",
    updatedAt: "2026-10-07T11:00:00Z",
  },
  {
    id: "c4",
    organizerId: "org_prof_1",
    organizerName: "Alandi Seva Sanstha (Doctor Volunteers)",
    organizerType: "Doctor",
    name: "General OPD & Senior Eye Checkup Camp",
    category: "Eye Checkup",
    description: "Vision testing, cataract evaluation, refraction test for free prescription spectacles, and general physician OPD for joint pain and hypertension.",
    address: "Sant Dnyaneshwar Community Hall, Alandi, Pune 412105",
    latitude: 18.677,
    longitude: 73.896,
    date: "2026-11-02",
    startTime: "08:00",
    endTime: "12:30",
    registrationDeadline: "2026-11-01",
    capacity: 80,
    registrationsCount: 0,
    status: "upcoming",
    verified: false,
    services: ["Eye Checkup", "General Health Checkup"],
    contactPhone: "+91 94220 98765",
    eligibility: "Open to general public; special queue for senior citizens.",
    instructions: "Spectacles distributed free to identified low-income seniors within 10 days.",
    createdAt: "2026-10-08T14:15:00Z",
    updatedAt: "2026-10-08T14:15:00Z",
  },
  {
    id: "c5",
    organizerId: "org_prof_1",
    organizerName: "District Health Office & Rotary East",
    organizerType: "Government",
    name: "HIV Testing, Counselling & Awareness Camp",
    category: "HIV Testing and Awareness",
    description: "Voluntary, completely confidential rapid HIV screening, pre- and post-test counselling by certified ICTC counsellors, and awareness session on prevention.",
    address: "APMC Market Yard Hall, Shikrapur, Taluka Shirur, Pune 412208",
    latitude: 18.69,
    longitude: 74.13,
    date: "2026-11-05",
    startTime: "10:00",
    endTime: "15:00",
    registrationDeadline: "2026-11-04",
    capacity: 90,
    registrationsCount: 0,
    status: "upcoming",
    verified: true,
    services: ["HIV Testing and Awareness", "Screening"],
    contactPhone: "+91 98220 12345",
    eligibility: "Open to all persons aged 15+. Strict privacy and confidentiality ensured.",
    instructions: "No prior fasting needed. Test takes 20 minutes with on-spot result counselling.",
    createdAt: "2026-10-10T08:00:00Z",
    updatedAt: "2026-10-10T08:00:00Z",
  },
];

export const INITIAL_REGISTRATIONS: Registration[] = [
  {
    id: "reg_1",
    campId: "c1",
    campName: "Free Diabetes & BP Comprehensive Screening",
    campDate: "2026-10-22",
    campTime: "09:00 AM – 02:00 PM",
    campAddress: "Gram Panchayat Community Hall, Kesnand, Taluka Haveli, Pune",
    userId: "u_user_1",
    userName: "Ramesh Jadhav",
    userPhone: "9876543210",
    userEmail: "ramesh.jadhav@example.com",
    userMessage: "Elderly family member has fluctuating blood sugar.",
    registeredAt: "2026-10-16T14:22:00Z",
    status: "active",
    reminderScheduledAt: "2026-10-21T20:00:00+05:30", // 8:00 PM day before camp
    reminderStatus: "scheduled",
    remindersSent: [
      { channel: "in_app", at: "2026-10-16T14:22:00Z" }
    ],
  },
  {
    id: "reg_2",
    campId: "c2",
    campName: "Child Immunization & Pediatric Nutrition Drive",
    campDate: "2026-10-25",
    campTime: "10:00 AM – 04:00 PM",
    campAddress: "Anganwadi Main Centre, Near Primary School, Manjari, Pune",
    userId: "u_user_2",
    userName: "Sunita Gaikwad",
    userPhone: "9823456781",
    userEmail: "sunita.g@example.com",
    userMessage: "Need 9-month measles booster for my daughter.",
    registeredAt: "2026-10-16T16:40:00Z",
    status: "active",
    reminderScheduledAt: "2026-10-24T20:00:00+05:30",
    reminderStatus: "scheduled",
    remindersSent: [
      { channel: "in_app", at: "2026-10-16T16:40:00Z" }
    ],
  },
  {
    id: "reg_3",
    campId: "c1",
    campName: "Free Diabetes & BP Comprehensive Screening",
    campDate: "2026-10-22",
    campTime: "09:00 AM – 02:00 PM",
    campAddress: "Gram Panchayat Community Hall, Kesnand, Taluka Haveli, Pune",
    userId: "u_user_3",
    userName: "Anand Kulkarni",
    userPhone: "9850123456",
    userEmail: "anand.k@example.com",
    registeredAt: "2026-10-17T09:15:00Z",
    status: "active",
    reminderScheduledAt: "2026-10-21T20:00:00+05:30",
    reminderStatus: "scheduled",
    remindersSent: [],
  },
];

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: "conv_1",
    campId: "c1",
    campName: "Free Diabetes & BP Comprehensive Screening",
    userId: "u_user_1",
    userName: "Ramesh Jadhav",
    organizerId: "org_prof_1",
    organizerName: "Rotary Club Pune East Healthcare Foundation",
    createdAt: "2026-10-16T14:30:00Z",
    updatedAt: "2026-10-16T15:10:00Z",
    unreadCountOrganizer: 0,
    unreadCountUser: 0,
  },
];

export const INITIAL_MESSAGES: Message[] = [
  {
    id: "msg_1",
    conversationId: "conv_1",
    campId: "c1",
    senderId: "u_user_1",
    senderName: "Ramesh Jadhav",
    senderRole: "user",
    messageText: "Namaste Doctor, what documents should we bring for the blood sugar check?",
    createdAt: "2026-10-16T14:30:00Z",
    readAt: "2026-10-16T14:45:00Z",
  },
  {
    id: "msg_2",
    conversationId: "conv_1",
    campId: "c1",
    senderId: "u_org_1",
    senderName: "Dr. Aruna Shinde",
    senderRole: "organizer",
    messageText: "Namaste Ramesh ji. Please bring any recent prescription or Aadhaar card if available. No prior registration fees. Keep overnight fasting for the best sugar test result.",
    createdAt: "2026-10-16T15:10:00Z",
    readAt: "2026-10-16T15:20:00Z",
  },
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "notif_1",
    recipientUserId: "u_user_1",
    relatedCampId: "c1",
    relatedRegistrationId: "reg_1",
    type: "registration_confirmed",
    title: "Registration Confirmed",
    message: "You are registered for Free Diabetes & BP Screening on Oct 22, 2026 at Kesnand Hall. Reminder scheduled for Oct 21 at 8:00 PM.",
    createdAt: "2026-10-16T14:22:00Z",
    readAt: null,
  },
  {
    id: "notif_2",
    recipientUserId: "u_user_1",
    relatedCampId: "c2",
    type: "new_camp",
    title: "New Health Camp Near You",
    message: "Child Immunization & Pediatric Nutrition Drive has been scheduled in Manjari on Oct 25, 2026.",
    createdAt: "2026-10-16T09:00:00Z",
    readAt: "2026-10-16T10:00:00Z",
  },
  {
    id: "notif_3",
    recipientUserId: "u_org_1",
    relatedCampId: "c1",
    type: "chat_reply",
    title: "New Participant Query",
    message: "Ramesh Jadhav sent a question regarding Free Diabetes & BP Comprehensive Screening.",
    createdAt: "2026-10-16T14:30:00Z",
    readAt: "2026-10-16T14:45:00Z",
  },
];

// ---------------- LOCAL STORAGE KEYS ----------------
const STORAGE_PREFIX = "careconnect_";
const KEYS = {
  CURRENT_USER: `${STORAGE_PREFIX}current_user`,
  ORGANIZER_PROFILE: `${STORAGE_PREFIX}organizer_profile`,
  CAMPS: `${STORAGE_PREFIX}camps`,
  REGISTRATIONS: `${STORAGE_PREFIX}registrations`,
  NOTIFICATIONS: `${STORAGE_PREFIX}notifications`,
  CONVERSATIONS: `${STORAGE_PREFIX}conversations`,
  MESSAGES: `${STORAGE_PREFIX}messages`,
  DEMAND_AREAS: `${STORAGE_PREFIX}demand_areas`,
  FACILITIES: `${STORAGE_PREFIX}facilities`,
};

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    notifyListeners();
  } catch (e) {
    console.error("Storage write error", e);
  }
}

// ---------------- REACTIVE SUBSCRIPTION ----------------
type Listener = () => void;
const listeners = new Set<Listener>();

export function subscribeStore(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyListeners() {
  listeners.forEach((fn) => {
    try {
      fn();
    } catch (e) {
      console.error("Listener callback failed", e);
    }
  });
}

// ---------------- STORE SERVICE METHODS ----------------

export const MockStore = {
  // Current active user & role
  getCurrentUser(): User {
    return readStorage<User>(KEYS.CURRENT_USER, INITIAL_RESIDENT_USER);
  },
  setCurrentUser(user: User): void {
    writeStorage(KEYS.CURRENT_USER, user);
  },
  switchRole(role: Role): User {
    const target = role === "organizer" ? INITIAL_ORGANIZER_USER : INITIAL_RESIDENT_USER;
    const current = MockStore.getCurrentUser();
    // Preserve language preference across role switch
    const updated = { ...target, preferredLanguage: current.preferredLanguage };
    MockStore.setCurrentUser(updated);
    return updated;
  },
  setUserLanguage(lang: Language): void {
    const current = MockStore.getCurrentUser();
    MockStore.setCurrentUser({ ...current, preferredLanguage: lang });
  },

  // Organizer Profile
  getOrganizerProfile(): OrganizerProfile {
    return readStorage<OrganizerProfile>(KEYS.ORGANIZER_PROFILE, INITIAL_ORGANIZER_PROFILE);
  },
  updateOrganizerProfile(updates: Partial<OrganizerProfile>): OrganizerProfile {
    const current = MockStore.getOrganizerProfile();
    const next = { ...current, ...updates };
    writeStorage(KEYS.ORGANIZER_PROFILE, next);
    return next;
  },

  // Camps
  getCamps(): Camp[] {
    return readStorage<Camp[]>(KEYS.CAMPS, INITIAL_CAMPS);
  },
  getCampById(id: string): Camp | undefined {
    return MockStore.getCamps().find((c) => c.id === id);
  },
  createCamp(campData: Omit<Camp, "id" | "registrationsCount" | "createdAt" | "updatedAt">): Camp {
    const camps = MockStore.getCamps();
    const newCamp: Camp = {
      ...campData,
      id: `camp_${Date.now()}`,
      registrationsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    camps.unshift(newCamp);
    writeStorage(KEYS.CAMPS, camps);

    // Create notifications for users discovering this new camp
    const notifs = MockStore.getNotifications();
    notifs.unshift({
      id: `notif_${Date.now()}`,
      recipientUserId: "u_user_1",
      relatedCampId: newCamp.id,
      type: "new_camp",
      title: "New Health Camp Scheduled",
      message: `${newCamp.name} scheduled for ${newCamp.date} at ${newCamp.address}.`,
      createdAt: new Date().toISOString(),
      readAt: null,
    });
    writeStorage(KEYS.NOTIFICATIONS, notifs);

    return newCamp;
  },
  updateCamp(id: string, updates: Partial<Camp>): Camp | undefined {
    const camps = MockStore.getCamps();
    const idx = camps.findIndex((c) => c.id === id);
    if (idx === -1) return undefined;
    const updated = { ...camps[idx], ...updates, updatedAt: new Date().toISOString() };
    camps[idx] = updated;
    writeStorage(KEYS.CAMPS, camps);

    // If date/time changed or cancelled, notify all registered beneficiaries
    if (updates.status === "cancelled" || updates.date || updates.startTime) {
      const regs = MockStore.getRegistrations().filter((r) => r.campId === id && r.status === "active");
      const notifs = MockStore.getNotifications();
      regs.forEach((r) => {
        notifs.unshift({
          id: `notif_${Date.now()}_${r.id}`,
          recipientUserId: r.userId,
          relatedCampId: id,
          relatedRegistrationId: r.id,
          type: "schedule_change",
          title: updates.status === "cancelled" ? "Camp Cancelled" : "Camp Rescheduled",
          message: updates.status === "cancelled"
            ? `${updated.name} on ${updated.date} has been cancelled by the organizer.`
            : `${updated.name} has been updated to ${updated.date} (${updated.startTime} - ${updated.endTime}).`,
          createdAt: new Date().toISOString(),
          readAt: null,
        });
      });
      writeStorage(KEYS.NOTIFICATIONS, notifs);
    }
    return updated;
  },
  cancelCamp(id: string, reason?: string): boolean {
    const camp = MockStore.getCampById(id);
    if (!camp) return false;
    MockStore.updateCamp(id, { status: "cancelled" });

    // Mark registrations cancelled & cancel scheduled reminders
    const regs = MockStore.getRegistrations();
    const updatedRegs = regs.map((r) => {
      if (r.campId === id && r.status === "active") {
        return { ...r, status: "cancelled" as const, reminderStatus: "cancelled" as const };
      }
      return r;
    });
    writeStorage(KEYS.REGISTRATIONS, updatedRegs);
    return true;
  },

  // Registrations & 8:00 PM Reminder Calculation
  getRegistrations(): Registration[] {
    return readStorage<Registration[]>(KEYS.REGISTRATIONS, INITIAL_REGISTRATIONS);
  },
  getUserRegistrations(userId: string): Registration[] {
    return MockStore.getRegistrations().filter((r) => r.userId === userId);
  },
  getCampRegistrations(campId: string): Registration[] {
    return MockStore.getRegistrations().filter((r) => r.campId === campId);
  },
  registerForCamp(
    campId: string,
    userInfo: { name: string; phone: string; email?: string; message?: string },
    userOverride?: User
  ): { success: boolean; error?: string; registration?: Registration } {
    const camp = MockStore.getCampById(campId);
    if (!camp) return { success: false, error: "Camp not found." };
    if (camp.status !== "upcoming") return { success: false, error: "This camp is no longer accepting registrations." };

    const activeRegistrations = MockStore.getCampRegistrations(campId).filter((r) => r.status === "active");
    if (camp.capacity > 0 && activeRegistrations.length >= camp.capacity) {
      return { success: false, error: "Camp capacity has been reached." };
    }

    const currentUser = userOverride || MockStore.getCurrentUser();

    // Check for duplicate active registration
    const existing = activeRegistrations.find(
      (r) => r.userId === currentUser.id || r.userPhone === userInfo.phone
    );
    if (existing) {
      return { success: false, error: "You are already actively registered for this camp." };
    }

    // Calculate 8:00 PM reminder on the preceding calendar day
    const campDateObj = new Date(`${camp.date}T00:00:00`);
    const reminderDateObj = new Date(campDateObj);
    reminderDateObj.setDate(reminderDateObj.getDate() - 1);
    reminderDateObj.setHours(20, 0, 0, 0); // 8:00 PM
    const reminderISO = reminderDateObj.toISOString();

    const newReg: Registration = {
      id: `reg_${Date.now()}`,
      campId: camp.id,
      campName: camp.name,
      campDate: camp.date,
      campTime: `${camp.startTime} – ${camp.endTime}`,
      campAddress: camp.address,
      userId: currentUser.id,
      userName: userInfo.name.trim(),
      userPhone: userInfo.phone.trim(),
      userEmail: userInfo.email?.trim() || "",
      userMessage: userInfo.message?.trim(),
      registeredAt: new Date().toISOString(),
      status: "active",
      reminderScheduledAt: reminderISO,
      reminderStatus: "scheduled",
      remindersSent: [
        { channel: "in_app", at: new Date().toISOString() },
      ],
    };

    // Save registration
    const regs = MockStore.getRegistrations();
    regs.unshift(newReg);
    writeStorage(KEYS.REGISTRATIONS, regs);

    // Update camp registrations count
    const camps = MockStore.getCamps();
    const campIdx = camps.findIndex((c) => c.id === campId);
    if (campIdx !== -1) {
      camps[campIdx].registrationsCount = activeRegistrations.length + 1;
      writeStorage(KEYS.CAMPS, camps);
    }

    // Create confirmation notification for user
    const notifs = MockStore.getNotifications();
    notifs.unshift({
      id: `notif_${Date.now()}`,
      recipientUserId: currentUser.id,
      relatedCampId: camp.id,
      relatedRegistrationId: newReg.id,
      type: "registration_confirmed",
      title: "Registration Confirmed!",
      message: `You are confirmed for ${camp.name} on ${camp.date}. Reminder scheduled for 8:00 PM on ${reminderDateObj.toLocaleDateString("en-IN", { month: "short", day: "numeric" })}.`,
      createdAt: new Date().toISOString(),
      readAt: null,
    });
    writeStorage(KEYS.NOTIFICATIONS, notifs);

    return { success: true, registration: newReg };
  },
  cancelRegistration(regId: string): boolean {
    const regs = MockStore.getRegistrations();
    const reg = regs.find((r) => r.id === regId);
    if (!reg) return false;

    reg.status = "cancelled";
    reg.reminderStatus = "cancelled";
    writeStorage(KEYS.REGISTRATIONS, regs);

    // Decrement camp registration count
    const camps = MockStore.getCamps();
    const camp = camps.find((c) => c.id === reg.campId);
    if (camp && camp.registrationsCount > 0) {
      camp.registrationsCount = Math.max(0, camp.registrationsCount - 1);
      writeStorage(KEYS.CAMPS, camps);
    }

    // Add cancellation notification
    const notifs = MockStore.getNotifications();
    notifs.unshift({
      id: `notif_${Date.now()}`,
      recipientUserId: reg.userId,
      relatedCampId: reg.campId,
      relatedRegistrationId: reg.id,
      type: "schedule_change",
      title: "Registration Cancelled",
      message: `Your registration for ${reg.campName} has been cancelled.`,
      createdAt: new Date().toISOString(),
      readAt: null,
    });
    writeStorage(KEYS.NOTIFICATIONS, notifs);

    return true;
  },
  markAttendance(regId: string, attended: boolean): boolean {
    const regs = MockStore.getRegistrations();
    const reg = regs.find((r) => r.id === regId);
    if (!reg) return false;
    reg.status = attended ? "attended" : "active";
    writeStorage(KEYS.REGISTRATIONS, regs);
    return true;
  },

  // Trigger / simulate 8:00 PM reminder (for testing & verification)
  simulateReminderTrigger(regId: string): boolean {
    const regs = MockStore.getRegistrations();
    const reg = regs.find((r) => r.id === regId);
    if (!reg || reg.status !== "active") return false;

    reg.reminderStatus = "sent";
    reg.remindersSent.push({
      channel: "in_app",
      at: new Date().toISOString(),
    });
    writeStorage(KEYS.REGISTRATIONS, regs);

    const notifs = MockStore.getNotifications();
    notifs.unshift({
      id: `notif_${Date.now()}`,
      recipientUserId: reg.userId,
      relatedCampId: reg.campId,
      relatedRegistrationId: reg.id,
      type: "reminder",
      title: "Tomorrow: Health Camp Reminder (8:00 PM Alert)",
      message: `Reminder for ${reg.userName}: ${reg.campName} is scheduled tomorrow on ${reg.campDate} at ${reg.campAddress}. Please arrive on time.`,
      createdAt: new Date().toISOString(),
      readAt: null,
    });
    writeStorage(KEYS.NOTIFICATIONS, notifs);
    return true;
  },

  // Conversations & Messaging
  getConversations(): Conversation[] {
    return readStorage<Conversation[]>(KEYS.CONVERSATIONS, INITIAL_CONVERSATIONS);
  },
  getMessages(conversationId?: string): Message[] {
    const all = readStorage<Message[]>(KEYS.MESSAGES, INITIAL_MESSAGES);
    if (!conversationId) return all;
    return all.filter((m) => m.conversationId === conversationId);
  },
  getOrCreateConversation(campId: string, userId: string): Conversation {
    const convs = MockStore.getConversations();
    const existing = convs.find((c) => c.campId === campId && c.userId === userId);
    if (existing) return existing;

    const camp = MockStore.getCampById(campId);
    const user = MockStore.getCurrentUser();
    const newConv: Conversation = {
      id: `conv_${Date.now()}`,
      campId,
      campName: camp ? camp.name : "Healthcare Camp",
      userId,
      userName: user.name,
      organizerId: camp ? camp.organizerId : "org_prof_1",
      organizerName: camp ? camp.organizerName : "Camp Organizer",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      unreadCountOrganizer: 0,
      unreadCountUser: 0,
    };
    convs.unshift(newConv);
    writeStorage(KEYS.CONVERSATIONS, convs);
    return newConv;
  },
  sendMessage(
    conversationId: string,
    messageText: string,
    senderOverride?: { id: string; name: string; role: Role }
  ): Message {
    const user = senderOverride || MockStore.getCurrentUser();
    const convs = MockStore.getConversations();
    const convIdx = convs.findIndex((c) => c.id === conversationId);

    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      conversationId,
      campId: convIdx !== -1 ? convs[convIdx].campId : "",
      senderId: user.id,
      senderName: user.name,
      senderRole: user.role,
      messageText: messageText.trim(),
      createdAt: new Date().toISOString(),
      readAt: null,
    };

    const messages = MockStore.getMessages();
    messages.push(newMsg);
    writeStorage(KEYS.MESSAGES, messages);

    // Update conversation metadata
    if (convIdx !== -1) {
      convs[convIdx].updatedAt = newMsg.createdAt;
      if (user.role === "user") {
        convs[convIdx].unreadCountOrganizer += 1;
        // Notify organizer
        const notifs = MockStore.getNotifications();
        notifs.unshift({
          id: `notif_${Date.now()}`,
          recipientUserId: "u_org_1",
          relatedCampId: convs[convIdx].campId,
          type: "chat_reply",
          title: "New Participant Query",
          message: `${user.name} sent a question regarding ${convs[convIdx].campName}: "${messageText.slice(0, 70)}..."`,
          createdAt: new Date().toISOString(),
          readAt: null,
        });
        writeStorage(KEYS.NOTIFICATIONS, notifs);
      } else {
        convs[convIdx].unreadCountUser += 1;
        // Notify user
        const notifs = MockStore.getNotifications();
        notifs.unshift({
          id: `notif_${Date.now()}`,
          recipientUserId: convs[convIdx].userId,
          relatedCampId: convs[convIdx].campId,
          type: "chat_reply",
          title: "Organizer Replied to Your Question",
          message: `${user.name} replied regarding ${convs[convIdx].campName}: "${messageText.slice(0, 70)}..."`,
          createdAt: new Date().toISOString(),
          readAt: null,
        });
        writeStorage(KEYS.NOTIFICATIONS, notifs);
      }
      writeStorage(KEYS.CONVERSATIONS, convs);
    }

    return newMsg;
  },

  // Notifications
  getNotifications(): Notification[] {
    return readStorage<Notification[]>(KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  },
  getUserNotifications(userId: string): Notification[] {
    return MockStore.getNotifications().filter((n) => n.recipientUserId === userId);
  },
  markNotificationRead(id: string): void {
    const notifs = MockStore.getNotifications();
    const notif = notifs.find((n) => n.id === id);
    if (notif && !notif.readAt) {
      notif.readAt = new Date().toISOString();
      writeStorage(KEYS.NOTIFICATIONS, notifs);
    }
  },
  markAllNotificationsRead(userId: string): void {
    const notifs = MockStore.getNotifications();
    let updated = false;
    notifs.forEach((n) => {
      if (n.recipientUserId === userId && !n.readAt) {
        n.readAt = new Date().toISOString();
        updated = true;
      }
    });
    if (updated) {
      writeStorage(KEYS.NOTIFICATIONS, notifs);
    }
  },

  // Healthcare Demand Areas & Facilities
  getDemandAreas(): HealthcareDemandArea[] {
    return readStorage<HealthcareDemandArea[]>(KEYS.DEMAND_AREAS, INITIAL_DEMAND_AREAS);
  },
  getFacilities(): Facility[] {
    return readStorage<Facility[]>(KEYS.FACILITIES, INITIAL_FACILITIES);
  },

  // Reset to initial seed
  resetStore(): void {
    if (typeof window === "undefined") return;
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
    notifyListeners();
  },
};
