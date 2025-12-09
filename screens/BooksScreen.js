import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNav from '../components/BottomNav';

const mockBooks = [
  {
    title: 'All The Light We Cannot See',
    author: 'Anthony Doerr',
    status: 'available',
    due: null,
  },
  {
    title: 'The Girl Who Drank The Moon',
    author: 'Kelly Barnhill',
    status: 'borrowed',
    due: '06/12/2025',
  },
  {
    title: 'Me Before You',
    author: 'Jojo Moyes',
    status: 'available',
    due: null,
  },
  {
    title: 'Pax Journey Home',
    author: 'Sara Pennypacker',
    status: 'borrowed',
    due: '06/12/2025',
  },
];

export default function BooksScreen({ theme, lang, strings, colors, onNavigate }) {
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('all'); // all | category | available

  const filtered = mockBooks.filter((b) => {
    if (tab === 'available' && b.status !== 'available') return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q);
    }
    return true;
  });

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
            onChangeText={setSearch}
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
      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {filtered.map((b) => (
          <TouchableOpacity
            key={b.title}
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
        ))}
      </ScrollView>

      <BottomNav
        activeKey="library"
        onChange={(key) => {
          if (key === 'home') onNavigate?.('home');
          if (key === 'settings') onNavigate?.('settings');
          // library: stay on this screen
        }}
        colors={colors}
        strings={{ ...strings, home: 'Home', library: strings.books || 'Sách', chats: 'Chats', settings: 'Settings' }}
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
      paddingBottom: 90,
      gap: 12,
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

