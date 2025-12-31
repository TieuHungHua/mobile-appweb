import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  LayoutAnimation,
  UIManager,
  Animated,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import BottomNav from "../components/BottomNav";
import { booksAPI, borrowsAPI } from "../utils/api";

export default function BooksScreen({
  theme,
  lang,
  strings,
  colors,
  onNavigate,
  searchValue = "",
  onChangeSearch,
}) {
  const styles = useMemo(() => createStyles(colors), [colors]);
  const search = searchValue;
  const [tab, setTab] = useState("all"); // all | category | available
  const [currentPage, setCurrentPage] = useState(1);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
  });
  const [selectedCategory, setSelectedCategory] = useState(null);
  const openRowRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    if (
      Platform.OS === "android" &&
      UIManager.setLayoutAnimationEnabledExperimental
    ) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  // Fetch books from API
  const fetchBooks = useCallback(
    async (
      page = 1,
      searchQuery = "",
      category = null,
      availableOnly = false
    ) => {
      try {
        setLoading(true);
        setError(null);

        const params = {
          page,
          limit: 12,
        };

        if (searchQuery.trim()) {
          params.search = searchQuery.trim();
        }

        if (category) {
          params.category = category;
        }

        const response = await booksAPI.getBooks(params);

        // Filter by available if needed (client-side filter since API doesn't have this filter)
        let filteredBooks = response.data || [];
        if (availableOnly) {
          filteredBooks = filteredBooks.filter(
            (book) => book.availableCopies > 0
          );
        }

        setBooks(filteredBooks);
        setPagination(
          response.pagination || {
            page,
            limit: 12,
            total: filteredBooks.length,
            totalPages: 1,
          }
        );
      } catch (err) {
        console.error("Error fetching books:", err);
        setError(err.message || "Không thể tải danh sách sách");
        setBooks([]);
        Alert.alert(
          strings.error || "Lỗi",
          err.message || "Không thể tải danh sách sách. Vui lòng thử lại.",
          [{ text: strings.ok || "OK" }]
        );
      } finally {
        setLoading(false);
      }
    },
    [strings]
  );

  // Initial load and when page changes
  useEffect(() => {
    fetchBooks(currentPage, search, selectedCategory, tab === "available");
  }, [currentPage, selectedCategory, tab]);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setCurrentPage(1); // Reset to first page when searching
      fetchBooks(1, search, selectedCategory, tab === "available");
    }, 500); // 500ms debounce

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [search]);

  // Handle tab change
  const handleTabChange = (newTab) => {
    setTab(newTab);
    setCurrentPage(1);
    if (newTab === "category") {
      // Category tab logic can be extended later
    }
  };

  // Handle borrow book
  const handleBorrowBook = async (bookId) => {
    try {
      // Calculate due date (30 days from now)
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);
      const dueAt = dueDate.toISOString();

      await borrowsAPI.borrowBook({
        bookId,
        dueAt,
      });

      Alert.alert(
        strings.success || "Thành công",
        strings.borrowSuccess || "Mượn sách thành công!",
        [{ text: strings.ok || "OK" }]
      );

      // Refresh books list
      fetchBooks(currentPage, search, selectedCategory, tab === "available");
    } catch (err) {
      console.error("Error borrowing book:", err);
      Alert.alert(
        strings.error || "Lỗi",
        err.message || "Không thể mượn sách. Vui lòng thử lại.",
        [{ text: strings.ok || "OK" }]
      );
    }
  };

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [tab, search]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />

      {/* Header */}
      <View style={[styles.topBar, { backgroundColor: colors.headerBg }]}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={colors.muted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            value={search}
            onChangeText={onChangeSearch}
            placeholder={strings.search || "Search"}
            placeholderTextColor={colors.placeholder}
            returnKeyType="search"
          />
        </View>
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="filter-outline" size={20} color={colors.headerText} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {[
          { key: "all", label: strings.all || "Tất cả" },
          { key: "category", label: strings.category || "Thể loại" },
          { key: "available", label: strings.available || "Sẵn có" },
        ].map((item) => {
          const active = tab === item.key;
          return (
            <TouchableOpacity
              key={item.key}
              style={styles.tabItem}
              onPress={() => setTab(item.key)}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: active ? colors.buttonBg : colors.text },
                ]}
              >
                {item.label}
              </Text>
              {active && (
                <View
                  style={[
                    styles.tabUnderline,
                    { backgroundColor: colors.buttonBg },
                  ]}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* List */}
      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.listAndFooter}>
          {loading && books.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.buttonBg} />
              <Text style={[styles.loadingText, { color: colors.muted }]}>
                {strings.loading || "Đang tải..."}
              </Text>
            </View>
          ) : error && books.length === 0 ? (
            <View style={styles.errorContainer}>
              <Ionicons
                name="alert-circle-outline"
                size={48}
                color={colors.error}
              />
              <Text style={[styles.errorText, { color: colors.error }]}>
                {error}
              </Text>
              <TouchableOpacity
                style={[
                  styles.retryButton,
                  { backgroundColor: colors.buttonBg },
                ]}
                onPress={() =>
                  fetchBooks(
                    currentPage,
                    search,
                    selectedCategory,
                    tab === "available"
                  )
                }
              >
                <Text
                  style={[styles.retryButtonText, { color: colors.buttonText }]}
                >
                  {strings.retry || "Thử lại"}
                </Text>
              </TouchableOpacity>
            </View>
          ) : books.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="book-outline" size={64} color={colors.muted} />
              <Text style={[styles.emptyText, { color: colors.muted }]}>
                {strings.noBooks || "Không tìm thấy sách"}
              </Text>
            </View>
          ) : (
            books.map((b) => {
              const renderRightActions = (progress, dragX) => {
                const translateX = dragX.interpolate({
                  inputRange: [-200, -50, 0],
                  outputRange: [0, 75, 200],
                  extrapolate: "clamp",
                });
                return (
                  <Animated.View
                    style={[
                      styles.swipeActions,
                      { transform: [{ translateX }] },
                    ]}
                  >
                    <TouchableOpacity
                      style={[styles.swipeBtn, { backgroundColor: "#f0f0f0" }]}
                    >
                      <Ionicons
                        name="bookmark-outline"
                        size={18}
                        color={colors.text}
                      />
                      <Text
                        style={[styles.swipeText, { color: colors.text }]}
                        numberOfLines={1}
                      >
                        {strings.save || "Lưu"}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.swipeBtn, { backgroundColor: "#f6c344" }]}
                    >
                      <Ionicons
                        name="heart-outline"
                        size={18}
                        color="#1f1f1f"
                      />
                      <Text
                        style={[styles.swipeText, { color: "#1f1f1f" }]}
                        numberOfLines={1}
                      >
                        {strings.favorite || "Thích"}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.swipeBtn,
                        { backgroundColor: colors.buttonBg },
                      ]}
                      onPress={() => {
                        if (b.availableCopies > 0) {
                          handleBorrowBook(b.id);
                        } else {
                          Alert.alert(
                            strings.error || "Lỗi",
                            strings.outOfStock || "Sách đã hết, không thể mượn"
                          );
                        }
                      }}
                    >
                      <Ionicons
                        name="library-outline"
                        size={18}
                        color={colors.buttonText}
                      />
                      <Text
                        style={[styles.swipeText, { color: colors.buttonText }]}
                        numberOfLines={1}
                      >
                        {strings.borrow || "Mượn"}
                      </Text>
                    </TouchableOpacity>
                  </Animated.View>
                );
              };

              return (
                <Swipeable
                  key={b.id}
                  renderRightActions={renderRightActions}
                  friction={2}
                  overshootFriction={6}
                  rightThreshold={32}
                  enableTrackpadTwoFingerGesture
                  onSwipeableOpen={(direction, ref) => {
                    if (openRowRef.current && openRowRef.current !== ref) {
                      openRowRef.current.close();
                    }
                    openRowRef.current = ref;
                  }}
                  onSwipeableClose={(ref) => {
                    if (openRowRef.current === ref) {
                      openRowRef.current = null;
                    }
                  }}
                >
                  <TouchableOpacity
                    style={[
                      styles.bookRow,
                      { borderColor: colors.inputBorder },
                    ]}
                    activeOpacity={0.7}
                    onPress={() => onNavigate?.("bookDetail", { bookId: b.id })}
                  >
                    <View
                      style={[
                        styles.cover,
                        {
                          backgroundColor: colors.inputBg,
                          borderColor: colors.inputBorder,
                        },
                      ]}
                    >
                      {b.coverImage ? (
                        <Image
                          source={{ uri: b.coverImage }}
                          style={styles.coverImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <Ionicons
                          name="book-outline"
                          size={22}
                          color={colors.buttonBg}
                        />
                      )}
                    </View>
                    <View style={styles.bookInfo}>
                      <Text
                        style={[styles.bookTitle, { color: colors.text }]}
                        numberOfLines={2}
                      >
                        {b.title}
                      </Text>
                      <Text
                        style={[styles.bookMeta, { color: colors.muted }]}
                        numberOfLines={1}
                      >
                        {b.author}
                      </Text>
                      <Text
                        style={[
                          styles.bookMeta,
                          {
                            color:
                              b.availableCopies > 0 ? "#2ecc71" : "#e74c3c",
                          },
                        ]}
                      >
                        {b.availableCopies > 0
                          ? `${strings.available || "Có sẵn"} (${
                              b.availableCopies
                            })`
                          : strings.outOfStock || "Hết sách"}
                      </Text>
                      {b.categories && b.categories.length > 0 && (
                        <Text
                          style={[styles.bookMeta, { color: colors.muted }]}
                          numberOfLines={1}
                        >
                          {b.categories.join(", ")}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                </Swipeable>
              );
            })
          )}

          <View style={styles.paginationSpacer} />

          {/* Pagination */}
          {!loading && books.length > 0 && (
            <View style={styles.paginationRow}>
              <TouchableOpacity
                style={[
                  styles.pageIconBtn,
                  {
                    borderColor: colors.inputBorder,
                    backgroundColor: colors.cardBg,
                    opacity: pagination.page <= 1 ? 0.5 : 1,
                  },
                ]}
                disabled={pagination.page <= 1}
                onPress={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                <Ionicons name="chevron-back" size={18} color={colors.text} />
              </TouchableOpacity>

              <View
                style={[
                  styles.pageInfoPill,
                  {
                    backgroundColor: colors.cardBg,
                    borderColor: colors.inputBorder,
                  },
                ]}
              >
                <Text style={[styles.pageInfoText, { color: colors.text }]}>
                  {strings.page || "Trang"} {pagination.page}/
                  {pagination.totalPages}
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.pageIconBtn,
                  {
                    borderColor: colors.inputBorder,
                    backgroundColor: colors.cardBg,
                    opacity: pagination.page >= pagination.totalPages ? 0.5 : 1,
                  },
                ]}
                disabled={pagination.page >= pagination.totalPages}
                onPress={() =>
                  setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))
                }
              >
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={colors.text}
                />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      <BottomNav
        activeKey="library"
        onChange={(key) => {
          if (key === "home") onNavigate?.("home");
          if (key === "settings") onNavigate?.("settings");
          if (key === "chats") onNavigate?.("chats");
          // library: stay on this screen
        }}
        colors={colors}
        strings={{
          ...strings,
          home: "Home",
          library: "Library",
          chats: "Chats",
          settings: "Settings",
        }}
      />
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    topBar: {
      paddingTop: Platform.OS === "ios" ? 44 : 20,
      paddingHorizontal: 10,
      paddingBottom: 10,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    searchBox: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.cardBg,
      borderRadius: 16,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      gap: 6,
    },
    searchInput: {
      flex: 1,
      fontSize: 14,
    },
    actionBtn: {
      padding: 6,
    },
    tabs: {
      flexDirection: "row",
      alignItems: "flex-end",
      paddingHorizontal: 14,
      paddingVertical: 6,
      gap: 14,
      backgroundColor: colors.background,
    },
    tabItem: {
      alignItems: "center",
      gap: 4,
    },
    tabText: {
      fontSize: 14,
      fontWeight: "700",
    },
    tabUnderline: {
      height: 2,
      width: "100%",
      borderRadius: 2,
    },
    listContent: {
      paddingHorizontal: 14,
      paddingBottom: 120,
      gap: 12,
      flexGrow: 1,
    },
    listAndFooter: {
      flexGrow: 1,
    },
    paginationSpacer: {
      flexGrow: 1,
    },
    paginationRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      paddingVertical: 12,
      paddingHorizontal: 14,
    },
    pageIconBtn: {
      width: 36,
      height: 36,
      borderRadius: 10,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOpacity: 0.05,
      shadowRadius: 3,
      shadowOffset: { width: 0, height: 1 },
      elevation: 1,
    },
    pageInfoPill: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 12,
      borderWidth: 1,
      minWidth: 96,
      alignItems: "center",
      justifyContent: "center",
    },
    pageInfoText: {
      fontSize: 13,
      fontWeight: "700",
    },
    swipeActions: {
      width: 200,
      flexDirection: "row",
      height: "100%",
    },
    swipeBtn: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
      paddingHorizontal: 6,
    },
    swipeText: {
      fontSize: 11,
      fontWeight: "700",
      textAlign: "center",
    },
    bookRow: {
      flexDirection: "row",
      gap: 12,
      paddingVertical: 10,
      borderBottomWidth: 1,
    },
    cover: {
      width: 52,
      height: 68,
      borderRadius: 8,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    bookInfo: {
      flex: 1,
      gap: 2,
    },
    bookTitle: {
      fontSize: 14,
      fontWeight: "700",
    },
    bookMeta: {
      fontSize: 12,
      fontWeight: "500",
    },
    coverImage: {
      width: "100%",
      height: "100%",
      borderRadius: 8,
    },
    loadingContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 60,
      gap: 12,
    },
    loadingText: {
      fontSize: 14,
      fontWeight: "500",
    },
    errorContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 60,
      gap: 16,
    },
    errorText: {
      fontSize: 14,
      fontWeight: "500",
      textAlign: "center",
      paddingHorizontal: 20,
    },
    retryButton: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8,
      marginTop: 8,
    },
    retryButtonText: {
      fontSize: 14,
      fontWeight: "600",
    },
    emptyContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 60,
      gap: 12,
    },
    emptyText: {
      fontSize: 16,
      fontWeight: "500",
      textAlign: "center",
    },
  });
