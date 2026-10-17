import { useState } from "react";
import {
  HeartPulse,
  Bell,
  Globe,
  UserCheck,
  Building2,
  RefreshCw,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import {
  type User,
  type Language,
  type Role,
  type Notification,
  MockStore,
} from "@/data/mockStore";
import { getTranslation } from "@/lib/i18n";
import { NotificationDrawer } from "./NotificationDrawer";

interface Props {
  currentUser: User;
  notifications: Notification[];
  onRoleSwitch: (role: Role) => void;
  onLanguageChange: (lang: Language) => void;
  onSelectCamp?: (campId: string) => void;
  onToast: (msg: string) => void;
}

export function AppHeader({
  currentUser,
  notifications,
  onRoleSwitch,
  onLanguageChange,
  onSelectCamp,
  onToast,
}: Props) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const t = getTranslation(currentUser.preferredLanguage);
  const unreadCount = notifications.filter((n) => !n.readAt).length;

  const handleSimulateReminder = () => {
    const regs = MockStore.getRegistrations().filter((r) => r.status === "active");
    if (regs.length === 0) {
      onToast("No active registrations found to test reminder. Register for a camp first!");
      return;
    }
    const targetReg = regs[0];
    MockStore.simulateReminderTrigger(targetReg.id);
    onToast(
      `🔔 8:00 PM pre-camp reminder simulated for "${targetReg.campName}"! Check notification center.`,
    );
    setNotifOpen(true);
  };

  const handleResetDemoData = () => {
    MockStore.resetStore();
    onToast("Demo database reset to initial verified state.");
  };

  const languageLabels: Record<Language, string> = {
    en: "English",
    hi: "हिंदी (Hindi)",
    mr: "मराठी (Marathi)",
  };

  return (
    <>
      <header className="sticky top-0 z-[1000] border-b bg-card/95 backdrop-blur-md transition-colors">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3 px-4 py-2.5 md:px-6">
          {/* Left: Branding & Language Selector */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-teal-500 text-white shadow-md shadow-blue-500/20">
                <HeartPulse className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-bold tracking-tight text-foreground md:text-lg">
                    {t.appTitle}
                  </h1>
                  <span className="hidden rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary sm:inline-block">
                    Pune District
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1">{t.appSubtitle}</p>
              </div>
            </div>

            {/* Language Selector Dropdown (Upper-Left accessibility) */}
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-1.5 rounded-lg border bg-background/80 px-2.5 py-1.5 text-xs font-semibold text-foreground shadow-xs hover:bg-accent transition"
                aria-label="Select Language"
              >
                <Globe className="h-3.5 w-3.5 text-primary" />
                <span>{languageLabels[currentUser.preferredLanguage]}</span>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </button>
              {langMenuOpen && (
                <div
                  className="absolute left-0 mt-1.5 w-36 rounded-xl border bg-card p-1 shadow-lg ring-1 ring-border z-50 animate-in fade-in"
                  onClick={() => setLangMenuOpen(false)}
                >
                  <button
                    onClick={() => onLanguageChange("en")}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-left ${
                      currentUser.preferredLanguage === "en"
                        ? "bg-primary text-primary-foreground font-semibold"
                        : "hover:bg-muted"
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => onLanguageChange("hi")}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-left ${
                      currentUser.preferredLanguage === "hi"
                        ? "bg-primary text-primary-foreground font-semibold"
                        : "hover:bg-muted"
                    }`}
                  >
                    हिंदी (Hindi)
                  </button>
                  <button
                    onClick={() => onLanguageChange("mr")}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-left ${
                      currentUser.preferredLanguage === "mr"
                        ? "bg-primary text-primary-foreground font-semibold"
                        : "hover:bg-muted"
                    }`}
                  >
                    मराठी (Marathi)
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right: Role Switcher & Notifications & Demo Helpers */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Quick Demo Simulator for 8 PM Reminder */}
            <button
              onClick={handleSimulateReminder}
              title="Test the 8:00 PM Pre-Camp Scheduled Reminder engine"
              className="hidden lg:flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-100 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-600" />
              <span>Simulate 8 PM Alert</span>
            </button>

            {/* Role Switcher Pill */}
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-semibold transition shadow-xs ${
                  currentUser.role === "organizer"
                    ? "border-blue-300 bg-blue-50 text-blue-900 hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-200"
                    : "border-teal-300 bg-teal-50 text-teal-900 hover:bg-teal-100 dark:border-teal-900 dark:bg-teal-950 dark:text-teal-200"
                }`}
              >
                {currentUser.role === "organizer" ? (
                  <Building2 className="h-3.5 w-3.5 text-blue-600" />
                ) : (
                  <UserCheck className="h-3.5 w-3.5 text-teal-600" />
                )}
                <div className="flex flex-col text-left">
                  <span className="text-[10px] uppercase font-bold tracking-wider opacity-75">
                    {currentUser.role === "organizer" ? t.roleOrganizer : t.roleUser}
                  </span>
                  <span className="text-xs font-semibold truncate max-w-[130px] sm:max-w-[180px]">
                    {currentUser.name}
                  </span>
                </div>
                <ChevronDown className="h-3 w-3 opacity-60" />
              </button>

              {roleMenuOpen && (
                <div
                  className="absolute right-0 mt-1.5 w-64 rounded-xl border bg-card p-2 shadow-xl ring-1 ring-border z-50 animate-in fade-in"
                  onClick={() => setRoleMenuOpen(false)}
                >
                  <p className="px-2 py-1 text-[11px] font-semibold text-muted-foreground uppercase">
                    Select Dashboard Experience
                  </p>
                  <button
                    onClick={() => onRoleSwitch("organizer")}
                    className={`flex w-full items-start gap-2.5 rounded-lg p-2 text-left transition ${
                      currentUser.role === "organizer"
                        ? "bg-primary/10 font-medium text-primary"
                        : "hover:bg-muted"
                    }`}
                  >
                    <Building2 className="mt-0.5 h-4 w-4 text-blue-600 shrink-0" />
                    <div>
                      <p className="text-xs font-bold leading-tight">{t.roleOrganizer}</p>
                      <p className="text-[11px] text-muted-foreground">
                        NGO / Doctor / Hospital Camp Creator
                      </p>
                    </div>
                  </button>
                  <button
                    onClick={() => onRoleSwitch("user")}
                    className={`flex w-full items-start gap-2.5 rounded-lg p-2 text-left transition ${
                      currentUser.role === "user"
                        ? "bg-primary/10 font-medium text-primary"
                        : "hover:bg-muted"
                    }`}
                  >
                    <UserCheck className="mt-0.5 h-4 w-4 text-teal-600 shrink-0" />
                    <div>
                      <p className="text-xs font-bold leading-tight">{t.roleUser}</p>
                      <p className="text-[11px] text-muted-foreground">
                        Rural Resident Beneficiary
                      </p>
                    </div>
                  </button>
                  <div className="my-1 border-t" />
                  <button
                    onClick={handleResetDemoData}
                    className="flex w-full items-center gap-2 rounded-lg p-2 text-xs text-muted-foreground hover:bg-muted"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Reset Demo Store to Initial</span>
                  </button>
                </div>
              )}
            </div>

            {/* Notification Bell (Upper-Right) */}
            <button
              onClick={() => setNotifOpen(true)}
              className="relative rounded-xl border bg-card p-2 text-foreground shadow-xs hover:bg-accent transition"
              aria-label="View notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-xs animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Slide-out notification center */}
      <NotificationDrawer
        notifications={notifications}
        isOpen={notifOpen}
        onClose={() => setNotifOpen(false)}
        onMarkRead={(id) => MockStore.markNotificationRead(id)}
        onMarkAllRead={() => MockStore.markAllNotificationsRead(currentUser.id)}
        onSelectCamp={onSelectCamp}
        lang={currentUser.preferredLanguage}
      />
    </>
  );
}
