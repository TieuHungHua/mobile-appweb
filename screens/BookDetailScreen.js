import { StatusBar } from 'expo-status-bar';
import { useMemo, useRef, useState, useEffect } from 'react';
import {
  StyleSheet,
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
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNav from '../components/BottomNav';
import { booksAPI } from '../utils/api/books';
import { borrowsAPI } from '../utils/api/borrows';
import { getStoredUserInfo } from '../utils/api';

export default function BookDetailScreen({ theme, lang, strings, colors, onNavigate, hideBottomNav = false, bookId }) {
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [search, setSearch] = useState('');
  const [showSearchOverlay, setShowSearchOverlay] = useState(false);
  const [recentSearches, setRecentSearches] = useState(['lịch sử tìm kiếm', 'Harry Potter', 'Kinh tế', 'Công nghệ AI']);
  const [openSections, setOpenSections] = useState([]);
  const [isBorrowed, setIsBorrowed] = useState(false);
  const [borrowDue, setBorrowDue] = useState(null);
  const [showBorrowSheet, setShowBorrowSheet] = useState(false);
  const [loading, setLoading] = useState(true);
  const [book, setBook] = useState(null);
  const [borrowing, setBorrowing] = useState(false);
  const [currentBorrow, setCurrentBorrow] = useState(null);

  const basePanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => Math.abs(gestureState.dx) > 12,
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx > 50) {
          onNavigate?.('back');
        }
      },
    })
  ).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => Math.abs(gestureState.dx) > 12,
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx > 50) {
          setShowSearchOverlay(false);
          Keyboard.dismiss();
        }
      },
    })
  ).current;

  // Handle borrow book
  const handleBorrow = async () => {
    if (!bookId || !book) return;

    try {
      setBorrowing(true);
      const userInfo = await getStoredUserInfo();
      if (!userInfo?.id) {
        Alert.alert(strings.error || 'Error', strings.loginRequired || 'Vui lòng đăng nhập');
        return;
      }

      // Calculate due date (14 days from now)
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);

      const borrowData = {
        bookId: bookId,
        dueAt: dueDate.toISOString(),
      };

      const result = await borrowsAPI.borrowBook(borrowData);
      
      setIsBorrowed(true);
      setCurrentBorrow(result);
      const day = String(dueDate.getDate()).padStart(2, '0');
      const month = String(dueDate.getMonth() + 1).padStart(2, '0');
      const year = dueDate.getFullYear();
      setBorrowDue(`${day}/${month}/${year}`);
      setShowBorrowSheet(false);

      // Refresh book data to update available copies
      const updatedBook = await booksAPI.getBookById(bookId);
      setBook(updatedBook);

      Alert.alert(
        strings.success || 'Success',
        strings.borrowSuccess || 'Mượn sách thành công'
      );
    } catch (error) {
      console.error('Error borrowing book:', error);
      Alert.alert(
        strings.error || 'Error',
        error.message || strings.borrowError || 'Không thể mượn sách'
      );
    } finally {
      setBorrowing(false);
    }
  };

  // Fetch book details and check borrow status
  useEffect(() => {
    if (!bookId) {
      setLoading(false);
      return;
    }

    const fetchBookDetails = async () => {
      try {
        setLoading(true);
        const bookData = await booksAPI.getBookById(bookId);
        setBook(bookData);

        // Check if user has borrowed this book
        const userInfo = await getStoredUserInfo();
        if (userInfo?.id) {
          try {
            const borrowsResponse = await borrowsAPI.getBorrows({ status: 'active' });
            const activeBorrow = borrowsResponse.data?.find((b) => b.bookId === bookId);
            if (activeBorrow) {
              setIsBorrowed(true);
              setCurrentBorrow(activeBorrow);
              const dueDate = new Date(activeBorrow.dueAt);
              const day = String(dueDate.getDate()).padStart(2, '0');
              const month = String(dueDate.getMonth() + 1).padStart(2, '0');
              const year = dueDate.getFullYear();
              setBorrowDue(`${day}/${month}/${year}`);
            }
          } catch (error) {
            console.error('Error checking borrow status:', error);
          }
        }
      } catch (error) {
        console.error('Error fetching book details:', error);
        Alert.alert(
          strings.error || 'Error',
          error.message || strings.bookNotFound || 'Không tìm thấy sách'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBookDetails();
  }, [bookId]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]} {...basePanResponder.panHandlers}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />

      {/* Header */}
      <View style={[styles.topBar, { backgroundColor: colors.headerBg }]}>
        <TouchableOpacity onPress={() => onNavigate?.('back')} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={22} color={colors.headerText} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.headerText }]} numberOfLines={1}>
          {strings.bookInfo || 'Thông tin sách'}
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => setShowSearchOverlay(true)} style={styles.iconBtn}>
            <Ionicons name="search" size={20} color={colors.headerText} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="ellipsis-vertical" size={18} color={colors.headerText} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.buttonBg} />
          <Text style={[styles.loadingText, { color: colors.muted }]}>{strings.loading || 'Đang tải...'}</Text>
        </View>
      ) : !book ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.muted} />
          <Text style={[styles.errorText, { color: colors.muted }]}>{strings.bookNotFound || 'Không tìm thấy sách'}</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={[styles.bookCard, { backgroundColor: colors.cardBg, borderColor: colors.inputBorder }]}>
            <View style={[styles.cover, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
              {book.coverImageUrl ? (
                <Image source={{ uri: book.coverImageUrl }} style={styles.coverImage} />
              ) : (
                <Ionicons name="book" size={42} color={colors.buttonBg} />
              )}
            </View>
            <Text style={[styles.bookTitle, { color: colors.text }]}>{book.title}</Text>
            <Text style={[styles.bookAuthor, { color: colors.muted }]}>{book.author}</Text>
            <View style={styles.tagRow}>
              <View
                style={[
                  styles.tag,
                  isBorrowed
                    ? { backgroundColor: '#fef4e6', borderColor: '#f39c12' }
                    : book.availableCopies > 0
                    ? { backgroundColor: '#e8f5e9', borderColor: '#2ecc71' }
                    : { backgroundColor: '#ffebee', borderColor: '#e74c3c' },
                ]}
              >
                <Text
                  style={[
                    styles.tagText,
                    { color: isBorrowed ? '#f39c12' : book.availableCopies > 0 ? '#2ecc71' : '#e74c3c' },
                  ]}
                >
                  {isBorrowed ? strings.borrowed || 'Đã mượn' : book.availableCopies > 0 ? strings.available || 'Available' : strings.unavailable || 'Hết sách'}
                </Text>
              </View>
              <View style={[styles.tag, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
                <Text style={[styles.tagText, { color: colors.text }]}>
                  {book.availableCopies || 0} / {book.totalCopies || 0} {strings.copies || 'bản'}
                </Text>
              </View>
            </View>
            {isBorrowed && borrowDue && (
              <Text style={[styles.bookMetaCenter, { color: colors.muted }]}>
                {strings.due || 'Hạn'}: {borrowDue}
              </Text>
            )}
            {book.categories && book.categories.length > 0 && (
              <View style={styles.tagRow}>
                {book.categories.map((cat, idx) => (
                  <View key={idx} style={[styles.tag, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
                    <Text style={[styles.tagText, { color: colors.text }]}>{cat}</Text>
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
              { backgroundColor: isBorrowed ? colors.inputBg : colors.buttonBg, borderColor: colors.inputBorder, borderWidth: isBorrowed ? 1 : 0 },
            ]}
            disabled={isBorrowed || book.availableCopies <= 0}
            onPress={() => setShowBorrowSheet(true)}
          >
            <Ionicons name="library-outline" size={16} color={isBorrowed ? colors.text : colors.buttonText} />
            <Text style={[styles.actionText, { color: isBorrowed ? colors.text : colors.buttonText }]}>
              {isBorrowed ? strings.borrowed || 'Đã mượn' : strings.borrow || 'Mượn'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionChip, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, borderWidth: 1 }]}>
            <Ionicons name="share-outline" size={16} color={colors.text} />
            <Text style={[styles.actionText, { color: colors.text }]}>{strings.share || 'Chia sẻ'}</Text>
          </TouchableOpacity>
        </View>

          {/* Sections */}
          <View style={[styles.sectionCard, { backgroundColor: colors.cardBg, borderColor: colors.inputBorder }]}>
            {book.categories && book.categories.length > 0 && (
              <TouchableOpacity
                style={[styles.sectionItem, openSections.includes('categories') && { backgroundColor: colors.inputBg }]}
                activeOpacity={0.85}
                onPress={() =>
                  setOpenSections((prev) =>
                    prev.includes('categories') ? prev.filter((i) => i !== 'categories') : [...prev, 'categories']
                  )
                }
              >
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>{strings.categories || 'Danh mục/Thể loại'}</Text>
                  <Ionicons name={openSections.includes('categories') ? 'chevron-up' : 'chevron-down'} size={18} color={colors.muted} />
                </View>
                {openSections.includes('categories') && (
                  <Text style={[styles.sectionContent, { color: colors.muted }]}>{book.categories.join(', ')}</Text>
                )}
              </TouchableOpacity>
            )}
            {book.description && (
              <TouchableOpacity
                style={[styles.sectionItem, openSections.includes('description') && { backgroundColor: colors.inputBg }]}
                activeOpacity={0.85}
                onPress={() =>
                  setOpenSections((prev) =>
                    prev.includes('description') ? prev.filter((i) => i !== 'description') : [...prev, 'description']
                  )
                }
              >
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>{strings.description || 'Mô tả'}</Text>
                  <Ionicons name={openSections.includes('description') ? 'chevron-up' : 'chevron-down'} size={18} color={colors.muted} />
                </View>
                {openSections.includes('description') && (
                  <Text style={[styles.sectionContent, { color: colors.muted }]}>{book.description}</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      )}

      {!hideBottomNav && (
        <BottomNav
          activeKey="library"
          onChange={(key) => {
            if (key === 'home') onNavigate?.('home');
            if (key === 'library') onNavigate?.('back');
            if (key === 'settings') onNavigate?.('settings');
            if (key === 'chats') onNavigate?.('chats');
          }}
          colors={colors}
          strings={{ ...strings, home: 'Home', library: 'Library', chats: 'Chats', settings: 'Settings' }}
        />
      )}

      {/* Borrow bottom sheet */}
      {showBorrowSheet && (
        <View style={[styles.sheetOverlay, { backgroundColor: 'rgba(0,0,0,0.45)' }]}>
          <View style={[styles.sheetCard, { backgroundColor: colors.cardBg, borderColor: colors.inputBorder }]}>
            <Text style={[styles.sheetTitle, { color: colors.text }]}>{strings.borrow || 'Mượn sách'}</Text>
            <Text style={[styles.sheetText, { color: colors.muted }]}>
              {strings.confirmBorrow || 'Bạn muốn mượn quyển sách này?'}
            </Text>
            <View style={styles.sheetActions}>
              <TouchableOpacity
                style={[styles.sheetBtn, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, borderWidth: 1 }]}
                onPress={() => setShowBorrowSheet(false)}
              >
                <Text style={[styles.sheetBtnText, { color: colors.text }]}>{strings.cancel || 'Hủy'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sheetBtn, { backgroundColor: colors.buttonBg, opacity: borrowing ? 0.6 : 1 }]}
                onPress={handleBorrow}
                disabled={borrowing}
              >
                {borrowing ? (
                  <ActivityIndicator size="small" color={colors.buttonText} />
                ) : (
                  <Text style={[styles.sheetBtnText, { color: colors.buttonText }]}>{strings.confirm || 'Xác nhận'}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Full-screen search overlay (reuse pattern from Home) */}
      {showSearchOverlay && (
        <KeyboardAvoidingView
          style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.45)' }]}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
        >
          <View style={styles.overlayCard}>
            <View style={[styles.overlayHeader, { paddingTop: Platform.OS === 'ios' ? 44 : 20 }]}>
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

              <View style={[styles.overlaySearchBox, { backgroundColor: colors.cardBg, borderColor: colors.inputBorder }]}>
                <TextInput
                  style={[styles.overlaySearchInput, { color: colors.text }]}
                  value={search}
                  onChangeText={setSearch}
                  autoFocus
                  placeholder={strings.search || 'Search'}
                  placeholderTextColor={colors.placeholder}
                  returnKeyType="search"
                  onSubmitEditing={() => {
                    if (search?.trim()) {
                      setRecentSearches((prev) => [search.trim(), ...prev.filter((p) => p !== search.trim())].slice(0, 8));
                    }
                    Keyboard.dismiss();
                  }}
                />
                {search?.length === 0 && <Ionicons name="search" size={18} color={colors.muted} />}
                {search?.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setSearch('')}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="close-circle" size={18} color={colors.muted} />
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
              <Text style={[styles.dropdownTitle, { color: colors.text, marginHorizontal: 8 }]}>
                {strings.searchHistory || 'Lịch sử tìm kiếm'}
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
                  <Ionicons name="time-outline" size={16} color={colors.muted} />
                  <Text style={[styles.dropdownText, { color: colors.text }]} numberOfLines={1}>
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

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    topBar: {
      paddingTop: Platform.OS === 'ios' ? 44 : 20,
      paddingHorizontal: 12,
      paddingBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    headerTitle: {
      flex: 1,
      textAlign: 'center',
      fontSize: 15,
      fontWeight: '700',
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    iconBtn: {
      padding: 6,
      minWidth: 32,
      alignItems: 'center',
    },
    searchBox: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.cardBg,
      borderRadius: 18,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      gap: 6,
      marginLeft: 8,
    },
    searchInput: {
      flex: 1,
      fontSize: 14,
    },
    content: {
      padding: 14,
      paddingBottom: 100,
      gap: 12,
    },
    bookCard: {
      alignItems: 'center',
      padding: 14,
      borderRadius: 12,
      borderWidth: 1,
      gap: 8,
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 1 },
      elevation: 1,
    },
    cover: {
      width: 96,
      height: 120,
      borderRadius: 8,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    bookTitle: {
      fontSize: 16,
      fontWeight: '700',
      textAlign: 'center',
    },
    bookAuthor: {
      fontSize: 13,
      fontWeight: '500',
    },
    tagRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      justifyContent: 'center',
    },
    tag: {
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 999,
      borderWidth: 1,
    },
    tagText: {
      fontSize: 12,
      fontWeight: '700',
    },
    actionRow: {
      flexDirection: 'row',
      gap: 10,
      justifyContent: 'center',
    },
    actionChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 12,
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 1 },
      elevation: 2,
    },
    actionText: {
      fontSize: 13,
      fontWeight: '700',
    },
    sectionCard: {
      borderRadius: 12,
      borderWidth: 1,
      padding: 6,
      gap: 6,
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 1 },
      elevation: 1,
    },
    sectionItem: {
      borderRadius: 10,
      paddingVertical: 8,
      paddingHorizontal: 10,
      borderWidth: 1,
      borderColor: 'transparent',
      marginVertical: 2,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '700',
    },
    sectionContent: {
      marginTop: 8,
      fontSize: 13,
      fontWeight: '500',
      lineHeight: 18,
    },
    bookMetaCenter: {
      fontSize: 12,
      fontWeight: '600',
      textAlign: 'center',
    },
    sheetOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 35,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingBottom: 0,
    },
    sheetCard: {
      borderRadius: 14,
      borderWidth: 1,
      padding: 16,
      gap: 10,
      shadowColor: '#000',
      shadowOpacity: 0.12,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 6,
      maxWidth: '92%',
      alignSelf: 'center',
    },
    sheetTitle: {
      fontSize: 15,
      fontWeight: '700',
    },
    sheetText: {
      fontSize: 13,
      fontWeight: '500',
      lineHeight: 18,
    },
    sheetActions: {
      flexDirection: 'row',
      gap: 10,
      justifyContent: 'flex-end',
      marginTop: 4,
    },
    sheetBtn: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 10,
      minWidth: 96,
      alignItems: 'center',
    },
    sheetBtnText: {
      fontSize: 13,
      fontWeight: '700',
    },
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 30,
      justifyContent: 'flex-start',
    },
    overlayCard: {
      flex: 1,
      borderRadius: 0,
      backgroundColor: colors.cardBg,
      borderWidth: 0,
      shadowColor: 'transparent',
      elevation: 0,
      overflow: 'hidden',
    },
    overlayHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingBottom: 10,
      gap: 10,
    },
    overlaySearchBox: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      borderWidth: 1,
      borderRadius: 22,
      paddingHorizontal: 12,
      paddingVertical: 8,
      gap: 8,
    },
    overlaySearchInput: {
      flex: 1,
      fontSize: 17,
    },
    overlayList: {
      flex: 1,
    },
    overlayListContent: {
      paddingVertical: 8,
      gap: 4,
    },
    dropdownTitle: {
      fontSize: 14,
      fontWeight: '700',
    },
    dropdownItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 6,
    },
    dropdownText: {
      fontSize: 14,
      fontWeight: '500',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 60,
      gap: 12,
    },
    loadingText: {
      fontSize: 16,
      fontWeight: '500',
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 60,
      gap: 12,
    },
    errorText: {
      fontSize: 16,
      fontWeight: '500',
      textAlign: 'center',
    },
    coverImage: {
      width: '100%',
      height: '100%',
      borderRadius: 8,
    },
  });

