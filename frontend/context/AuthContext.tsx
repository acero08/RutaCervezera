import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import ApiService from "../services/ApiService";
import { RegisterData } from "@/types";

interface User {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  mobile?: string;
  gender?: string;
  image?: string;
  accountType?: string;
  managedBars?: string[];
  [key: string]: any;
}

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
  updateUserContext: (userData: User) => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const api = ApiService.getInstance();

  useEffect(() => {
    const checkLogin = async () => {
      try {
        console.log('CheckLogin - Starting...');
        const storedToken = await AsyncStorage.getItem("token");
        const storedUser = await AsyncStorage.getItem("user");

        if (storedToken && storedUser) {
          console.log('CheckLogin - Found stored data');
          setToken(storedToken);
          const parsedUser = JSON.parse(storedUser);
          console.log('CheckLogin - Parsed user:', parsedUser);
          setUser(parsedUser);
          
          // Fetch fresh data from server
          try {
            const userData = await api.getUserData(storedToken);
            console.log('CheckLogin - Fresh user data:', userData);
            setUser(userData);
            await AsyncStorage.setItem("user", JSON.stringify(userData));
          } catch (error) {
            console.error("Error fetching fresh user data:", error);
          }
        }
      } catch (error) {
        console.error("Error in checkLogin:", error);
      } finally {
        setLoading(false);
      }
    };
    checkLogin();
  }, []);

  // Función para redirigir según el tipo de cuenta
  const redirectToAppropriateTab = (accountType: string) => {
    console.log('Redirecting user with account type:', accountType);
    try {
      if (accountType === 'business') {
        console.log('Redirecting to business tabs');
        router.replace('/(business-tabs)/hosting');
      } else {
        console.log('Redirecting to user tabs');
        router.replace('/(tabs)/collection');
      }
    } catch (error) {
      console.error('Error in redirectToAppropriateTab:', error);
      // Fallback navigation
      if (accountType === 'business') {
        router.push('/(business-tabs)/hosting');
      } else {
        router.push('/(tabs)/collection');
      }
    }
  };

  const fetchUser = async () => {
    try {
      const storedToken = await AsyncStorage.getItem("token");
      if (storedToken) {
        const userData = await api.getUserData(storedToken);
        if (userData.image) {
          userData.image = `${userData.image}?v=${Date.now()}`;
        }
        setUser(userData);
        await AsyncStorage.setItem("user", JSON.stringify(userData));
      }
    } catch (error) {
      console.error("Error in fetchUser:", error);
    }
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  const handleAuth = async (auth: any) => {
    try {
      console.log('HandleAuth - Received user type:', auth.user.accountType);
      await AsyncStorage.setItem("token", auth.token);
      await AsyncStorage.setItem("user", JSON.stringify(auth.user));
      setToken(auth.token);
      setUser(auth.user);

      // Forzar fetch para asegurar datos frescos
      const freshUserData = await api.getUserData(auth.token);
      console.log('Fresh user data from API:', freshUserData);
      setUser(freshUserData);
      await AsyncStorage.setItem("user", JSON.stringify(freshUserData));

      // Redirigir según el tipo de cuenta
      if (freshUserData.accountType === 'business') {
        console.log('Redirecting to business hosting');
        router.replace('/(business-tabs)/hosting');
      } else {
        console.log('Redirecting to user collection');
        router.replace('/(tabs)/collection');
      }
    } catch (error) {
      console.error("Error in handleAuth:", error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const auth = await api.login(email, password);
      await handleAuth(auth);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      const auth = await api.register(
        userData.name,
        userData.email,
        userData.mobile,
        userData.password,
        userData.accountType || 'user'
      );
      await handleAuth(auth);
    } catch (error) {
      console.error("Register error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.clear();
      setUser(null);
      setToken(null);
      router.replace("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const updateUserContext = async (userData: User) => {
    try {
      setUser(userData);
      await AsyncStorage.setItem("user", JSON.stringify(userData));
    } catch (error) {
      console.error("Error updating user context:", error);
    }
  };

  console.log('BusinessLayout - user:', user, 'loading:', loading);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        fetchUser,
        updateUserContext,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};