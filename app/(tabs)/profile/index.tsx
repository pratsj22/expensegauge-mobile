import { useAuthStore } from '@/store/authStore';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, Image, ScrollView, Pressable, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LogoutModal from './LogoutModal';
import api from '@/api/api';
import { Toast } from 'toastify-react-native';

import DateTimePicker from '@react-native-community/datetimepicker';
import { useColorScheme, Modal, Platform } from 'react-native';

const UserProfileScreen: React.FC = () => {
  const router = useRouter()
  const user = useAuthStore((state) => state.name);
  const email = useAuthStore((state) => state.email);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Unified Report Modal State
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportType, setReportType] = useState('monthly');
  const [referenceDate, setReferenceDate] = useState(new Date());

  // Initialize safe dates
  const getLastWeek = () => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d;
  }
  const [customStart, setCustomStart] = useState(getLastWeek());
  const [customEnd, setCustomEnd] = useState(new Date());

  // Date Picker visibility
  const [showRefPicker, setShowRefPicker] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleGenerate = async () => {
    let start = new Date();
    let end = new Date();
    let d = new Date(referenceDate);

    if (reportType === 'weekly') {
      // Logic to get start of week (Sunday or Monday)
      const day = d.getDay();
      const diff = d.getDate() - day;
      start = new Date(d);
      start.setDate(diff);
      start.setHours(0, 0, 0, 0);

      end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
    } else if (reportType === 'monthly') {
      start = new Date(d.getFullYear(), d.getMonth(), 1);
      end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
    } else if (reportType === 'yearly') {
      start = new Date(d.getFullYear(), 0, 1);
      end = new Date(d.getFullYear(), 11, 31);
      end.setHours(23, 59, 59, 999);
    } else if (reportType === 'custom') {
      start = new Date(customStart);
      end = new Date(customEnd);
      if (start > end) {
        Toast.error("Start date must be before end date");
        return;
      }
    }

    setShowReportModal(false);
    try {
      Toast.info(`Generating ${reportType} Report...`)
      // Always sending as 'custom' with explicit dates to backend for precision
      await api.post('/expense/report/generate', {
        type: 'custom',
        startDate: start.toISOString(),
        endDate: end.toISOString()
      })
      Toast.success(`Report sent to ${email}`)
    } catch (e) {
      Toast.error("Failed to generate report")
    }
  };

  const formatDateRange = () => {
    const d = new Date(referenceDate);
    if (reportType === 'weekly') {
      const day = d.getDay();
      const start = new Date(d.setDate(d.getDate() - day));
      const end = new Date(new Date(start).setDate(start.getDate() + 6));
      return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
    }
    if (reportType === 'monthly') return d.toLocaleDateString('default', { month: 'long', year: 'numeric' });
    if (reportType === 'yearly') return d.getFullYear().toString();
    return '';
  };

  return (
    <SafeAreaView className='dark:bg-gray-900 bg-white' style={{ flex: 1 }}>
      <ScrollView className="px-6 pt-10" contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="items-center mb-6">
          <Image
            source={{ uri: 'https://i.pravatar.cc/150?img=12' }}
            className="w-24 h-24 rounded-full mb-3"
          />
          <Text className="text-xl font-bold text-gray-900 dark:text-white">{user}</Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400">{email}</Text>
        </View>

        <View className='mt-10'>
          <Text className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
            Settings
          </Text>

          <View className=" p-2 mb-6">

            <Pressable className="flex-row justify-between items-center border-b dark:border-gray-600 border-gray-300 dark:active:bg-gray-800 active:bg-gray-100" onPress={() => setShowReportModal(true)}>
              <Text className="text-base text-gray-700 dark:text-gray-200 py-6">Download Expense Report</Text>
              <Text className="text-base text-gray-500 dark:text-gray-300 py-6 px-1"><Feather name='download' size={15} /></Text>
            </Pressable>

            <Pressable className="flex-row justify-between items-center border-b dark:border-gray-600 border-gray-300 dark:active:bg-gray-800 active:bg-gray-100" onPress={() => router.navigate('/profile/theme')}>
              <Text className="text-base text-gray-700 dark:text-gray-200 py-6">Change Theme</Text>
              <Text className="text-base text-gray-500 dark:text-gray-300 py-6 px-1"><Feather name='chevron-right' size={15} /></Text>
            </Pressable>
            <Pressable className="flex-row justify-between items-center border-b dark:border-gray-600 border-gray-300 dark:active:bg-gray-800 active:bg-gray-100" onPress={() => router.navigate('/profile/changePassword')}>
              <Text className="text-base text-gray-700 dark:text-gray-200 py-6">Change Password</Text>
              <Text className="text-base text-gray-500 dark:text-gray-300 py-6 px-1"><Feather name='chevron-right' size={15} /></Text>
            </Pressable>
            <TouchableOpacity className="py-6" onPress={() => setShowLogoutModal(true)}>
              <Text className="text-base text-red-600 dark:text-red-400 font-semibold">
                Log Out
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {showLogoutModal && <LogoutModal setShow={setShowLogoutModal} />}

        {/* Unified Report Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={showReportModal}
          onRequestClose={() => setShowReportModal(false)}
        >
          <View className="flex-1 justify-center items-center bg-black/50 p-4">
            <View className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-2xl p-6 shadow-xl">
              <Text className="text-xl font-bold mb-6 text-center dark:text-white">Export Expenses</Text>

              {/* Types */}
              <View className="flex-row justify-between mb-6 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                {['weekly', 'monthly', 'yearly', 'custom'].map((t) => {
                  const isActive = reportType === t;
                  return (
                    <TouchableOpacity
                      key={t}
                      onPress={() => setReportType(t)}
                      className={isActive
                        ? "flex-1 py-2 rounded-md bg-white dark:bg-gray-600 shadow-sm"
                        : "flex-1 py-2 rounded-md"
                      }
                    >
                      <Text className={isActive
                        ? "text-center text-xs font-medium capitalize text-indigo-600 dark:text-white"
                        : "text-center text-xs font-medium capitalize text-gray-500 dark:text-gray-400"
                      }>
                        {t}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Dynamic Inputs */}
              {reportType !== 'custom' ? (
                <View className="mb-6">
                  <Text className="text-gray-600 dark:text-gray-300 mb-2 font-medium">
                    Select {reportType === 'weekly' ? 'Week' : reportType === 'monthly' ? 'Month' : 'Year'}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowRefPicker(true)}
                    className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-4 rounded-xl flex-row justify-between items-center"
                  >
                    <Text className="dark:text-white text-base">
                      {formatDateRange()}
                    </Text>
                    <Feather name="calendar" size={18} color={isDark ? "white" : "gray"} />
                  </TouchableOpacity>
                  {showRefPicker && (
                    <DateTimePicker
                      value={referenceDate}
                      mode="date"
                      display="default"
                      onChange={(event, date) => {
                        setShowRefPicker(Platform.OS === 'ios');
                        if (date) setReferenceDate(date);
                      }}
                    />
                  )}
                </View>
              ) : (
                <View className="mb-6">
                  <View className="mb-4">
                    <Text className="text-gray-600 dark:text-gray-300 mb-2 font-medium">Start Date</Text>
                    <TouchableOpacity onPress={() => setShowStartPicker(true)} className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-3 rounded-xl flex-row justify-between items-center">
                      <Text className="dark:text-white">{customStart.toDateString()}</Text>
                      <Feather name="calendar" size={18} color={isDark ? "white" : "gray"} />
                    </TouchableOpacity>
                    {showStartPicker && (
                      <DateTimePicker value={customStart} mode="date" display="default" onChange={(e, d) => { setShowStartPicker(Platform.OS === 'ios'); if (d) setCustomStart(d); }} />
                    )}
                  </View>
                  <View>
                    <Text className="text-gray-600 dark:text-gray-300 mb-2 font-medium">End Date</Text>
                    <TouchableOpacity onPress={() => setShowEndPicker(true)} className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-3 rounded-xl flex-row justify-between items-center">
                      <Text className="dark:text-white">{customEnd.toDateString()}</Text>
                      <Feather name="calendar" size={18} color={isDark ? "white" : "gray"} />
                    </TouchableOpacity>
                    {showEndPicker && (
                      <DateTimePicker value={customEnd} mode="date" display="default" maximumDate={new Date()} onChange={(e, d) => { setShowEndPicker(Platform.OS === 'ios'); if (d) setCustomEnd(d); }} />
                    )}
                  </View>
                </View>
              )}

              <View className="flex-row gap-3">
                <TouchableOpacity onPress={() => setShowReportModal(false)} className="flex-1 bg-gray-200 dark:bg-gray-700 p-4 rounded-xl">
                  <Text className="text-center font-semibold text-gray-700 dark:text-gray-300">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleGenerate} className="flex-1 bg-indigo-600 p-4 rounded-xl">
                  <Text className="text-center font-semibold text-white">Generate PDF</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

      </ScrollView>
    </SafeAreaView>
  );
};

export default UserProfileScreen;
