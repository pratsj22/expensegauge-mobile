import { View, Text, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput } from 'react-native-paper';
import { useRouter } from 'expo-router';

const changePassword = () => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const router = useRouter()
  const handleVerify = () => {
    router.navigate('..');
    
  }
  return (
    <SafeAreaView className="flex-1 p-6 dark:bg-gray-900 items-center border-2 border-gray-200">
      <Text className="text-2xl text-center font-bold text-white mb-5">
        Change Password
      </Text>
      <View className="flex gap-5 space-y-6">
        <TextInput
          className="dark:bg-gray-800 text-white p-4 rounded-lg text-lg"
          placeholder="Username"
          placeholderTextColor="#9CA3AF"
          onChangeText={setUsername}
        />
        <TextInput
          className="dark:bg-gray-800 text-white p-4 rounded-lg text-lg"
          placeholder="Old Password"
          placeholderTextColor="#9CA3AF"
          onChangeText={setPassword}
          secureTextEntry
        />

        <TextInput
          className="dark:bg-gray-800 text-white p-4 rounded-lg text-lg"
          placeholder="New Password"
          placeholderTextColor="#9CA3AF"
          onChangeText={setNewPassword}
          secureTextEntry
        />

        <TouchableOpacity className="bg-indigo-600 py-4 rounded-lg" onPress={handleVerify}>
          <Text className="text-white text-center text-lg font-semibold">
            Confirm
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export default changePassword