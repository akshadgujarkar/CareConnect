import { MockStore, type Registration, type Camp } from "@/data/mockStore";

/**
 * Calculates the exact reminder date & time for a given camp date.
 * Rule: 8:00 PM (20:00) on the preceding calendar day in Indian Standard Time (+05:30).
 */
export function calculatePreCampReminderTime(campDateStr: string): {
  reminderISO: string;
  isPast: boolean;
  formattedDisplay: string;
} {
  const campDate = new Date(`${campDateStr}T00:00:00`);
  const reminderDate = new Date(campDate);
  reminderDate.setDate(reminderDate.getDate() - 1);
  reminderDate.setHours(20, 0, 0, 0);

  const now = new Date();
  const isPast = reminderDate.getTime() <= now.getTime();

  return {
    reminderISO: reminderDate.toISOString(),
    isPast,
    formattedDisplay: reminderDate.toLocaleString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }),
  };
}

/**
 * Checks all active registrations and automatically delivers notifications
 * for those whose 8:00 PM scheduled reminder time has arrived.
 */
export function checkAndTriggerDueReminders(): number {
  const regs = MockStore.getRegistrations();
  const now = new Date().getTime();
  let triggeredCount = 0;

  regs.forEach((r) => {
    if (r.status === "active" && r.reminderStatus === "scheduled") {
      const scheduledTime = new Date(r.reminderScheduledAt).getTime();
      if (now >= scheduledTime) {
        MockStore.simulateReminderTrigger(r.id);
        triggeredCount++;
      }
    }
  });

  return triggeredCount;
}

/**
 * Formats a camp date string cleanly
 */
export function formatCampDate(dateStr: string, locale: string = "en-IN"): string {
  try {
    return new Date(`${dateStr}T00:00:00`).toLocaleDateString(locale, {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}
