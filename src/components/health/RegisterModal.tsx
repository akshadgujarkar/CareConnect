import { useState } from "react";
import { X, CheckCircle2, MessageSquare, Mail } from "lucide-react";
import type { Camp } from "@/data/health";

export interface Registration {
  id: string; name: string; phone: string; email: string; message: string;
  campId: string; campName: string; campDate: string; channels: ("sms" | "email")[];
  attended: boolean; remindersSent: { channel: "sms" | "email"; at: string }[]; at: string;
}
export const REG_KEY = "cha_registrations";
export const loadRegs = (): Registration[] => {
  try { return JSON.parse(localStorage.getItem(REG_KEY) || "[]").filter((r: Registration) => r.id); } catch { return []; }
};
export const saveRegs = (r: Registration[]) => localStorage.setItem(REG_KEY, JSON.stringify(r));

export function RegisterModal({ camp, onClose, onSuccess }: { camp: Camp; onClose: () => void; onSuccess: (msg: string) => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sms, setSms] = useState(true);
  const [mail, setMail] = useState(false);
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) return setError("Please enter your full name.");
    if (!/^[6-9]\d{9}$/.test(phone.replace(/\D/g, "").slice(-10))) return setError("Enter a valid 10-digit mobile number.");
    if (mail && !/^\S+@\S+\.\S+$/.test(email)) return setError("Enter a valid email for email reminders.");
    const channels = [...(sms ? ["sms" as const] : []), ...(mail ? ["email" as const] : [])];
    const regs = loadRegs();
    regs.push({ id: String(Date.now()), name: name.trim(), phone, email: email.trim(), message: message.slice(0, 500), campId: camp.id, campName: camp.name, campDate: camp.date, channels, attended: false, remindersSent: [], at: new Date().toISOString() });
    saveRegs(regs);
    onSuccess(`Registered for ${camp.name}!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm animate-in fade-in" onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={submit} className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-2xl bg-card p-6 shadow-elevated animate-in zoom-in-95">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold">Register Interest</h2>
            <p className="text-sm text-muted-foreground">We'll remind you if you miss your checkup.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-1 text-muted-foreground hover:bg-muted"><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-4">
          <Field label="Full Name"><input className="input" maxLength={100} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sunita Patil" /></Field>
          <Field label="Phone Number"><input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="98XXXXXXXX" inputMode="tel" /></Field>
          <Field label="Email (optional)"><input className="input" type="email" maxLength={255} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" /></Field>
          <Field label="Selected Camp"><input className="input bg-muted" value={camp.name} readOnly /></Field>
          <div>
            <span className="mb-1.5 block text-sm font-medium">Missed-checkup reminders</span>
            <div className="flex gap-2">
              <button type="button" onClick={() => setSms(!sms)} className={sms ? "pill pill-active flex items-center gap-1.5" : "pill flex items-center gap-1.5"}><MessageSquare className="h-4 w-4" />SMS</button>
              <button type="button" onClick={() => setMail(!mail)} className={mail ? "pill pill-active flex items-center gap-1.5" : "pill flex items-center gap-1.5"}><Mail className="h-4 w-4" />Email</button>
            </div>
          </div>
          <Field label="Message (optional)"><textarea className="input min-h-20" maxLength={500} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Any health concern or accessibility need?" /></Field>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <button type="submit" className="btn-primary mt-6 w-full"><CheckCircle2 className="h-4 w-4" /> Confirm Registration</button>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-sm font-medium">{label}</span>{children}</label>;
}
