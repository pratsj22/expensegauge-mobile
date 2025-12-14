import { Link, useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { FlatList, RefreshControl, Text, TouchableOpacity, useColorScheme, View } from "react-native";
import { useEffect, useState } from "react";
import api from "@/api/api";
import { useAdminStore } from "@/store/adminStore";
import { FontAwesome } from "@expo/vector-icons";
import DeleteModal from "../(tabs)/home/DeleteModal";
import ExpenseItem from "../expenseModal/ExpenseItem";

type Transaction = {
  _id: string;
  amount: number;
  date: string;
  details: string;
  type: string;
  category: string;
  isSynced: string | null;
};

export default function adminUserView() {
  const { userindex } = useLocalSearchParams<Record<string, string>>()
  // const { expenses, balance, removeExpense } = useExpenseStore();
  const user = useAdminStore((state) => state.cachedUsers[parseInt(userindex)]);
  const { removeUserExpenseByAdmin } = useAdminStore()
  const [refreshing, setRefreshing] = useState(false)
  const [hasMore, setHasMore] = useState(true);


  const [expenses, setExpenses] = useState<Transaction[]>(user.expenses);
  useEffect(() => {
    setExpenses(user.expenses);
  }, [user]);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const colorScheme = useColorScheme();
  const handleTransactionPress = (transaction: Transaction) => {
    setSelectedTransaction(
      selectedTransaction?._id === transaction._id ? null : transaction
    );
  }
  const handleDelete = async () => {
    if (selectedTransaction) {
      try {
        const response = await api.delete(`/admin/expense/${user._id}/${selectedTransaction._id}`)
        setExpenses(prev => prev.filter((item) => item._id !== selectedTransaction._id))
        removeUserExpenseByAdmin(user._id, selectedTransaction)

      } catch (error) {
        console.error(error);

      }
    }
    setShowDeleteModal(false)
  }
  const fetchExpenses = async () => {
    setRefreshing(true)

    try {
      const limit = 10;
      const response = await api.get(`/admin/expenses/${user._id}`);
      setHasMore(response.data.hasMore)
      setExpenses(prev => [...response.data.expenses].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    } catch (err) {
      console.error('Failed to fetch expenses', err);
    }
    setRefreshing(false)
  };

  useEffect(() => {
    if (expenses.length < 10) {
      fetchExpenses()
    }
  }, [])

  const router = useRouter();
  const navigate = useNavigation()
  useEffect(() => {
    navigate.setOptions({
      headerTitle: user.name,
    })
  }, [])
  return (
    <View className="flex-1 p-4 dark:bg-gray-900">
      <View className="dark:bg-indigo-600 bg-white rounded-xl p-6 mb-6 dark:border-0 border border-gray-300">
        <Text className="dark:text-white text-slate-800 text-lg">Total Balance</Text>
        <Text className="dark:text-white text-slate-800 text-4xl font-bold mt-2">{user.netBalance.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</Text>
      </View>

      {/* Transaction Buttons */}
      <View className="flex-row justify-between mb-6">
        <Link href={`/expenseModal/credit?userId=${user._id}`} asChild>
          <TouchableOpacity className="bg-green-600 py-3 px-6 rounded-lg flex-1 mr-2">
            <Text className="text-white text-center">Assign Balance</Text>
          </TouchableOpacity>
        </Link>
      </View>

      {/* Recent Transactions */}
      <View className="flex-row justify-between items-center my-4">
        <Text className="dark:text-white text-gray-800 text-lg font-semibold">Recent Transactions</Text>
        {<TouchableOpacity onPress={() => router.navigate(`/admin/adminUserHistory?userindex=${userindex}`)}>
          <Text className="dark:text-indigo-400 text-indigo-800 dark:font-normal font-semibold text-lg">View All</Text>
        </TouchableOpacity>}
      </View>

      {expenses[0] &&
        <FlatList
          data={expenses.slice(0, 10)}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={fetchExpenses} />
          }
          renderItem={({ item }) => (
            <ExpenseItem
              item={item}
              selectedId={selectedTransaction?._id || null}
              type="admin"
              onSelect={handleTransactionPress}
              onDeletePress={() => setShowDeleteModal(true)
              }
            />
          )}
          keyExtractor={item => item._id}
        />}
      {!expenses[0] &&
        <View className="flex flex-row justify-center items-center p-3">
          <Text className="text-xl dark:text-white ">No transactions to show</Text>
        </View>
      }
      {showDeleteModal && <DeleteModal setShow={setShowDeleteModal} handleDelete={handleDelete} />}
    </View>
  );
}
