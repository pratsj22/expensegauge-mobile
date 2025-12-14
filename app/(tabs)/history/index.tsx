import { View, Text, FlatList, Dimensions, useColorScheme, RefreshControl } from 'react-native';
import { use, useEffect, useState } from 'react';
import { useExpenseStore } from '../../../store/expenseStore';
import { LineChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '@/api/api';
import { ActivityIndicator } from 'react-native-paper';
import { useAuthStore } from '@/store/authStore';
import { Redirect } from 'expo-router';
import ExpenseItem from '@/app/expenseModal/ExpenseItem';
import DeleteModal from '../home/DeleteModal';

type Transaction = {
  _id: string;
  amount: number;
  date: string; // e.g., "Sun Apr 06 2025"
  details: string;
  type: string;
  category: string;
  isSynced: string | null;
}
// Screen width for chart
const screenWidth = Dimensions.get('window').width;

export default function TransactionHistory() {
  const user = useAuthStore((state) => state.role);

  if (user === 'admin') {
    return <Redirect href="/history/adminAllUsersView" />;
  }
  const { setCachedExpenses, removeExpense, LastSyncedAt, cachedExpenses } = useExpenseStore();
  // const expense = useExpenseStore((state) => state.expenses);
  const existingIds = new Set(cachedExpenses.map(exp => exp._id));
  const [expenses, setExpenses] = useState<Transaction[]>(cachedExpenses);

  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  useEffect(() => {
    setExpenses(cachedExpenses)
  }, [cachedExpenses]);
  const handleTransactionPress = (transaction: Transaction) => {
    setSelectedTransaction(
      selectedTransaction?._id === transaction._id ? null : transaction
    );
  }
  const handleDelete = async () => {
    if (selectedTransaction) {
      try {
        const response = await api.delete(`/expense/${selectedTransaction._id}`)
        setExpenses(prev => prev.filter((item) => item._id !== selectedTransaction._id))
        removeExpense(selectedTransaction)

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
      const month = date.toLocaleString('default', { month: 'long' });
      const year = date.getFullYear();

      const monthYear = `${month.substring(0,3)} ${year}`;

      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = [];
      }
      monthlyData[monthYear].push(transaction);
    });
    console.log(monthlyData);

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
      let debitTotal = 0;
      let creditTotal = 0;

      for (const t of transactions) {
        if (t.type === "debit") {
          debitTotal += t.amount;
        } else if (t.type === "credit") {
          creditTotal += t.amount;
        }
      }

      debitData.push(debitTotal);
      creditData.push(creditTotal);

    });
    // 👇 Add dummy starting values to avoid dot-on-axis issue
    console.log(debitData);
    console.log(creditData);

    if (debitData.length > 0) debitData.unshift(0);
    if (creditData.length > 0) creditData.unshift(0);
    labels.unshift(""); // empty label for the first dummy point
    return { labels, debitData, creditData };
  };
  const colorScheme = useColorScheme()

  const { labels, debitData, creditData } = getGraphData();

  const chartConfig = {
    backgroundGradientFrom: '#1E293B',
    backgroundGradientTo: '#1E293B',
    decimalPlaces: 0,
    fromZero: true,
    
    color: (opacity = 1) => `${colorScheme == 'dark' ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`}`,
    labelColor: (opacity = 1) => `${colorScheme == 'dark' ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`}`,
    propsForDots: {
      r: '5',
      strokeWidth: '1',
      stroke: '#ffa726',
    },
  };
  const fetchExpenses = async () => {

    if (loading || !hasMore) return;

    setLoading(true);
    setRefreshing(true)
    try {
      const limit = 10;
      const response = await api.get(`/expense/get-expense/?offset=${offset}&limit=${limit}`);

      const filteredNew = response.data.expenses.filter((exp: Transaction) => !existingIds.has(exp._id));

      setExpenses(prev => [...prev, ...filteredNew].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
      setCachedExpenses(expenses.slice(0, 21), response.data.totalBalance)
      setOffset(prev => prev + limit);
      setHasMore(response.data.hasMore);
    } catch (err) {
      console.error('Failed to fetch expenses', err);
    } finally {
      setLoading(false);
      setRefreshing(false)
    }
  };
  useEffect(() => {
    if (expenses.length < 10) {
      fetchExpenses()
    }
  }, []);

  return (
    <SafeAreaView className="flex-1 dark:bg-gray-900 p-5 pb-20">
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
        data={Object.keys(monthlyData).reverse()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchExpenses} />
        }
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
                  type="user"
                  onSelect={handleTransactionPress}
                  onDeletePress={() => setShowDeleteModal(true)}
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

    </SafeAreaView>
  );
}