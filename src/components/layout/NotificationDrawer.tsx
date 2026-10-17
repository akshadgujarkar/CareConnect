import { X, CheckCircle2, Bell, Calendar, MessageSquare, AlertTriangle } from "lucide-react";
import { type Notification, type Language } from "@/data/mockStore";
import { getTranslation } from "@/lib/i18n";
import { formatCampDate } from "@/lib/reminderEngine";

interface Props {
  notifications: Notification[];
  isOpen: boolean;
  onClose: () => void;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onSelectCamp?: (campId: string) => void;
  lang?: Language;
}

export function NotificationDrawer({
  notifications,
  isOpen,
  onClose,
  onMarkRead,
  onMarkAllRead,
  onSelectCamp,
  lang = "en",
}: Props) {
  if (!isOpen) return null;
  const t = getTranslation(lang);

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "reminder":
        return <Bell className="h-4 w-4 text-amber-500" />;
      case "registration_confirmed":
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case "new_camp":
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case "chat_reply":
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
      case "schedule_change":
        return <AlertTriangle className="h-4 w-4 text-rose-500" />;
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div
      className="fixed inset-0 z-[3000] flex justify-end bg-foreground/30 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <aside
        className="flex h-full w-full max-w-md flex-col bg-card shadow-2xl animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <h2 className="text-base font-semibold text-foreground">{t.navNotifications}</h2>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
              {notifications.filter((n) => !n.readAt).length} unread
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-muted"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center justify-between border-b bg-muted/40 px-5 py-2.5 text-xs">
          <span className="text-muted-foreground">In-App Live Alerts</span>
          {notifications.some((n) => !n.readAt) && (
            <button onClick={onMarkAllRead} className="font-medium text-primary hover:underline">
              {t.markAllRead}
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-border">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
              <Bell className="mb-3 h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm font-medium">{t.allCaughtUp}</p>
            </div>
          ) : (
            notifications.map((n) => {
              const isUnread = !n.readAt;
              return (
                <div
                  key={n.id}
                  className={`p-4 transition hover:bg-muted/40 cursor-pointer ${
                    isUnread ? "bg-primary/5" : ""
                  }`}
                  onClick={() => {
                    onMarkRead(n.id);
                    if (n.relatedCampId && onSelectCamp) {
                      onSelectCamp(n.relatedCampId);
                      onClose();
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-lg border bg-card p-2 shadow-xs">
                      {getIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p
                          className={`text-xs font-semibold ${isUnread ? "text-primary" : "text-foreground"}`}
                        >
                          {n.title}
                        </p>
                        {isUnread && <span className="h-2 w-2 rounded-full bg-primary" />}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                        {n.message}
                      </p>
                      <p className="mt-1.5 text-[10px] text-muted-foreground font-mono">
                        {new Date(n.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        · {formatCampDate(n.createdAt.slice(0, 10))}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>
    </div>
  );
}
