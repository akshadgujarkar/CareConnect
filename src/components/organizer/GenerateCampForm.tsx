import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Building,
  Phone,
  Users,
  AlertCircle,
  CheckCircle2,
  X,
  Sparkles,
} from "lucide-react";
import {
  MockStore,
  type Camp,
  type OrganizerType,
  type HealthcareDemandArea,
  type Language,
} from "@/data/mockStore";
import { getTranslation } from "@/lib/i18n";

interface Props {
  prefillArea?: HealthcareDemandArea | null;
  onSuccess: (newCamp: Camp) => void;
  onCancel: () => void;
  lang?: Language;
}

const CATEGORIES = [
  "Diabetes Screening",
  "HIV Testing and Awareness",
  "General Health Checkup",
  "Eye Checkup",
  "Child Immunization",
  "Cancer Screening & Women's Health",
  "Blood Donation",
];

const ORGANIZER_TYPES: OrganizerType[] = ["NGO", "Doctor", "Hospital", "Government"];

export function GenerateCampForm({ prefillArea, onSuccess, onCancel, lang = "en" }: Props) {
  const t = getTranslation(lang);
  const profile = MockStore.getOrganizerProfile();

  // Form State
  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("14:00");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState(18.55);
  const [longitude, setLongitude] = useState(73.95);
  const [organizerName, setOrganizerName] = useState(profile.organizationName);
  const [organizerType, setOrganizerType] = useState<OrganizerType>(profile.organizerType);
  const [contactPhone, setContactPhone] = useState(profile.contactPhone);
  const [capacity, setCapacity] = useState(150);
  const [registrationDeadline, setRegistrationDeadline] = useState("");
  const [eligibility, setEligibility] = useState("Open to all local residents. Free of charge.");
  const [instructions, setInstructions] = useState(
    "Please bring previous health records or prescriptions if available. Wear comfortable clothing.",
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set default minimum date to today (2026-10-17 or browser date)
  const todayStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (prefillArea) {
      setName(`Free ${prefillArea.healthcareCategory} Camp – ${prefillArea.areaName}`);
      setCategory(
        CATEGORIES.includes(prefillArea.healthcareCategory)
          ? prefillArea.healthcareCategory
          : "General Health Checkup",
      );
      setAddress(`Community Centre / Gram Panchayat Hall, ${prefillArea.areaName}, Pune`);
      setLatitude(prefillArea.lat);
      setLongitude(prefillArea.lng);
      setDescription(
        `Special outreach camp addressing documented access gaps in ${prefillArea.areaName}. Providing free ${prefillArea.missingServices.join(
          ", ",
        )}.`,
      );
      // Default to next week
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      setDate(nextWeek.toISOString().split("T")[0]);
    }
  }, [prefillArea]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!name.trim() || name.trim().length < 5) {
      errs.name = "Camp name must be at least 5 characters.";
    }
    if (!description.trim() || description.trim().length < 15) {
      errs.description = "Please provide an informative description (at least 15 characters).";
    }
    if (!date) {
      errs.date = "Please select a valid scheduled date.";
    } else if (date < todayStr) {
      errs.date = "Camp date cannot be scheduled in the past.";
    }
    if (!startTime || !endTime) {
      errs.time = "Both start time and end time are required.";
    } else if (startTime >= endTime) {
      errs.time = "End time must be later than start time.";
    }
    if (!address.trim() || address.trim().length < 8) {
      errs.address = "Please enter a specific venue address and landmark.";
    }
    if (isNaN(latitude) || latitude < 17 || latitude > 20) {
      errs.latitude = "Please enter valid coordinates within Pune district (approx 18.x).";
    }
    if (isNaN(longitude) || longitude < 72 || longitude > 76) {
      errs.longitude = "Please enter valid coordinates within Pune district (approx 73.x - 74.x).";
    }
    if (!contactPhone.trim() || contactPhone.trim().length < 8) {
      errs.contactPhone = "Please provide a valid contact phone number.";
    }
    if (!capacity || capacity <= 0) {
      errs.capacity = "Capacity must be at least 1 participant.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const created = MockStore.createCamp({
        organizerId: profile.id,
        organizerName: organizerName.trim(),
        organizerType,
        name: name.trim(),
        category,
        description: description.trim(),
        address: address.trim(),
        latitude,
        longitude,
        date,
        startTime,
        endTime,
        registrationDeadline: registrationDeadline || date,
        capacity: Number(capacity),
        status: "upcoming",
        verified: true,
        services: [category, "General Health Checkup"],
        contactPhone: contactPhone.trim(),
        eligibility: eligibility.trim(),
        instructions: instructions.trim(),
      });

      onSuccess(created);
    } catch (e) {
      console.error(e);
      setErrors({ form: "Failed to create camp. Please review details." });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border bg-card p-5 sm:p-6 shadow-soft animate-in fade-in">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Building className="h-5 w-5 text-primary" />
            {t.navGenerateCamp}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Create a verified healthcare camp and make it immediately discoverable to local
            residents.
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full p-1 text-muted-foreground hover:bg-muted"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {prefillArea && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 p-3 text-xs text-blue-900 dark:text-blue-200">
          <Sparkles className="h-4 w-4 text-blue-600 shrink-0" />
          <span>
            Prefilled with high-demand statistics for <b>{prefillArea.areaName}</b> (
            {prefillArea.healthcareCategory}).
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        {/* Camp Name */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            {t.formCampName} *
          </label>
          <input
            type="text"
            className="input w-full text-sm"
            placeholder="e.g. Free Community Diabetes & BP Screening Camp"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
        </div>

        {/* Category & Organizer Type */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              {t.formCategory} *
            </label>
            <select
              className="input w-full text-sm bg-card"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              {t.formOrganizerType} *
            </label>
            <select
              className="input w-full text-sm bg-card"
              value={organizerType}
              onChange={(e) => setOrganizerType(e.target.value as OrganizerType)}
            >
              {ORGANIZER_TYPES.map((ot) => (
                <option key={ot} value={ot}>
                  {ot}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            {t.formDescription} *
          </label>
          <textarea
            className="input w-full text-sm min-h-20"
            rows={3}
            placeholder="Explain the purpose of the camp, diagnostic services available, doctors in attendance, and target community."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          {errors.description && (
            <p className="mt-1 text-xs text-destructive">{errors.description}</p>
          )}
        </div>

        {/* Date & Timings */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                {t.formDate} *
              </span>
            </label>
            <input
              type="date"
              className="input w-full text-sm"
              min={todayStr}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            {errors.date && <p className="mt-1 text-xs text-destructive">{errors.date}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-primary" />
                {t.formStartTime} *
              </span>
            </label>
            <input
              type="time"
              className="input w-full text-sm"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-primary" />
                {t.formEndTime} *
              </span>
            </label>
            <input
              type="time"
              className="input w-full text-sm"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        </div>
        {errors.time && <p className="text-xs text-destructive">{errors.time}</p>}

        {/* Location Address */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              {t.formLocation} *
            </span>
          </label>
          <input
            type="text"
            className="input w-full text-sm"
            placeholder="e.g. Gram Panchayat Community Hall, Kesnand, Taluka Haveli, Pune 412207"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          {errors.address && <p className="mt-1 text-xs text-destructive">{errors.address}</p>}
        </div>

        {/* Coordinates */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              {t.formLatitude} (Pune Region)
            </label>
            <input
              type="number"
              step="0.0001"
              className="input w-full text-sm"
              value={latitude}
              onChange={(e) => setLatitude(parseFloat(e.target.value))}
            />
            {errors.latitude && <p className="mt-1 text-xs text-destructive">{errors.latitude}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              {t.formLongitude} (Pune Region)
            </label>
            <input
              type="number"
              step="0.0001"
              className="input w-full text-sm"
              value={longitude}
              onChange={(e) => setLongitude(parseFloat(e.target.value))}
            />
            {errors.longitude && (
              <p className="mt-1 text-xs text-destructive">{errors.longitude}</p>
            )}
          </div>
        </div>

        {/* Capacity, Phone, Organizer Name */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              <span className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-primary" />
                {t.formCapacity} *
              </span>
            </label>
            <input
              type="number"
              min={1}
              className="input w-full text-sm"
              value={capacity}
              onChange={(e) => setCapacity(parseInt(e.target.value) || 0)}
            />
            {errors.capacity && <p className="mt-1 text-xs text-destructive">{errors.capacity}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              <span className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-primary" />
                {t.formContactPhone} *
              </span>
            </label>
            <input
              type="tel"
              className="input w-full text-sm"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
            />
            {errors.contactPhone && (
              <p className="mt-1 text-xs text-destructive">{errors.contactPhone}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Organization Name *
            </label>
            <input
              type="text"
              className="input w-full text-sm"
              value={organizerName}
              onChange={(e) => setOrganizerName(e.target.value)}
            />
          </div>
        </div>

        {/* Instructions & Eligibility */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              {t.formEligibility}
            </label>
            <input
              type="text"
              className="input w-full text-sm"
              value={eligibility}
              onChange={(e) => setEligibility(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              {t.formInstructions}
            </label>
            <input
              type="text"
              className="input w-full text-sm"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
            />
          </div>
        </div>

        {errors.form && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-xs text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errors.form}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
          >
            {t.formCancel}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary flex items-center gap-2 text-xs font-semibold"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>{isSubmitting ? t.loading : t.formSubmit}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
