import { useMemo, useState } from 'react';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import HomeScreen from './screens/HomeScreen';
import { themes, i18n } from './utils/theme';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('login'); // 'login', 'register', 'forgotPassword', 'home'
  const [theme, setTheme] = useState('light'); // 'light' | 'dark'
  const [lang, setLang] = useState('vi'); // 'vi' | 'en'

  const strings = i18n[lang];
  const colors = useMemo(() => themes[theme], [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  const selectLanguage = (targetLang) => setLang(targetLang);

  if (currentScreen === 'home') {
    return (
      <HomeScreen
        theme={theme}
        lang={lang}
        strings={strings}
        colors={colors}
        onToggleTheme={toggleTheme}
        onSelectLanguage={selectLanguage}
        onNavigate={(key) => {
          if (key === 'settings') {
            setCurrentScreen('login');
          }
        }}
      />
    );
  }

  if (currentScreen === 'register') {
    return (
      <RegisterScreen
        onNavigateToLogin={() => setCurrentScreen('login')}
        theme={theme}
        lang={lang}
        strings={strings}
        colors={colors}
        onToggleTheme={toggleTheme}
        onSelectLanguage={selectLanguage}
      />
    );
  }

  if (currentScreen === 'forgotPassword') {
    return (
      <ForgotPasswordScreen
        onNavigateToLogin={() => setCurrentScreen('login')}
        theme={theme}
        lang={lang}
        strings={strings}
        colors={colors}
        onToggleTheme={toggleTheme}
        onSelectLanguage={selectLanguage}
      />
    );
  }

  return (
    <LoginScreen
      onNavigateToRegister={() => setCurrentScreen('register')}
      onNavigateToForgotPassword={() => setCurrentScreen('forgotPassword')}
      onNavigateHome={() => setCurrentScreen('home')}
      theme={theme}
      lang={lang}
      strings={strings}
      colors={colors}
      onToggleTheme={toggleTheme}
      onSelectLanguage={selectLanguage}
    />
  );
}
