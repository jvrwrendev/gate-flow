import { store } from './store';
import { delay, simulateError, generateId } from './mockApi';
import type { CreateVisitorPassPayload, VisitorPass } from '@/src/types';

export async function listVisitorPasses(hostUserId: string): Promise<VisitorPass[]> {
  await delay();
  await simulateError();
  return store.visitorPasses
    .filter((p) => p.hostUserId === hostUserId)
    .sort((a, b) => +new Date(b.requestedAt) - +new Date(a.requestedAt));
}

export async function getVisitorPass(id: string): Promise<VisitorPass> {
  await delay();
  await simulateError();
  const pass = store.visitorPasses.find((p) => p.id === id);
  if (!pass) throw new Error('Visitor pass not found.');
  return pass;
}

export async function createVisitorPass(
  hostUserId: string,
  payload: CreateVisitorPassPayload
): Promise<VisitorPass> {
  await delay(700);
  await simulateError();

  const start = new Date(payload.scheduledStart);
  const end = new Date(payload.scheduledEnd);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error('Invalid schedule dates.');
  }
  if (end <= start) {
    throw new Error('End time must be after start time.');
  }

  const pass: VisitorPass = {
    id: generateId('vp'),
    hostUserId,
    visitorName: payload.visitorName.trim(),
    visitorPhone: payload.visitorPhone?.trim(),
    purpose: payload.purpose.trim(),
    vehiclePlate: payload.vehiclePlate?.trim().toUpperCase(),
    vehicleType: payload.vehicleType,
    vehiclePhotoUrl: payload.vehiclePhotoUrl || undefined,
    scheduledStart: start.toISOString(),
    scheduledEnd: end.toISOString(),
    status: 'PENDING',
    requestedAt: new Date().toISOString(),
    notes: payload.notes,
  };

  store.visitorPasses.unshift(pass);
  return pass;
}
