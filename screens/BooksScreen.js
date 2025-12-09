import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Platform, LayoutAnimation, UIManager, Animated } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import BottomNav from '../components/BottomNav';

const mockBooks = [
  { title: 'All The Light We Cannot See', author: 'Anthony Doerr', status: 'available', due: null },
  { title: 'The Girl Who Drank The Moon', author: 'Kelly Barnhill', status: 'borrowed', due: '06/12/2025' },
  { title: 'Me Before You', author: 'Jojo Moyes', status: 'available', due: null },
  { title: 'Pax Journey Home', author: 'Sara Pennypacker', status: 'borrowed', due: '06/12/2025' },
  { title: 'Atomic Habits', author: 'James Clear', status: 'available', due: null }, // Self-help
  { title: 'Sapiens', author: 'Yuval Noah Harari', status: 'available', due: null }, // History
  { title: 'The Pragmatic Programmer', author: 'Andrew Hunt', status: 'available', due: null }, // Tech
  { title: 'Clean Code', author: 'Robert C. Martin', status: 'borrowed', due: '10/12/2025' }, // Tech
  { title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', status: 'available', due: null }, // Psychology
  { title: 'The Hobbit', author: 'J.R.R. Tolkien', status: 'available', due: null }, // Fantasy
  { title: 'Dune', author: 'Frank Herbert', status: 'borrowed', due: '15/12/2025' }, // Sci-fi
  { title: 'Educated', author: 'Tara Westover', status: 'available', due: null }, // Memoir
  { title: 'Becoming', author: 'Michelle Obama', status: 'available', due: null }, // Biography
  { title: 'The Silent Patient', author: 'Alex Michaelides', status: 'borrowed', due: '20/12/2025' }, // Thriller
  { title: 'Norwegian Wood', author: 'Haruki Murakami', status: 'available', due: null }, // Literary
  { title: 'The Alchemist', author: 'Paulo Coelho', status: 'available', due: null }, // Philosophy/Fiction
  { title: 'How to Win Friends and Influence People', author: 'Dale Carnegie', status: 'available', due: null }, // Self-help
  { title: 'The Design of Everyday Things', author: 'Don Norman', status: 'available', due: null }, // Design
];

export default function BooksScreen({ theme, lang, strings, colors, onNavigate, searchValue = '', onChangeSearch }) {
  const styles = useMemo(() => createStyles(colors), [colors]);
  const search = searchValue;
  const [tab, setTab] = useState('all'); // all | category | available
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;
  const openRowRef = useRef(null);

  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  const filtered = mockBooks.filter((b) => {
    if (tab === 'available' && b.status !== 'available') return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q);
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const page = Math.min(currentPage, totalPages);
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [tab, search]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />

      {/* Header */}
      <View style={[styles.topBar, { backgroundColor: colors.headerBg }]}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={colors.muted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            value={search}
            onChangeText={onChangeSearch}
            placeholder={strings.search || 'Search'}
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
          { key: 'all', label: strings.all || 'Tất cả' },
          { key: 'category', label: strings.category || 'Thể loại' },
          { key: 'available', label: strings.available || 'Sẵn có' },
        ].map((item) => {
          const active = tab === item.key;
          return (
            <TouchableOpacity key={item.key} style={styles.tabItem} onPress={() => setTab(item.key)}>
              <Text style={[styles.tabText, { color: active ? colors.buttonBg : colors.text }]}>
                {item.label}
              </Text>
              {active && <View style={[styles.tabUnderline, { backgroundColor: colors.buttonBg }]} />}
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
          {pageData.map((b) => {
            const renderRightActions = (progress, dragX) => {
              const translateX = dragX.interpolate({
                inputRange: [-200, -50, 0],
                outputRange: [0, 75, 200],
                extrapolate: 'clamp',
              });
              return (
                <Animated.View style={[styles.swipeActions, { transform: [{ translateX }] }]}>
                  <TouchableOpacity style={[styles.swipeBtn, { backgroundColor: '#f0f0f0' }]}>
                    <Ionicons name="bookmark-outline" size={18} color={colors.text} />
                    <Text style={[styles.swipeText, { color: colors.text }]} numberOfLines={1}>
                      {strings.save || 'Lưu'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.swipeBtn, { backgroundColor: '#f6c344' }]}>
                    <Ionicons name="heart-outline" size={18} color="#1f1f1f" />
                    <Text style={[styles.swipeText, { color: '#1f1f1f' }]} numberOfLines={1}>
                      {strings.favorite || 'Thích'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.swipeBtn, { backgroundColor: colors.buttonBg }]}>
                    <Ionicons name="library-outline" size={18} color={colors.buttonText} />
                    <Text style={[styles.swipeText, { color: colors.buttonText }]} numberOfLines={1}>
                      {strings.borrow || 'Mượn'}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              );
            };

            return (
              <Swipeable
                key={b.title}
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
                  style={[styles.bookRow, { borderColor: colors.inputBorder }]}
                  activeOpacity={0.7}
                  onPress={() => onNavigate?.('bookDetail')}
                >
                  <View style={[styles.cover, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
                    <Ionicons name="book-outline" size={22} color={colors.buttonBg} />
                  </View>
                  <View style={styles.bookInfo}>
                    <Text style={[styles.bookTitle, { color: colors.text }]} numberOfLines={2}>
                      {b.title}
                    </Text>
                    <Text style={[styles.bookMeta, { color: colors.muted }]} numberOfLines={1}>
                      {b.author}
                    </Text>
                    <Text style={[styles.bookMeta, { color: b.status === 'available' ? '#2ecc71' : colors.muted }]}>
                      {b.status === 'available' ? (strings.available || 'Có sẵn') : strings.borrowed || 'Đã mượn'}
                    </Text>
                    {b.due && (
                      <Text style={[styles.bookMeta, { color: colors.muted }]}>
                        {strings.due || 'Hạn'}: {b.due}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              </Swipeable>
            );
          })}

          <View style={styles.paginationSpacer} />

          {/* Pagination */}
          <View style={styles.paginationRow}>
            <TouchableOpacity
              style={[
                styles.pageIconBtn,
                { borderColor: colors.inputBorder, backgroundColor: colors.cardBg, opacity: page <= 1 ? 0.5 : 1 },
              ]}
              disabled={page <= 1}
              onPress={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              <Ionicons name="chevron-back" size={18} color={colors.text} />
            </TouchableOpacity>

            <View style={[styles.pageInfoPill, { backgroundColor: colors.cardBg, borderColor: colors.inputBorder }]}>
              <Text style={[styles.pageInfoText, { color: colors.text }]}>
                {strings.page || 'Trang'} {page}/{totalPages}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.pageIconBtn,
                { borderColor: colors.inputBorder, backgroundColor: colors.cardBg, opacity: page >= totalPages ? 0.5 : 1 },
              ]}
              disabled={page >= totalPages}
              onPress={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              <Ionicons name="chevron-forward" size={18} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <BottomNav
        activeKey="library"
        onChange={(key) => {
          if (key === 'home') onNavigate?.('home');
          if (key === 'settings') onNavigate?.('settings');
          if (key === 'chats') onNavigate?.('chats');
          // library: stay on this screen
        }}
        colors={colors}
        strings={{ ...strings, home: 'Home', library: 'Library', chats: 'Chats', settings: 'Settings' }}
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
      paddingTop: Platform.OS === 'ios' ? 44 : 20,
      paddingHorizontal: 10,
      paddingBottom: 10,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    searchBox: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
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
      flexDirection: 'row',
      alignItems: 'flex-end',
      paddingHorizontal: 14,
      paddingVertical: 6,
      gap: 14,
      backgroundColor: colors.background,
    },
    tabItem: {
      alignItems: 'center',
      gap: 4,
    },
    tabText: {
      fontSize: 14,
      fontWeight: '700',
    },
    tabUnderline: {
      height: 2,
      width: '100%',
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
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      paddingVertical: 12,
      paddingHorizontal: 14,
    },
    pageIconBtn: {
      width: 36,
      height: 36,
      borderRadius: 10,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
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
      alignItems: 'center',
      justifyContent: 'center',
    },
    pageInfoText: {
      fontSize: 13,
      fontWeight: '700',
    },
    swipeActions: {
      width: 200,
      flexDirection: 'row',
      height: '100%',
    },
    swipeBtn: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      paddingHorizontal: 6,
    },
    swipeText: {
      fontSize: 11,
      fontWeight: '700',
      textAlign: 'center',
    },
    bookRow: {
      flexDirection: 'row',
      gap: 12,
      paddingVertical: 10,
      borderBottomWidth: 1,
    },
    cover: {
      width: 52,
      height: 68,
      borderRadius: 8,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    bookInfo: {
      flex: 1,
      gap: 2,
    },
    bookTitle: {
      fontSize: 14,
      fontWeight: '700',
    },
    bookMeta: {
      fontSize: 12,
      fontWeight: '500',
    },
  });

