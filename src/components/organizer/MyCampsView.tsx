import { useState, useMemo } from "react";
import {
  CalendarDays,
  Clock,
  MapPin,
  Users,
  Search,
  Filter,
  BadgeCheck,
  AlertTriangle,
  X,
  CheckCircle2,
  Ban,
  FileSpreadsheet,
} from "lucide-react";
import {
  MockStore,
  type Camp,
  type Registration,
  type CampStatus,
  type Language,
} from "@/data/mockStore";
import { getTranslation } from "@/lib/i18n";
import { formatCampDate } from "@/lib/reminderEngine";

interface Props {
  camps: Camp[];
  registrations: Registration[];
  onSelectCampOnMap?: (camp: Camp) => void;
  onToast: (msg: string) => void;
  lang?: Language;
}

export function MyCampsView({
  camps,
  registrations,
  onSelectCampOnMap,
  onToast,
  lang = "en",
}: Props) {
  const t = getTranslation(lang);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | CampStatus>("All");
  const [selectedCamp, setSelectedCamp] = useState<Camp | null>(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  const filteredCamps = useMemo(() => {
    return camps.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.address.toLowerCase().includes(search.toLowerCase()) ||
        c.category.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "All" || c.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [camps, search, statusFilter]);

  const activeRegistrationsForCamp = (campId: string) => {
    return registrations.filter((r) => r.campId === campId && r.status === "active");
  };

  const allRegistrationsForCamp = (campId: string) => {
    return registrations.filter((r) => r.campId === campId);
  };

  const handleCancelCamp = () => {
    if (!selectedCamp) return;
    const ok = MockStore.cancelCamp(selectedCamp.id);
    if (ok) {
      onToast(
        `Camp "${selectedCamp.name}" has been cancelled. Registered beneficiaries were notified.`,
      );
      setCancelModalOpen(false);
      setSelectedCamp(null);
    }
  };

  const handleToggleAttendance = (regId: string, currentStatus: string) => {
    const isAttended = currentStatus === "attended";
    MockStore.markAttendance(regId, !isAttended);
    onToast(`Participant attendance updated to ${!isAttended ? "Attended" : "Registered"}.`);
  };

  const handleMarkCompleted = (camp: Camp) => {
    MockStore.updateCamp(camp.id, { status: "completed" });
    onToast(`Camp "${camp.name}" marked as completed.`);
    if (selectedCamp?.id === camp.id) {
      setSelectedCamp(null);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border bg-card p-4 shadow-soft">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            className="input w-full pl-9 text-xs"
            placeholder="Search your camps by title, service, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
          {(["All", "upcoming", "completed", "cancelled"] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition ${
                statusFilter === st
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Camps Grid */}
      {filteredCamps.length === 0 ? (
        <div className="rounded-2xl border bg-card p-12 text-center text-muted-foreground">
          <CalendarDays className="mx-auto mb-3 h-10 w-10 text-muted-foreground/60" />
          <p className="font-semibold text-foreground">No camps found</p>
          <p className="text-xs text-muted-foreground mt-1">
            Try adjusting your search query or status filter.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredCamps.map((camp) => {
            const activeRegs = activeRegistrationsForCamp(camp.id);
            const isFull = camp.capacity > 0 && activeRegs.length >= camp.capacity;

            return (
              <article
                key={camp.id}
                className="group flex flex-col justify-between rounded-2xl border bg-card p-5 shadow-soft transition hover:shadow-elevated hover:-translate-y-0.5"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                      {camp.category}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${
                        camp.status === "upcoming"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                          : camp.status === "completed"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                      }`}
                    >
                      {camp.status}
                    </span>
                  </div>

                  <h3 className="mt-2 text-base font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
                    {camp.name}
                  </h3>

                  <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                    <p className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-primary shrink-0" />
                      <span>
                        {formatCampDate(camp.date)} · {camp.startTime} - {camp.endTime}
                      </span>
                    </p>
                    <p className="flex items-center gap-2 line-clamp-1">
                      <MapPin className="h-4 w-4 text-primary shrink-0" />
                      <span>{camp.address}</span>
                    </p>
                  </div>

                  {/* Registrations Progress */}
                  <div className="mt-4 rounded-xl bg-muted/50 p-3">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="flex items-center gap-1.5 text-foreground">
                        <Users className="h-3.5 w-3.5 text-primary" />
                        Registrations
                      </span>
                      <span className={isFull ? "text-rose-600 font-bold" : "text-primary"}>
                        {activeRegs.length} / {camp.capacity} {isFull ? "(Full)" : ""}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full rounded-full bg-border overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isFull ? "bg-rose-500" : "bg-primary"
                        }`}
                        style={{
                          width: `${Math.min(100, (activeRegs.length / (camp.capacity || 1)) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 pt-3 border-t">
                  <button
                    onClick={() => setSelectedCamp(camp)}
                    className="flex-1 rounded-xl bg-primary px-3 py-2 text-center text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition"
                  >
                    Manage & Participants ({activeRegs.length})
                  </button>
                  {onSelectCampOnMap && (
                    <button
                      onClick={() => onSelectCampOnMap(camp)}
                      className="rounded-xl border p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition"
                      title="Show on map"
                    >
                      <MapPin className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Selected Camp Management Modal */}
      {selectedCamp && (
        <div
          className="fixed inset-0 z-[2500] flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-xs animate-in fade-in"
          onClick={() => setSelectedCamp(null)}
        >
          <div
            className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl bg-card shadow-2xl animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b p-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                    {selectedCamp.category}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${
                      selectedCamp.status === "upcoming"
                        ? "bg-blue-100 text-blue-800"
                        : selectedCamp.status === "completed"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {selectedCamp.status}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-foreground leading-tight">
                  {selectedCamp.name}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  📍 {selectedCamp.address} · 📅 {formatCampDate(selectedCamp.date)} (
                  {selectedCamp.startTime} - {selectedCamp.endTime})
                </p>
              </div>
              <button
                onClick={() => setSelectedCamp(null)}
                className="rounded-full p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Description & Eligibility */}
              <div className="rounded-xl border bg-muted/30 p-4 text-xs space-y-2">
                <p>
                  <b>Description:</b> {selectedCamp.description}
                </p>
                <p>
                  <b>Eligibility:</b> {selectedCamp.eligibility}
                </p>
                <p>
                  <b>Instructions:</b> {selectedCamp.instructions}
                </p>
                <p>
                  <b>Organizer Contact:</b> {selectedCamp.contactPhone} (
                  {selectedCamp.organizerName})
                </p>
              </div>

              {/* Participants Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    Participant Registrations ({allRegistrationsForCamp(selectedCamp.id).length})
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    Active: {activeRegistrationsForCamp(selectedCamp.id).length} / Capacity:{" "}
                    {selectedCamp.capacity}
                  </span>
                </div>

                {allRegistrationsForCamp(selectedCamp.id).length === 0 ? (
                  <p className="rounded-xl border p-6 text-center text-xs text-muted-foreground">
                    No participants have registered for this camp yet.
                  </p>
                ) : (
                  <div className="overflow-x-auto rounded-xl border">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-muted/70 text-muted-foreground font-semibold border-b">
                        <tr>
                          <th className="px-3.5 py-2.5">Participant</th>
                          <th className="px-3.5 py-2.5">Phone</th>
                          <th className="px-3.5 py-2.5">Registered At</th>
                          <th className="px-3.5 py-2.5">Status</th>
                          <th className="px-3.5 py-2.5 text-right">Attendance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {allRegistrationsForCamp(selectedCamp.id).map((r) => (
                          <tr key={r.id} className="hover:bg-muted/30">
                            <td className="px-3.5 py-2.5 font-medium text-foreground">
                              {r.userName}
                              {r.userMessage && (
                                <p className="text-[10px] text-muted-foreground truncate max-w-[180px]">
                                  Note: {r.userMessage}
                                </p>
                              )}
                            </td>
                            <td className="px-3.5 py-2.5 text-muted-foreground font-mono">
                              {r.userPhone}
                            </td>
                            <td className="px-3.5 py-2.5 text-muted-foreground">
                              {formatCampDate(r.registeredAt.slice(0, 10))}
                            </td>
                            <td className="px-3.5 py-2.5">
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${
                                  r.status === "active"
                                    ? "bg-blue-100 text-blue-800"
                                    : r.status === "attended"
                                      ? "bg-emerald-100 text-emerald-800"
                                      : "bg-rose-100 text-rose-800"
                                }`}
                              >
                                {r.status}
                              </span>
                            </td>
                            <td className="px-3.5 py-2.5 text-right">
                              {r.status !== "cancelled" ? (
                                <button
                                  onClick={() => handleToggleAttendance(r.id, r.status)}
                                  className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                                    r.status === "attended"
                                      ? "bg-emerald-600 text-white"
                                      : "border bg-card hover:bg-muted"
                                  }`}
                                >
                                  {r.status === "attended" ? "✓ Attended" : "Mark Attended"}
                                </button>
                              ) : (
                                <span className="text-[11px] text-muted-foreground italic">
                                  Cancelled
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t bg-muted/20 p-4">
              <div className="flex items-center gap-2">
                {selectedCamp.status === "upcoming" && (
                  <button
                    onClick={() => setCancelModalOpen(true)}
                    className="flex items-center gap-1.5 rounded-xl border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-800 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200"
                  >
                    <Ban className="h-3.5 w-3.5" />
                    <span>Cancel Camp</span>
                  </button>
                )}
                {selectedCamp.status === "upcoming" && (
                  <button
                    onClick={() => handleMarkCompleted(selectedCamp)}
                    className="flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Mark Completed</span>
                  </button>
                )}
              </div>

              <button
                onClick={() => setSelectedCamp(null)}
                className="rounded-xl border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Camp Cancellation */}
      {cancelModalOpen && selectedCamp && (
        <div
          className="fixed inset-0 z-[3000] flex items-center justify-center bg-foreground/50 p-4 backdrop-blur-xs animate-in fade-in"
          onClick={() => setCancelModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-card p-6 shadow-2xl animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-base font-bold text-foreground">Cancel Healthcare Camp?</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to cancel <b>"{selectedCamp.name}"</b>? All{" "}
              <b>{activeRegistrationsForCamp(selectedCamp.id).length} registered participants</b>{" "}
              will be notified immediately via in-app alert, and any scheduled 8:00 PM pre-camp
              reminders will be cancelled.
            </p>
            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                onClick={() => setCancelModalOpen(false)}
                className="rounded-xl border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
              >
                Go Back
              </button>
              <button
                onClick={handleCancelCamp}
                className="rounded-xl bg-destructive px-3.5 py-1.5 text-xs font-semibold text-destructive-foreground hover:bg-destructive/90"
              >
                Yes, Cancel Camp & Notify
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
