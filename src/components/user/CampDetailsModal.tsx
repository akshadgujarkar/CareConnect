import { useState, useMemo } from "react";
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Building,
  Phone,
  CheckCircle2,
  Users,
  MessageSquare,
  Send,
  AlertCircle,
  BellRing,
  HelpCircle,
} from "lucide-react";
import {
  MockStore,
  type Camp,
  type Registration,
  type User,
  type Language,
  type Message,
} from "@/data/mockStore";
import { getTranslation } from "@/lib/i18n";
import { formatCampDate, calculatePreCampReminderTime } from "@/lib/reminderEngine";

interface Props {
  camp: Camp;
  currentUser: User;
  onClose: () => void;
  onSuccess: (msg: string) => void;
  lang?: Language;
}

export function CampDetailsModal({ camp, currentUser, onClose, onSuccess, lang = "en" }: Props) {
  const t = getTranslation(lang);
  const [activeTab, setActiveTab] = useState<"details" | "chat">("details");

  // Registration Form State
  const [showRegForm, setShowRegForm] = useState(false);
  const [name, setName] = useState(currentUser.name || "");
  const [phone, setPhone] = useState(currentUser.phone || "");
  const [email, setEmail] = useState(currentUser.email || "");
  const [message, setMessage] = useState("");
  const [regError, setRegError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Chat State
  const [chatInput, setChatInput] = useState("");

  const activeRegistrations = useMemo(() => {
    return MockStore.getCampRegistrations(camp.id).filter((r) => r.status === "active");
  }, [camp.id]);

  const isAlreadyRegistered = useMemo(() => {
    return activeRegistrations.some(
      (r) =>
        r.userId === currentUser.id || (currentUser.phone && r.userPhone === currentUser.phone),
    );
  }, [activeRegistrations, currentUser]);

  const isFull = camp.capacity > 0 && activeRegistrations.length >= camp.capacity;

  const reminderInfo = useMemo(() => {
    return calculatePreCampReminderTime(camp.date);
  }, [camp.date]);

  // Conversation for this camp & user
  const conversation = useMemo(() => {
    return MockStore.getOrCreateConversation(camp.id, currentUser.id);
  }, [camp.id, currentUser.id]);

  const [msgTick, setMsgTick] = useState(0);

  const messages: Message[] = useMemo(() => {
    void msgTick;
    return MockStore.getMessages(conversation.id);
  }, [conversation.id, msgTick]);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");

    if (!name.trim() || name.trim().length < 2) {
      setRegError("Please enter your full name.");
      return;
    }
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setRegError("Please enter a valid 10-digit mobile phone number.");
      return;
    }

    setIsSubmitting(true);
    const res = MockStore.registerForCamp(
      camp.id,
      {
        name: name.trim(),
        phone: cleanPhone.slice(-10),
        email: email.trim(),
        message: message.trim(),
      },
      currentUser,
    );

    if (!res.success) {
      setRegError(res.error || "Registration could not be completed.");
      setIsSubmitting(false);
      return;
    }

    onSuccess(
      `Registered for ${camp.name}! Pre-camp reminder scheduled for 8:00 PM on ${reminderInfo.formattedDisplay}.`,
    );
    onClose();
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    MockStore.sendMessage(conversation.id, chatInput.trim(), {
      id: currentUser.id,
      name: currentUser.name,
      role: "user",
    });

    setChatInput("");
    setMsgTick((t) => t + 1);
  };

  return (
    <div
      className="fixed inset-0 z-[2500] flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-2xl flex-col rounded-2xl bg-card shadow-2xl animate-in zoom-in-95 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b p-5 bg-card">
          <div className="pr-4">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                {camp.category}
              </span>
              {camp.verified && (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  ✓ Verified Camp
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold text-foreground leading-snug">{camp.name}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t.organizer}:{" "}
              <span className="font-semibold text-foreground">{camp.organizerName}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-muted"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Controls: Details vs Ask a Question */}
        <div className="flex border-b bg-muted/30 px-5 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("details")}
            className={`py-3 px-3 border-b-2 transition ${
              activeTab === "details"
                ? "border-primary text-primary font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Camp Information & Services
          </button>
          <button
            onClick={() => setActiveTab("chat")}
            className={`py-3 px-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === "chat"
                ? "border-primary text-primary font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>{t.btnAskQuestion}</span>
            {messages.length > 0 && (
              <span className="rounded-full bg-primary/20 px-1.5 text-[10px] text-primary">
                {messages.length}
              </span>
            )}
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeTab === "details" ? (
            <>
              {/* Date & Location Grid */}
              <div className="grid gap-3 sm:grid-cols-2 rounded-xl bg-muted/40 p-4 border text-xs">
                <div className="space-y-1">
                  <p className="flex items-center gap-2 font-semibold text-foreground">
                    <Calendar className="h-4 w-4 text-primary" />
                    {formatCampDate(camp.date)}
                  </p>
                  <p className="flex items-center gap-2 text-muted-foreground pl-6">
                    <Clock className="h-3.5 w-3.5" />
                    {camp.startTime} – {camp.endTime}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="flex items-center gap-2 font-semibold text-foreground">
                    <MapPin className="h-4 w-4 text-primary" />
                    Venue Location
                  </p>
                  <p className="text-muted-foreground pl-6 leading-relaxed">{camp.address}</p>
                </div>
              </div>

              {/* 8:00 PM Reminder Notice */}
              <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
                <BellRing className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Automated 8:00 PM Pre-Camp Reminder Included</p>
                  <p className="mt-0.5 leading-relaxed">
                    When you register, an alert will be scheduled for{" "}
                    <b>8:00 PM on the day before the camp ({reminderInfo.formattedDisplay})</b> to
                    remind you about fasting and arrival guidelines.
                  </p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Camp Description & Diagnostic Services
                </h4>
                <p className="text-sm text-foreground leading-relaxed">{camp.description}</p>
              </div>

              {/* Services Tags */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Available Medical Services
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {camp.services.map((s) => (
                    <span
                      key={s}
                      className="rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Eligibility & Instructions */}
              <div className="rounded-xl border p-3.5 text-xs space-y-2 bg-card">
                <p>
                  <b>Eligibility:</b> {camp.eligibility}
                </p>
                <p>
                  <b>Participant Instructions:</b> {camp.instructions}
                </p>
                <p className="flex items-center gap-2 text-muted-foreground pt-1">
                  <Phone className="h-3.5 w-3.5 text-primary" />
                  Organizer Contact:{" "}
                  <span className="font-semibold text-foreground">{camp.contactPhone}</span>
                </p>
              </div>

              {/* Registration Form / Action */}
              {!showRegForm ? (
                <div className="pt-2">
                  {isAlreadyRegistered ? (
                    <div className="flex items-center justify-between rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-xs font-semibold text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        <span>You are registered for this camp.</span>
                      </div>
                      <span className="text-[11px] underline">Check My Registrations tab</span>
                    </div>
                  ) : isFull ? (
                    <div className="rounded-xl border border-rose-300 bg-rose-50 p-4 text-center text-xs font-semibold text-rose-800 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200">
                      Camp capacity ({camp.capacity}) has been reached. Please check other nearby
                      camps.
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowRegForm(true)}
                      className="btn-primary w-full py-3 text-sm font-bold flex items-center justify-center gap-2 shadow-md"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>{t.btnRegister} (Free)</span>
                    </button>
                  )}
                </div>
              ) : (
                <form
                  onSubmit={handleRegister}
                  className="rounded-xl border bg-muted/20 p-4 space-y-3 animate-in fade-in"
                >
                  <div className="flex items-center justify-between border-b pb-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                      Confirm Free Registration
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowRegForm(false)}
                      className="text-xs text-muted-foreground hover:underline"
                    >
                      Cancel
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      {t.fieldFullName} *
                    </label>
                    <input
                      type="text"
                      className="input w-full text-xs"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Ramesh Jadhav"
                      required
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">
                        {t.fieldPhone} *
                      </label>
                      <input
                        type="tel"
                        className="input w-full text-xs font-mono"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="98XXXXXXXX"
                        maxLength={10}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">
                        {t.fieldEmail}
                      </label>
                      <input
                        type="email"
                        className="input w-full text-xs"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="optional@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      {t.fieldMessage}
                    </label>
                    <input
                      type="text"
                      className="input w-full text-xs"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="e.g. Bringing elderly parent; wheelchair required"
                    />
                  </div>

                  {regError && (
                    <div className="flex items-center gap-1.5 text-xs text-destructive">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{regError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{isSubmitting ? t.loading : "Confirm Registration & Set Reminder"}</span>
                  </button>
                </form>
              )}
            </>
          ) : (
            /* Chat Tab */
            <div className="flex flex-col h-[380px] bg-card rounded-xl border overflow-hidden">
              <div className="p-3 border-b bg-muted/40 text-xs">
                <p className="font-semibold text-foreground">
                  Ask {camp.organizerName} about this camp
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Common questions: Documents needed, fasting requirements, wheelchair access.
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
                    <HelpCircle className="h-8 w-8 text-muted-foreground/50 mb-2" />
                    <p className="text-xs font-medium">{t.noMessages}</p>
                  </div>
                ) : (
                  messages.map((m) => {
                    const isUser = m.senderRole === "user";
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                      >
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-1">
                          <span>{m.senderName}</span>
                          <span>·</span>
                          <span className="font-mono">
                            {new Date(m.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <div
                          className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                            isUser
                              ? "bg-primary text-primary-foreground rounded-tr-xs"
                              : "bg-muted text-foreground rounded-tl-xs border"
                          }`}
                        >
                          {m.messageText}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <form onSubmit={handleSendMessage} className="p-3 border-t bg-card flex gap-2">
                <input
                  type="text"
                  className="input flex-1 text-xs"
                  placeholder={t.chatPlaceholder}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="btn-primary px-3 py-2 text-xs font-semibold flex items-center gap-1 disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{t.chatSend}</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
