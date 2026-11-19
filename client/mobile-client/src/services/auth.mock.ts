import { store } from './store';
import { delay, simulateError, generateId } from './mockApi';
import type { AuthSession, LoginPayload, RegisterPayload, User } from '@/src/types';

export async function login(payload: LoginPayload): Promise<AuthSession> {
  await delay();
  await simulateError();

  const user = store.users.find(
    (u) => u.email.toLowerCase() === payload.email.toLowerCase()
  );
  if (!user) {
    throw new Error('Invalid email or password.');
  }

  // Mock password check; accept any non-empty password for demo accounts
  if (!payload.password || payload.password.length < 4) {
    throw new Error('Invalid email or password.');
  }

  return { user, token: `mock-token-${generateId('tkn')}` };
}

export async function register(payload: RegisterPayload): Promise<AuthSession> {
  await delay(700);
  await simulateError();

  if (store.users.some((u) => u.email.toLowerCase() === payload.email.toLowerCase())) {
    throw new Error('An account with this email already exists.');
  }

  const newUser: User = {
    id: generateId('user'),
    email: payload.email,
    name: payload.name,
    phone: payload.phone,
    unit: payload.unit,
    avatarUrl: undefined,
    notificationPrefs: {
      approvals: true,
      entryExit: true,
      security: true,
      visitorUpdates: true,
      emailDigest: false,
    },
  };

  store.users.push(newUser);

  return { user: newUser, token: `mock-token-${generateId('tkn')}` };
}

export async function forgotPassword(email: string): Promise<void> {
  await delay(600);
  await simulateError();

  const user = store.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    // Silent success to avoid email enumeration in production-style UX
    return;
  }
}

export async function updateUser(
  userId: string,
  updates: Partial<Pick<User, 'name' | 'phone' | 'unit' | 'notificationPrefs'>>
): Promise<User> {
  await delay();
  await simulateError();

  const user = store.users.find((u) => u.id === userId);
  if (!user) {
    throw new Error('User not found.');
  }

  Object.assign(user, updates);
  return { ...user };
}
