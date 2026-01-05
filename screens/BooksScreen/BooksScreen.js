import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Platform,
  LayoutAnimation,
  UIManager,
  Animated,
  ActivityIndicator,
  RefreshControl,
  Image,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import BottomNav from "../../components/BottomNav";
import { createStyles } from "./Books.styles";
import { booksAPI } from "../../utils/api";

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
  const [tab, setTab] = useState("all");
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState(null);
  const openRowRef = useRef(null);
  const flatListRef = useRef(null);
  const limit = 20; // Số sách mỗi lần load

  useEffect(() => {
    if (
      Platform.OS === "android" &&
      UIManager.setLayoutAnimationEnabledExperimental
    ) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  // Load books from API
  const loadBooks = useCallback(
    async (page = 1, append = false) => {
      try {
        if (page === 1) {
          setLoading(true);
          setError(null);
        } else {
          setLoadingMore(true);
        }

        // Build query params
        const params = {
          page,
          limit,
          sortBy: "createdAt",
          sortOrder: "desc",
        };

        // Add search filter
        if (search.trim()) {
          params.search = search.trim();
        }

        // Add category filter if needed (có thể mở rộng sau)
        // if (tab === "category") {
        //   params.category = selectedCategory;
        // }

        // Add status filter for "available" tab
        // Note: API có thể không hỗ trợ filter status, sẽ filter ở client nếu cần
        // Hoặc có thể thêm vào API sau

        const response = await booksAPI.getBooks(params);

        if (response && response.data) {
          const newBooks = response.data;
          const pagination = response.pagination || {};

          if (append) {
            setBooks((prev) => [...prev, ...newBooks]);
          } else {
            setBooks(newBooks);
          }

          setHasMore(pagination.hasNextPage || false);
          setCurrentPage(page);
        }
      } catch (err) {
        console.error("Error loading books:", err);
        setError(err.message || "Không thể tải danh sách sách");
        if (!append) {
          setBooks([]);
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [search, tab, limit]
  );

  // Load more books when scrolling to end
  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore && !loading) {
      loadBooks(currentPage + 1, true);
    }
  }, [loadingMore, hasMore, loading, currentPage, loadBooks]);

  // Refresh books
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setCurrentPage(1);
    setHasMore(true);
    loadBooks(1, false);
  }, [loadBooks]);

  // Load books when component mounts or filters change
  useEffect(() => {
    setCurrentPage(1);
    setHasMore(true);
    setError(null);
    loadBooks(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, tab]); // Reload when search or tab changes

  // Filter books by tab (if needed for client-side filtering)
  const filteredBooks = useMemo(() => {
    if (tab === "available") {
      return books.filter((b) => b.status === "có sẵn" || b.availableCopies > 0);
    }
    return books;
  }, [books, tab]);

  return (
    <View
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <StatusBar style={theme === "dark" ? "light" : "dark"} />

      <View style={[styles.topBar, { backgroundColor: colors.headerBg }]}>
        <View
          style={[
            styles.searchBox,
            {
              backgroundColor: colors.cardBg,
              borderColor: colors.inputBorder,
            },
          ]}
        >
          <Ionicons name="search" size={18} color={colors.muted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            value={search}
            onChangeText={onChangeSearch}
            placeholder={strings.search || "Tìm kiếm sách..."}
            placeholderTextColor={colors.placeholder}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => onChangeSearch?.("")}>
              <Ionicons name="close-circle" size={18} color={colors.muted} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[
            styles.actionBtn,
            {
              backgroundColor: colors.cardBg,
              borderColor: colors.inputBorder,
            },
          ]}
          activeOpacity={0.7}
        >
          <Ionicons name="filter-outline" size={20} color={colors.buttonBg} />
        </TouchableOpacity>
      </View>

      <View style={[styles.tabs, { backgroundColor: colors.background }]}>
        {[
          { key: "all", label: strings.all || "Tất cả" },
          { key: "category", label: strings.category || "Thể loại" },
          { key: "available", label: strings.available || "Sẵn có" },
        ].map((item) => {
          const active = tab === item.key;
          return (
            <TouchableOpacity
              key={item.key}
              style={[
                styles.tabItem,
                active && {
                  backgroundColor: colors.buttonBg + "15",
                },
              ]}
              onPress={() => setTab(item.key)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color: active ? colors.buttonBg : colors.text,
                    fontWeight: active ? "700" : "500",
                  },
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {loading && books.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.buttonBg} />
          <Text style={[styles.loadingText, { color: colors.muted }]}>
            {strings.loading || "Đang tải..."}
          </Text>
        </View>
      ) : error && books.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View
            style={[
              styles.emptyIconContainer,
              { backgroundColor: colors.inputBg },
            ]}
          >
            <Ionicons name="alert-circle-outline" size={64} color={colors.muted} />
          </View>
          <Text style={[styles.emptyText, { color: colors.muted }]}>
            {error}
          </Text>
          <TouchableOpacity
            style={[
              styles.retryButton,
              { backgroundColor: colors.buttonBg },
            ]}
            onPress={() => loadBooks(1, false)}
          >
            <Text style={[styles.retryButtonText, { color: colors.buttonText }]}>
              {strings.retry || "Thử lại"}
            </Text>
          </TouchableOpacity>
        </View>
      ) : filteredBooks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View
            style={[
              styles.emptyIconContainer,
              { backgroundColor: colors.inputBg },
            ]}
          >
            <Ionicons name="book-outline" size={64} color={colors.muted} />
          </View>
          <Text style={[styles.emptyText, { color: colors.muted }]}>
            {strings.noBooks || "Không tìm thấy sách nào"}
          </Text>
          {search.trim() && (
            <Text style={[styles.emptySubtext, { color: colors.muted }]}>
              {strings.tryDifferentSearch ||
                "Thử tìm kiếm với từ khóa khác"}
            </Text>
          )}
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={filteredBooks}
          keyExtractor={(item, index) => item.id || `book-${index}`}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.buttonBg}
              colors={[colors.buttonBg]}
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={() => {
            if (loadingMore) {
              return (
                <View style={styles.loadMoreContainer}>
                  <ActivityIndicator size="small" color={colors.buttonBg} />
                  <Text style={[styles.loadMoreText, { color: colors.muted }]}>
                    {strings.loadingMore || "Đang tải thêm..."}
                  </Text>
                </View>
              );
            }
            if (!hasMore && filteredBooks.length > 0) {
              return (
                <View style={styles.endContainer}>
                  <Text style={[styles.endText, { color: colors.muted }]}>
                    {strings.noMoreBooks || "Đã hiển thị tất cả sách"}
                  </Text>
                </View>
              );
            }
            return null;
          }}
          renderItem={({ item: b }) => {
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
                    style={[
                      styles.swipeBtn,
                      { backgroundColor: "#f0f0f0" },
                    ]}
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
                    style={[
                      styles.swipeBtn,
                      { backgroundColor: "#f6c344" },
                    ]}
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
                  >
                    <Ionicons
                      name="library-outline"
                      size={18}
                      color={colors.buttonText}
                    />
                    <Text
                      style={[
                        styles.swipeText,
                        { color: colors.buttonText },
                      ]}
                      numberOfLines={1}
                    >
                      {strings.borrow || "Mượn"}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              );
            };

            return (
              <View style={styles.bookItemWrapper}>
                <Swipeable
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
                      styles.bookCard,
                      {
                        backgroundColor: colors.cardBg,
                        borderColor: colors.inputBorder,
                      },
                    ]}
                    activeOpacity={0.7}
                    onPress={() => onNavigate?.("bookDetail", { book: b })}
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
                          size={28}
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
                        style={[styles.bookAuthor, { color: colors.muted }]}
                        numberOfLines={1}
                      >
                        {b.author}
                      </Text>
                      <View style={styles.bookFooter}>
                        <View
                          style={[
                            styles.statusBadge,
                            {
                              backgroundColor:
                                b.status === "có sẵn" || b.availableCopies > 0
                                  ? "#2ecc71" + "20"
                                  : colors.inputBg,
                            },
                          ]}
                        >
                          <View
                            style={[
                              styles.statusDot,
                              {
                                backgroundColor:
                                  b.status === "có sẵn" || b.availableCopies > 0
                                    ? "#2ecc71"
                                    : colors.muted,
                              },
                            ]}
                          />
                          <Text
                            style={[
                              styles.statusText,
                              {
                                color:
                                  b.status === "có sẵn" || b.availableCopies > 0
                                    ? "#2ecc71"
                                    : colors.muted,
                              },
                            ]}
                          >
                            {b.status === "có sẵn" || b.availableCopies > 0
                              ? strings.available || "Có sẵn"
                              : strings.borrowed || "Không có sẵn"}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                </Swipeable>
              </View>
            );
          }}
        />
      )}

      <BottomNav
        activeKey="library"
        onChange={(key) => {
          if (key === "home") onNavigate?.("home");
          if (key === "settings") onNavigate?.("settings");
          if (key === "chats") onNavigate?.("chats");
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
