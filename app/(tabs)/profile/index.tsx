import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, Image, ScrollView, Pressable, Switch, useColorScheme, Appearance, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const UserProfileScreen: React.FC = () => {
  
  const router= useRouter()
  return (
    <SafeAreaView className='dark:bg-gray-900 bg-white' style={{ flex: 1 }}>
      <ScrollView className="px-6 pt-10" contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="items-center mb-6">
          <Image
            source={{ uri: 'https://i.pravatar.cc/150?img=12' }}
            className="w-24 h-24 rounded-full mb-3"
          />
          <Text className="text-xl font-bold text-gray-900 dark:text-white">Mahendra Johnson</Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400">mahendra@email.com</Text>
        </View>

        <View className='mt-10'>

          <Text className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
            Settings
          </Text>

          <View className=" p-2 mb-6">
            <Pressable className="flex-row justify-between items-center border-t dark:border-gray-600 border-gray-300 dark:active:bg-gray-800 active:bg-gray-100" onPress={()=>router.navigate('/profile/theme')}>
              <Text className="text-base text-gray-700 dark:text-gray-200 py-6">Change Theme</Text>
              <Text className="text-base text-gray-500 dark:text-gray-300 py-6 px-1"><Feather name='chevron-right' size={15} /></Text>
            </Pressable>
            <Pressable className="flex-row justify-between items-center border-t dark:border-gray-600 border-gray-300 dark:active:bg-gray-800 border-b active:bg-gray-100" onPress={()=>router.navigate('/profile/changePassword')}>
              <Text className="text-base text-gray-700 dark:text-gray-200 py-6">Change Password</Text>
              <Text className="text-base text-gray-500 dark:text-gray-300 py-6 px-1"><Feather name='chevron-right' size={15} /></Text>
            </Pressable>
            <TouchableOpacity className="py-6">
              <Text className="text-base text-red-600 dark:text-red-400 font-semibold">
                Log Out
              </Text>
            </TouchableOpacity>

          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default UserProfileScreen;
