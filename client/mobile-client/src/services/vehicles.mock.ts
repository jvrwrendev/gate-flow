import { store } from './store';
import { delay, simulateError, generateId } from './mockApi';
import type { CreateVehiclePayload, Vehicle } from '@/src/types';

export async function listVehicles(ownerId: string): Promise<Vehicle[]> {
  await delay();
  await simulateError();
  return store.vehicles
    .filter((v) => v.ownerId === ownerId)
    .sort((a, b) => +new Date(b.submittedAt) - +new Date(a.submittedAt));
}

export async function getVehicle(id: string): Promise<Vehicle> {
  await delay();
  await simulateError();
  const vehicle = store.vehicles.find((v) => v.id === id);
  if (!vehicle) throw new Error('Vehicle not found.');
  return vehicle;
}

export async function createVehicle(
  ownerId: string,
  payload: CreateVehiclePayload
): Promise<Vehicle> {
  await delay(700);
  await simulateError();

  const normalizedPlate = payload.plateNumber.trim().toUpperCase();
  const duplicate = store.vehicles.find(
    (v) => v.ownerId === ownerId && v.plateNumber.toUpperCase() === normalizedPlate
  );
  if (duplicate) {
    throw new Error('A vehicle with this plate number is already registered.');
  }

  const vehicle: Vehicle = {
    id: generateId('v'),
    ownerId,
    plateNumber: normalizedPlate,
    type: payload.type,
    brand: payload.brand.trim(),
    model: payload.model.trim(),
    color: payload.color.trim(),
    photoUrl: payload.photoUrl || undefined,
    status: 'PENDING_VERIFICATION',
    submittedAt: new Date().toISOString(),
  };

  store.vehicles.unshift(vehicle);
  return vehicle;
}
