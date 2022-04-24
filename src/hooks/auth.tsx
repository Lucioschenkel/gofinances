import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

import * as AuthSession from 'expo-auth-session';
import * as AppleAuthentication from 'expo-apple-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

interface AuthProviderProps {
  children: ReactNode;
}

interface User {
  id: string;
  name: string;
  email: string;
  photo?: string;
}

interface AuthContextData {
  user: User;
  signInWithGoogle(): Promise<void>;
  signInWithApple(): Promise<void>;
  signOut(): Promise<void>;
  isLoadingUser: boolean;
}

interface AuthResponse {
  params: {
    access_token: string;
  };
  type: string;
}

const userStorageKey = '@gofinances:user';

function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User>({} as User);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  async function signInWithGoogle() {
    try {
      const RESPONSE_TYPE = 'token';
      const SCOPE = encodeURIComponent('profile email');

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`;

      const { params, type } = (await AuthSession.startAsync({
        authUrl,
      })) as AuthResponse;

      if (type === 'success') {
        const response = await fetch(
          `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${params.access_token}`
        );
        const userInfo = await response.json();
        setUser({
          email: userInfo.email,
          id: String(userInfo.id),
          name: userInfo.given_name,
          photo: userInfo.picture,
        });
        await AsyncStorage.setItem(userStorageKey, JSON.stringify(user));
      }
    } catch (error) {
      throw error;
    }
  }

  async function signInWithApple() {
    try {
      const credentials = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (credentials) {
        const name = credentials!.fullName!.givenName;
        const photo = `https://ui-avatars.com/api/?name=${
          credentials.fullName!.givenName
        }&length=1`;

        const loggedUser = {
          id: String(credentials!.user),
          email: credentials!.email,
          name,
          photo,
        } as User;
        setUser(loggedUser);
        await AsyncStorage.setItem(userStorageKey, JSON.stringify(loggedUser));
      }
    } catch (error) {
      throw error;
    }
  }

  async function signOut() {
    setUser({} as User);
    await AsyncStorage.removeItem(userStorageKey);
  }

  useEffect(() => {
    async function loadUserStorageData() {
      const storedUser = await AsyncStorage.getItem(userStorageKey);
      if (storedUser) {
        const loggedUser = JSON.parse(storedUser) as User;
        setUser(loggedUser);
      }

      setIsLoadingUser(false);
    }

    loadUserStorageData();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        signInWithGoogle,
        signInWithApple,
        user,
        signOut,
        isLoadingUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);

  return context;
}

export { AuthProvider, useAuth };
