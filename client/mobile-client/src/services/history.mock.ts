import { store } from './store';
import { delay, simulateError } from './mockApi';
import type { AccessLog } from '@/src/types';

export async function listAccessHistory(userId: string): Promise<AccessLog[]> {
  await delay();
  await simulateError();

  const userVehiclePlates = new Set(
    store.vehicles.filter((v) => v.ownerId === userId).map((v) => v.plateNumber.toUpperCase())
  );
  const userVisitorPlates = new Set(
    store.visitorPasses
      .filter((p) => p.hostUserId === userId && p.vehiclePlate)
      .map((p) => p.vehiclePlate!.toUpperCase())
  );

  const logs = store.accessLogs.filter(
    (log) =>
      userVehiclePlates.has(log.plateNumber.toUpperCase()) ||
      userVisitorPlates.has(log.plateNumber.toUpperCase())
  );

  return logs.sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp));
}
