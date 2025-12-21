import { Link, useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { ActivityIndicator, FlatList, RefreshControl, Text, TouchableOpacity, useColorScheme, View } from "react-native";
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
type User = {
  _id: string;
  netBalance: number;
  name: string;
  createdAt: string;
  expenses: Transaction[];
};

export default function adminUserView() {
  const { userindex, userId } = useLocalSearchParams<Record<string, string>>()
  const cachedUsers = useAdminStore((state) => state.cachedUsers);
  const { removeUserExpenseByAdmin } = useAdminStore()

  const [user, setUser] = useState<User | null>(() => {
    if (userId) return cachedUsers.find(u => u._id === userId) || null;
    if (userindex) return cachedUsers[parseInt(userindex)] || null;
    return null;
  });

  const [refreshing, setRefreshing] = useState(false)
  const [hasMore, setHasMore] = useState(true);
  const [expenses, setExpenses] = useState<Transaction[]>(user?.expenses || []);

  const fetchUserData = async () => {
    if (!userId) return;
    try {
      const response = await api.get(`/admin/user/${userId}`);
      setUser(prev => {
        if (!prev) return { ...response.data, expenses: [] };
        return { ...response.data, expenses: prev.expenses };
      });
    } catch (error) {
      console.error("Failed to fetch user data", error);
    }
  }

  useEffect(() => {
    if (!user && userId) {
      fetchUserData();
    }
  }, [userId]);

  useEffect(() => {
    if (user) {
      setExpenses(user.expenses);
    }
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
    if (selectedTransaction && user) {
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
    if (!user?._id) return;
    setRefreshing(true)

    try {
      const limit = 10;
      const response = await api.get(`/admin/expenses/${user._id}`);
      setHasMore(response.data.hasMore)
      const sortedExpenses = [...response.data.expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setExpenses(sortedExpenses);
    } catch (err) {
      console.error('Failed to fetch expenses', err);
    }
    setRefreshing(false)
  };

  useEffect(() => {
    if (user && expenses.length < 10) {
      fetchExpenses()
    }
  }, [user])

  const router = useRouter();
  const navigate = useNavigation()

  useEffect(() => {
    if (user) {
      navigate.setOptions({
        headerTitle: user.name,
      })
    }
  }, [user])

  if (!user) {
    return (
      <View className="flex-1 justify-center items-center dark:bg-gray-900">
        <ActivityIndicator size="large" />
      </View>
    )
  }

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
        {<TouchableOpacity onPress={() => router.navigate(`/admin/adminUserHistory?userindex=${userindex}&userId=${user._id}`)}>
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
