import { StatusBar } from 'expo-status-bar';
import { useMemo, useRef, useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNav from '../components/BottomNav';

const bookMock = {
  title: 'All The Light We Cannot See',
  author: 'Anthony Doerr',
  status: 'available',
  copies: '2 of 5 copies',
  tags: ['Historical', 'Fiction'],
  categories: ['Văn học', 'Hư cấu'],
};

const detailSections = [
    { title: 'Danh mục/Thể loại', content: 'Tiểu thuyết lịch sử, Hư cấu, Văn học hiện đại' },
    { title: 'Mô tả', content: 'Một cô gái mù người Pháp và một cậu bé người Đức trong Thế chiến II.' },
    { title: 'Thông tin chung', content: '• NXB: Scribner\n• Năm XB: 2014\n• Trang: 531' },
];

export default function BookDetailScreen({ theme, lang, strings, colors, onNavigate }) {
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [search, setSearch] = useState('');
  const [showSearchOverlay, setShowSearchOverlay] = useState(false);
  const [recentSearches, setRecentSearches] = useState(['lịch sử tìm kiếm', 'Harry Potter', 'Kinh tế', 'Công nghệ AI']);
  const [openSections, setOpenSections] = useState([]);

  const basePanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => Math.abs(gestureState.dx) > 12,
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx > 50) {
          onNavigate?.('library');
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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]} {...basePanResponder.panHandlers}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />

      {/* Header */}
      <View style={[styles.topBar, { backgroundColor: colors.headerBg }]}>
        <TouchableOpacity onPress={() => onNavigate?.('library')} style={styles.iconBtn}>
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
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.bookCard, { backgroundColor: colors.cardBg, borderColor: colors.inputBorder }]}>
          <View style={[styles.cover, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
            <Ionicons name="book" size={42} color={colors.buttonBg} />
          </View>
          <Text style={[styles.bookTitle, { color: colors.text }]}>{bookMock.title}</Text>
          <Text style={[styles.bookAuthor, { color: colors.muted }]}>{bookMock.author}</Text>
          <View style={styles.tagRow}>
            <View style={[styles.tag, { backgroundColor: '#e8f5e9', borderColor: '#2ecc71' }]}>
              <Text style={[styles.tagText, { color: '#2ecc71' }]}>{strings.available || 'Available'}</Text>
            </View>
            <View style={[styles.tag, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
              <Text style={[styles.tagText, { color: colors.text }]}>{bookMock.copies}</Text>
            </View>
          </View>
          <View style={styles.tagRow}>
            {bookMock.tags.map((t) => (
              <View key={t} style={[styles.tag, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
                <Text style={[styles.tagText, { color: colors.text }]}>{t}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={[styles.actionChip, { backgroundColor: colors.buttonBg }]}>
            <Ionicons name="library-outline" size={16} color={colors.buttonText} />
            <Text style={[styles.actionText, { color: colors.buttonText }]}>{strings.borrow || 'Mượn'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionChip, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, borderWidth: 1 }]}>
            <Ionicons name="share-outline" size={16} color={colors.text} />
            <Text style={[styles.actionText, { color: colors.text }]}>{strings.share || 'Chia sẻ'}</Text>
          </TouchableOpacity>
        </View>

        {/* Sections */}
        <View style={[styles.sectionCard, { backgroundColor: colors.cardBg, borderColor: colors.inputBorder }]}>
          {detailSections.map((sec, idx) => {
            const open = openSections.includes(idx);
            return (
              <TouchableOpacity
                key={sec.title}
                style={[styles.sectionItem, open && { backgroundColor: colors.inputBg }]}
                activeOpacity={0.85}
                onPress={() =>
                  setOpenSections((prev) =>
                    prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
                  )
                }
              >
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>{sec.title}</Text>
                  <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={colors.muted} />
                </View>
                {open && (
                  <Text style={[styles.sectionContent, { color: colors.muted }]}>{sec.content}</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <BottomNav
        activeKey="library"
        onChange={(key) => {
          if (key === 'home') onNavigate?.('home');
          if (key === 'library') onNavigate?.('library');
          if (key === 'settings') onNavigate?.('settings');
        }}
        colors={colors}
        strings={{ ...strings, home: 'Home', library: strings.books || 'Sách', chats: 'Chats', settings: 'Settings' }}
      />

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
  });

