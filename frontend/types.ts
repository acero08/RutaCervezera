
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Register: undefined;
  Profile: undefined;
  Collection: undefined;
  BarDetail: { id: string };
  User: undefined;
};

export type RegisterData = {
  name: string;
  email: string;
  mobile: string;
  password: string;
};

export type AuthContextType = {
  user: any | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
};