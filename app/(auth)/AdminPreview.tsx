import { useRouter } from 'expo-router'
import { View, Text, ScrollView, Image, TouchableOpacity, useColorScheme } from 'react-native'

export default function AdminPreviewScreen() {
  const router = useRouter()
  const colorScheme=useColorScheme()
  const slides = [
    {
      title: 'Manage Users',
      image: colorScheme==='dark'?require("../../assets/images/admin_preview1.jpg"):require("../../assets/images/admin_preview1_light.jpg"),
      description: 'See and manage all registered users easily.'
    },
    {
      title: 'Register new users',
      image: colorScheme==='dark'?require("../../assets/images/admin_preview2.jpg"):require("../../assets/images/admin_preview2_light.jpg"),
      description: 'Register new users and track thier expenses'
    },
    {
      title: 'Track Expenses Globally',
      image: colorScheme==='dark'?require("../../assets/images/admin_preview3.jpg"):require("../../assets/images/admin_preview3_light.jpg"),
      description: 'Oversee all user expenses with rich analytics.'
    }
  ]
  
  return (
    <ScrollView horizontal pagingEnabled className="flex-1 bg-white dark:bg-gray-800">
      {slides.map((slide, index) => (
        <View key={index} className="w-screen items-center justify-center px-6">
          <Image source={slide.image} className="w-80 h-2/3 my-6 rounded-xl" resizeMode="stretch" />
          <Text className="text-2xl dark:text-gray-200 font-bold mb-2">{slide.title}</Text>
          <Text className="text-center dark:text-gray-200 text-gray-600">{slide.description}</Text>
        </View>
      ))}
      <View className="w-screen items-center justify-center px-6">
        <Text className="text-xl dark:text-gray-200 font-semibold mb-4">Ready to manage your app?</Text>
        <TouchableOpacity
          className="bg-indigo-600 px-6 py-3 rounded-full"
          onPress={() => router.replace('/login?type=signup&role=admin')}
        >
          <Text className="text-white font-semibold">Sign Up as Admin</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-3"
        >
          <Text className="text-gray-500 dark:text-gray-200">Go Back</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}
