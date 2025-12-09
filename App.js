import { useMemo, useState } from 'react';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import HomeScreen from './screens/HomeScreen';
import BooksScreen from './screens/BooksScreen';
import BookDetailScreen from './screens/BookDetailScreen';
import { themes, i18n } from './utils/theme';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('login'); // 'login', 'register', 'forgotPassword', 'home', 'books', 'bookDetail'
  const [theme, setTheme] = useState('light'); // 'light' | 'dark'
  const [lang, setLang] = useState('vi'); // 'vi' | 'en'

  const strings = i18n[lang];
  const colors = useMemo(() => themes[theme], [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  const selectLanguage = (targetLang) => setLang(targetLang);

  if (currentScreen === 'bookDetail') {
    return (
      <BookDetailScreen
        theme={theme}
        lang={lang}
        strings={strings}
        colors={colors}
        onNavigate={(key) => setCurrentScreen(key === 'library' ? 'books' : key)}
      />
    );
  }

  if (currentScreen === 'books') {
    return (
      <BooksScreen
        theme={theme}
        lang={lang}
        strings={strings}
        colors={colors}
        onNavigate={(key) => {
          if (key === 'home') setCurrentScreen('home');
          if (key === 'settings') setCurrentScreen('login');
          if (key === 'bookDetail') setCurrentScreen('bookDetail');
        }}
      />
    );
  }

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
          if (key === 'settings') setCurrentScreen('login');
          if (key === 'books') setCurrentScreen('books');
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
