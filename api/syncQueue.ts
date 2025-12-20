// syncQueue.ts
import api from './api';
import { getQueue, removeFromQueue, updateRequestInQueue, QueuedRequest } from '@/store/offlineQueue';
import { useExpenseStore } from '@/store/expenseStore';
import { useAdminStore } from '@/store/adminStore';
import { checkConnection } from './network';

const MAX_RETRIES = 3;
const BASE_DELAY = 1000; // Start with 1s

export const processQueue = async () => {
  const isConnected = await checkConnection();
  if (!isConnected) return;

  const queue = await getQueue();
  if (queue.length === 0) return;

  const { markAsSynced } = useExpenseStore.getState();
  const { markAsSyncedAdmin } = useAdminStore.getState();
  const now = Date.now();

  for (const request of queue) {
    if (request.nextRetryTime && request.nextRetryTime > now) continue;

    try {
      const res = await api.request({
        method: request.method,
        url: request.url,
        data: request.data,
        headers: { 'x-skip-queue': 'true' },
      });

      // Handle Sync Mapping
      if (request.type === 'expense') {
        if (request.action === 'add') {
          markAsSynced(request.localId!, res.data?.id || request.localId!);
        } else if (request.action === 'edit') {
          markAsSynced(request.localId!, request.localId!);
        }
      } else if (request.type === 'admin_expense') {
        if (request.action === 'edit' && request.userId) {
          markAsSyncedAdmin(request.localId!, request.localId!, request.userId);
        }
      } else if (request.type === 'admin_balance') {
        if (request.action === 'add' && request.userId) {
          markAsSyncedAdmin(request.localId!, res.data?.id || request.localId!, request.userId);
        }
      }

      await removeFromQueue(request.id);
    } catch (err: any) {
      const retryCount = request.retryCount + 1;
      if (retryCount >= MAX_RETRIES) {
        console.error(`❌ Max retries reached for ${request.url}. Removing.`);
        await removeFromQueue(request.id);
      } else {
        const backoffDelay = Math.pow(2, retryCount) * BASE_DELAY;
        const nextRetryTime = Date.now() + backoffDelay;

        console.warn(`❌ Failed to sync ${request.url} (${err.message}). Retrying in ${backoffDelay / 1000}s...`);

        await updateRequestInQueue({
          ...request,
          retryCount,
          nextRetryTime,
        });
      }
    }
  }
};
