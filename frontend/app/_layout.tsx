import { Stack } from "expo-router";
import { AuthProvider } from "@/context/AuthContext";
import "./global.css";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} /> {/* Separé el index de los tabs y le quite el header */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} /> {/* Separé los tabs y le quite el header */}
        <Stack.Screen name="(business-tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="bars/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="favorite/favorites" options={{ headerShown: false }} />
        <Stack.Screen name="bars/drink/[drinkId]" options={{ headerShown: false }} />
        <Stack.Screen name="userauth/Login" options={{ headerShown: false }} /> {/* Le quite el header */}
        <Stack.Screen name="userauth/Register" options={{ headerShown: false }} /> {/* Le quite el header */}
        <Stack.Screen name="userauth/AdminRegister" options={{ headerShown: false }} />
        <Stack.Screen name="userauth/EditProfile" options={{ headerShown: false }} />
        <Stack.Screen name="events/[eventId]" options={{ headerShown: false }} />
        <Stack.Screen name="(menu)/alcoholic-drinks" options={{ headerShown: false }} />
        <Stack.Screen name="(menu)/drinks" options={{ headerShown: false }} />
        <Stack.Screen name="(menu)/food" options={{ headerShown: false }} />
      </Stack>
    </AuthProvider>
  );
}
