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

type AuthContextType = {
  user: any | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
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
  const [user, setUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const api = ApiService.getInstance();

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("token");
        if (storedToken) {
          const userData = await api.getUserData(storedToken);
          setUser(userData);
          setToken(storedToken);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    checkLogin();
  }, []);

  const fetchUser = async () => {
    const storedToken = await AsyncStorage.getItem("token");
    if (storedToken) {
      const userData = await api.getUserData(storedToken);
      setUser(userData);
    }
  };

  const handleAuth = async (auth: any) => {
    await AsyncStorage.setItem("token", auth.token);
    await AsyncStorage.setItem("user", JSON.stringify(auth.user));
    setToken(auth.token);
    setUser(auth.user);
    router.replace("/(tabs)/profile");
  };

  const login = async (email: string, password: string) => {
    try {
      const auth = await api.login(email, password);
      await handleAuth(auth);
    } catch (error) {
      console.error(error);
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
      console.error(error);
      throw error;
    }
  };

  const logout = async () => {
    await AsyncStorage.clear();
    setUser(null);
    setToken(null);
    router.replace("/userauth/Login");
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
