import { Feather } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Text, useColorScheme, View } from "react-native";


export default function RootLayout() {
  const colorScheme = useColorScheme()
  const backcolor = colorScheme == 'light' ? 'white' : '#111827'

  return (
    <View style={{ flex: 1, backgroundColor: '#111827' }}>
      <Tabs screenOptions={{
        tabBarShowLabel: false,
        tabBarStyle: { backgroundColor: backcolor, minHeight: 70, position: "absolute", borderTopWidth: 0.3, borderColor: colorScheme == 'dark' ? '#6366f1' : '#3b82f6' },
        tabBarActiveTintColor: 'white'
      }}>
        <Tabs.Screen name="home/index" options={{
          title: 'Home',
          headerShown: false,
          tabBarShowLabel: true,
          tabBarLabel: ({ focused, color }) => (
            <Text className="text-xs mt-1" style={{ color: focused ? colorScheme == 'dark'? '#6366f1':'#3b82f6' : color }}>Home</Text>
          ),
          tabBarIcon: ({ focused, color }) => <Feather size={23} name="home" color={focused ? colorScheme == 'dark'? '#6366f1':'#3b82f6' : color} />,
        }} />
        <Tabs.Screen name="history/index" options={{
          title: "History", headerShown: false,
          tabBarShowLabel: true,
          tabBarLabel: ({ focused, color }) => (
            <Text className="text-xs mt-1" style={{ color: focused ? colorScheme == 'dark'? '#6366f1':'#3b82f6' : color }}>Insights</Text>
          ),
          tabBarIcon: ({ focused, color }) => <Feather size={23} name="bar-chart-2" color={focused ? colorScheme == 'dark'? '#6366f1':'#3b82f6' : color} />,
        }} />
        <Tabs.Screen name="profile" options={{
          title: "Profile", headerShown: false,
          tabBarShowLabel: true,
          tabBarLabel: ({ focused, color }) => (
            <Text className="text-xs mt-1" style={{ color: focused ? colorScheme == 'dark'? '#6366f1':'#3b82f6' : color }}>Profile</Text>
          ),
          tabBarIcon: ({ focused, color }) => <Feather size={23} name="user" color={focused ? colorScheme == 'dark'? '#6366f1':'#3b82f6' : color} />,
        }} />
      </Tabs>
    </View>

  );
}
