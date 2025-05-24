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
  refreshUser: () => Promise<void>; // New method for force refresh
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
        const storedToken = await AsyncStorage.getItem("token");
        const storedUser = await AsyncStorage.getItem("user");

        if (storedToken) {
          setToken(storedToken);

          if (storedUser) {
            // Use stored user data first for faster loading
            setUser(JSON.parse(storedUser));
          }

          // Then fetch fresh data from server
          try {
            const userData = await api.getUserData(storedToken);
            setUser(userData);
            // Update stored user data
            await AsyncStorage.setItem("user", JSON.stringify(userData));
          } catch (error) {
            console.error("Error fetching fresh user data:", error);
            // If server fetch fails, keep using stored data
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

  const fetchUser = async () => {
    try {
      const storedToken = await AsyncStorage.getItem("token");
      if (storedToken) {
        const userData = await api.getUserData(storedToken);
        setUser(userData);
        await AsyncStorage.setItem("user", JSON.stringify(userData));
      }
    } catch (error) {
      console.error("Error in fetchUser:", error);
    }
  };

  const refreshUser = async () => {
    // Force refresh user data from server
    await fetchUser();
  };

  const handleAuth = async (auth: any) => {
    try {
      await AsyncStorage.setItem("token", auth.token);
      await AsyncStorage.setItem("user", JSON.stringify(auth.user));
      setToken(auth.token);
      setUser(auth.user);
      router.replace("/(tabs)/profile");
    } catch (error) {
      console.error("Error in handleAuth:", error);
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
        userData.password
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
      router.replace("/userauth/Login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const updateUserContext = async (userData: User) => {
    try {
      setUser(userData);
      await AsyncStorage.setItem("user", JSON.stringify(userData));
      console.log("User context updated with new data");
    } catch (error) {
      console.error("Error updating user context:", error);
    }
  };

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
