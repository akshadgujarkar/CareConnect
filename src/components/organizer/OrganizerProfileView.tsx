import { useState } from "react";
import { Building, Phone, Mail, FileText, CheckCircle2, Globe, ShieldCheck } from "lucide-react";
import {
  MockStore,
  type OrganizerProfile,
  type OrganizerType,
  type Language,
} from "@/data/mockStore";
import { getTranslation } from "@/lib/i18n";

interface Props {
  profile: OrganizerProfile;
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  onToast: (msg: string) => void;
}

export function OrganizerProfileView({ profile, lang, onLanguageChange, onToast }: Props) {
  const t = getTranslation(lang);
  const [name, setName] = useState(profile.organizationName);
  const [type, setType] = useState<OrganizerType>(profile.organizerType);
  const [phone, setPhone] = useState(profile.contactPhone);
  const [email, setEmail] = useState(profile.contactEmail);
  const [description, setDescription] = useState(profile.description);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    MockStore.updateOrganizerProfile({
      organizationName: name.trim(),
      organizerType: type,
      contactPhone: phone.trim(),
      contactEmail: email.trim(),
      description: description.trim(),
    });
    onToast("Organizer profile updated successfully!");
  };

  return (
    <div className="max-w-3xl rounded-2xl border bg-card p-6 shadow-soft space-y-6 animate-in fade-in">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Building className="h-5 w-5 text-primary" />
            Organizer Profile & Language Preferences
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your organization information displayed to beneficiaries and partners.
          </p>
        </div>
        {profile.verified && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            <ShieldCheck className="h-4 w-4" />
            Verified Organization
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Organization Name
            </label>
            <input
              type="text"
              className="input w-full text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Organizer Type
            </label>
            <select
              className="input w-full text-sm bg-card"
              value={type}
              onChange={(e) => setType(e.target.value as OrganizerType)}
            >
              <option value="NGO">NGO</option>
              <option value="Doctor">Doctor</option>
              <option value="Hospital">Hospital</option>
              <option value="Government">Government / Public Health</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              <span className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-primary" />
                Contact Phone Number
              </span>
            </label>
            <input
              type="tel"
              className="input w-full text-sm"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-primary" />
                Contact Email Address
              </span>
            </label>
            <input
              type="email"
              className="input w-full text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            <span className="flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-primary" />
              Organization Mission & Description
            </span>
          </label>
          <textarea
            className="input w-full text-sm min-h-24"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Language Preference */}
        <div className="rounded-xl border bg-muted/40 p-4">
          <label className="block text-xs font-semibold text-foreground mb-1 flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            Dashboard Interface Language
          </label>
          <p className="text-xs text-muted-foreground mb-3">
            Change your default portal language. Translates all headings, forms, tables, and alerts.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onLanguageChange("en")}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                lang === "en"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "border bg-card hover:bg-muted"
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => onLanguageChange("hi")}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                lang === "hi"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "border bg-card hover:bg-muted"
              }`}
            >
              हिंदी (Hindi)
            </button>
            <button
              type="button"
              onClick={() => onLanguageChange("mr")}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                lang === "mr"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "border bg-card hover:bg-muted"
              }`}
            >
              मराठी (Marathi)
            </button>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="btn-primary flex items-center gap-2 text-xs font-semibold"
          >
            <CheckCircle2 className="h-4 w-4" />
            Save Profile Updates
          </button>
        </div>
      </form>
    </div>
  );
}
