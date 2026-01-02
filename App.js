import { useMemo, useState, useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import StartScreen from "./screens/Start/StartScreen";
import LoginScreen from "./screens/Login/LoginScreen";
import RegisterScreen from "./screens/Register/RegisterScreen";
import ForgotPasswordScreen from "./screens/ForgotPassword/ForgotPasswordScreen";
import HomeScreen from "./screens/Home/HomeScreen";
import BooksScreen from "./screens/BooksScreen/BooksScreen";
import BookDetailScreen from "./screens/BookDetail/BookDetailScreen";
import ChatScreen from "./screens/Chat/ChatScreen";
import SettingsScreen from "./screens/Settings/SettingsScreen";
import EditInformationScreen from "./screens/EditInformation/EditInformationScreen";
import ChangePasswordScreen from "./screens/ChangePassword/ChangePasswordScreen";
import MyBookshelfScreen from "./screens/MyBookshelf/MyBookshelfScreen";
import PrivacyPolicyScreen from "./screens/PrivacyPolicy/PrivacyPolicyScreen";
import AboutUsScreen from "./screens/AboutUs/AboutUsScreen";
import LibraryCardScreen from "./screens/LibraryCard/LibraryCardScreen";
import RoomBookingScreen from "./screens/RoomBooking/RoomBookingScreen";
import BookedRoomsScreen from "./screens/BookedRooms/BookedRoomsScreen";
import NotificationsScreen from "./screens/Notifications/NotificationsScreen";
import { themes, i18n } from "./utils/theme";
import { storeToken, storeRefreshToken, storeUserInfo } from "./utils/api";

const MOCK_MODE = false; // true = bỏ qua đăng nhập, false = dùng authentication
const MOCK_START_SCREEN = "home"; // Màn hình bắt đầu: 'home', 'books', 'settings', 'chats', 'myBookshelf', 'bookDetail', etc.

export default function App() {
  const [currentScreen, setCurrentScreen] = useState(
    MOCK_MODE ? MOCK_START_SCREEN : "start"
  ); // 'start', 'login', 'register', 'forgotPassword', 'home', 'books', 'bookDetail', 'chats', 'settings', 'editInformation', 'changePassword', 'myBookshelf', 'privacyPolicy', 'aboutUs'
  const [previousScreen, setPreviousScreen] = useState(null); // Track previous screen for navigation back
  const [myBookshelfActiveTab, setMyBookshelfActiveTab] = useState("borrowed"); // Track active tab in MyBookshelfScreen
  const [theme, setTheme] = useState("light"); // 'light' | 'dark'
  const [lang, setLang] = useState("vi"); // 'vi' | 'en'
  const [booksSearch, setBooksSearch] = useState("");

  const strings = i18n[lang];
  const colors = useMemo(() => themes[theme], [theme]);

  const toggleTheme = () =>
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  const selectLanguage = (targetLang) => setLang(targetLang);

  useEffect(() => {
    if (MOCK_MODE) {
      const setupMockAuth = async () => {
        try {
          await storeToken("mock_access_token_for_testing");
          await storeRefreshToken("mock_refresh_token_for_testing");

          const mockUser = {
            id: 1,
            username: "test_user",
            email: "test@example.com",
            phone: "0123456789",
            role: "student", // 'student' hoặc 'lecturer'
            studentId: "SV001",
            name: "Người dùng Test",
          };
          await storeUserInfo(mockUser);
          console.log("[MOCK MODE] Mock authentication data đã được set");
        } catch (error) {
          console.error("[MOCK MODE] Lỗi khi set mock data:", error);
        }
      };
      setupMockAuth();
    }
  }, []);

  let screen = null;

  if (currentScreen === "start") {
    screen = (
      <StartScreen
        theme={theme}
        lang={lang}
        strings={strings}
        colors={colors}
        onNavigate={(key) => {
          if (key === "login") setCurrentScreen("login");
          if (key === "register") setCurrentScreen("register");
        }}
        onToggleTheme={toggleTheme}
        onSelectLanguage={selectLanguage}
      />
    );
  } else if (currentScreen === "bookDetail") {
    screen = (
      <BookDetailScreen
        theme={theme}
        lang={lang}
        strings={strings}
        colors={colors}
        hideBottomNav={previousScreen === "myBookshelf"}
        onNavigate={(key) => {
          if (key === "back" || key === "library") {
            // Navigate back to previous screen
            setCurrentScreen(previousScreen || "books");
            setPreviousScreen(null);
          } else if (key === "home") {
            setCurrentScreen("home");
            setPreviousScreen(null);
          } else if (key === "settings") {
            setCurrentScreen("settings");
            setPreviousScreen(null);
          } else if (key === "chats") {
            setCurrentScreen("chats");
            setPreviousScreen(null);
          } else if (key === "myBookshelf") {
            setCurrentScreen("myBookshelf");
            setPreviousScreen(null);
          } else {
            setCurrentScreen(key);
            setPreviousScreen(null);
          }
        }}
      />
    );
  } else if (currentScreen === "chats") {
    screen = (
      <ChatScreen
        theme={theme}
        lang={lang}
        strings={strings}
        colors={colors}
        onNavigate={(key) => {
          if (key === "home") setCurrentScreen("home");
          if (key === "library") setCurrentScreen("books");
          if (key === "settings") setCurrentScreen("settings");
        }}
      />
    );
  } else if (currentScreen === "settings") {
    screen = (
      <SettingsScreen
        theme={theme}
        lang={lang}
        strings={strings}
        colors={colors}
        onNavigate={(key) => {
          if (key === "home") setCurrentScreen("home");
          if (key === "library") setCurrentScreen("books");
          if (key === "books") setCurrentScreen("books");
          if (key === "chats") setCurrentScreen("chats");
          if (key === "login") setCurrentScreen("login");
          if (key === "editInformation") setCurrentScreen("editInformation");
          if (key === "changePassword") setCurrentScreen("changePassword");
          if (key === "myBookshelf") setCurrentScreen("myBookshelf");
          if (key === "privacyPolicy") setCurrentScreen("privacyPolicy");
          if (key === "aboutUs") setCurrentScreen("aboutUs");
          if (key === "bookedRooms") setCurrentScreen("bookedRooms");
        }}
      />
    );
  } else if (currentScreen === "editInformation") {
    screen = (
      <EditInformationScreen
        theme={theme}
        lang={lang}
        strings={strings}
        colors={colors}
        onNavigate={(key) => {
          if (key === "settings") setCurrentScreen("settings");
        }}
      />
    );
  } else if (currentScreen === "changePassword") {
    screen = (
      <ChangePasswordScreen
        theme={theme}
        lang={lang}
        strings={strings}
        colors={colors}
        onNavigate={(key) => {
          if (key === "settings") setCurrentScreen("settings");
        }}
      />
    );
  } else if (currentScreen === "myBookshelf") {
    screen = (
      <MyBookshelfScreen
        theme={theme}
        lang={lang}
        strings={strings}
        colors={colors}
        activeTab={myBookshelfActiveTab}
        onTabChange={setMyBookshelfActiveTab}
        onNavigate={(key) => {
          if (key === "settings") {
            setCurrentScreen("settings");
            setPreviousScreen(null);
          }
          if (key === "bookDetail") {
            setPreviousScreen("myBookshelf");
            setCurrentScreen("bookDetail");
          }
        }}
      />
    );
  } else if (currentScreen === "privacyPolicy") {
    screen = (
      <PrivacyPolicyScreen
        theme={theme}
        lang={lang}
        strings={strings}
        colors={colors}
        onNavigate={(key) => {
          if (key === "settings") setCurrentScreen("settings");
        }}
      />
    );
  } else if (currentScreen === "aboutUs") {
    screen = (
      <AboutUsScreen
        theme={theme}
        lang={lang}
        strings={strings}
        colors={colors}
        onNavigate={(key) => {
          if (key === "settings") setCurrentScreen("settings");
        }}
      />
    );
  } else if (currentScreen === "books") {
    screen = (
      <BooksScreen
        theme={theme}
        lang={lang}
        strings={strings}
        colors={colors}
        searchValue={booksSearch}
        onChangeSearch={setBooksSearch}
        onNavigate={(key) => {
          if (key === "home") {
            setCurrentScreen("home");
            setPreviousScreen(null);
          }
          if (key === "settings") {
            setCurrentScreen("settings");
            setPreviousScreen(null);
          }
          if (key === "bookDetail") {
            setPreviousScreen("books");
            setCurrentScreen("bookDetail");
          }
          if (key === "chats") {
            setCurrentScreen("chats");
            setPreviousScreen(null);
          }
        }}
      />
    );
  } else if (currentScreen === "home") {
    screen = (
      <HomeScreen
        theme={theme}
        lang={lang}
        strings={strings}
        colors={colors}
        onToggleTheme={toggleTheme}
        onSelectLanguage={selectLanguage}
        onNavigate={(key) => {
          if (key === "settings") setCurrentScreen("settings");
          if (key === "books") setCurrentScreen("books");
          if (key === "chats") setCurrentScreen("chats");
          if (key === "libraryCard") setCurrentScreen("libraryCard");
          if (key === "roomBooking") setCurrentScreen("roomBooking");
          if (key === "notifications") setCurrentScreen("notifications");
        }}
      />
    );
  } else if (currentScreen === "notifications") {
    screen = (
      <NotificationsScreen
        theme={theme}
        lang={lang}
        strings={strings}
        colors={colors}
        onNavigate={(key) => {
          if (key === "home") setCurrentScreen("home");
        }}
      />
    );
  } else if (currentScreen === "libraryCard") {
    screen = (
      <LibraryCardScreen
        theme={theme}
        lang={lang}
        strings={strings}
        colors={colors}
        onNavigate={(key) => {
          if (key === "home") setCurrentScreen("home");
        }}
      />
    );
  } else if (currentScreen === "roomBooking") {
    screen = (
      <RoomBookingScreen
        theme={theme}
        lang={lang}
        strings={strings}
        colors={colors}
        onNavigate={(key) => {
          if (key === "home") setCurrentScreen("home");
          if (key === "bookedRooms") setCurrentScreen("bookedRooms");
        }}
      />
    );
  } else if (currentScreen === "bookedRooms") {
    screen = (
      <BookedRoomsScreen
        theme={theme}
        lang={lang}
        strings={strings}
        colors={colors}
        onNavigate={(key) => {
          if (key === "settings") setCurrentScreen("settings");
        }}
      />
    );
  } else if (currentScreen === "register") {
    screen = (
      <RegisterScreen
        onNavigateToLogin={() => setCurrentScreen("login")}
        theme={theme}
        lang={lang}
        strings={strings}
        colors={colors}
        onToggleTheme={toggleTheme}
        onSelectLanguage={selectLanguage}
      />
    );
  } else if (currentScreen === "forgotPassword") {
    screen = (
      <ForgotPasswordScreen
        onNavigateToLogin={() => setCurrentScreen("login")}
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
        onNavigateToRegister={() => setCurrentScreen("register")}
        onNavigateToForgotPassword={() => setCurrentScreen("forgotPassword")}
        onNavigateHome={() => setCurrentScreen("home")}
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      {screen}
    </GestureHandlerRootView>
  );
}
