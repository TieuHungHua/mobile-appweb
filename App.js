import { useMemo, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import HomeScreen from './screens/HomeScreen';
import BooksScreen from './screens/BooksScreen';
import BookDetailScreen from './screens/BookDetailScreen';
import ChatScreen from './screens/ChatScreen';
import SettingsScreen from './screens/SettingsScreen';
import EditInformationScreen from './screens/EditInformationScreen';
import { themes, i18n } from './utils/theme';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('login'); // 'login', 'register', 'forgotPassword', 'home', 'books', 'bookDetail', 'chats', 'settings', 'editInformation'
  const [theme, setTheme] = useState('light'); // 'light' | 'dark'
  const [lang, setLang] = useState('vi'); // 'vi' | 'en'
  const [booksSearch, setBooksSearch] = useState('');

  const strings = i18n[lang];
  const colors = useMemo(() => themes[theme], [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  const selectLanguage = (targetLang) => setLang(targetLang);

  let screen = null;

  if (currentScreen === 'bookDetail') {
    screen = (
      <BookDetailScreen
        theme={theme}
        lang={lang}
        strings={strings}
        colors={colors}
        onNavigate={(key) => {
          if (key === 'library') setCurrentScreen('books');
          else if (key === 'home') setCurrentScreen('home');
          else if (key === 'settings') setCurrentScreen('settings');
          else if (key === 'chats') setCurrentScreen('chats');
          else setCurrentScreen(key);
        }}
      />
    );
  } else if (currentScreen === 'chats') {
    screen = (
      <ChatScreen
        theme={theme}
        lang={lang}
        strings={strings}
        colors={colors}
        onNavigate={(key) => {
          if (key === 'home') setCurrentScreen('home');
          if (key === 'library') setCurrentScreen('books');
          if (key === 'settings') setCurrentScreen('settings');
        }}
      />
    );
  } else if (currentScreen === 'settings') {
    screen = (
      <SettingsScreen
        theme={theme}
        lang={lang}
        strings={strings}
        colors={colors}
        onNavigate={(key) => {
          if (key === 'home') setCurrentScreen('home');
          if (key === 'library') setCurrentScreen('books');
          if (key === 'chats') setCurrentScreen('chats');
          if (key === 'login') setCurrentScreen('login');
          if (key === 'editInformation') setCurrentScreen('editInformation');
        }}
      />
    );
  } else if (currentScreen === 'editInformation') {
    screen = (
      <EditInformationScreen
        theme={theme}
        lang={lang}
        strings={strings}
        colors={colors}
        onNavigate={(key) => {
          if (key === 'settings') setCurrentScreen('settings');
        }}
      />
    );
  } else if (currentScreen === 'books') {
    screen = (
      <BooksScreen
        theme={theme}
        lang={lang}
        strings={strings}
        colors={colors}
        searchValue={booksSearch}
        onChangeSearch={setBooksSearch}
        onNavigate={(key) => {
          if (key === 'home') setCurrentScreen('home');
          if (key === 'settings') setCurrentScreen('settings');
          if (key === 'bookDetail') setCurrentScreen('bookDetail');
          if (key === 'chats') setCurrentScreen('chats');
        }}
      />
    );
  } else if (currentScreen === 'home') {
    screen = (
      <HomeScreen
        theme={theme}
        lang={lang}
        strings={strings}
        colors={colors}
        onToggleTheme={toggleTheme}
        onSelectLanguage={selectLanguage}
        onNavigate={(key) => {
          if (key === 'settings') setCurrentScreen('settings');
          if (key === 'books') setCurrentScreen('books');
          if (key === 'chats') setCurrentScreen('chats');
        }}
      />
    );
  } else if (currentScreen === 'register') {
    screen = (
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
  } else if (currentScreen === 'forgotPassword') {
    screen = (
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
  } else {
    screen = (
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

  return <GestureHandlerRootView style={{ flex: 1 }}>{screen}</GestureHandlerRootView>;
}
