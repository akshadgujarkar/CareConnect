import { useState } from "react";
import {
  CalendarDays,
  Clock,
  MapPin,
  Building,
  BellRing,
  CheckCircle2,
  Ban,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { MockStore, type Registration, type Camp, type Language } from "@/data/mockStore";
import { getTranslation } from "@/lib/i18n";
import { formatCampDate } from "@/lib/reminderEngine";

interface Props {
  registrations: Registration[];
  camps: Camp[];
  onSelectCamp: (camp: Camp) => void;
  onToast: (msg: string) => void;
  lang?: Language;
}

export function MyRegistrationsView({
  registrations,
  camps,
  onSelectCamp,
  onToast,
  lang = "en",
}: Props) {
  const t = getTranslation(lang);
  const [filter, setFilter] = useState<"all" | "active" | "attended" | "cancelled">("all");
  const [cancelModalReg, setCancelModalReg] = useState<Registration | null>(null);

  const filtered = registrations.filter((r) => {
    if (filter === "all") return true;
    return r.status === filter;
  });

  const handleSimulateReminder = (reg: Registration) => {
    const success = MockStore.simulateReminderTrigger(reg.id);
    if (success) {
      onToast(
        `🔔 8:00 PM Pre-Camp reminder triggered for ${reg.campName}! View notification center.`,
      );
    }
  };

  const handleConfirmCancel = () => {
    if (!cancelModalReg) return;
    const ok = MockStore.cancelRegistration(cancelModalReg.id);
    if (ok) {
      onToast(`Registration for "${cancelModalReg.campName}" has been cancelled.`);
      setCancelModalReg(null);
    }
  };

  return (
    <section className="rounded-2xl border bg-card p-5 shadow-soft space-y-4 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
        <div>
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            {t.navMyRegistrations} ({registrations.length})
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Your registered healthcare camps, attendance status, and automated 8:00 PM reminders.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {(["all", "active", "attended", "cancelled"] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition ${
                filter === st
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          <CalendarDays className="mx-auto mb-2 h-10 w-10 text-muted-foreground/60" />
          <p className="text-sm font-semibold text-foreground">No registrations found</p>
          <p className="text-xs text-muted-foreground mt-1">
            Discover upcoming healthcare camps above and register for free.
          </p>
        </div>
      ) : (
        <div className="grid gap-3.5 md:grid-cols-2">
          {filtered.map((reg) => {
            const camp = camps.find((c) => c.id === reg.campId);
            const isCancelled = reg.status === "cancelled";
            const isAttended = reg.status === "attended";

            return (
              <div
                key={reg.id}
                className="flex flex-col justify-between rounded-xl border bg-card p-4 shadow-xs transition hover:shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-foreground leading-snug">
                      {reg.campName}
                    </h3>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold capitalize shrink-0 ${
                        isAttended
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : isCancelled
                            ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                      }`}
                    >
                      {reg.status}
                    </span>
                  </div>

                  <div className="mt-2.5 space-y-1 text-xs text-muted-foreground">
                    <p className="flex items-center gap-2 font-medium text-foreground">
                      <CalendarDays className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>
                        {formatCampDate(reg.campDate)} ({reg.campTime})
                      </span>
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="line-clamp-1">{reg.campAddress}</span>
                    </p>
                    {camp && (
                      <p className="flex items-center gap-2">
                        <Building className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span>Organized by {camp.organizerName}</span>
                      </p>
                    )}
                  </div>

                  {/* Reminder Information Badge */}
                  {!isCancelled && (
                    <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50/70 p-2.5 text-xs text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-200">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 font-bold">
                          <BellRing className="h-3.5 w-3.5 text-amber-600" />
                          Pre-Camp 8:00 PM Reminder
                        </span>
                        <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-amber-200/60 dark:bg-amber-900">
                          {reg.reminderStatus}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] leading-snug">
                        Scheduled for:{" "}
                        <b>
                          {new Date(reg.reminderScheduledAt).toLocaleString("en-IN", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </b>
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 border-t pt-2.5 text-xs">
                  <div className="flex items-center gap-2">
                    {!isCancelled && (
                      <button
                        onClick={() => handleSimulateReminder(reg)}
                        className="flex items-center gap-1 rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-900 hover:bg-amber-100 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200"
                        title="Simulate this camp's 8:00 PM reminder immediately"
                      >
                        <Sparkles className="h-3 w-3 text-amber-600" />
                        <span>Test 8 PM Alert</span>
                      </button>
                    )}
                    {camp && (
                      <button
                        onClick={() => onSelectCamp(camp)}
                        className="font-medium text-primary hover:underline text-[11px]"
                      >
                        View Details
                      </button>
                    )}
                  </div>

                  {!isCancelled && !isAttended && (
                    <button
                      onClick={() => setCancelModalReg(reg)}
                      className="text-[11px] font-medium text-destructive hover:underline"
                    >
                      Withdraw
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelModalReg && (
        <div
          className="fixed inset-0 z-[3000] flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-xs animate-in fade-in"
          onClick={() => setCancelModalReg(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-card p-5 shadow-2xl animate-in zoom-in-95 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 text-destructive">
              <Ban className="h-5 w-5" />
              <h3 className="text-sm font-bold text-foreground">Withdraw Registration?</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to cancel your registration for{" "}
              <b>"{cancelModalReg.campName}"</b>? Your reserved spot will be released, and the
              scheduled 8:00 PM reminder will be cancelled.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setCancelModalReg(null)}
                className="rounded-xl border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
              >
                Keep Registration
              </button>
              <button
                onClick={handleConfirmCancel}
                className="rounded-xl bg-destructive px-3 py-1.5 text-xs font-semibold text-destructive-foreground hover:bg-destructive/90"
              >
                Yes, Withdraw
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
