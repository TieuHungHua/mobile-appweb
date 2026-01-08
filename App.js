import { useMemo, useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BookCategoryModal from "./components/BookCategoryModal/BookCategoryModal";
import {
  shouldShowBookCategoryModal,
  markModalAsShown,
  markModalAsCompleted,
  saveBookCategoryPreferences,
} from "./utils/bookCategoryPreferences";
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
import FAQScreen from "./screens/FAQ/FAQScreen";
import { themes, i18n } from "./utils/theme";
import { storeToken, storeRefreshToken, storeUserInfo, getStoredUserInfo } from "./utils/api";

// FCM service đã được bỏ - chỉ dùng NotificationLog API


const MOCK_MODE = false; // chế độ mô phỏng: true = bỏ qua đăng nhập, false = dùng authentication
const MOCK_START_SCREEN = "settings"; // màn hình bắt đầu: 'home', 'books', 'settings', 'chats', 'myBookshelf', 'bookDetail', etc.

export default function App() {
  const [currentScreen, setCurrentScreen] = useState(
    MOCK_MODE ? MOCK_START_SCREEN : "start"
  );
  const [previousScreen, setPreviousScreen] = useState(null);
  const [myBookshelfActiveTab, setMyBookshelfActiveTab] = useState("borrowed");
  const [theme, setTheme] = useState("light");
  const [lang, setLang] = useState("vi");
  const [booksSearch, setBooksSearch] = useState("");
  const [selectedBook, setSelectedBook] = useState(null); // Store selected book data for BookDetailScreen
  const [navigationStack, setNavigationStack] = useState([]); // Stack for navigation history
  const [showBookCategoryModal, setShowBookCategoryModal] = useState(false);

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

  /**
   * Check and show book category modal when user logs in or navigates to home
   */
  useEffect(() => {
    const checkAndShowModal = async () => {
      // Only show on home screen or after login
      if (currentScreen === "home" || currentScreen === MOCK_START_SCREEN) {
        const shouldShow = await shouldShowBookCategoryModal();
        if (shouldShow) {
          setShowBookCategoryModal(true);
          await markModalAsShown();
        }
      }
    };

    checkAndShowModal();
  }, [currentScreen]);

  // FCM push notifications đã được bỏ
  // Chỉ dùng NotificationLog API để lấy danh sách thông báo

  /**
   * Handle book category modal continue
   */
  const handleBookCategoryContinue = async (preferences) => {
    try {
      await saveBookCategoryPreferences(preferences);
      await markModalAsCompleted();
      setShowBookCategoryModal(false);
      console.log("[BookCategoryModal] Preferences saved:", preferences);
    } catch (error) {
      console.error("[BookCategoryModal] Error saving preferences:", error);
      setShowBookCategoryModal(false);
    }
  };

  /**
   * Handle book category modal skip
   */
  const handleBookCategorySkip = async () => {
    try {
      await markModalAsCompleted();
      setShowBookCategoryModal(false);
    } catch (error) {
      console.error("[BookCategoryModal] Error skipping:", error);
      setShowBookCategoryModal(false);
    }
  };

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
    // Render both BooksScreen (background) and BookDetailScreen (foreground) to maintain state
    screen = (
      <View style={{ flex: 1 }}>
        {/* Keep BooksScreen mounted in background to preserve state */}
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
          <BooksScreen
            theme={theme}
            lang={lang}
            strings={strings}
            colors={colors}
            searchValue={booksSearch}
            onChangeSearch={setBooksSearch}
            onNavigate={() => { }} // Prevent navigation when in background
          />
        </View>
        {/* BookDetailScreen on top */}
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }}>
          <BookDetailScreen
            theme={theme}
            lang={lang}
            strings={strings}
            colors={colors}
            hideBottomNav={previousScreen === "myBookshelf"}
            book={selectedBook}
            onNavigate={(key) => {
              if (key === "back" || key === "library") {
                // Navigate back to previous screen without reloading
                setCurrentScreen(previousScreen || "books");
                setPreviousScreen(null);
                setSelectedBook(null);
                // Don't clear stack, keep books mounted
              } else if (key === "home") {
                setCurrentScreen("home");
                setPreviousScreen(null);
                setNavigationStack([]);
              } else if (key === "settings") {
                setCurrentScreen("settings");
                setPreviousScreen(null);
                setNavigationStack([]);
              } else if (key === "chats") {
                setCurrentScreen("chats");
                setPreviousScreen(null);
                setNavigationStack([]);
              } else if (key === "myBookshelf") {
                setCurrentScreen("myBookshelf");
                setPreviousScreen(null);
                setNavigationStack([]);
              } else {
                setCurrentScreen(key);
                setPreviousScreen(null);
                setNavigationStack([]);
              }
            }}
          />
        </View>
      </View>
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
          if (key === "faq") setCurrentScreen("faq");
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
        onNavigate={(key, params) => {
          if (key === "settings") {
            setCurrentScreen("settings");
            setPreviousScreen(null);
          }
          if (key === "bookDetail") {
            setSelectedBook(params?.book || null);
            setPreviousScreen("myBookshelf");
            setCurrentScreen("bookDetail");
            // Add myBookshelf to navigation stack to keep it mounted
            setNavigationStack(["myBookshelf"]);
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
  } else if (currentScreen === "faq") {
    screen = (
      <FAQScreen
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
        onNavigate={(key, params) => {
          if (key === "home") {
            setCurrentScreen("home");
            setPreviousScreen(null);
          }
          if (key === "settings") {
            setCurrentScreen("settings");
            setPreviousScreen(null);
          }
          if (key === "bookDetail") {
            setSelectedBook(params?.book || null);
            setPreviousScreen("books");
            setCurrentScreen("bookDetail");
            // Add books to navigation stack to keep it mounted
            setNavigationStack(["books"]);
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
        onNavigate={(key, params) => {
          if (key === "home") {
            setCurrentScreen("home");
          } else if (key === "myBookshelf") {
            if (params?.activeTab) {
              setMyBookshelfActiveTab(params.activeTab);
            }
            setCurrentScreen("myBookshelf");
          } else if (key === "bookDetail") {
            if (params?.book) {
              setSelectedBook(params.book);
            } else if (params?.bookId) {
              // Nếu chỉ có bookId, cần fetch book data
              // Tạm thời set selectedBook với bookId để BookDetailScreen có thể fetch
              setSelectedBook({ id: params.bookId });
            }
            setPreviousScreen("notifications");
            setCurrentScreen("bookDetail");
          }
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
      {/* Book Category Modal */}
      <BookCategoryModal
        visible={showBookCategoryModal}
        onClose={() => setShowBookCategoryModal(false)}
        onContinue={handleBookCategoryContinue}
        onSkip={handleBookCategorySkip}
        theme={theme}
        colors={colors}
        strings={strings}
      />
    </GestureHandlerRootView>
  );
}
