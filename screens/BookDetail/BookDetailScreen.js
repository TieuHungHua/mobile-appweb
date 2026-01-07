import { StatusBar } from "expo-status-bar";
import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Keyboard,
  KeyboardAvoidingView,
  PanResponder,
  ActivityIndicator,
  Image,
  Alert,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import BottomNav from "../../components/BottomNav";
import { createStyles } from "./BookDetail.styles";
import { booksAPI, borrowsAPI } from "../../utils/api";

export default function BookDetailScreen({
  theme,
  lang,
  strings,
  colors,
  onNavigate,
  hideBottomNav = false,
  book: initialBook = null,
}) {
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [book, setBook] = useState(initialBook);
  const [loading, setLoading] = useState(!initialBook);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [showSearchOverlay, setShowSearchOverlay] = useState(false);
  const [recentSearches, setRecentSearches] = useState([
    "lịch sử tìm kiếm",
    "Harry Potter",
    "Kinh tế",
    "Công nghệ AI",
  ]);
  const [openSections, setOpenSections] = useState([0]); // Open first section by default
  const [isBorrowed, setIsBorrowed] = useState(false);
  const [borrowDue, setBorrowDue] = useState(null);
  const [showBorrowSheet, setShowBorrowSheet] = useState(false);
  const [selectedDueDate, setSelectedDueDate] = useState(() => {
    // Default to 2 weeks (14 days) from now
    const date = new Date();
    date.setDate(date.getDate() + 14);
    return date;
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [borrowing, setBorrowing] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // Load book detail from API
  const loadBookDetail = useCallback(async () => {
    if (!initialBook?.id) {
      setError("Không có thông tin sách");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await booksAPI.getBookById(initialBook.id);
      console.log("[BookDetail] API Response:", response);

      // Handle different response structures
      const bookData = response.data || response;
      console.log("[BookDetail] Book data:", bookData);
      console.log("[BookDetail] Book description field:", bookData.description);

      setBook(bookData);

      // Check borrow status from API response
      setIsBorrowed(bookData.isBorrowed || false);
      if (bookData.borrowDue) {
        setBorrowDue(formatDateForDisplay(bookData.borrowDue));
      } else if (bookData.dueAt) {
        setBorrowDue(formatDateForDisplay(bookData.dueAt));
      } else {
        setBorrowDue(null);
      }

      // Check favorite status
      try {
        const favoriteStatus = await booksAPI.checkFavorite(initialBook.id);
        setIsFavorite(favoriteStatus.isFavorite || false);
      } catch (favErr) {
        console.log("[BookDetail] Could not check favorite status:", favErr);
        // Fallback to API response if available
        setIsFavorite(bookData.isFavorite || false);
      }

      // Check saved status from API response
      setIsSaved(bookData.isSaved || false);
    } catch (err) {
      console.error("Error loading book detail:", err);
      setError(err.message || "Không thể tải thông tin sách");
      // Fallback to initial book data if available
      if (initialBook) {
        setBook(initialBook);
      }
    } finally {
      setLoading(false);
    }
  }, [initialBook]);

  // Load book detail when component mounts or book changes
  useEffect(() => {
    console.log("[BookDetail] initialBook:", initialBook);
    if (initialBook) {
      if (initialBook.id) {
        // If we have ID, load full detail from API
        console.log("[BookDetail] Loading book detail for ID:", initialBook.id);
        loadBookDetail();
      } else {
        // If we have book data but no ID, use it directly
        console.log("[BookDetail] Using initial book data directly (no ID)");
        setBook(initialBook);
        setLoading(false);
        setError(null);
      }
    } else {
      // No book data at all
      console.log("[BookDetail] No book data provided");
      setLoading(false);
      setError("Không có thông tin sách");
    }
  }, [initialBook?.id, loadBookDetail]);

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
    if (!book?.id) {
      Alert.alert("Lỗi", "Không có thông tin sách");
      return;
    }

    // Validate agree to terms
    if (!agreeToTerms) {
      Alert.alert("Lỗi", "Vui lòng đồng ý với điều khoản mượn sách trước khi tiếp tục");
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

      console.log("[BookDetail] Borrowing book:", {
        bookId: book.id,
        dueAt: dueAtISO,
      });

      const result = await borrowsAPI.borrowBook({
        bookId: book.id,
        dueAt: dueAtISO,
      });

      console.log("[BookDetail] Borrow success:", result);

      // Update local state
      setIsBorrowed(true);
      if (result.dueAt) {
        setBorrowDue(formatDateForDisplay(result.dueAt));
      } else if (result.due_at) {
        setBorrowDue(formatDateForDisplay(result.due_at));
      }

      // Update book state immediately
      setBook((prevBook) => {
        if (!prevBook) return prevBook;
        return {
          ...prevBook,
          availableCopies: Math.max(0, (prevBook.availableCopies || 0) - 1),
          isBorrowed: true,
          borrowDue: result.dueAt || result.due_at,
        };
      });

      // Refresh book data to get updated availableCopies from server
      await loadBookDetail();

      // Close sheet
      setShowBorrowSheet(false);

      // Show success message
      Alert.alert(
        "Thành công",
        `Đã mượn sách "${book.title}" thành công!\nHạn trả: ${formatDateForDisplay(result.dueAt)}\nBạn nhận được 10 điểm thưởng.`,
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("[BookDetail] Borrow error:", error);

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
  }, [book, selectedDueDate, agreeToTerms, loadBookDetail]);

  // Handle toggle favorite - Optimistic update
  const handleToggleFavorite = useCallback(async () => {
    if (!book?.id) {
      Alert.alert("Lỗi", "Không có thông tin sách");
      return;
    }

    // Optimistic update: Cập nhật UI ngay lập tức
    const previousFavorite = isFavorite;
    const previousLikeCount = book.likeCount || 0;
    const newFavoriteState = !isFavorite;

    setIsFavorite(newFavoriteState);

    // Update likeCount optimistically
    setBook((prevBook) => {
      if (!prevBook) return prevBook;
      return {
        ...prevBook,
        likeCount: newFavoriteState
          ? (prevBook.likeCount || 0) + 1
          : Math.max(0, (prevBook.likeCount || 0) - 1),
      };
    });

    // Gọi API nền (không block UI)
    booksAPI.toggleFavorite(book.id)
      .then((result) => {
        console.log("[BookDetail] Toggle favorite result:", result);

        // Cập nhật state từ server response (để đảm bảo sync)
        if (result.isFavorite !== undefined) {
          setIsFavorite(result.isFavorite);
        }

        // Update book likeCount from server
        if (result.likeCount !== undefined) {
          setBook((prevBook) => {
            if (!prevBook) return prevBook;
            return {
              ...prevBook,
              likeCount: result.likeCount,
            };
          });
        }
      })
      .catch((error) => {
        console.error("[BookDetail] Toggle favorite error:", error);

        // Revert lại trạng thái cũ nếu có lỗi
        setIsFavorite(previousFavorite);
        setBook((prevBook) => {
          if (!prevBook) return prevBook;
          return {
            ...prevBook,
            likeCount: previousLikeCount,
          };
        });

        // Hiển thị thông báo lỗi
        let errorMessage = "Không thể cập nhật yêu thích. Vui lòng thử lại.";
        if (error.message) {
          if (error.message.includes("Unauthorized")) {
            errorMessage = "Vui lòng đăng nhập để yêu thích sách";
          } else {
            errorMessage = error.message;
          }
        }
        Alert.alert("Lỗi", errorMessage);
      });
  }, [book, isFavorite]);

  // Handle save/bookmark - Optimistic update
  const handleSave = useCallback(async () => {
    if (!book?.id) {
      Alert.alert("Lỗi", "Không có thông tin sách");
      return;
    }

    // Optimistic update: Cập nhật UI ngay lập tức
    const previousSaved = isSaved;
    const newSavedState = !isSaved;

    setIsSaved(newSavedState);

    // TODO: Gọi API save/bookmark nếu có
    // Tạm thời chỉ update UI, khi có API thì implement tương tự handleToggleFavorite
    // booksAPI.toggleSave(book.id)
    //   .then((result) => {
    //     if (result.isSaved !== undefined) {
    //       setIsSaved(result.isSaved);
    //     }
    //   })
    //   .catch((error) => {
    //     console.error("[BookDetail] Save error:", error);
    //     // Revert lại trạng thái cũ nếu có lỗi
    //     setIsSaved(previousSaved);
    //     Alert.alert("Lỗi", "Không thể lưu sách. Vui lòng thử lại.");
    //   });
  }, [book, isSaved]);

  // Prepare detail sections from book data
  const detailSections = useMemo(() => {
    if (!book) return [];

    console.log("[BookDetail] Preparing sections from book:", book);
    console.log("[BookDetail] book.description:", book.description);
    console.log("[BookDetail] book.desc:", book.desc);
    console.log("[BookDetail] book.summary:", book.summary);
    console.log("[BookDetail] book.content:", book.content);

    const sections = [];

    // 1. Danh mục/Thể loại section
    if (book.categories) {
      const categoriesArray = Array.isArray(book.categories) ? book.categories : [book.categories];
      if (categoriesArray.length > 0) {
        const categoriesText = categoriesArray.join(", ");
        sections.push({
          title: "Danh mục/Thể loại",
          content: categoriesText,
        });
      } else {
        sections.push({
          title: "Danh mục/Thể loại",
          content: "Không có",
        });
      }
    } else {
      sections.push({
        title: "Danh mục/Thể loại",
        content: "Không có",
      });
    }

    // 2. Mô tả section
    const description = book.description || book.desc || book.summary || book.content || book.overview;
    if (description && description.trim()) {
      sections.push({
        title: "Mô tả",
        content: description.trim(),
      });
    } else {
      sections.push({
        title: "Mô tả",
        content: "Không có",
      });
    }

    // 3. Thông tin chung section
    const generalInfo = [];
    if (book.publisher) {
      generalInfo.push(`• NXB: ${book.publisher}`);
    } else {
      generalInfo.push(`• NXB: Không có`);
    }

    const publishedYear = book.publicationYear || book.publishedYear;
    if (publishedYear) {
      generalInfo.push(`• Năm XB: ${publishedYear}`);
    } else {
      generalInfo.push(`• Năm XB: Không có`);
    }

    if (book.pages) {
      generalInfo.push(`• Trang: ${book.pages}`);
    } else {
      generalInfo.push(`• Trang: Không có`);
    }

    if (book.isbn) {
      generalInfo.push(`• ISBN: ${book.isbn}`);
    }

    sections.push({
      title: "Thông tin chung",
      content: generalInfo.join("\n"),
    });

    return sections;
  }, [book]);

  // Auto-open first section when book data is loaded
  useEffect(() => {
    if (book && detailSections && detailSections.length > 0 && !openSections.includes(0)) {
      setOpenSections([0]); // Open first section to show description
    }
  }, [book, detailSections]);

  const basePanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) =>
        Math.abs(gestureState.dx) > 12,
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx > 50) {
          onNavigate?.("back");
        }
      },
    })
  ).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) =>
        Math.abs(gestureState.dx) > 12,
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx > 50) {
          setShowSearchOverlay(false);
          Keyboard.dismiss();
        }
      },
    })
  ).current;

  return (
    <View
      style={[styles.container, { backgroundColor: colors.background }]}
      {...basePanResponder.panHandlers}
    >
      <StatusBar style={theme === "dark" ? "light" : "dark"} />

      {/* Header */}
      <View style={[styles.topBar, { backgroundColor: colors.headerBg }]}>
        <TouchableOpacity
          onPress={() => onNavigate?.("back")}
          style={styles.iconBtn}
        >
          <Ionicons name="chevron-back" size={22} color={colors.headerText} />
        </TouchableOpacity>
        <Text
          style={[styles.headerTitle, { color: colors.headerText }]}
          numberOfLines={1}
        >
          {strings.bookInfo || "Thông tin sách"}
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => setShowSearchOverlay(true)}
            style={styles.iconBtn}
          >
            <Ionicons name="search" size={20} color={colors.headerText} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons
              name="ellipsis-vertical"
              size={18}
              color={colors.headerText}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.buttonBg} />
          <Text style={[styles.loadingText, { color: colors.muted }]}>
            {strings.loading || "Đang tải..."}
          </Text>
        </View>
      ) : error && !book ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.muted} />
          <Text style={[styles.errorText, { color: colors.muted }]}>
            {error}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.buttonBg }]}
            onPress={loadBookDetail}
          >
            <Text style={[styles.retryButtonText, { color: colors.buttonText }]}>
              {strings.retry || "Thử lại"}
            </Text>
          </TouchableOpacity>
        </View>
      ) : book ? (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[
              styles.bookCard,
              { backgroundColor: colors.cardBg, borderColor: colors.inputBorder },
            ]}
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
              {book.coverImage ? (
                <Image
                  source={{ uri: book.coverImage }}
                  style={styles.coverImage}
                  resizeMode="cover"
                />
              ) : (
                <Ionicons name="book" size={42} color={colors.buttonBg} />
              )}
            </View>
            <Text style={[styles.bookTitle, { color: colors.text }]}>
              {book.title || "Không có tiêu đề"}
            </Text>
            <Text style={[styles.bookAuthor, { color: colors.muted }]}>
              {book.author || "Không có tác giả"}
            </Text>
            <View style={styles.tagRow}>
              {/* Số lượng bản in */}
              <View
                style={[
                  styles.tag,
                  {
                    backgroundColor: colors.inputBg,
                    borderColor: colors.inputBorder,
                  },
                ]}
              >
                <Text style={[styles.tagText, { color: colors.text }]}>
                  {book.availableCopies !== undefined
                    ? `${book.availableCopies} bản có sẵn`
                    : book.totalCopies !== undefined
                      ? `${book.totalCopies} bản in`
                      : "N/A"}
                </Text>
              </View>
              {/* Trạng thái yêu thích */}
              {isFavorite && (
                <View
                  style={[
                    styles.tag,
                    {
                      backgroundColor: "#fff3e0",
                      borderColor: "#f6c344",
                    },
                  ]}
                >
                  <Ionicons name="heart" size={12} color="#f6c344" style={{ marginRight: 4 }} />
                  <Text style={[styles.tagText, { color: "#f6c344" }]}>
                    {strings.favorited || "Đã yêu thích"}
                  </Text>
                </View>
              )}
              {/* Trạng thái đã lưu */}
              {isSaved && (
                <View
                  style={[
                    styles.tag,
                    {
                      backgroundColor: "#e3f2fd",
                      borderColor: colors.buttonBg,
                    },
                  ]}
                >
                  <Ionicons name="bookmark" size={12} color={colors.buttonBg} style={{ marginRight: 4 }} />
                  <Text style={[styles.tagText, { color: colors.buttonBg }]}>
                    {strings.saved || "Đã lưu"}
                  </Text>
                </View>
              )}
            </View>
            {isBorrowed && borrowDue && (
              <View style={styles.dueDateContainer}>
                <Ionicons name="calendar-outline" size={14} color={colors.muted} />
                <Text style={[styles.bookMetaCenter, { color: colors.muted, marginLeft: 4 }]}>
                  {strings.due || "Hạn trả"}: {borrowDue}
                </Text>
              </View>
            )}
            {book.categories && Array.isArray(book.categories) && book.categories.length > 0 && (
              <View style={styles.tagRow}>
                {book.categories.map((category, index) => (
                  <View
                    key={index}
                    style={[
                      styles.tag,
                      {
                        backgroundColor: colors.inputBg,
                        borderColor: colors.inputBorder,
                      },
                    ]}
                  >
                    <Text style={[styles.tagText, { color: colors.text }]}>
                      {category}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Actions */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[
                styles.actionChip,
                {
                  backgroundColor:
                    isBorrowed || (book.availableCopies === 0 || book.status === "không có sẵn")
                      ? colors.inputBg
                      : colors.buttonBg,
                  borderColor: colors.inputBorder,
                  borderWidth: isBorrowed || (book.availableCopies === 0 || book.status === "không có sẵn") ? 1 : 0,
                  opacity: isBorrowed || (book.availableCopies === 0 || book.status === "không có sẵn") ? 0.6 : 1,
                },
              ]}
              disabled={isBorrowed || borrowing || (book.availableCopies === 0 || book.status === "không có sẵn")}
              onPress={() => setShowBorrowSheet(true)}
            >
              <Ionicons
                name="library-outline"
                size={16}
                color={
                  isBorrowed || (book.availableCopies === 0 || book.status === "không có sẵn")
                    ? colors.text
                    : colors.buttonText
                }
              />
              <Text
                style={[
                  styles.actionText,
                  {
                    color:
                      isBorrowed || (book.availableCopies === 0 || book.status === "không có sẵn")
                        ? colors.text
                        : colors.buttonText
                  },
                ]}
              >
                {isBorrowed
                  ? strings.borrowed || "Đã mượn"
                  : (book.availableCopies === 0 || book.status === "không có sẵn")
                    ? strings.notAvailable || "Không có sẵn"
                    : strings.borrow || "Mượn"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.actionChip,
                {
                  backgroundColor: isFavorite ? "#f6c344" : colors.inputBg,
                  borderColor: colors.inputBorder,
                  borderWidth: 1,
                },
              ]}
              onPress={handleToggleFavorite}
            >
              <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={16}
                color={isFavorite ? "#1f1f1f" : colors.text}
              />
              <Text
                style={[
                  styles.actionText,
                  { color: isFavorite ? "#1f1f1f" : colors.text },
                ]}
              >
                {strings.favorite || "Yêu thích"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.actionChip,
                {
                  backgroundColor: isSaved ? colors.buttonBg : colors.inputBg,
                  borderColor: colors.inputBorder,
                  borderWidth: 1,
                },
              ]}
              onPress={handleSave}
            >
              <Ionicons
                name={isSaved ? "bookmark" : "bookmark-outline"}
                size={16}
                color={isSaved ? colors.buttonText : colors.text}
              />
              <Text
                style={[
                  styles.actionText,
                  { color: isSaved ? colors.buttonText : colors.text },
                ]}
              >
                {strings.save || "Lưu"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.actionChip,
                {
                  backgroundColor: colors.inputBg,
                  borderColor: colors.inputBorder,
                  borderWidth: 1,
                },
              ]}
            >
              <Ionicons name="share-outline" size={16} color={colors.text} />
              <Text style={[styles.actionText, { color: colors.text }]}>
                {strings.share || "Chia sẻ"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Sections */}
          {detailSections.length > 0 && (
            <View
              style={[
                styles.sectionCard,
                { backgroundColor: colors.cardBg, borderColor: colors.inputBorder },
              ]}
            >
              {detailSections.map((sec, idx) => {
                const open = openSections.includes(idx);
                return (
                  <TouchableOpacity
                    key={sec.title}
                    style={[
                      styles.sectionItem,
                      open && { backgroundColor: colors.inputBg },
                    ]}
                    activeOpacity={0.85}
                    onPress={() =>
                      setOpenSections((prev) =>
                        prev.includes(idx)
                          ? prev.filter((i) => i !== idx)
                          : [...prev, idx]
                      )
                    }
                  >
                    <View style={styles.sectionHeader}>
                      <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        {sec.title}
                      </Text>
                      <Ionicons
                        name={open ? "chevron-up" : "chevron-down"}
                        size={18}
                        color={colors.muted}
                      />
                    </View>
                    {open && (
                      <Text
                        style={[styles.sectionContent, { color: colors.muted }]}
                      >
                        {sec.content}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>
      ) : null}

      {!hideBottomNav && (
        <BottomNav
          activeKey="library"
          onChange={(key) => {
            if (key === "home") onNavigate?.("home");
            if (key === "library") onNavigate?.("back");
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
      )}

      {/* Borrow bottom sheet */}
      {showBorrowSheet && (
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

      {/* Full-screen search overlay */}
      {showSearchOverlay && (
        <KeyboardAvoidingView
          style={[styles.overlay, { backgroundColor: "rgba(0,0,0,0.45)" }]}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
        >
          <View style={styles.overlayCard}>
            <View
              style={[
                styles.overlayHeader,
                { paddingTop: Platform.OS === "ios" ? 44 : 20 },
              ]}
            >
              <TouchableOpacity
                style={styles.backBtn}
                onPress={() => {
                  setShowSearchOverlay(false);
                  Keyboard.dismiss();
                }}
                {...panResponder.panHandlers}
              >
                <Ionicons name="arrow-back" size={22} color={colors.text} />
              </TouchableOpacity>

              <View
                style={[
                  styles.overlaySearchBox,
                  {
                    backgroundColor: colors.cardBg,
                    borderColor: colors.inputBorder,
                  },
                ]}
              >
                <TextInput
                  style={[styles.overlaySearchInput, { color: colors.text }]}
                  value={search}
                  onChangeText={setSearch}
                  autoFocus
                  placeholder={strings.search || "Search"}
                  placeholderTextColor={colors.placeholder}
                  returnKeyType="search"
                  onSubmitEditing={() => {
                    if (search?.trim()) {
                      setRecentSearches((prev) =>
                        [
                          search.trim(),
                          ...prev.filter((p) => p !== search.trim()),
                        ].slice(0, 8)
                      );
                    }
                    Keyboard.dismiss();
                  }}
                />
                {search?.length === 0 && (
                  <Ionicons name="search" size={18} color={colors.muted} />
                )}
                {search?.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setSearch("")}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons
                      name="close-circle"
                      size={18}
                      color={colors.muted}
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <ScrollView
              style={styles.overlayList}
              contentContainerStyle={styles.overlayListContent}
              keyboardShouldPersistTaps="handled"
              {...panResponder.panHandlers}
            >
              <Text
                style={[
                  styles.dropdownTitle,
                  { color: colors.text, marginHorizontal: 8 },
                ]}
              >
                {strings.searchHistory || "Lịch sử tìm kiếm"}
              </Text>
              {recentSearches.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[styles.dropdownItem, { paddingHorizontal: 8 }]}
                  onPress={() => {
                    setSearch(item);
                    setShowSearchOverlay(false);
                    Keyboard.dismiss();
                  }}
                >
                  <Ionicons
                    name="time-outline"
                    size={16}
                    color={colors.muted}
                  />
                  <Text
                    style={[styles.dropdownText, { color: colors.text }]}
                    numberOfLines={1}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}
