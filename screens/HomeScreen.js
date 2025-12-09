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
import SettingsPanel from '../components/SettingsPanel';

const mockFeatured = [
    { title: 'Cây cam ngọt của tôi' },
    { title: 'Harry Potter' },
    { title: 'Doraemon' },
    { title: 'Sherlock Holmes' },
];

const mockReading = [
    { title: 'Sapiens', progress: 0.55 },
    { title: 'Atomic Habits', progress: 0.32 },
];

const mockMonthlyStats = [
    { month: 'T1', borrowed: 8, returned: 6 },
    { month: 'T2', borrowed: 10, returned: 9 },
    { month: 'T3', borrowed: 7, returned: 5 },
    { month: 'T4', borrowed: 12, returned: 11 },
    { month: 'T5', borrowed: 9, returned: 7 },
];

const mockQuickActions = [
    { icon: 'qr-code-outline', labelKey: 'quickScan' },
    { icon: 'cloud-download-outline', labelKey: 'quickDownload' },
    { icon: 'pricetag-outline', labelKey: 'quickPromo' },
    { icon: 'star-outline', labelKey: 'quickFavorite' },
];

export default function HomeScreen({ theme, lang, strings, colors, onNavigate, onToggleTheme, onSelectLanguage }) {
    const styles = useMemo(() => createStyles(colors), [colors]);
    const [search, setSearch] = useState('');
    const [showSearchOverlay, setShowSearchOverlay] = useState(false);
    const [recentSearches, setRecentSearches] = useState(['lịch sử tìm kiếm', 'Harry Potter', 'Kinh tế', 'Công nghệ AI']);

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
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />

            {/* Top bar */}
            <View style={[styles.topBar, { backgroundColor: colors.headerBg }]}>
                <View style={styles.topLeft}>
                    <Ionicons name="menu-outline" size={24} color={colors.headerText} />
                    <View style={styles.searchBox}>
                        {!showSearchOverlay && <Ionicons name="search" size={18} color={colors.muted} />}
                        <TextInput
                            style={[styles.searchInput, { color: colors.text }]}
                            value={search}
                            onChangeText={setSearch}
                            onFocus={() => setShowSearchOverlay(true)}
                            placeholder={strings.search || 'Search'}
                            placeholderTextColor={colors.placeholder}
                            returnKeyType="search"
                            onSubmitEditing={() => Keyboard.dismiss()}
                        />
                    </View>
                </View>
                <View style={styles.topRight}>
                    <Ionicons name="notifications-outline" size={22} color={colors.headerText} />
                    <Ionicons name="person-circle-outline" size={28} color={colors.headerText} />
                </View>
            </View>

            {/* Content */}
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Quick actions */}
                <View style={[styles.quickCard, { backgroundColor: colors.cardBg, borderColor: colors.inputBorder }]}>
                    <View style={styles.quickRow}>
                        {mockQuickActions.map((qa) => (
                            <TouchableOpacity key={qa.label} style={styles.quickItem} activeOpacity={0.8}>
                                <View style={[styles.quickIcon, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
                                    <Ionicons name={qa.icon} size={18} color={colors.buttonBg} />
                                </View>
                                <Text style={[styles.quickLabel, { color: colors.text }]} numberOfLines={1}>
                                    {strings?.[qa.labelKey] || qa.labelKey}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Info & stats */}
                <View style={[styles.card, { backgroundColor: colors.cardBg }]}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>{strings.yourInfo || 'Thông tin của bạn'}</Text>
                    <Text style={[styles.cardText, { color: colors.text }]}>"Xin chào, Quang Minh 👋👋"</Text>
                    <View style={styles.statsRow}>
                        <View style={[styles.statBox, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
                            <Ionicons name="book-outline" size={18} color={colors.buttonBg} />
                            <Text style={[styles.statNumber, { color: colors.text }]}>3</Text>
                            <Text style={[styles.statLabel, { color: colors.muted }]}>{strings.borrowed || 'Đã mượn'}</Text>
                        </View>
                        <View style={[styles.statBox, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
                            <Ionicons name="time-outline" size={18} color="#e67e22" />
                            <Text style={[styles.statNumber, { color: colors.text }]}>1</Text>
                            <Text style={[styles.statLabel, { color: colors.muted }]}>{strings.overdue || 'Quá hạn'}</Text>
                        </View>
                    </View>
                </View>

                {/* Monthly chart */}
                <View style={[styles.card, { backgroundColor: colors.cardBg }]}>
                    <View style={styles.cardHeaderRow}>
                        <Text style={[styles.cardTitle, { color: colors.text }]}>{strings.monthly || 'Thống kê theo tháng'}</Text>
                        <View style={styles.legendRow}>
                            <View style={[styles.legendDot, { backgroundColor: colors.buttonBg }]} />
                            <Text style={[styles.legendText, { color: colors.text }]}>{strings.borrowed || 'Mượn'}</Text>
                            <View style={[styles.legendDot, { backgroundColor: '#f1c40f' }]} />
                            <Text style={[styles.legendText, { color: colors.text }]}>{strings.returned || 'Trả'}</Text>
                        </View>
                    </View>
                    <View style={styles.chartRow}>
                        {mockMonthlyStats.map((m) => {
                            const maxVal = 12;
                            const borrowHeight = (m.borrowed / maxVal) * 80 + 6;
                            const returnHeight = (m.returned / maxVal) * 80 + 6;
                            return (
                                <View key={m.month} style={styles.chartCol}>
                                    <View style={styles.barGroup}>
                                        <View style={[styles.bar, { height: borrowHeight, backgroundColor: colors.buttonBg }]} />
                                        <View style={[styles.bar, { height: returnHeight, backgroundColor: '#f1c40f' }]} />
                                    </View>
                                    <Text style={[styles.chartLabel, { color: colors.text }]}>{m.month}</Text>
                                </View>
                            );
                        })}
                    </View>
                </View>

                {/* Categories */}
                <View style={[styles.card, { backgroundColor: colors.cardBg }]}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>{strings.categories || 'Thể loại sách'}</Text>
                    <View style={styles.chipsRow}>
                        {[
                            { label: 'Tiểu thuyết', color: '#2ecc71' },
                            { label: 'Kinh tế', color: '#f1c40f' },
                            { label: 'Khoa học', color: '#3498db' },
                            { label: 'Công nghệ', color: '#e74c3c' },
                            { label: 'Phổ biến', color: '#9b59b6' },
                        ].map((item) => (
                            <View key={item.label} style={[styles.chip, { borderColor: item.color }]}>
                                <View style={[styles.dot, { backgroundColor: item.color }]} />
                                <Text style={[styles.chipText, { color: colors.text }]}>{item.label}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Reading list */}
                <View style={[styles.card, { backgroundColor: colors.cardBg }]}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>{strings.reading || 'Đang đọc'}</Text>
                    {mockReading.map((item) => (
                        <View key={item.title} style={styles.readingRow}>
                            <View style={[styles.readingIcon, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
                                <Ionicons name="book-outline" size={16} color={colors.buttonBg} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.readingTitle, { color: colors.text }]} numberOfLines={1}>
                                    {item.title}
                                </Text>
                                <View style={[styles.progressBar, { backgroundColor: colors.inputBg }]}>
                                    <View style={[styles.progressFill, { width: `${Math.floor(item.progress * 100)}%`, backgroundColor: colors.buttonBg }]} />
                                </View>
                            </View>
                            <Text style={[styles.progressText, { color: colors.muted }]}>{Math.floor(item.progress * 100)}%</Text>
                        </View>
                    ))}
                </View>

                {/* Featured books */}
                <View style={[styles.card, { backgroundColor: colors.cardBg }]}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>{strings.featured || 'Sách nổi bật'}</Text>
                    <View style={styles.coversRow}>
                        {mockFeatured.map((b, idx) => (
                            <View key={idx} style={styles.coverItem}>
                                <View style={[styles.coverPlaceholder, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]} />
                                <Text style={[styles.coverLabel, { color: colors.text }]} numberOfLines={1}>
                                    {b.title}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>

            <BottomNav
                activeKey="home"
                onChange={(key) => {
                    if (key === 'settings') {
                        onNavigate?.('settings');
                    }
                }}
                colors={colors}
                strings={{ ...strings, home: 'Home', library: 'Library', chats: 'Chats', settings: 'Settings' }}
            />

            {/* Full-screen search overlay */}
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
            paddingTop: Platform.OS === 'ios' ? 44 : 20, // dư ra cho tai thỏ
            paddingHorizontal: 12,
            paddingBottom: 10,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
        },
        topLeft: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            flex: 1,
        },
        searchBox: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.cardBg,
            borderRadius: 20,
            paddingHorizontal: 10,
            paddingVertical: 6,
            flex: 1,
            gap: 6,
        },
        searchInput: {
            flex: 1,
            fontSize: 14,
        },
        dropdownTitle: {
            fontSize: 13,
            fontWeight: '700',
        },
        dropdownItem: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            paddingVertical: 6,
        },
        dropdownText: {
            fontSize: 13,
            fontWeight: '500',
        },
        overlay: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 20,
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
        backBtn: {
            padding: 6,
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
            fontSize: 16,
        },
        overlayList: {
            flex: 1,
        },
        overlayListContent: {
            paddingVertical: 8,
            gap: 4,
        },
        topRight: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            paddingLeft: 4,
        },
        content: {
            padding: 16,
            paddingBottom: 180, // chừa không gian cho FAB settings + nav
            gap: 12,
        },
        card: {
            borderRadius: 14,
            padding: 14,
            borderWidth: 0,
            gap: 8,
            shadowColor: '#000',
            shadowOpacity: 0.08,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 2 },
            elevation: 2,
        },
        cardTitle: {
            fontSize: 14,
            fontWeight: '700',
        },
        cardText: {
            fontSize: 13,
            fontWeight: '500',
        },
        quickCard: {
            borderRadius: 14,
            paddingVertical: 10,
            paddingHorizontal: 8,
            borderWidth: 1,
            shadowColor: '#000',
            shadowOpacity: 0.05,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 1 },
            elevation: 1,
        },
        quickRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 8,
        },
        quickItem: {
            flex: 1,
            alignItems: 'center',
            gap: 6,
        },
        quickIcon: {
            width: 42,
            height: 42,
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
        },
        quickLabel: {
            fontSize: 11,
            fontWeight: '600',
        },
        statsRow: {
            flexDirection: 'row',
            gap: 12,
        },
        statBox: {
            flex: 1,
            padding: 12,
            borderRadius: 12,
            borderWidth: 1,
            gap: 4,
        },
        statNumber: {
            fontSize: 20,
            fontWeight: '700',
        },
        statLabel: {
            fontSize: 12,
            fontWeight: '600',
        },
        cardHeaderRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 4,
        },
        legendRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
        },
        legendDot: {
            width: 10,
            height: 10,
            borderRadius: 5,
        },
        legendText: {
            fontSize: 12,
            fontWeight: '600',
        },
        chartRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            gap: 12,
            paddingTop: 6,
        },
        chartCol: {
            alignItems: 'center',
            justifyContent: 'flex-end',
            flex: 1,
            gap: 6,
        },
        barGroup: {
            flexDirection: 'row',
            alignItems: 'flex-end',
            gap: 4,
        },
        bar: {
            width: 12,
            borderRadius: 4,
        },
        chartLabel: {
            fontSize: 11,
            fontWeight: '600',
        },
        chipsRow: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
        },
        chip: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 10,
            borderWidth: 1,
        },
        dot: {
            width: 8,
            height: 8,
            borderRadius: 4,
        },
        chipText: {
            fontSize: 12,
            fontWeight: '600',
        },
        coversRow: {
            flexDirection: 'row',
            gap: 10,
            marginTop: 8,
        },
        coverItem: {
            width: 60,
            alignItems: 'center',
            gap: 4,
        },
        coverPlaceholder: {
            width: 60,
            height: 80,
            borderRadius: 8,
            borderWidth: 1,
        },
        coverLabel: {
            fontSize: 11,
            textAlign: 'center',
        },
    });

