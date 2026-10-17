import { describe, expect, it, beforeEach } from "vitest";
import { MockStore } from "@/data/mockStore";
import { calculatePreCampReminderTime, checkAndTriggerDueReminders } from "@/lib/reminderEngine";
import { getTranslation } from "@/lib/i18n";

describe("CareConnect Platform End-to-End Scenarios", () => {
  beforeEach(() => {
    MockStore.resetStore();
  });

  it("Scenario 1: Organizer creates and publishes a healthcare camp", () => {
    const profile = MockStore.getOrganizerProfile();
    const initialCount = MockStore.getCamps().length;

    const newCamp = MockStore.createCamp({
      organizerId: profile.id,
      organizerName: profile.organizationName,
      organizerType: "NGO",
      name: "Rural Vision & Glaucoma Outreach",
      category: "Eye Checkup",
      description: "Comprehensive cataract screenings and free spectacles distribution.",
      address: "Gram Panchayat Hall, Theur, Pune",
      latitude: 18.53,
      longitude: 74.05,
      date: "2026-11-15",
      startTime: "09:00",
      endTime: "13:00",
      capacity: 100,
      status: "upcoming",
      verified: true,
      services: ["Eye Checkup"],
      contactPhone: "9822012345",
      eligibility: "Open to seniors 55+",
      instructions: "No fasting needed.",
    });

    expect(newCamp.id).toBeDefined();
    expect(MockStore.getCamps().length).toBe(initialCount + 1);

    // Verify it is discoverable
    const found = MockStore.getCampById(newCamp.id);
    expect(found).toBeDefined();
    expect(found?.name).toBe("Rural Vision & Glaucoma Outreach");

    // Verify a new-camp notification was broadcast
    const notifs = MockStore.getNotifications();
    const campNotif = notifs.find((n) => n.relatedCampId === newCamp.id);
    expect(campNotif).toBeDefined();
    expect(campNotif?.type).toBe("new_camp");
  });

  it("Scenario 2 & 3: User registers for a camp, updates attendee count, prevents duplicates, schedules reminder", () => {
    // Camp c3 currently has 0 registrations
    const targetCamp = MockStore.getCamps().find((c) => c.id === "c3")!;
    const initialAttendeeCount = targetCamp.registrationsCount;

    // Register user for c3
    const regResult = MockStore.registerForCamp(targetCamp.id, {
      name: "Ramesh Jadhav",
      phone: "9876543210",
      email: "ramesh@example.com",
      message: "Need diabetic foot examination.",
    });

    expect(regResult.success).toBe(true);
    expect(regResult.registration).toBeDefined();

    // Verify registration status and 8:00 PM reminder calculation
    const reg = regResult.registration!;
    expect(reg.status).toBe("active");
    expect(reg.reminderStatus).toBe("scheduled");

    // The reminder must be at 20:00 (8:00 PM) on the day before the camp
    const reminderDate = new Date(reg.reminderScheduledAt);
    expect(reminderDate.getHours()).toBe(20);
    expect(reminderDate.getMinutes()).toBe(0);

    // Verify camp's registrations count incremented
    const updatedCamp = MockStore.getCampById(targetCamp.id);
    expect(updatedCamp?.registrationsCount).toBe(initialAttendeeCount + 1);

    // Verify duplicate registration attempt is prevented
    const duplicateAttempt = MockStore.registerForCamp(targetCamp.id, {
      name: "Ramesh Jadhav",
      phone: "9876543210",
    });
    expect(duplicateAttempt.success).toBe(false);
    expect(duplicateAttempt.error).toContain("already actively registered");

    // Verify confirmation notification was created
    const notifs = MockStore.getNotifications();
    const confirmNotif = notifs.find((n) => n.relatedRegistrationId === reg.id);
    expect(confirmNotif).toBeDefined();
    expect(confirmNotif?.type).toBe("registration_confirmed");
  });

  it("Scenario 4: 8:00 PM reminder simulation delivers alert and handles cancellation", () => {
    // Camp c4 has 0 registrations
    const targetCamp = MockStore.getCamps().find((c) => c.id === "c4")!;

    const regResult = MockStore.registerForCamp(targetCamp.id, {
      name: "Meena Deshmukh",
      phone: "9811122233",
    });
    expect(regResult.success).toBe(true);
    const regId = regResult.registration!.id;

    // Simulate triggering 8:00 PM reminder
    const simulated = MockStore.simulateReminderTrigger(regId);
    expect(simulated).toBe(true);

    const updatedReg = MockStore.getRegistrations().find((r) => r.id === regId);
    expect(updatedReg?.reminderStatus).toBe("sent");

    // User should have received a reminder notification
    const reminderNotif = MockStore.getNotifications().find(
      (n) => n.relatedRegistrationId === regId && n.type === "reminder",
    );
    expect(reminderNotif).toBeDefined();
    expect(reminderNotif?.title).toContain("8:00 PM Alert");

    // If user cancels registration, reminder status becomes cancelled
    MockStore.cancelRegistration(regId);
    const cancelledReg = MockStore.getRegistrations().find((r) => r.id === regId);
    expect(cancelledReg?.status).toBe("cancelled");
    expect(cancelledReg?.reminderStatus).toBe("cancelled");
  });

  it("Scenario 5: User questions and organizer bidirectional messaging", () => {
    const targetCamp = MockStore.getCamps()[0];
    const user = MockStore.getCurrentUser();

    // User creates conversation and sends message
    const conv = MockStore.getOrCreateConversation(targetCamp.id, user.id);
    expect(conv.campId).toBe(targetCamp.id);

    const userMsg = MockStore.sendMessage(conv.id, "Is wheelchair access available at the venue?");
    expect(userMsg.senderRole).toBe("user");
    expect(userMsg.messageText).toContain("wheelchair");

    // Verify organizer received notification
    const orgNotifs = MockStore.getUserNotifications("u_org_1");
    const queryNotif = orgNotifs.find(
      (n) => n.relatedCampId === targetCamp.id && n.type === "chat_reply",
    );
    expect(queryNotif).toBeDefined();

    // Organizer replies
    const orgReply = MockStore.sendMessage(
      conv.id,
      "Yes, ramps and volunteer support are available.",
      {
        id: "u_org_1",
        name: "Dr. Aruna Shinde",
        role: "organizer",
      },
    );
    expect(orgReply.senderRole).toBe("organizer");

    // Check conversation message list
    const conversationMessages = MockStore.getMessages(conv.id);
    expect(conversationMessages.length).toBeGreaterThanOrEqual(2);
  });

  it("Scenario 6: Language translations persist and cover Hindi, Marathi, and English", () => {
    const en = getTranslation("en");
    const hi = getTranslation("hi");
    const mr = getTranslation("mr");

    expect(en.appTitle).toBe("CareConnect");
    expect(hi.appTitle).toContain("केयरकनेक्ट");
    expect(mr.appTitle).toContain("केअरकनेक्ट");

    expect(en.btnRegister).toContain("Register");
    expect(hi.btnRegister).toContain("पंजीकरण");
    expect(mr.btnRegister).toContain("नोंदणी");
  });

  it("Scenario 7: Camp cancellation notifies all registered participants", () => {
    const camp = MockStore.getCamps()[0];
    const initialActive = MockStore.getCampRegistrations(camp.id).filter(
      (r) => r.status === "active",
    );

    const cancelled = MockStore.cancelCamp(camp.id, "Inclement weather");
    expect(cancelled).toBe(true);

    const updatedCamp = MockStore.getCampById(camp.id);
    expect(updatedCamp?.status).toBe("cancelled");

    // All previously active registrations are marked cancelled
    const updatedRegs = MockStore.getCampRegistrations(camp.id);
    updatedRegs.forEach((r) => {
      expect(r.status).toBe("cancelled");
      expect(r.reminderStatus).toBe("cancelled");
    });

    // Check that schedule_change notification was dispatched
    const cancellationNotifs = MockStore.getNotifications().filter(
      (n) => n.relatedCampId === camp.id && n.type === "schedule_change",
    );
    expect(cancellationNotifs.length).toBeGreaterThanOrEqual(initialActive.length);
  });
});
