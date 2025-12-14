import { useAuthStore } from "@/store/authStore";
import { Redirect, Stack } from "expo-router";
import { useColorScheme, View } from "react-native";
import ToastManager from 'toastify-react-native'


export default function RootLayout() {
  const colorScheme = useColorScheme()
  const backcolor = colorScheme == 'light' ? 'white' : '#111827'
  const user = useAuthStore((state) => state.accessToken);
  
  if (user) {
    return <Redirect href="/(tabs)/home" />;
  }
  return (
    <View style={{ flex: 1, backgroundColor: backcolor }}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="AdminPreview" options={{ headerShown: false }} />
        <Stack.Screen name="forgotCredentials" options={{ headerShown: false }} />
      </Stack>
      <ToastManager useModal={false} theme={colorScheme} />
    </View>

  );
}
