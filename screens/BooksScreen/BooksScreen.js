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
  Alert,
  Modal,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import BottomNav from "../../components/BottomNav";
import { createStyles } from "./Books.styles";
import { booksAPI, borrowsAPI } from "../../utils/api";

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

  // Borrow states
  const [showBorrowSheet, setShowBorrowSheet] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedDueDate, setSelectedDueDate] = useState(() => {
    // Default to 2 weeks (14 days) from now
    const date = new Date();
    date.setDate(date.getDate() + 14);
    return date;
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [borrowing, setBorrowing] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

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

        // Add available filter - backend sẽ filter sách có sẵn và không bao gồm sách đã mượn
        if (tab === "available") {
          params.status = "available";
          // Backend cần filter: availableCopies > 0 AND isBorrowed = false
        }

        const response = await booksAPI.getBooks(params);

        let newBooks = [];
        if (response && response.data) {
          newBooks = response.data.map((book) => {
            // Đảm bảo isBorrowed là boolean (backend có thể trả về undefined)
            const isBorrowed = Boolean(book.isBorrowed);

            // Format borrowDue nếu có (backend trả về ISO 8601 hoặc null)
            let borrowDue = null;
            if (isBorrowed) {
              const dueDate = book.borrowDue || book.dueAt || book.due_at;
              if (dueDate) {
                borrowDue = formatDateForDisplay(dueDate);
              }
            }

            // Đảm bảo isFavorite là boolean
            const isFavorite = Boolean(book.isFavorite);

              return {
                ...book,
              isBorrowed, // Đảm bảo là boolean
              borrowDue,  // Format date hoặc null
              isFavorite, // Đảm bảo là boolean
              };
          });
        }

        if (response) {
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
      // Chỉ lấy sách có sẵn VÀ user chưa mượn
      // Backend đã filter, nhưng vẫn check client-side để đảm bảo
      return books.filter((b) => {
        const isBorrowed = Boolean(b.isBorrowed);
        const isAvailable = b.status === "có sẵn" || (b.availableCopies && b.availableCopies > 0);
        return isAvailable && !isBorrowed;
      });
    }
    // Tab "all": Hiển thị TẤT CẢ sách, bao gồm cả sách đã mượn
    return books;
  }, [books, tab]);

  // Handle date picker change
  const handleDateChange = (event, date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
      if (event.type === "set" && date) {
        setSelectedDueDate(date);
      }
    } else {
      if (date) {
        setSelectedDueDate(date);
      }
    }
  };

  // Format date to ISO 8601 string
  const formatDateToISO = (date) => {
    return date.toISOString();
  };

  // Format date for display
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dateString;
    }
  };

  // Handle borrow book
  const handleBorrow = useCallback(async () => {
    if (!selectedBook?.id) {
      Alert.alert("Lỗi", "Không có thông tin sách");
      return;
    }

    // Validate date is in the future and not more than 30 days
    const now = new Date();
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);

    if (selectedDueDate <= now) {
      Alert.alert("Lỗi", "Ngày hết hạn phải là ngày trong tương lai");
      return;
    }

    if (selectedDueDate > maxDate) {
      Alert.alert("Lỗi", "Ngày hết hạn không được quá 1 tháng (30 ngày) kể từ ngày mượn");
      return;
    }

    try {
      setBorrowing(true);
      const dueAtISO = formatDateToISO(selectedDueDate);

      console.log("[BooksScreen] Borrowing book:", {
        bookId: selectedBook.id,
        dueAt: dueAtISO,
      });

      const result = await borrowsAPI.borrowBook({
        bookId: selectedBook.id,
        dueAt: dueAtISO,
      });

      console.log("[BooksScreen] Borrow success:", result);

      // Update books list immediately
      const formattedDueDate = result.dueAt || result.due_at 
        ? formatDateForDisplay(result.dueAt || result.due_at)
        : null;
      
      setBooks((prevBooks) => {
        return prevBooks.map((b) => {
          if (b.id === selectedBook.id) {
            return {
              ...b,
              availableCopies: Math.max(0, (b.availableCopies || 0) - 1),
              status: (b.availableCopies || 0) <= 1 ? "không có sẵn" : b.status,
              isBorrowed: true, // Mark as borrowed by current user
              borrowDue: formattedDueDate, // Add due date
            };
          }
          return b;
        });
      });

      // Close sheet
      setShowBorrowSheet(false);
      setSelectedBook(null);

      // Refresh books list to get updated data from server
      await loadBooks(1, false);

      // Show success message
      Alert.alert(
        "Thành công",
        `Đã mượn sách "${selectedBook.title}" thành công!\nHạn trả: ${formatDateForDisplay(result.dueAt)}\nBạn nhận được 10 điểm thưởng.`,
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("[BooksScreen] Borrow error:", error);

      let errorMessage = "Không thể mượn sách. Vui lòng thử lại.";

      if (error.message) {
        if (error.message.includes("không còn bản sao")) {
          errorMessage = "Sách hiện không còn bản sao có sẵn";
        } else if (error.message.includes("đang mượn")) {
          errorMessage = "Bạn đang mượn sách này rồi";
        } else if (error.message.includes("không tồn tại")) {
          errorMessage = "Sách không tồn tại";
        } else if (error.message.includes("Unauthorized")) {
          errorMessage = "Vui lòng đăng nhập để mượn sách";
        } else {
          errorMessage = error.message;
        }
      }

      Alert.alert("Lỗi", errorMessage);
    } finally {
      setBorrowing(false);
    }
  }, [selectedBook, selectedDueDate, loadBooks]);

  // Handle toggle favorite
  const handleToggleFavorite = useCallback(async (book) => {
    if (!book?.id) {
      Alert.alert("Lỗi", "Không có thông tin sách");
      return;
    }

    try {
      setFavoriteLoading(true);
      const previousFavorite = Boolean(book.isFavorite);
      const newFavoriteState = !previousFavorite;

      // Optimistic update
      setBooks((prevBooks) => {
        return prevBooks.map((b) => {
          if (b.id === book.id) {
            return {
              ...b,
              isFavorite: newFavoriteState,
            };
          }
          return b;
        });
      });

      const result = await booksAPI.toggleFavorite(book.id);

      // Update với response từ server
      if (result.isFavorite !== undefined) {
        setBooks((prevBooks) => {
          return prevBooks.map((b) => {
            if (b.id === book.id) {
              return {
                ...b,
                isFavorite: result.isFavorite,
              };
            }
            return b;
          });
        });
      }

      // Show success message (optional, có thể bỏ để không làm phiền user)
      // if (result.isFavorite) {
      //   Alert.alert("Thành công", "Đã thêm vào yêu thích!\nBạn nhận được 2 điểm thưởng.");
      // } else {
      //   Alert.alert("Thành công", "Đã bỏ yêu thích.");
      // }
    } catch (error) {
      console.error("[BooksScreen] Toggle favorite error:", error);

      // Revert optimistic update
      setBooks((prevBooks) => {
        return prevBooks.map((b) => {
          if (b.id === book.id) {
            return {
              ...b,
              isFavorite: Boolean(book.isFavorite),
            };
          }
          return b;
        });
      });

      let errorMessage = "Không thể cập nhật yêu thích. Vui lòng thử lại.";
      if (error.message) {
        if (error.message.includes("Unauthorized")) {
          errorMessage = "Vui lòng đăng nhập để yêu thích sách";
        } else {
          errorMessage = error.message;
        }
      }

      Alert.alert("Lỗi", errorMessage);
    } finally {
      setFavoriteLoading(false);
    }
  }, []);

  // Open borrow sheet
  const openBorrowSheet = useCallback((book) => {
    setSelectedBook(book);
    setShowBorrowSheet(true);
    setAgreeToTerms(false); // Reset terms agreement
    // Reset date to default (14 days from now)
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 14);
    setSelectedDueDate(defaultDate);
  }, []);

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
              // Capture favoriteLoading from component scope
              const isLoading = favoriteLoading;
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
                      {
                        backgroundColor: Boolean(b.isFavorite) ? "#f6c344" : "#f6c344",
                        opacity: isLoading ? 0.5 : 1,
                      },
                    ]}
                    onPress={async () => {
                      openRowRef.current?.close();
                      await handleToggleFavorite(b);
                    }}
                    disabled={isLoading}
                  >
                    <Ionicons
                      name={Boolean(b.isFavorite) ? "heart" : "heart-outline"}
                      size={18}
                      color="#1f1f1f"
                    />
                    <Text
                      style={[styles.swipeText, { color: "#1f1f1f" }]}
                      numberOfLines={1}
                    >
                      {Boolean(b.isFavorite)
                        ? strings.favorited || "Đã thích"
                        : strings.favorite || "Thích"}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.swipeBtn,
                      {
                        backgroundColor: Boolean(b.isBorrowed)
                          ? colors.inputBg
                          : colors.buttonBg,
                        opacity: Boolean(b.isBorrowed) || (b.availableCopies <= 0 && b.status !== "có sẵn") ? 0.5 : 1,
                      },
                    ]}
                    onPress={() => {
                      const isBorrowed = Boolean(b.isBorrowed);
                      if (isBorrowed || (b.availableCopies <= 0 && b.status !== "có sẵn")) {
                        return;
                      }
                      openRowRef.current?.close();
                      openBorrowSheet(b);
                    }}
                    disabled={Boolean(b.isBorrowed) || (b.availableCopies <= 0 && b.status !== "có sẵn")}
                  >
                    <Ionicons
                      name="library-outline"
                      size={18}
                      color={Boolean(b.isBorrowed) ? colors.text : colors.buttonText}
                    />
                    <Text
                      style={[
                        styles.swipeText,
                        {
                          color: Boolean(b.isBorrowed) ? colors.text : colors.buttonText,
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {Boolean(b.isBorrowed)
                        ? strings.borrowed || "Đã mượn"
                        : strings.borrow || "Mượn"}
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
                        {/* Luôn hiển thị status badge cho tất cả sách */}
                        {(() => {
                          const isBorrowed = Boolean(b.isBorrowed);
                          const isAvailable = b.status === "có sẵn" || (b.availableCopies && b.availableCopies > 0);

                          return (
                            <>
                          <View
                            style={[
                              styles.statusBadge,
                              {
                                    backgroundColor: isBorrowed
                                      ? "#f39c12" + "20" // Màu cam nhạt cho "Đã mượn"
                                      : isAvailable
                                        ? "#2ecc71" + "20" // Màu xanh nhạt cho "Có sẵn"
                                        : "#e74c3c" + "20", // Màu đỏ nhạt cho "Không có sẵn"
                              },
                            ]}
                          >
                            <View
                              style={[
                                styles.statusDot,
                                {
                                      backgroundColor: isBorrowed
                                        ? "#f39c12" // Màu cam cho "Đã mượn"
                                        : isAvailable
                                          ? "#2ecc71" // Màu xanh cho "Có sẵn"
                                          : "#e74c3c", // Màu đỏ cho "Không có sẵn"
                                },
                              ]}
                            />
                            <Text
                              style={[
                                styles.statusText,
                                {
                                      color: isBorrowed
                                        ? "#f39c12" // Màu cam cho "Đã mượn"
                                        : isAvailable
                                          ? "#2ecc71" // Màu xanh cho "Có sẵn"
                                          : "#e74c3c", // Màu đỏ cho "Không có sẵn"
                                },
                              ]}
                            >
                                  {isBorrowed
                                    ? strings.borrowed || "Đã mượn"
                                    : isAvailable
                                ? strings.available || "Có sẵn"
                                : strings.notAvailable || "Không có sẵn"}
                            </Text>
                          </View>
                        {/* Hiển thị ngày hết hạn nếu đã mượn */}
                              {isBorrowed && b.borrowDue && (
                          <View style={styles.dueDateContainer}>
                            <Ionicons name="calendar-outline" size={12} color={colors.muted} />
                            <Text style={[styles.dueDate, { color: colors.muted }]}>
                              {strings.due || "Hạn"}: {b.borrowDue}
                            </Text>
                          </View>
                        )}
                            </>
                          );
                        })()}
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

      {/* Borrow bottom sheet */}
      {showBorrowSheet && selectedBook && (
        <View
          style={[styles.sheetOverlay, { backgroundColor: "rgba(0,0,0,0.45)" }]}
        >
          <TouchableOpacity
            style={styles.sheetOverlay}
            activeOpacity={1}
            onPress={() => !borrowing && setShowBorrowSheet(false)}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
              style={[
                styles.sheetCard,
                {
                  backgroundColor: colors.cardBg,
                  borderColor: colors.inputBorder,
                },
              ]}
            >
              <Text style={[styles.sheetTitle, { color: colors.text }]}>
                {strings.borrow || "Mượn sách"}
              </Text>
              <Text style={[styles.sheetText, { color: colors.muted }]}>
                {strings.confirmBorrow || "Thời hạn mượn sách mặc định là 14 ngày kể từ ngày mượn. Bạn có thể chọn ngày hết hạn khác (tối đa 30 ngày)."}
              </Text>

              {/* Book Info */}
              <View style={styles.sheetBookInfo}>
                <Text style={[styles.sheetBookTitle, { color: colors.text }]}>
                  {selectedBook.title}
                </Text>
                <Text style={[styles.sheetBookAuthor, { color: colors.muted }]}>
                  {selectedBook.author}
                </Text>
              </View>

              {/* Date Picker Section */}
              <View style={styles.datePickerSection}>
                <Text style={[styles.datePickerLabel, { color: colors.text }]}>
                  Ngày hết hạn:
                </Text>
                <TouchableOpacity
                  style={[
                    styles.datePickerButton,
                    {
                      backgroundColor: colors.inputBg,
                      borderColor: colors.inputBorder,
                    },
                  ]}
                  onPress={() => setShowDatePicker(true)}
                  disabled={borrowing}
                >
                  <Ionicons name="calendar-outline" size={18} color={colors.text} />
                  <Text style={[styles.datePickerText, { color: colors.text }]}>
                    {formatDateForDisplay(selectedDueDate.toISOString())} ({Math.ceil((selectedDueDate - new Date()) / (1000 * 60 * 60 * 24))} ngày)
                  </Text>
                  <Ionicons name="chevron-down" size={16} color={colors.muted} />
                </TouchableOpacity>
                <Text style={[styles.datePickerHint, { color: colors.muted }]}>
                  Mặc định: 14 ngày kể từ ngày mượn (tối đa: 30 ngày)
                </Text>
              </View>

              {/* Terms Agreement */}
              <View style={styles.termsSection}>
                <TouchableOpacity
                  style={styles.termsCheckbox}
                  onPress={() => setAgreeToTerms(!agreeToTerms)}
                  disabled={borrowing}
                >
                  <View
                    style={[
                      styles.checkbox,
                      {
                        backgroundColor: agreeToTerms
                          ? colors.buttonBg
                          : "transparent",
                        borderColor: agreeToTerms
                          ? colors.buttonBg
                          : colors.inputBorder,
                      },
                    ]}
                  >
                    {agreeToTerms && (
                      <Ionicons
                        name="checkmark"
                        size={16}
                        color={colors.buttonText}
                      />
                    )}
                  </View>
                  <Text style={[styles.termsText, { color: colors.text }]}>
                    Tôi đồng ý với{" "}
                    <Text
                      style={[styles.termsLink, { color: colors.buttonBg }]}
                      onPress={() => {
                        // Có thể mở modal điều khoản hoặc navigate đến trang điều khoản
                        Alert.alert(
                          "Điều khoản mượn sách",
                          "1. Sách phải được trả đúng hạn\n2. Nếu trả trễ sẽ bị trừ điểm\n3. Phải giữ gìn sách cẩn thận\n4. Nếu làm mất hoặc hư hỏng sách sẽ phải bồi thường\n5. Mỗi lần mượn tối đa 30 ngày",
                          [{ text: "Đã hiểu" }]
                        );
                      }}
                    >
                      điều khoản mượn sách
                    </Text>
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.sheetActions}>
                <TouchableOpacity
                  style={[
                    styles.sheetBtn,
                    {
                      backgroundColor: colors.inputBg,
                      borderColor: colors.inputBorder,
                      borderWidth: 1,
                      opacity: borrowing ? 0.5 : 1,
                    },
                  ]}
                  onPress={() => {
                    setShowBorrowSheet(false);
                    setSelectedBook(null);
                    setAgreeToTerms(false);
                  }}
                  disabled={borrowing}
                >
                  <Text style={[styles.sheetBtnText, { color: colors.text }]}>
                    {strings.cancel || "Hủy"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.sheetBtn,
                    {
                      backgroundColor: colors.buttonBg,
                      opacity: borrowing ? 0.5 : 1,
                    },
                  ]}
                  onPress={handleBorrow}
                  disabled={borrowing || !agreeToTerms}
                >
                  {borrowing ? (
                    <ActivityIndicator size="small" color={colors.buttonText} />
                  ) : (
                    <Text
                      style={[styles.sheetBtnText, { color: colors.buttonText }]}
                    >
                      {strings.confirm || "Xác nhận"}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      )}

      {/* Date Picker Modal */}
      {showDatePicker && (
        <Modal
          transparent={true}
          animationType="fade"
          visible={showDatePicker}
          onRequestClose={() => setShowDatePicker(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowDatePicker(false)}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
              style={[
                styles.modalContent,
                {
                  backgroundColor: colors.cardBg,
                  borderColor: colors.inputBorder,
                },
              ]}
            >
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Chọn ngày hết hạn
              </Text>
              {Platform.OS === "ios" && (
                <DateTimePicker
                  value={selectedDueDate}
                  mode="date"
                  display="spinner"
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                  maximumDate={(() => {
                    const maxDate = new Date();
                    maxDate.setDate(maxDate.getDate() + 30);
                    return maxDate;
                  })()}
                  style={styles.datePickerIOS}
                />
              )}
              {Platform.OS === "android" && (
                <DateTimePicker
                  value={selectedDueDate}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                  maximumDate={(() => {
                    const maxDate = new Date();
                    maxDate.setDate(maxDate.getDate() + 30);
                    return maxDate;
                  })()}
                />
              )}
              {Platform.OS === "ios" && (
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[
                      styles.modalBtn,
                      {
                        backgroundColor: colors.inputBg,
                        borderColor: colors.inputBorder,
                        borderWidth: 1,
                      },
                    ]}
                    onPress={() => setShowDatePicker(false)}
                  >
                    <Text style={[styles.modalBtnText, { color: colors.text }]}>
                      Hủy
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.modalBtn,
                      { backgroundColor: colors.buttonBg },
                    ]}
                    onPress={() => setShowDatePicker(false)}
                  >
                    <Text
                      style={[styles.modalBtnText, { color: colors.buttonText }]}
                    >
                      Xác nhận
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
}
