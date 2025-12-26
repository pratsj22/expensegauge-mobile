import { Feather } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Text, useColorScheme, View } from "react-native";


import { useSafeAreaInsets } from "react-native-safe-area-context";


export default function RootLayout() {
  const colorScheme = useColorScheme()
  const backcolor = colorScheme == 'light' ? 'white' : '#111827'
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: '#111827' }}>
      <Tabs screenOptions={{
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: backcolor,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          position: "absolute",
          borderTopWidth: 0.3,
          borderColor: '#4f46e5'
        },
        tabBarActiveTintColor: 'white'
      }}>
        <Tabs.Screen name="home" options={{
          title: 'Home',
          headerShown: false,
          tabBarShowLabel: true,
          tabBarLabel: ({ focused, color }) => (
            <Text className="text-xs mt-1" style={{ color: focused ? '#6366f1' : color }}>Home</Text>
          ),
          tabBarIcon: ({ focused, color }) => <Feather size={23} name="home" color={focused ? '#6366f1' : color} />,
        }} />
        <Tabs.Screen name="history" options={{
          title: "History", headerShown: false,
          tabBarShowLabel: true,
          tabBarLabel: ({ focused, color }) => (
            <Text className="text-xs mt-1" style={{ color: focused ? '#6366f1' : color }}>Insights</Text>
          ),
          tabBarIcon: ({ focused, color }) => <Feather size={23} name="bar-chart-2" color={focused ? '#6366f1' : color} />,
        }} />
        <Tabs.Screen name="profile" options={{
          title: "Profile", headerShown: false,
          tabBarShowLabel: true,
          tabBarLabel: ({ focused, color }) => (
            <Text className="text-xs mt-1" style={{ color: focused ? '#6366f1' : color }}>Profile</Text>
          ),
          tabBarIcon: ({ focused, color }) => <Feather size={23} name="user" color={focused ? '#6366f1' : color} />,
        }} />
      </Tabs>
    </View>

  );
}
