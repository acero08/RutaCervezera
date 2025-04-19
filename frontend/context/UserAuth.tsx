import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { User } from "../models/User";
import { AuthResponse } from "../models/AuthResponse";
import { loginAPI, registerAPI } from "../components/LoginService";

type Context = {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (
    email: string,
    username: string,
    password: string
  ) => Promise<void>;
  logout: () => void;
};

type UserProviderProps = {
  children: ReactNode;
};

const UserContext = createContext<Context | undefined>(undefined);

export const UserProvider = ({ children }: UserProviderProps) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
  }, []);

  const handleAuth = ({ token, user }: AuthResponse) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setToken(token);
    setUser(user);
    navigate("/search");
  };

  const login = async (username: string, password: string) => {
    try {
      const auth = await loginAPI(username, password);
      handleAuth(auth);
      toast.success("Login successful!");
    } catch {
      //Lo hace el handleloginerror
    }
  };

  const register = async (
    email: string,
    username: string,
    password: string
  ) => {
    try {
      const auth = await registerAPI(email, username, password);
      handleAuth(auth);
      toast.success("Registro exitoso!");
    } catch {
      //Lo hace el handleloginerror
    }
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    setToken(null);
    navigate("/");
  };

  return (
    <UserContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useAuth = (): Context => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useAuth must be used within a UserProvider");
  }
  return context;
};
