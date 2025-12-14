import { View, Text, TouchableOpacity, FlatList, Dimensions, useColorScheme } from 'react-native';
import { useState } from 'react';
import { useExpenseStore } from '../../../store/store';
import { LineChart } from 'react-native-chart-kit';
import { Link } from 'expo-router';

type Transaction = {
  amount: number;
  day: string; // e.g., "Sun Apr 06 2025"
  details: string;
  id: string;
  quantity: string;
  type: string;
  unit: string;
}
// Screen width for chart
const screenWidth = Dimensions.get('window').width;

export default function TransactionHistory() {
  const { expenses } = useExpenseStore();
  const [filter, setFilter] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  const [reportRange, setReportRange] = useState<'monthly' | 'quarterly' | 'custom'>('monthly');

  // Process transactions for monthly segregation and graph data
  const getMonthlyData = () => {
    const monthlyData: { [key: string]: Transaction[] } = {};
    expenses.slice().reverse().forEach((transaction: Transaction) => {
      const date = new Date(transaction.day);
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
  const colorScheme=useColorScheme()

  const { labels, debitData, creditData } = getGraphData();

  const chartConfig = {
    backgroundGradientFrom: '#1E293B',
    backgroundGradientTo: '#1E293B',
    decimalPlaces: 0,
    color: (opacity = 1) => `${colorScheme=='dark'?`rgba(255, 255, 255, ${opacity})`:`rgba(0, 0, 0, ${opacity})`}`,
    labelColor: (opacity = 1) => `${colorScheme=='dark'?`rgba(255, 255, 255, ${opacity})`:`rgba(0, 0, 0, ${opacity})`}`,
    propsForDots: {
      r: '5',
      strokeWidth: '1',
      stroke: '#ffa726',
    },
  };
  return (
    <View className="flex-1 dark:bg-gray-900 p-5">
      {/* Graph Section */}
      <View className="p-4 pb-0 rounded-xl mb-6 overflow-hidden" style={{backgroundColor:colorScheme=='dark'?'#1E293B':'white'}}>
        <Text className="dark:text-white text-lg font-semibold mb-2">Transaction Trends</Text>
        {labels.length > 0 ? (
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
            style={{ borderRadius: 16,marginHorizontal:-13}}
          />
        ) : (
          <Text className="text-gray-400 text-center">No data available</Text>
        )}
      </View>

      {/* Filters */}
      <View className="flex-row justify-between mb-6">
        {(['weekly', 'monthly', 'yearly'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            className={`py-2 px-4 rounded-lg ${filter === f ? 'bg-indigo-600' : 'bg-gray-800'
              }`}
            onPress={() => setFilter(f)}
          >
            <Text className="text-white capitalize">{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Report Download */}
      {/* <View className="mb-6">
        <Text className="text-white text-lg font-semibold mb-2">Download Report</Text>
        <View className="flex-row justify-between">
          {(['monthly', 'quarterly', 'custom'] as const).map((r) => (
            <TouchableOpacity
              key={r}
              className={`py-2 px-4 rounded-lg ${reportRange === r ? 'bg-indigo-600' : 'bg-gray-800'
                }`}
              onPress={() => setReportRange(r)}
            >
              <Text className="text-white capitalize">{r}</Text>
            </TouchableOpacity>
          ))}
        </View> */}
      {/* Placeholder for report download action */}
      {/* <TouchableOpacity className="bg-indigo-600 py-2 px-4 rounded-lg mt-2 self-start">
          <Text className="text-white">Download</Text>
        </TouchableOpacity>
      </View> */}

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
                <View className="dark:bg-gray-800 bg-white p-4 rounded-lg mb-2 dark:border-0 border border-gray-200 dark:shadow-none shadow-lg">
                  <View className="flex-row justify-between">
                    <Text className="dark:text-white">{item.details} {item.type === 'debit' ? `- ${item.quantity} ${item.unit}` : ""}</Text>
                    <Text className={item.type === 'debit' ? 'text-red-400' : 'text-green-400'}>
                      {item.type === 'debit' ? '-' : '+'} ₹{item.amount}
                    </Text>
                  </View>
                  <View className="flex flex-row justify-between items-center mt-1">

                    <Text className="dark:text-gray-400 text-gray-700 text-sm">{item.day}</Text>
                  </View>
                </View>
              )}
              keyExtractor={(item) => item.id}
            />
          </View>
        )}
        keyExtractor={(item) => item}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}