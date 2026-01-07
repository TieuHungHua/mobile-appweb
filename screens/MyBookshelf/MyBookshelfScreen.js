import { StatusBar } from "expo-status-bar";
import { useMemo, useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Image,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { createStyles } from "./MyBookshelf.styles";
import {
  TABS,
  TAB_LABELS,
  STATUS_COLORS,
  STATUS_THRESHOLD,
  INITIAL_STATE,
} from "./MyBookshelf.mock";
import { PanResponder } from "react-native";
import { booksAPI, borrowsAPI } from "../../utils/api";

// Debug: Check if APIs are imported correctly
console.log("[MyBookshelf] booksAPI:", typeof booksAPI, booksAPI ? Object.keys(booksAPI) : "undefined");
console.log("[MyBookshelf] borrowsAPI:", typeof borrowsAPI, borrowsAPI ? Object.keys(borrowsAPI) : "undefined");

export default function MyBookshelfScreen({
  theme,
  lang,
  strings,
  colors,
  onNavigate,
  activeTab: propActiveTab,
  onTabChange,
}) {
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [activeTab, setActiveTab] = useState(
    propActiveTab || INITIAL_STATE.activeTab
  );
  const [searchQuery, setSearchQuery] = useState(INITIAL_STATE.searchQuery);
  const [showSearch, setShowSearch] = useState(INITIAL_STATE.showSearch);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [favoriteBooks, setFavoriteBooks] = useState([]);
  const [savedBooks, setSavedBooks] = useState([]);

  const currentTab = propActiveTab !== undefined ? propActiveTab : activeTab;

  const handleTabChange = (tab) => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setActiveTab(tab);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return (
          gestureState.dx > 12 &&
          Math.abs(gestureState.dy) < Math.abs(gestureState.dx) &&
          evt.nativeEvent.pageX < 20
        );
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx > 50) {
          onNavigate?.("settings");
        }
      },
    })
  ).current;

  const getFilteredBooks = () => {
    let books = [];
    if (currentTab === TABS.BORROWED) {
      books = borrowedBooks;
    } else if (currentTab === TABS.FAVORITES) {
      books = favoriteBooks;
    } else if (currentTab === TABS.SAVED) {
      books = savedBooks;
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return books.filter(
        (book) =>
          (book.title || "").toLowerCase().includes(query) ||
          (book.author || "").toLowerCase().includes(query)
      );
    }
    return books;
  };

  const formatDateDisplay = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    } catch {
      return dateString;
    }
  };

  const loadBorrowed = useCallback(
    async (opts = {}) => {
      const { silent = false } = opts;
      if (!silent) setLoading(true);
      try {
        const res = await borrowsAPI.getBorrows({
          page: 1,
          limit: 50,
          search: searchQuery.trim() || undefined,
          status: "active",
        });
        const list = res.data || res || [];
        const mapped = list.map((item) => {
          const book = item.book || {};
          const dueAt = item.dueAt || item.due_at || item.borrowDue;
          const daysLeft =
            item.daysLeft !== undefined
              ? item.daysLeft
              : Math.ceil(
                  (new Date(dueAt) - new Date()) / (1000 * 60 * 60 * 24)
                );
          return {
            id: item.id,
            bookId: item.bookId || book.id,
            title: book.title,
            author: book.author,
            cover: book.coverImage,
            expirationDate: formatDateDisplay(dueAt),
            daysLeft,
            status: item.status || (daysLeft < 0 ? "expired" : "active"),
            isExpired: item.isExpired ?? daysLeft < 0,
            canRenew: item.canRenew ?? true,
          };
        });
        setBorrowedBooks(mapped);
      } catch (err) {
        console.error("[MyBookshelf] loadBorrowed error:", err);
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [searchQuery]
  );

  const loadFavorites = useCallback(
    async (opts = {}) => {
      const { silent = false } = opts;
      if (!silent) setLoading(true);
      try {
        const res = await booksAPI.getFavorites({
          page: 1,
          limit: 50,
          search: searchQuery.trim() || undefined,
        });
        const list = res.data || res || [];
        const mapped = list.map((item) => {
          // Backend trả về structure: { id, userId, bookId, favoritedAt, book: {...} }
          const book = item.book || item;
          return {
            id: book.id || item.bookId || item.id,
            title: book.title,
            author: book.author,
            cover: book.coverImage || book.cover_image,
            description: book.description,
            availableCopies: book.availableCopies || book.available_copies,
            totalCopies: book.totalCopies || book.total_copies,
            status: book.status,
            isBorrowed: Boolean(book.isBorrowed),
            borrowDue: book.borrowDue || book.dueAt || book.due_at,
            isFavorite: Boolean(book.isFavorite !== undefined ? book.isFavorite : true), // Luôn true vì đây là favorites
            favoritedAt: item.favoritedAt || item.favorited_at,
            // Giữ nguyên các fields khác từ book
            ...book,
          };
        });
        setFavoriteBooks(mapped);
      } catch (err) {
        console.error("[MyBookshelf] loadFavorites error:", err);
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [searchQuery]
  );

  const loadSaved = useCallback(
    async (opts = {}) => {
      const { silent = false } = opts;
      if (!silent) setLoading(true);
      try {
        const res = await booksAPI.getSaved({
          page: 1,
          limit: 50,
          search: searchQuery.trim() || undefined,
        });
        const list = res.data || res || [];
        const mapped = list.map((item) => {
          const book = item.book || item;
          return {
            id: book.id || item.id,
            title: book.title,
            author: book.author,
            cover: book.coverImage,
          };
        });
        setSavedBooks(mapped);
      } catch (err) {
        console.error("[MyBookshelf] loadSaved error:", err);
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [searchQuery]
  );

  const loadCurrentTab = useCallback(
    async (opts = {}) => {
      if (currentTab === TABS.BORROWED) {
        await loadBorrowed(opts);
      } else if (currentTab === TABS.FAVORITES) {
        await loadFavorites(opts);
      } else if (currentTab === TABS.SAVED) {
        await loadSaved(opts);
      }
    },
    [currentTab, loadBorrowed, loadFavorites, loadSaved]
  );

  useEffect(() => {
    loadCurrentTab();
  }, [loadCurrentTab]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCurrentTab({ silent: true });
    setRefreshing(false);
  };

  const handleRenew = async (borrowId) => {
    try {
      const res = await borrowsAPI.renewBorrow(borrowId);
      Alert.alert("Thành công", "Đã gia hạn sách");
      await loadBorrowed({ silent: true });
      return res;
    } catch (err) {
      console.error("[MyBookshelf] renew error:", err);
      Alert.alert("Lỗi", err.message || "Không thể gia hạn");
    }
  };

  const getStatusInfo = (book) => {
    const isExpired =
      book.isExpired === true ||
      book.status === "expired" ||
      (book.daysLeft !== undefined && book.daysLeft < 0);
    const statusColor = isExpired
      ? STATUS_COLORS.EXPIRED
      : book.daysLeft <= STATUS_THRESHOLD.WARNING_DAYS
      ? STATUS_COLORS.WARNING
      : STATUS_COLORS.ACTIVE;

    const statusText = isExpired
      ? strings.expired || "Hết hạn"
      : book.daysLeft === STATUS_THRESHOLD.ONE_DAY
      ? strings.oneDayLeft || "1 ngày nữa"
      : `${book.daysLeft} ${strings.daysLeft || "ngày nữa"}`;

    return { isExpired, statusColor, statusText };
  };

  const renderBookItem = (book) => {
    if (currentTab === TABS.BORROWED) {
      const { isExpired, statusColor, statusText } = getStatusInfo(book);

      return (
        <View
          key={book.id}
          style={[
            styles.bookItem,
            { backgroundColor: colors.cardBg, borderColor: colors.inputBorder },
            isExpired && styles.expiredBookItem,
          ]}
        >
          <View
            style={[
              styles.bookCover,
              {
                backgroundColor: colors.inputBg,
                borderColor: colors.inputBorder,
              },
            ]}
          >
            {book.cover ? (
              <Image source={{ uri: book.cover }} style={styles.coverImage} />
            ) : (
              <Ionicons name="book-outline" size={32} color={colors.buttonBg} />
            )}
          </View>
          <View style={styles.bookDetails}>
            <Text
              style={[styles.bookTitle, { color: colors.text }]}
              numberOfLines={2}
            >
              {book.title}
            </Text>
            <Text
              style={[styles.bookAuthor, { color: colors.muted }]}
              numberOfLines={1}
            >
              {book.author}
            </Text>
            <Text style={[styles.expirationDate, { color: colors.muted }]}>
              {strings.expirationDate || "Thời hạn"}: {book.expirationDate}
            </Text>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: statusColor + "20",
                  borderColor: statusColor,
                },
              ]}
            >
              <Text style={[styles.statusText, { color: statusColor }]}>
                {statusText}
              </Text>
            </View>
            {!isExpired ? (
              <TouchableOpacity
                style={[
                  styles.renewButton,
                  { backgroundColor: STATUS_COLORS.RENEW },
                ]}
                onPress={() => handleRenew(book.id)}
                activeOpacity={0.8}
              >
                <Text style={[styles.renewButtonText, { color: "#fff" }]}>
                  {strings.renew || "Gia hạn"}
                </Text>
              </TouchableOpacity>
            ) : (
              <View
                style={[
                  styles.expiredButton,
                  { backgroundColor: STATUS_COLORS.EXPIRED },
                ]}
              >
                <Text style={[styles.expiredButtonText, { color: "#fff" }]}>
                  {strings.expired || "Hết hạn"}
                </Text>
              </View>
            )}
          </View>
        </View>
      );
    } else {
      return (
        <TouchableOpacity
          key={book.id}
          style={[
            styles.bookItem,
            { backgroundColor: colors.cardBg, borderColor: colors.inputBorder },
          ]}
          onPress={() => onNavigate?.("bookDetail")}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.bookCover,
              {
                backgroundColor: colors.inputBg,
                borderColor: colors.inputBorder,
              },
            ]}
          >
            {book.cover ? (
              <Image source={{ uri: book.cover }} style={styles.coverImage} />
            ) : (
              <Ionicons name="book-outline" size={32} color={colors.buttonBg} />
            )}
          </View>
          <View style={styles.bookDetails}>
            <Text
              style={[styles.bookTitle, { color: colors.text }]}
              numberOfLines={2}
            >
              {book.title}
            </Text>
            <Text
              style={[styles.bookAuthor, { color: colors.muted }]}
              numberOfLines={1}
            >
              {book.author}
            </Text>
          </View>
        </TouchableOpacity>
      );
    }
  };

  const getEmptyMessage = () => {
    if (currentTab === TABS.BORROWED) {
      return strings.noBorrowedBooks || "Chưa có sách đã mượn";
    } else if (currentTab === TABS.FAVORITES) {
      return strings.noFavoriteBooks || "Chưa có sách yêu thích";
    }
    return strings.noSavedBooks || "Chưa có sách đã lưu";
  };

  return (
    <View
      style={[styles.container, { backgroundColor: colors.background }]}
      {...panResponder.panHandlers}
    >
      <StatusBar style={theme === "dark" ? "light" : "dark"} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.headerBg }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => onNavigate?.("settings")}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={colors.headerText} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.headerText }]}>
          {strings.myBookshelf || "Tủ sách của tôi"}
        </Text>
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => setShowSearch(!showSearch)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={showSearch ? "close-outline" : "search-outline"}
            size={24}
            color={colors.headerText}
          />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View
        style={[styles.tabsContainer, { backgroundColor: colors.background }]}
      >
        {TAB_LABELS.map((tabItem) => (
          <TouchableOpacity
            key={tabItem.key}
            style={[styles.tab, currentTab === tabItem.key && styles.activeTab]}
            onPress={() => handleTabChange(tabItem.key)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    currentTab === tabItem.key ? colors.buttonBg : colors.muted,
                },
              ]}
            >
              {strings[tabItem.label] || tabItem.label}
            </Text>
            {currentTab === tabItem.key && (
              <View
                style={[
                  styles.tabIndicator,
                  { backgroundColor: colors.buttonBg },
                ]}
              />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Search Bar */}
      {showSearch && (
        <View
          style={[
            styles.searchContainer,
            { backgroundColor: colors.cardBg, borderColor: colors.inputBorder },
          ]}
        >
          <Ionicons name="search-outline" size={20} color={colors.muted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={strings.searchBooks || "Tìm kiếm sách..."}
            placeholderTextColor={colors.placeholder}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              activeOpacity={0.7}
            >
              <Ionicons name="close-circle" size={20} color={colors.muted} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Content */}
      {loading ? (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={colors.buttonBg} />
          <Text style={[styles.emptyText, { color: colors.muted, marginTop: 12 }]}>
            {strings.loading || "Đang tải..."}
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {getFilteredBooks().length > 0 ? (
            getFilteredBooks().map((book) => renderBookItem(book))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="book-outline" size={64} color={colors.muted} />
              <Text style={[styles.emptyText, { color: colors.muted }]}>
                {getEmptyMessage()}
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}
