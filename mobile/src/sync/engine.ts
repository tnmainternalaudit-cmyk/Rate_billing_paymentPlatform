import { apiPost } from '../api/client';

export async function syncNow() {
  // Server-wins for reference data (ratepayers, bills), client-wins for newly created payments.
  await apiPost('/sync/pull', { deviceId: 'android-device-1' });
  await apiPost('/sync/push', { deviceId: 'android-device-1', officerId: 'offline-officer', payments: [] });
}
