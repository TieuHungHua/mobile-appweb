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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BottomNav from "../../components/BottomNav";
import { createStyles } from "./BookDetail.styles";
import { booksAPI } from "../../utils/api";

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
              <View
                style={[
                  styles.tag,
                  isBorrowed || (book.status === "không có sẵn" || book.availableCopies === 0)
                    ? { backgroundColor: "#fef4e6", borderColor: "#f39c12" }
                    : { backgroundColor: "#e8f5e9", borderColor: "#2ecc71" },
                ]}
              >
                <Text
                  style={[
                    styles.tagText,
                    { color: isBorrowed || (book.status === "không có sẵn" || book.availableCopies === 0) ? "#f39c12" : "#2ecc71" },
                  ]}
                >
                  {isBorrowed
                    ? strings.borrowed || "Đã mượn"
                    : book.status === "có sẵn" || book.availableCopies > 0
                    ? strings.available || "Có sẵn"
                    : strings.borrowed || "Không có sẵn"}
                </Text>
              </View>
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
                    : book.status || "N/A"}
                </Text>
              </View>
            </View>
            {isBorrowed && borrowDue && (
              <Text style={[styles.bookMetaCenter, { color: colors.muted }]}>
                {strings.due || "Hạn"}: {borrowDue}
              </Text>
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
                backgroundColor: isBorrowed ? colors.inputBg : colors.buttonBg,
                borderColor: colors.inputBorder,
                borderWidth: isBorrowed ? 1 : 0,
              },
            ]}
            disabled={isBorrowed}
            onPress={() => setShowBorrowSheet(true)}
          >
            <Ionicons
              name="library-outline"
              size={16}
              color={isBorrowed ? colors.text : colors.buttonText}
            />
            <Text
              style={[
                styles.actionText,
                { color: isBorrowed ? colors.text : colors.buttonText },
              ]}
            >
              {isBorrowed
                ? strings.borrowed || "Đã mượn"
                : strings.borrow || "Mượn"}
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
          <View
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
              {strings.confirmBorrow || "Bạn muốn mượn quyển sách này?"}
            </Text>
            <View style={styles.sheetActions}>
              <TouchableOpacity
                style={[
                  styles.sheetBtn,
                  {
                    backgroundColor: colors.inputBg,
                    borderColor: colors.inputBorder,
                    borderWidth: 1,
                  },
                ]}
                onPress={() => setShowBorrowSheet(false)}
              >
                <Text style={[styles.sheetBtnText, { color: colors.text }]}>
                  {strings.cancel || "Hủy"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sheetBtn, { backgroundColor: colors.buttonBg }]}
                onPress={() => {
                  setIsBorrowed(true);
                  setBorrowDue("06/12/2025");
                  setShowBorrowSheet(false);
                }}
              >
                <Text
                  style={[styles.sheetBtnText, { color: colors.buttonText }]}
                >
                  {strings.confirm || "Xác nhận"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
