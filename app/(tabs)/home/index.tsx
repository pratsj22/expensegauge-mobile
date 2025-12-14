import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useExpenseStore } from '../../../store/store'
import { useState } from "react";
import { FontAwesome } from '@expo/vector-icons';

export default function Index() {

  const { expenses, balance } = useExpenseStore();
  const [selectedTransaction, setSelectedTransaction] = useState('');
  const router = useRouter();
  const handleTransactionPress = (transaction: string) => {
    setSelectedTransaction(
      selectedTransaction === transaction ? '' : transaction
    );
  }

  return (
    <SafeAreaView className="flex-1 p-4 dark:bg-gray-900">
      <View className="px-2 py-2">
        <Text className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Hello Mahendra 👋</Text>
      </View>
      <View className="dark:bg-indigo-600 bg-white rounded-xl p-6 mb-6 dark:border-0 border border-gray-300">
        <Text className="dark:text-white text-slate-800 text-lg">Total Balance</Text>
        <Text className="dark:text-white text-slate-800 text-4xl font-bold mt-2">{balance.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</Text>
      </View>

      {/* Transaction Buttons */}
      <View className="flex-row justify-between mb-6">
        <Link href={'/modal/credit'} asChild>
          <TouchableOpacity className="bg-green-600 py-3 px-6 rounded-lg flex-1 mr-2">
            <Text className="text-white text-center">Add Credit</Text>
          </TouchableOpacity>
        </Link>
        <Link href={'/modal/debit'} asChild>
          <TouchableOpacity className="bg-red-600 py-3 px-6 rounded-lg flex-1 ml-2">
            <Text className="text-white text-center">Add Debit</Text>
          </TouchableOpacity>
        </Link>
      </View>
      {/* Recent Transactions */}
      <View className="flex-row justify-between items-center my-4">
        <Text className="dark:text-white text-gray-800 text-lg font-semibold">Recent Transactions</Text>
        <TouchableOpacity onPress={() => router.navigate('/(tabs)/history')}>
          <Text className="dark:text-indigo-400 text-indigo-800 dark:font-normal font-semibold text-lg">View All</Text>
        </TouchableOpacity>
      </View>

      {expenses[0] &&
        <FlatList
          data={expenses.slice(0, 10)}
          renderItem={({ item }) => (
            <View className="mb-2">
              <TouchableOpacity
                className="dark:bg-gray-800 bg-white dark:border-0 border border-gray-200 p-4 rounded-lg dark:shadow-none shadow-lg"
                onPress={() => handleTransactionPress(item.id)}
              >
                <View className="flex-row justify-between">
                  <Text className="dark:text-gray-100">{item.details} {item.type === 'debit' && item.unit? `- ${item.quantity} ${item.unit}` : ""}</Text>
                  <Text className={item.type === 'debit' ? 'dark:text-red-400 text-red-500' : 'dark:text-green-400 text-green-500'}>
                    {item.type === 'debit' ? '-' : '+'} ₹{item.amount}
                  </Text>
                </View>
                <View className="flex flex-row justify-between items-center mt-1">
                  <Text className="dark:text-gray-400 text-gray-700 text-sm">{item.day}</Text>
                </View>
              </TouchableOpacity>
              {/* Edit Button (appears when selected) */}
              {selectedTransaction === item.id && (
                <Link href={{
                  pathname:`/modal/[type]`,
                  params:{...item}
                }} asChild>
                  <TouchableOpacity className="bg-indigo-900 flex-row gap-2 py-2 px-4 rounded-lg items-center justify-end w-full" style={{ borderTopRightRadius: 0, borderTopLeftRadius: 0 }}>
                    <FontAwesome name="pencil" size={15} color="white" />
                    <Text className="text-white text-sm font-semibold">Edit Transaction</Text>
                  </TouchableOpacity>
                </Link>
              )}
            </View>
          )}
          keyExtractor={item => item.id}
        />}
      {!expenses[0] &&
        <View className="flex flex-row justify-center items-center p-3">
          <Text className="text-xl text-white ">No transactions to show</Text>
        </View>
      }
    </SafeAreaView>
  );
}
