import { Stack } from "expo-router";
import { AuthProvider } from "@/context/AuthContext";
import "./global.css";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="bars/[id]" options={{ headerShown: false }} />
      </Stack>
    </AuthProvider>
  );
}
