import {
  MOCK_USERS,
  MOCK_VEHICLES,
  MOCK_VISITOR_PASSES,
  MOCK_ACCESS_LOGS,
  MOCK_NOTIFICATIONS,
} from '@/src/data/mocks';
import type {
  User,
  Vehicle,
  VisitorPass,
  AccessLog,
  Notification,
} from '@/src/types';

export const store = {
  users: [...MOCK_USERS],
  vehicles: [...MOCK_VEHICLES],
  visitorPasses: [...MOCK_VISITOR_PASSES],
  accessLogs: [...MOCK_ACCESS_LOGS],
  notifications: [...MOCK_NOTIFICATIONS],
};

export function resetStore() {
  store.users = [...MOCK_USERS];
  store.vehicles = [...MOCK_VEHICLES];
  store.visitorPasses = [...MOCK_VISITOR_PASSES];
  store.accessLogs = [...MOCK_ACCESS_LOGS];
  store.notifications = [...MOCK_NOTIFICATIONS];
}
