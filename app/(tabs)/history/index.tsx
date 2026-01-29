import { View, Text, FlatList, Dimensions, useColorScheme, RefreshControl, ScrollView } from 'react-native';
import { use, useEffect, useState, useRef } from 'react';
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
  const [expenses, setExpenses] = useState<Transaction[]>(cachedExpenses);

  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    value: number;
    visible: boolean;
    type: 'Debit' | 'Credit';
  } | null>(null);

  const tooltipTimeout = useRef<any>(null);

  useEffect(() => {
    setExpenses(prev => {
      if (cachedExpenses.length === 0) return [];

      // Get the oldest date in current cache to define the "cached range"
      const oldestCachedTime = new Date(cachedExpenses[cachedExpenses.length - 1].date).getTime();
      const cachedIds = new Set(cachedExpenses.map(exp => exp._id));

      // Items in local state that are NOT in cache and are NOT within the cache's date range
      // This prevents deleted items (which would be in the cache's range but missing from it) from returning
      const extraExpenses = prev.filter(exp => {
        const isNotCached = !cachedIds.has(exp._id);
        const isOlderThanCache = new Date(exp.date).getTime() < oldestCachedTime;
        return isNotCached && isOlderThanCache;
      });

      return [...cachedExpenses, ...extraExpenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });
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
    // ALWAYS sort ASCENDING (oldest to newest) to ensure keys are created in chronological order for the graph
    const sortedExpenses = [...expenses].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    sortedExpenses.forEach((transaction: Transaction) => {
      const date = new Date(transaction.date);
      const month = date.toLocaleString('default', { month: 'long' });
      const year = date.getFullYear();

      const monthYear = `${month.substring(0, 3)} ${year}`;

      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = [];
      }
      // Since we process in ASC order, unshift makes the list newest-first within each month
      monthlyData[monthYear].unshift(transaction);
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
    if (debitData.length > 0) debitData.unshift(0);
    if (creditData.length > 0) creditData.unshift(0);
    labels.unshift(""); // empty label for the first dummy point
    return { labels, debitData, creditData };
  };

  const scrollViewRef = useRef<ScrollView>(null);
  const colorScheme = useColorScheme()

  const { labels, debitData, creditData } = getGraphData();

  // Calculate dynamic width: min width is screenWidth, but if more than 3 months, expand.
  const chartWidth = Math.max(screenWidth * 0.9, (labels.length - 1) * (screenWidth * 0.3));

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
  const fetchExpenses = async (isRefresh = false) => {
    if (loading || (!isRefresh && !hasMore)) return;

    setLoading(true);
    if (isRefresh) setRefreshing(true);

    try {
      const limit = 10;
      const currentOffset = isRefresh ? 0 : offset;
      const response = await api.get(`/expense/get-expense/?offset=${currentOffset}&limit=${limit}`);

      const fetched = response.data.expenses;

      setExpenses(prev => {
        const merged = isRefresh ? fetched : [...prev, ...fetched];
        // Deduplicate and sort DESC (newest first)
        const unique = merged.filter((item: Transaction, index: number, self: Transaction[]) =>
          index === self.findIndex((t: Transaction) => t._id === item._id)
        );
        const sorted = unique.sort((a: Transaction, b: Transaction) => new Date(b.date).getTime() - new Date(a.date).getTime());

        // Update cache with the most recent items if we are at the top
        if (currentOffset === 0) {
          setCachedExpenses(sorted.slice(0, 21), response.data.totalBalance);
        }

        return sorted;
      });

      setOffset(isRefresh ? limit : prev => prev + limit);
      setHasMore(response.data.hasMore);
    } catch (err) {
      console.error('Failed to fetch expenses', err);
    } finally {
      setLoading(false);
      setRefreshing(false)
    }
  };

  const handleRefresh = () => {
    fetchExpenses(true);
  };
  useEffect(() => {
    if (expenses.length === 0) {
      fetchExpenses()
    }
  }, []);

  return (
    <SafeAreaView className="flex-1 dark:bg-gray-900 p-5 pb-20">
      {/* Graph Section */}
      <View className="p-4 pb-0 rounded-xl mb-6" style={{ backgroundColor: colorScheme == 'dark' ? '#1E293B' : 'white' }}>
        {labels.length > 1 ? (
          <>
            <Text className="dark:text-white text-lg font-semibold mb-2">Transaction Trends</Text>
            <ScrollView
              horizontal
              ref={scrollViewRef}
              showsHorizontalScrollIndicator={false}
              onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
              onScrollBeginDrag={() => setTooltip(null)} // Hide tooltip on scroll
            >
              <View style={{ position: 'relative' }}>
                <LineChart
                  data={{
                    labels,
                    datasets: [
                      { data: debitData, color: () => '#EF4444' }, // Red for debit
                      { data: creditData, color: () => '#10B981' }, // Green for credit
                    ],
                  }}
                  width={chartWidth}
                  height={280}
                  chartConfig={chartConfig}
                  bezier
                  transparent
                  style={{ borderRadius: 16, marginHorizontal: -13 }}
                  onDataPointClick={({ x, y, value, dataset }) => {
                    const type = dataset.color!(1) === '#EF4444' ? 'Debit' : 'Credit';

                    if (tooltipTimeout.current) clearTimeout(tooltipTimeout.current);

                    setTooltip({ x, y, value, type, visible: true });

                    tooltipTimeout.current = setTimeout(() => {
                      setTooltip(null);
                    }, 3000);
                  }}
                />

                {tooltip && tooltip.visible && (
                  <View
                    pointerEvents="none"
                    style={{
                      position: 'absolute',
                      left: tooltip.x - 45,
                      top: tooltip.y < 70 ? tooltip.y + 15 : tooltip.y - 65,
                      backgroundColor: 'rgba(30, 41, 59, 0.95)',
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: tooltip.type === 'Debit' ? '#EF4444' : '#10B981',
                      alignItems: 'center',
                      zIndex: 100,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 4.65,
                      elevation: 8,
                    }}
                  >
                    <Text style={{ color: 'white', fontSize: 13, fontWeight: 'bold' }}>
                      {tooltip.type}
                    </Text>
                    <Text style={{ color: 'white', fontSize: 15, fontWeight: '900', marginTop: 2 }}>
                      ₹{tooltip.value.toLocaleString('en-IN')}
                    </Text>
                    {/* Arrow */}
                    <View
                      style={{
                        position: 'absolute',
                        bottom: tooltip.y < 70 ? undefined : -6,
                        top: tooltip.y < 70 ? -6 : undefined,
                        width: 12,
                        height: 12,
                        backgroundColor: 'rgba(30, 41, 59, 0.95)',
                        borderRightWidth: 1,
                        borderBottomWidth: 1,
                        borderTopWidth: 0,
                        borderLeftWidth: 0,
                        borderColor: tooltip.type === 'Debit' ? '#EF4444' : '#10B981',
                        transform: [{ rotate: tooltip.y < 70 ? '225deg' : '45deg' }],
                      }}
                    />
                  </View>
                )}
              </View>
            </ScrollView>
          </>

        ) : (
          <Text className="text-gray-600 dark:text-gray-300 font-semibold text-center py-5 text-lg">No data available</Text>
        )}
      </View>


      {/* Transaction List */}
      <FlatList
        data={Object.keys(monthlyData).reverse()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
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
        onEndReached={() => fetchExpenses()}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loading ? <ActivityIndicator size="large" /> : null}
      />
      {showDeleteModal && <DeleteModal setShow={setShowDeleteModal} handleDelete={handleDelete} />}

    </SafeAreaView>
  );
}