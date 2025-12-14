import { create } from 'zustand'
type Transaction = {
    amount: number;
    day: string;
    details: string;
    id: string;
    quantity: string;
    type: string;
    unit: string;
}
type ExpenseStore = {
    expenses: Transaction[];
    balance: number;
    addExpense: (data: Transaction) => void;
    editExpense: (data: Transaction) => void;
    removeExpense: (data: Transaction) => void;
};

export const useExpenseStore = create<ExpenseStore>((set) => ({
    expenses: [{ "amount": 100, "day": "Sun Apr 06 2025", "details": "Bhindi", "id": "1743958760980", "quantity": "1","type": "debit", "unit": "kg" }],
    balance: 3000,
    addExpense: (data: Transaction) => set((state: { expenses: Transaction[]; balance: number; }) => ({ ...state, expenses: [data, ...state.expenses].sort((a, b) => (new Date(b.day).getTime() - new Date(a.day).getTime())), balance: data.type == "credit" ? state.balance + data.amount : state.balance - data.amount })),
    editExpense: (data: Transaction) => set(
        (state: { expenses: Transaction[]; balance: number; }) => (
            {
                ...state,
                expenses: state.expenses.map((item)=>{
                    if(item.id===data.id){
                        return data;
                    }
                    return item;
                }),
                balance: data.type == "credit" ? state.balance - data.amount : state.balance + data.amount
            }
        )
    ),
    removeExpense: (data: Transaction) => set(
        (state: { expenses: Transaction[]; balance: number; }) => (
            {
                ...state,
                expenses: state.expenses.filter((item: { id: string; }) => item.id !== data.id),
                balance: data.type == "credit" ? state.balance - data.amount : state.balance + data.amount
            }
        )
    )
}))