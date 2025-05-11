import { Stack } from "expo-router";
import { AuthProvider } from "@/context/AuthContext";
import "./global.css";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} /> {/* Separé el index de los tabs y le quite el header */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} /> {/* Separé los tabs y le quite el header */}
        <Stack.Screen name="bars/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="userauth/Login" options={{ headerShown: false }} /> {/* Le quite el header */}
        <Stack.Screen name="userauth/Register" options={{ headerShown: false }} /> {/* Le quite el header */}
      </Stack>
    </AuthProvider>
  );
}
