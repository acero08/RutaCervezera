import { Text, View, Image, TouchableOpacity, StatusBar, Dimensions } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { BlurView } from "expo-blur"

const { width } = Dimensions.get("window")
const imageSize = width * 0.8

export default function Index() {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      <LinearGradient colors={["#121212", "#1E1E1E"]} className="flex-1 justify-between">
        {/* Top Section */}
        <View className="items-center pt-16 px-6">
          <Text className="text-3xl text-white font-bold mb-2">RUTA CERVECERA</Text>
          <View className="h-1 w-24 bg-[#FF6600] rounded-full mb-4" />

          <Text className="text-white text-xl text-center mb-6">Hola borrachín, ¿Qué plan hoy?</Text>
        </View>

        {/* Center Image Section */}
        <View className="items-center justify-center">
          <View className="shadow-2xl">
            <Image
              source={require("../assets/images/perrito.png")}
              style={{
                width: imageSize,
                height: imageSize,
                borderRadius: 24,
              }}
              resizeMode="cover"
            />

            {/* Overlay Text */}
            <View className="absolute bottom-6 left-0 right-0 items-center">
              <BlurView intensity={80} tint="dark" className="rounded-xl overflow-hidden">
                <View className="px-6 py-3">
                  <Text className="text-white text-center font-bold text-lg">
                    Para los cachanillas amantes de la cerveza
                  </Text>
                </View>
              </BlurView>
            </View>
          </View>
        </View>

        {/* Bottom Section */}
        <View className="items-center mb-12">
          {/* Main Button with Gradient */}
          <TouchableOpacity className="mb-10 rounded-full overflow-hidden shadow-lg" activeOpacity={0.8}>
            <LinearGradient
              colors={["#FF6600", "#FF8C00"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="py-4 px-16"
            >
              <Text className="text-white font-bold text-xl tracking-wide"><a href = 'userauth/Login'> TRAIGO SED </a></Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Auth Links with Improved Styling */}
          <View className="flex-row justify-between w-full px-10">
            <TouchableOpacity className="px-4 py-2">
              <Text className="text-white font-bold text-lg">
                <a href="userauth/Login" className="text-white">
                  Iniciar Sesión
                </a>
              </Text>
              <View className="h-0.5 w-full bg-[#FF6600] mt-1" />
            </TouchableOpacity>

            <TouchableOpacity className="px-4 py-2">
              <Text className="text-white font-bold text-lg">
                <a href="userauth/Register" className="text-white">
                  Crear Cuenta
                </a>
              </Text>
              <View className="h-0.5 w-full bg-[#FF6600] mt-1" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer Decoration */}
        <View className="pb-8 w-full">
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
