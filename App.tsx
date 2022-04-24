import React from 'react';
import AppLoading from 'expo-app-loading';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from 'styled-components';

import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';

import theme from './src/global/styles/theme';

import { AuthProvider, useAuth } from './src/hooks/auth';
import { Routes } from './src/routes';

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_700Bold,
  });
  const { isLoadingUser } = useAuth();

  if (!fontsLoaded || isLoadingUser) {
    return <AppLoading />;
  }

  return (
    <ThemeProvider theme={theme}>
      {/* <AppRoutes /> */}
      <AuthProvider>
        <Routes />
      </AuthProvider>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}
