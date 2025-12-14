import { useLocalSearchParams, useRouter } from "expo-router";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import axios from 'axios'
import api from "@/api/api";
import { API_URL } from '@env';

export default function Index() {

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()
  const handleVerify = async() => {
    console.log("hellloo");
    console.log(API_URL);
    
    const response= await axios.get('http://192.168.29.6:8000/')
    console.log(response);
    // router.navigate('/(tabs)/home?id=admin');
  }
  const isLogin = useLocalSearchParams()?.type === 'login';
  
  return (
    <SafeAreaView className="flex-1 p-6 dark:bg-gray-900 ">
      <View className="flex-[0.5] justify-center items-center">
        <Text className="text-4xl font-bold text-white mb-2">ExpenseGauge</Text>
        <Text className="text-gray-400 text-center">
          Manage your finances with ease
        </Text>
      </View>
      <Text className="text-2xl text-center font-bold text-white mb-5">
        {isLogin ? 'Welcome Back' : 'Create Account'}
      </Text>
      <View className="flex gap-5 space-y-6">
        {!isLogin &&
          <TextInput
            className="bg-gray-800 text-white p-4 rounded-lg text-lg"
            placeholder="Full Name"
            placeholderTextColor="#9CA3AF"
          />
        }
        <TextInput
          className="bg-gray-800 text-white p-4 rounded-lg text-lg"
          placeholder="Username"
          placeholderTextColor="#9CA3AF"
          onChangeText={setUsername}
        />
        <TextInput
          className="bg-gray-800 text-white p-4 rounded-lg text-lg"
          placeholder="Password"
          placeholderTextColor="#9CA3AF"
          onChangeText={setPassword}
          secureTextEntry
        />

        <TextInput
          className="bg-gray-800 text-white p-4 rounded-lg text-lg"
          placeholder="Confirm Password"
          placeholderTextColor="#9CA3AF"
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity className="bg-indigo-600 py-4 rounded-lg" onPress={handleVerify}>
          <Text className="text-white text-center text-lg font-semibold">
            {isLogin ? 'Login' : 'Sign Up'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
