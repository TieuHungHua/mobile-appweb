import { StatusBar } from 'expo-status-bar';
import { useMemo, useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, Platform, Image, PanResponder, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { borrowsAPI } from '../utils/api/borrows';
import { getStoredUserInfo } from '../utils/api';

// Mock data for favorites and saved (not implemented in backend yet)
const mockFavoriteBooks = [
  {
    id: 1,
    title: 'All The Light We Cannot See',
    author: 'Anthony Doerr',
    cover: null,
  },
  {
    id: 2,
    title: 'The Girl Who Drank The Moon',
    author: 'Kelly Barnhill',
    cover: null,
  },
  {
    id: 3,
    title: 'Atomic Habits',
    author: 'James Clear',
    cover: null,
  },
];

const mockSavedBooks = [
  {
    id: 1,
    title: 'Sapiens',
    author: 'Yuval Noah Harari',
    cover: null,
  },
  {
    id: 2,
    title: 'The Pragmatic Programmer',
    author: 'Andrew Hunt',
    cover: null,
  },
  {
    id: 3,
    title: 'Clean Code',
    author: 'Robert C. Martin',
    cover: null,
  },
];

export default function MyBookshelfScreen({ theme, lang, strings, colors, onNavigate, activeTab: propActiveTab, onTabChange }) {
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [activeTab, setActiveTab] = useState(propActiveTab || 'borrowed'); // 'borrowed', 'favorites', 'saved'
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Sync with prop if provided
  const currentTab = propActiveTab !== undefined ? propActiveTab : activeTab;
  const handleTabChange = (tab) => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setActiveTab(tab);
    }
  };

  // Fetch borrowed books
  const fetchBorrowedBooks = async () => {
    try {
      setRefreshing(true);
      const userInfo = await getStoredUserInfo();
      if (!userInfo?.id) {
        setBorrowedBooks([]);
        return;
      }

      // Fetch active and overdue borrows
      const [activeResponse, returnedResponse] = await Promise.all([
        borrowsAPI.getBorrows({ status: 'active', limit: 100 }),
        borrowsAPI.getBorrows({ status: 'overdue', limit: 100 }),
      ]);

      const allBorrows = [...(activeResponse.data || []), ...(returnedResponse.data || [])];
      
      // Transform borrows to book items with status
      const books = allBorrows.map((borrow) => {
        const dueDate = new Date(borrow.dueAt);
        const now = new Date();
        const daysLeft = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
        const isExpired = borrow.status === 'overdue' || daysLeft < 0;

        const day = String(dueDate.getDate()).padStart(2, '0');
        const month = String(dueDate.getMonth() + 1).padStart(2, '0');
        const year = dueDate.getFullYear();

        return {
          id: borrow.id,
          borrowId: borrow.id,
          bookId: borrow.book?.id || borrow.bookId,
          title: borrow.book?.title || 'Unknown',
          author: borrow.book?.author || 'Unknown',
          cover: null, // You can add coverImageUrl if available
          expirationDate: `${day}-${month}-${year}`,
          daysLeft,
          status: isExpired ? 'expired' : 'active',
          borrow: borrow, // Keep full borrow object for return/renew
        };
      });

      setBorrowedBooks(books);
    } catch (error) {
      console.error('Error fetching borrowed books:', error);
      Alert.alert(
        strings.error || 'Error',
        error.message || strings.loadError || 'Không thể tải danh sách sách đã mượn'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (currentTab === 'borrowed') {
      fetchBorrowedBooks();
    } else {
      setLoading(false);
    }
  }, [currentTab]);

  // Refresh when tab changes to borrowed
  useEffect(() => {
    if (currentTab === 'borrowed' && !loading) {
      fetchBorrowedBooks();
    }
  }, [currentTab]);

  // Pan responder for swipe back gesture
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return gestureState.dx > 12 && Math.abs(gestureState.dy) < Math.abs(gestureState.dx) && evt.nativeEvent.pageX < 20;
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx > 50) {
          onNavigate?.('settings');
        }
      },
    })
  ).current;

  const getFilteredBooks = () => {
    let books = [];
    if (currentTab === 'borrowed') {
      books = borrowedBooks;
    } else if (currentTab === 'favorites') {
      books = mockFavoriteBooks;
    } else if (currentTab === 'saved') {
      books = mockSavedBooks;
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return books.filter(
        (book) => book.title.toLowerCase().includes(query) || book.author.toLowerCase().includes(query)
      );
    }
    return books;
  };

  const handleRenew = async (borrowId) => {
    // Note: Backend doesn't have renew endpoint, so we'll show a message
    Alert.alert(
      strings.info || 'Info',
      strings.renewNotAvailable || 'Tính năng gia hạn chưa được hỗ trợ. Vui lòng liên hệ thủ thư để gia hạn.'
    );
  };

  const handleReturn = async (borrowId) => {
    Alert.alert(
      strings.confirm || 'Confirm',
      strings.confirmReturn || 'Bạn có chắc chắn muốn trả sách này?',
      [
        {
          text: strings.cancel || 'Hủy',
          style: 'cancel',
        },
        {
          text: strings.confirm || 'Xác nhận',
          onPress: async () => {
            try {
              await borrowsAPI.returnBook(borrowId);
              Alert.alert(
                strings.success || 'Success',
                strings.returnSuccess || 'Trả sách thành công'
              );
              fetchBorrowedBooks(); // Refresh list
            } catch (error) {
              console.error('Error returning book:', error);
              Alert.alert(
                strings.error || 'Error',
                error.message || strings.returnError || 'Không thể trả sách'
              );
            }
          },
        },
      ]
    );
  };

  const renderBookItem = (book) => {
    if (currentTab === 'borrowed') {
      const isExpired = book.status === 'expired' || book.daysLeft < 0;
      const statusColor = isExpired ? '#e74c3c' : book.daysLeft <= 3 ? '#f39c12' : '#2ecc71';
      const statusText = isExpired
        ? strings.expired || 'Hết hạn'
        : book.daysLeft === 1
        ? strings.oneDayLeft || '1 ngày nữa'
        : `${book.daysLeft} ${strings.daysLeft || 'ngày nữa'}`;

      return (
        <View key={book.id} style={[styles.bookItem, { backgroundColor: colors.cardBg, borderColor: colors.inputBorder }, isExpired && styles.expiredBookItem]}>
          <View style={[styles.bookCover, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
            {book.cover ? (
              <Image source={{ uri: book.cover }} style={styles.coverImage} />
            ) : (
              <Ionicons name="book-outline" size={32} color={colors.buttonBg} />
            )}
          </View>
          <View style={styles.bookDetails}>
            <Text style={[styles.bookTitle, { color: colors.text }]} numberOfLines={2}>
              {book.title}
            </Text>
            <Text style={[styles.bookAuthor, { color: colors.muted }]} numberOfLines={1}>
              {book.author}
            </Text>
            <Text style={[styles.expirationDate, { color: colors.muted }]}>
              {strings.expirationDate || 'Thời hạn'}: {book.expirationDate}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '20', borderColor: statusColor }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
            </View>
            {!isExpired ? (
              <View style={styles.actionButtonsRow}>
                <TouchableOpacity
                  style={[styles.renewButton, { backgroundColor: '#17a2b8' }]}
                  onPress={() => handleRenew(book.borrowId)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.renewButtonText, { color: '#fff' }]}>
                    {strings.renew || 'Gia hạn'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.returnButton, { backgroundColor: colors.buttonBg }]}
                  onPress={() => handleReturn(book.borrowId)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.returnButtonText, { color: colors.buttonText }]}>
                    {strings.return || 'Trả sách'}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.actionButtonsRow}>
                <View style={[styles.expiredButton, { backgroundColor: '#e74c3c' }]}>
                  <Text style={[styles.expiredButtonText, { color: '#fff' }]}>
                    {strings.expired || 'Hết hạn'}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.returnButton, { backgroundColor: colors.buttonBg }]}
                  onPress={() => handleReturn(book.borrowId)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.returnButtonText, { color: colors.buttonText }]}>
                    {strings.return || 'Trả sách'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      );
    } else {
      // Favorites and Saved tabs
      return (
        <TouchableOpacity
          key={book.id}
          style={[styles.bookItem, { backgroundColor: colors.cardBg, borderColor: colors.inputBorder }]}
          onPress={() => onNavigate?.('bookDetail', { bookId: book.bookId || book.id })}
          activeOpacity={0.7}
        >
          <View style={[styles.bookCover, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
            {book.cover ? (
              <Image source={{ uri: book.cover }} style={styles.coverImage} />
            ) : (
              <Ionicons name="book-outline" size={32} color={colors.buttonBg} />
            )}
          </View>
          <View style={styles.bookDetails}>
            <Text style={[styles.bookTitle, { color: colors.text }]} numberOfLines={2}>
              {book.title}
            </Text>
            <Text style={[styles.bookAuthor, { color: colors.muted }]} numberOfLines={1}>
              {book.author}
            </Text>
          </View>
        </TouchableOpacity>
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]} {...panResponder.panHandlers}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.headerBg }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => onNavigate?.('settings')}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={colors.headerText} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.headerText }]}>
          {strings.myBookshelf || 'Tủ sách của tôi'}
        </Text>
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => setShowSearch(!showSearch)}
          activeOpacity={0.7}
        >
          <Ionicons name={showSearch ? "close-outline" : "search-outline"} size={24} color={colors.headerText} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={[styles.tabsContainer, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          style={[styles.tab, currentTab === 'borrowed' && styles.activeTab]}
          onPress={() => handleTabChange('borrowed')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.tabText,
              { color: currentTab === 'borrowed' ? colors.buttonBg : colors.muted },
            ]}
          >
            {strings.borrowed || 'Đã mượn'}
          </Text>
          {currentTab === 'borrowed' && (
            <View style={[styles.tabIndicator, { backgroundColor: colors.buttonBg }]} />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, currentTab === 'favorites' && styles.activeTab]}
          onPress={() => handleTabChange('favorites')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.tabText,
              { color: currentTab === 'favorites' ? colors.buttonBg : colors.muted },
            ]}
          >
            {strings.favorites || 'Yêu thích'}
          </Text>
          {currentTab === 'favorites' && (
            <View style={[styles.tabIndicator, { backgroundColor: colors.buttonBg }]} />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, currentTab === 'saved' && styles.activeTab]}
          onPress={() => handleTabChange('saved')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.tabText,
              { color: currentTab === 'saved' ? colors.buttonBg : colors.muted },
            ]}
          >
            {strings.saved || 'Đã lưu'}
          </Text>
          {currentTab === 'saved' && (
            <View style={[styles.tabIndicator, { backgroundColor: colors.buttonBg }]} />
          )}
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      {showSearch && (
        <View style={[styles.searchContainer, { backgroundColor: colors.cardBg, borderColor: colors.inputBorder }]}>
          <Ionicons name="search-outline" size={20} color={colors.muted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={strings.searchBooks || 'Tìm kiếm sách...'}
            placeholderTextColor={colors.placeholder}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
              <Ionicons name="close-circle" size={20} color={colors.muted} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.buttonBg} />
          <Text style={[styles.loadingText, { color: colors.muted }]}>{strings.loading || 'Đang tải...'}</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            currentTab === 'borrowed' ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={fetchBorrowedBooks}
                colors={[colors.buttonBg]}
                tintColor={colors.buttonBg}
              />
            ) : undefined
          }
        >
          {getFilteredBooks().length > 0 ? (
            getFilteredBooks().map((book) => renderBookItem(book))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="book-outline" size={64} color={colors.muted} />
              <Text style={[styles.emptyText, { color: colors.muted }]}>
                {currentTab === 'borrowed'
                  ? strings.noBorrowedBooks || 'Chưa có sách đã mượn'
                  : currentTab === 'favorites'
                  ? strings.noFavoriteBooks || 'Chưa có sách yêu thích'
                  : strings.noSavedBooks || 'Chưa có sách đã lưu'}
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      paddingTop: Platform.OS === 'ios' ? 44 : 20,
      paddingHorizontal: 16,
      paddingBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    backButton: {
      padding: 4,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '700',
      flex: 1,
      textAlign: 'center',
    },
    searchButton: {
      padding: 4,
    },
    tabsContainer: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.inputBorder,
    },
    tab: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 12,
      position: 'relative',
    },
    activeTab: {
      // Active tab styling
    },
    tabText: {
      fontSize: 15,
      fontWeight: '600',
    },
    tabIndicator: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 3,
      borderRadius: 2,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 16,
      marginVertical: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 10,
      borderWidth: 1,
      gap: 8,
    },
    searchInput: {
      flex: 1,
      fontSize: 14,
    },
    content: {
      padding: 16,
      paddingBottom: 30,
      gap: 12,
    },
    bookItem: {
      flexDirection: 'row',
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      gap: 12,
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    bookCover: {
      width: 80,
      height: 110,
      borderRadius: 8,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    coverImage: {
      width: '100%',
      height: '100%',
      borderRadius: 8,
    },
    bookDetails: {
      flex: 1,
      gap: 6,
    },
    bookTitle: {
      fontSize: 16,
      fontWeight: '700',
    },
    bookAuthor: {
      fontSize: 13,
      fontWeight: '500',
    },
    expirationDate: {
      fontSize: 12,
      marginTop: 4,
    },
    statusBadge: {
      alignSelf: 'flex-start',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      borderWidth: 1,
      marginTop: 4,
    },
    statusText: {
      fontSize: 11,
      fontWeight: '600',
    },
    renewButton: {
      marginTop: 8,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignItems: 'center',
    },
    renewButtonText: {
      fontSize: 14,
      fontWeight: '600',
    },
    expiredButton: {
      marginTop: 8,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignItems: 'center',
    },
    expiredButtonText: {
      fontSize: 14,
      fontWeight: '600',
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 60,
      gap: 12,
    },
    emptyText: {
      fontSize: 16,
      fontWeight: '500',
      textAlign: 'center',
    },
    expiredBookItem: {
      opacity: 0.6,
    },
    divider: {
      height: 1,
      marginVertical: 16,
      marginHorizontal: 4,
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
    actionButtonsRow: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 8,
    },
    returnButton: {
      flex: 1,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignItems: 'center',
    },
    returnButtonText: {
      fontSize: 14,
      fontWeight: '600',
    },
  });

