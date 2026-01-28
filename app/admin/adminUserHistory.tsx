import { View, Text, FlatList, Dimensions, useColorScheme } from 'react-native';
import { useEffect, useState } from 'react';
import { LineChart } from 'react-native-chart-kit';
import api from '@/api/api';
import { ActivityIndicator } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';
import { useAdminStore } from '@/store/adminStore';
import ExpenseItem from '../expenseModal/ExpenseItem';
import DeleteModal from '../(tabs)/home/DeleteModal';

type Transaction = {
  _id: string;
  amount: number;
  date: string; // e.g., "Sun Apr 06 2025"
  details: string;
  type: string;
  category: string;
  isSynced: string | null;
}
type User = {
  _id: string;
  netBalance: number;
  name: string;
  createdAt: string;
  expenses: Transaction[];
};
// Screen width for chart
const screenWidth = Dimensions.get('window').width;

export default function TransactionHistory() {
  const { userindex, userId } = useLocalSearchParams<Record<string, string>>()
  const { activeUser, setActiveUser } = useAdminStore();
  const cachedUsers = useAdminStore((state) => state.cachedUsers);
  const { removeUserExpenseByAdmin } = useAdminStore()

  // Set active user on mount or param change
  useEffect(() => {
    let foundUser = null;
    if (userId) foundUser = cachedUsers.find(u => u._id === userId) || null;
    else if (userindex) foundUser = cachedUsers[parseInt(userindex)] || null;

    if (foundUser) {
      setActiveUser(foundUser);
    }
  }, [userId, userindex]);

  const user = activeUser;

  const [expenses, setExpenses] = useState<Transaction[]>(user?.expenses || []);

  const fetchUserData = async () => {
    if (!userId) return;
    try {
      const response = await api.get(`/admin/user/${userId}`);
      if (activeUser) {
        setActiveUser({ ...response.data, expenses: activeUser.expenses })
      } else {
        setActiveUser({ ...response.data, expenses: [] })
      }
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

  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
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

  // Process transactions for monthly segregation and graph data
  const getMonthlyData = () => {
    const monthlyData: { [key: string]: Transaction[] } = {};
    expenses.slice().reverse().forEach((transaction: Transaction) => {
      const date = new Date(transaction.date);
      const monthYear = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = [];
      }
      monthlyData[monthYear].push(transaction);
    });
    return monthlyData;
  };

  const monthlyData = getMonthlyData();

  // Graph data (total debit and credit per month)
  const getGraphData = () => {
    const labels: string[] = [];
    const debitData: number[] = [];
    const creditData: number[] = [];

    Object.keys(monthlyData).forEach((monthYear) => {
      labels.push(monthYear); // month & year for label
      const transactions = monthlyData[monthYear];
      const totalDebit = transactions
        .filter((t) => t.type === 'debit')
        .reduce((sum, t) => sum + t.amount, 0);
      const totalCredit = transactions
        .filter((t) => t.type === 'credit')
        .reduce((sum, t) => sum + t.amount, 0);
      debitData.push(totalDebit);
      creditData.push(totalCredit);
    });

    return { labels, debitData, creditData };
  };
  const colorScheme = useColorScheme()

  const { labels, debitData, creditData } = getGraphData();

  const chartConfig = {
    backgroundGradientFrom: '#1E293B',
    backgroundGradientTo: '#1E293B',
    decimalPlaces: 0,
    color: (opacity = 1) => `${colorScheme == 'dark' ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`}`,
    labelColor: (opacity = 1) => `${colorScheme == 'dark' ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`}`,
    propsForDots: {
      r: '5',
      strokeWidth: '1',
      stroke: '#ffa726',
    },
  };

  const fetchExpenses = async () => {
    if (!user?._id) return;
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const limit = 10;
      const response = await api.get(`/admin/expenses/${user._id}/?offset=${offset}&limit=${limit}`);

      setExpenses(prev => [...response.data.expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setOffset(prev => prev + limit);
      setHasMore(response.data.hasMore);
    } catch (err) {
      console.error('Failed to fetch expenses', err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (user && expenses.length < 10 && !user.expenses.length) {
      fetchExpenses()
    }
  }, [user]);

  if (!user) {
    return (
      <View className="flex-1 justify-center items-center dark:bg-gray-900">
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
    <View className="flex-1 dark:bg-gray-900 p-5 pb-20">
      {/* Graph Section */}
      <View className="p-4 pb-0 rounded-xl mb-6 overflow-hidden" style={{ backgroundColor: colorScheme == 'dark' ? '#1E293B' : 'white' }}>
        {labels.length > 0 ? (
          <>
            <Text className="dark:text-white text-lg font-semibold mb-2">Transaction Trends</Text>
            <LineChart
              data={{
                labels,
                datasets: [
                  { data: debitData, color: () => '#EF4444' }, // Red for debit
                  { data: creditData, color: () => '#10B981' }, // Green for credit
                ],
              }}
              width={screenWidth * 0.9} // Adjusted for padding
              height={280}
              chartConfig={chartConfig}
              bezier
              transparent
              style={{ borderRadius: 16, marginHorizontal: -13 }}
            />
          </>

        ) : (
          <Text className="text-gray-600 dark:text-gray-300 font-semibold text-center py-5 text-lg">No data available</Text>
        )}
      </View>


      {/* Transaction List */}
      <FlatList
        data={Object.keys(monthlyData).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())}
        renderItem={({ item: monthYear }) => (
          <View className="mb-6">
            <View className='flex-row items-center'>
              <Text className="dark:text-white text-lg font-semibold mb-2 pr-3">{monthYear}</Text>
              <Text className='bg-gray-500 h-[0.01px] w-full'></Text>
            </View>
            <FlatList
              data={monthlyData[monthYear]}
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
              keyExtractor={(item) => item._id}
            />
          </View>
        )}
        keyExtractor={(item) => item}
        showsVerticalScrollIndicator={false}
        onEndReached={fetchExpenses}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loading ? <ActivityIndicator size="large" /> : null}
      />
      {showDeleteModal && <DeleteModal setShow={setShowDeleteModal} handleDelete={handleDelete} />}

    </View>
  );
}