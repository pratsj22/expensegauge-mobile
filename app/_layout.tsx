import { Stack } from "expo-router";
import "../global.css";
import { useColorScheme, View } from "react-native";
import { StatusBar } from 'expo-status-bar';
import ToastManager from 'toastify-react-native'


export default function RootLayout() {
  const colorScheme = useColorScheme()
  const backcolor = colorScheme == 'light' ? 'white' : '#111827'
  
  return (
    <View style={{ flex: 1, backgroundColor: backcolor }}>
      <StatusBar style="auto" />
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal/[type]" options={{
          headerShown: false,
          presentation: 'transparentModal',
          animation: "fade_from_bottom",
          statusBarBackgroundColor: backcolor,
        }} />
      </Stack>
      <ToastManager useModal={false} theme={colorScheme} />
    </View>

  );
}
