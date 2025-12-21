import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Transaction = {
    _id: string;
    amount: number;
    date: string;
    details: string;
    type: string;
    category: string;
    isSynced: string | null;
};
type User = {
    _id: string;
    netBalance: number;
    name: string;
    createdAt: string;
    expenses: Transaction[];
};

type AdminStore = {
    cachedUsers: User[];
    totalUserBalance: number;
    LastSyncedAt: string;
    addUser: (data: User) => void;
    setCachedUsers: (data: User[], balance: number) => void;
    assignBalance: (id: string, expense: Transaction) => void;
    deleteUser: (data: User) => void;
    editUserExpenseByAdmin: (id: string, data: Transaction) => void;
    removeUserExpenseByAdmin: (id: string, data: Transaction) => void;
    markAsSyncedAdmin: (tempId: string, newIdFromBackend: string, userId: String) => void;
    reset: () => void;
};

export const useAdminStore = create<AdminStore>()(
    persist(
        (set) => ({
            cachedUsers: [],
            totalUserBalance: 0,
            LastSyncedAt: new Date(Date.now()).toLocaleString(),
            setCachedUsers: (data: User[], balance) => set((state) => ({
                cachedUsers: data.slice(0, 5).map(user => ({
                    ...user,
                    expenses: user.expenses.slice(0, 10)
                })),
                totalUserBalance: balance,
                LastSyncedAt: new Date(Date.now()).toLocaleString()
            })),
            addUser: (data) =>
                set((state) => {
                    const updatedUsers = [data, ...state.cachedUsers].sort(
                        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    ).slice(0, 5);
                    return {
                        ...state,
                        cachedUsers: updatedUsers,
                        totalUserBalance: state.totalUserBalance + data.netBalance
                    }
                }),
            assignBalance: (id, expense) =>
                set((state) => ({
                    ...state,
                    cachedUsers: state.cachedUsers.map((item) => (
                        item._id === id ? {
                            ...item,
                            netBalance: (item.netBalance + expense.amount),
                            expenses: [expense, ...item.expenses].slice(0, 10)
                        } : item
                    )),
                    totalUserBalance: state.totalUserBalance + expense.amount
                })),
            deleteUser: (data) =>
                set((state) => ({
                    ...state,
                    cachedUsers: state.cachedUsers.filter((item) => item._id !== data._id),
                    totalUserBalance: state.totalUserBalance - data.netBalance
                })),
            editUserExpenseByAdmin: (id, data) => set((state) => {
                let diffAmount = 0
                return {
                    ...state,
                    cachedUsers: state.cachedUsers.map((item) => {
                        if (item._id === id) {
                            return {
                                ...item, expenses: item.expenses.map((it) => {
                                    if (it._id === data._id) {
                                        diffAmount = data.amount - it.amount;
                                        return { ...data }
                                    }
                                    return it
                                }), netBalance: item.netBalance + diffAmount
                            }
                        }
                        return item
                    }),
                    totalUserBalance: state.totalUserBalance + diffAmount
                }
            }),
            removeUserExpenseByAdmin: (id, data) => set((state) => {
                let diffAmount = 0
                return {
                    ...state,
                    cachedUsers: state.cachedUsers.map((item) => {
                        if (item._id === id) {
                            return {
                                ...item, expenses: item.expenses.filter((it) => {
                                    if (it._id === data._id) {
                                        diffAmount = data.amount

                                        return false
                                    }
                                    return true
                                }), netBalance: item.netBalance - diffAmount
                            }
                        }
                        return item
                    }),
                    totalUserBalance: state.totalUserBalance - diffAmount
                }
            }),
            markAsSyncedAdmin: (tempId, newIdFromBackend, userId) => set((state) => {
                return {
                    ...state,
                    cachedUsers: state.cachedUsers.map((item) => {
                        if (item._id === userId) {
                            return {
                                ...item, expenses: item.expenses.map((e) =>
                                    e._id === tempId
                                        ? { ...e, _id: newIdFromBackend, isSynced: 'true' }
                                        : e)
                            }
                        }
                        return item
                    }),
                }
            }),
            reset: () =>
                set((state) => ({
                    cachedUsers: [],
                })),
        }),
        {
            name: 'admin-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
