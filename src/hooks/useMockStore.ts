import { useEffect, useState } from "react";
import { MockStore, subscribeStore, type User, type OrganizerProfile, type Camp, type Registration, type Notification, type Conversation, type HealthcareDemandArea, type Facility } from "@/data/mockStore";

export function useMockStore() {
  const [, setVersion] = useState(0);

  useEffect(() => {
    return subscribeStore(() => {
      setVersion((v) => v + 1);
    });
  }, []);

  const currentUser: User = MockStore.getCurrentUser();
  const organizerProfile: OrganizerProfile = MockStore.getOrganizerProfile();
  const camps: Camp[] = MockStore.getCamps();
  const registrations: Registration[] = MockStore.getRegistrations();
  const notifications: Notification[] = MockStore.getNotifications();
  const conversations: Conversation[] = MockStore.getConversations();
  const demandAreas: HealthcareDemandArea[] = MockStore.getDemandAreas();
  const facilities: Facility[] = MockStore.getFacilities();

  return {
    currentUser,
    organizerProfile,
    camps,
    registrations,
    notifications,
    conversations,
    demandAreas,
    facilities,
    store: MockStore,
  };
}
