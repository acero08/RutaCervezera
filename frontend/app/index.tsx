import { Text, View, Image, TouchableOpacity, StatusBar } from "react-native"
import { LinearGradient } from "expo-linear-gradient"

export default function Index() {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#1E1E1E" />
      <LinearGradient colors={["#1E1E1E", "#2A2A2A"]} className="flex-1 justify-center items-center">
        {/* Logo and Title Section */}
        <View className="items-center mb-8">
          <Text className="text-3xl text-white font-bold mb-2">RUTA CERVECERA</Text>
          <View className="h-1 w-24 bg-[#FF6600] rounded-full" />
        </View>

        {/* Image Container with Border and Shadow */}
        <View className="border-2 border-[#FF6600] rounded-2xl p-2 mb-6 shadow-lg">
          <Image
            source={require("../assets/images/perrito.png")}
            style={{
              width: 280,
              height: 340,
              borderRadius: 12,
            }}
          />
        </View>

        {/* Subtitle with Background */}
        <View className="bg-[#2A2A2A] px-6 py-3 rounded-xl mb-8 border-l-4 border-[#FF6600]">
          <Text className="text-white mb-1 text-center font-bold text-xl">
            Para los cachanillas amantes de la cerveza
          </Text>
        </View>

        {/* Main Button with Gradient */}
        <TouchableOpacity className="mb-8 rounded-full overflow-hidden" activeOpacity={0.9}>
          <LinearGradient
            colors={["#FF6600", "#FF8C00"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="py-3 px-12"
          >
            <Text className="text-white font-bold text-xl">TRAIGO SED</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Auth Links with Improved Styling */}
        <View className="flex-row justify-between w-full px-10 mb-6">
          <View className="border-b-2 border-[#FF6600] pb-1">
            <Text className="text-white font-bold text-lg">
              <a href="userauth/Login" className="text-white">
                {" "}
                Iniciar Sesión{" "}
              </a>
            </Text>
          </View>

          <View className="border-b-2 border-[#FF6600] pb-1">
            <Text className="text-white font-bold text-lg">
              <a href="userauth/Register" className="text-white">
                {" "}
                Crear Cuenta{" "}
              </a>
            </Text>
          </View>
        </View>

        {/* Footer Decoration */}
        <View className="absolute bottom-6 w-full">
          <View className="flex-row justify-center">
            <View className="h-1 w-16 bg-[#FF6600] rounded-full mx-1 opacity-30" />
            <View className="h-1 w-16 bg-[#FF6600] rounded-full mx-1 opacity-60" />
            <View className="h-1 w-16 bg-[#FF6600] rounded-full mx-1 opacity-90" />
          </View>
        </View>
      </LinearGradient>
    </>
  )
}
