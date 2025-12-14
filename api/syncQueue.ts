// syncQueue.ts
import api from './api';
import { getQueue, removeFromQueue } from '@/store/offlineQueue';
import { useExpenseStore } from '@/store/expenseStore';

export const processQueue = async () => {
  const queue = await getQueue();
  if (queue.length === 0) return;

  const { markAsSynced } = useExpenseStore.getState();

  for (const request of queue) {
    try {
      const res = await api.request({
        method: request.method,
        url: request.url,
        data: request.data,
      });

      if (request.type === 'expense') {
        if (request.action === 'add') {
          const newId = res.data?.id || request.localId;
          markAsSynced(request.localId!, newId);
        } else if (request.action === 'edit') {
          markAsSynced(request.localId!, request.localId!);
        }
      }

      await removeFromQueue(request.id);
      console.log(`✅ Synced: ${request.url}`);
    } catch (err:any) {
      console.warn(`❌ Failed to sync ${request.url}:`, err.message);
    }
  }
};
