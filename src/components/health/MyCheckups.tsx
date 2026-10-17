import { useEffect, useState } from "react";
import {
  BellRing,
  Mail,
  MessageSquare,
  CheckCircle2,
  ClipboardList,
  FlaskConical,
} from "lucide-react";
import { TODAY, camps, formatDate } from "@/data/health";
import { loadRegs, saveRegs, type Registration } from "./RegisterModal";

const isMissed = (r: Registration) => !r.attended && new Date(r.campDate) < TODAY;

export function MyCheckups({
  refreshKey,
  onToast,
}: {
  refreshKey: number;
  onToast: (m: string) => void;
}) {
  const [regs, setRegs] = useState<Registration[]>([]);
  useEffect(() => setRegs(loadRegs()), [refreshKey]);
  const update = (next: Registration[]) => {
    saveRegs(next);
    setRegs(next);
  };

  const nextCamp = (r: Registration) =>
    camps.find((c) => c.id !== r.campId && c.verified && new Date(c.date) >= TODAY);

  const send = (r: Registration, channel: "sms" | "email") => {
    if (channel === "email" && !r.email) return onToast("No email on file for this registration.");
    const alt = nextCamp(r);
    update(
      regs.map((x) =>
        x.id === r.id
          ? { ...x, remindersSent: [...x.remindersSent, { channel, at: new Date().toISOString() }] }
          : x,
      ),
    );
    onToast(
      `${channel === "sms" ? `SMS sent to ${r.phone}` : `Email sent to ${r.email}`}: "You missed ${r.campName}.${alt ? ` Next camp: ${alt.name}, ${formatDate(alt.date)}.` : ""}"`,
    );
  };

  const runAuto = () => {
    let n = 0;
    const next = regs.map((r) => {
      if (!isMissed(r) || r.remindersSent.length) return r;
      n += r.channels.length;
      return {
        ...r,
        remindersSent: r.channels.map((channel) => ({ channel, at: new Date().toISOString() })),
      };
    });
    update(next);
    onToast(n ? `Sent ${n} missed-checkup reminder(s).` : "No new missed checkups to remind.");
  };

  const addDemo = () => {
    const past = camps.find((c) => new Date(c.date) < TODAY)!;
    update([
      ...regs,
      {
        id: String(Date.now()),
        name: "Ramesh Jadhav",
        phone: "9876543210",
        email: "ramesh@example.com",
        message: "",
        campId: past.id,
        campName: past.name,
        campDate: past.date,
        channels: ["sms", "email"],
        attended: false,
        remindersSent: [],
        at: new Date().toISOString(),
      },
    ]);
  };

  const missedCount = regs.filter(isMissed).length;

  return (
    <section className="rounded-2xl border bg-card p-5 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-semibold">
            <ClipboardList className="h-4 w-4 text-primary" />
            My Checkups & Reminders
          </h2>
          <p className="text-sm text-muted-foreground">
            {missedCount} missed · reminders go out by SMS and email
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={addDemo} className="pill flex items-center gap-1.5">
            <FlaskConical className="h-4 w-4" />
            Add demo missed checkup
          </button>
          <button onClick={runAuto} className="btn-primary">
            <BellRing className="h-4 w-4" />
            Send missed reminders
          </button>
        </div>
      </div>
      {regs.length === 0 ? (
        <p className="mt-6 py-6 text-center text-sm text-muted-foreground">
          No registrations yet. Register for a camp above.
        </p>
      ) : (
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {regs.map((r) => {
            const missed = isMissed(r);
            return (
              <div key={r.id} className="rounded-xl border p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{r.campName}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.name} · {formatDate(r.campDate)}
                    </p>
                  </div>
                  {r.attended ? (
                    <span className="badge-verified">Attended</span>
                  ) : missed ? (
                    <span className="badge-missed">Missed</span>
                  ) : (
                    <span className="badge-muted">Upcoming</span>
                  )}
                </div>
                {r.remindersSent.length > 0 && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Reminders sent: {r.remindersSent.map((s) => s.channel.toUpperCase()).join(", ")}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  {missed && (
                    <>
                      <button
                        onClick={() => send(r, "sms")}
                        className="pill flex items-center gap-1.5 text-xs"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        SMS
                      </button>
                      <button
                        onClick={() => send(r, "email")}
                        className="pill flex items-center gap-1.5 text-xs"
                      >
                        <Mail className="h-3.5 w-3.5" />
                        Email
                      </button>
                    </>
                  )}
                  {!r.attended && (
                    <button
                      onClick={() =>
                        update(regs.map((x) => (x.id === r.id ? { ...x, attended: true } : x)))
                      }
                      className="pill flex items-center gap-1.5 text-xs"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Mark attended
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
