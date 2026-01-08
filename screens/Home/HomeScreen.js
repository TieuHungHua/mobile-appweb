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
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BottomNav from "../../components/BottomNav";
import SettingsPanel from "../../components/SettingsPanel";
import { createStyles } from "./Home.styles";
import { notificationsAPI, userAPI, getStoredUserInfo } from "../../utils/api";
import {
  mockFeatured,
  mockReading,
  mockMonthlyStats,
  mockQuickActions,
  CATEGORIES,
  INITIAL_RECENT_SEARCHES,
  CHART_CONFIG,
  STAT_INITIAL,
  GREETING,
  mockRewardPoints,
  mockForYou,
} from "./Home.mock";

export default function HomeScreen({
  theme,
  lang,
  strings,
  colors,
  onNavigate,
  onToggleTheme,
  onSelectLanguage,
}) {
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [search, setSearch] = useState("");
  const [showSearchOverlay, setShowSearchOverlay] = useState(false);
  const [recentSearches, setRecentSearches] = useState(INITIAL_RECENT_SEARCHES);
  const [unreadCount, setUnreadCount] = useState(0);

  // Student stats state
  const [monthlyStats, setMonthlyStats] = useState([]); // Array of 5 months
  const [activityScore, setActivityScore] = useState(0);
  const [popularBooks, setPopularBooks] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [userName, setUserName] = useState("");

  // Current month stats (for display in info card)
  const currentMonthStats = useMemo(() => {
    if (monthlyStats.length === 0) {
      return { borrowCount: 0, overdueCount: 0 };
    }
    // First item is the current month
    return monthlyStats[0] || { borrowCount: 0, overdueCount: 0 };
  }, [monthlyStats]);

  // Calculate rank from activityScore
  // Đồng: 0-99, Bạc: 100-299, Vàng: 300-499, Bạch Kim: 500+
  const rankInfo = useMemo(() => {
    const score = activityScore || 0;
    let rank = "Đồng";
    let rankIcon = "medal-outline";
    let rankColor = "#cd7f32"; // Bronze color
    let minPoints = 0;
    let maxPoints = 99;
    let nextRank = "Bạc";
    let nextRankPoints = 100;

    if (score >= 500) {
      rank = "Bạch Kim";
      rankIcon = "diamond-outline";
      rankColor = "#e5e4e2"; // Platinum color
      minPoints = 500;
      maxPoints = Infinity;
      nextRank = null; // Highest rank
      nextRankPoints = null;
    } else if (score >= 300) {
      rank = "Vàng";
      rankIcon = "trophy-outline";
      rankColor = "#f1c40f"; // Gold color
      minPoints = 300;
      maxPoints = 499;
      nextRank = "Bạch Kim";
      nextRankPoints = 500;
    } else if (score >= 100) {
      rank = "Bạc";
      rankIcon = "medal-outline";
      rankColor = "#c0c0c0"; // Silver color
      minPoints = 100;
      maxPoints = 299;
      nextRank = "Vàng";
      nextRankPoints = 300;
    } else {
      rank = "Đồng";
      rankIcon = "medal-outline";
      rankColor = "#cd7f32"; // Bronze color
      minPoints = 0;
      maxPoints = 99;
      nextRank = "Bạc";
      nextRankPoints = 100;
    }

    // Calculate progress within current rank
    const progress = nextRankPoints
      ? (score - minPoints) / (nextRankPoints - minPoints)
      : 1; // 100% if at highest rank
    const progressPercent = Math.min(Math.max(progress, 0), 1);

    // Points needed for next rank
    const pointsNeeded = nextRankPoints ? nextRankPoints - score : 0;

    return {
      rank,
      rankIcon,
      rankColor,
      progress: progressPercent,
      nextRank,
      nextRankPoints,
      pointsNeeded,
    };
  }, [activityScore]);

  // Load unread notifications count
  const loadUnreadCount = useCallback(async () => {
    try {
      const res = await notificationsAPI.getUnreadCount();
      const count = res.count || res.data?.count || 0;
      setUnreadCount(count);
    } catch (err) {
      console.error("[Home] Load unread count error:", err);
      // Silently fail, don't show error to user
      setUnreadCount(0); // Set to 0 on error
    }
  }, []);

  // Load student stats
  const loadStudentStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const res = await userAPI.getStudentStats();

      // Update monthly stats (array of 5 months)
      if (res.monthlyStats && Array.isArray(res.monthlyStats)) {
        setMonthlyStats(res.monthlyStats);
      } else {
        setMonthlyStats([]);
      }

      // Update activity score
      if (res.activityScore !== undefined) {
        setActivityScore(res.activityScore || 0);
      }

      // Update popular books
      if (res.popularBooks && Array.isArray(res.popularBooks)) {
        setPopularBooks(res.popularBooks);
      }
    } catch (err) {
      console.error("[Home] Load student stats error:", err);
      // Silently fail, use default values
      setMonthlyStats([]);
      setActivityScore(0);
      setPopularBooks([]);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Load user name
  const loadUserName = useCallback(async () => {
    try {
      const userInfo = await getStoredUserInfo();
      if (userInfo) {
        const name = userInfo.displayName || userInfo.name || userInfo.fullName || userInfo.username || "";
        setUserName(name);
      }
    } catch (err) {
      console.error("[Home] Load user name error:", err);
    }
  }, []);

  // Load count and stats when screen mounts
  useEffect(() => {
    loadUnreadCount();
    loadStudentStats();
    loadUserName();

    // Refresh count when navigating back to home
    const interval = setInterval(() => {
      loadUnreadCount();
      loadStudentStats();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [loadUnreadCount, loadStudentStats, loadUserName]);

  // Listen for navigation events to refresh count
  useEffect(() => {
    if (onNavigate) {
      const originalNavigate = onNavigate;
      // Wrap onNavigate to refresh count when navigating to notifications
      // This will be handled by App.js when screen changes
    }
  }, [onNavigate]);

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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />

      <View style={[styles.topBar, { backgroundColor: colors.headerBg }]}>
        <View style={styles.topLeft}>
          <Ionicons name="menu-outline" size={24} color={colors.headerText} />
          <View style={styles.searchBox}>
            {!showSearchOverlay && (
              <Ionicons name="search" size={18} color={colors.muted} />
            )}
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              value={search}
              onChangeText={setSearch}
              onFocus={() => setShowSearchOverlay(true)}
              placeholder={strings.search || "Search"}
              placeholderTextColor={colors.placeholder}
              returnKeyType="search"
              onSubmitEditing={() => Keyboard.dismiss()}
            />
          </View>
        </View>
        <View style={styles.topRight}>
          <TouchableOpacity
            onPress={() => {
              loadUnreadCount(); // Refresh count before navigating
              onNavigate?.("notifications");
            }}
            activeOpacity={0.7}
            style={styles.notificationButton}
          >
            <Ionicons
              name="notifications-outline"
              size={22}
              color={colors.headerText}
            />
            {unreadCount > 0 && (
              <View style={[styles.badge, { backgroundColor: "#e74c3c" }]}>
                <Text style={styles.badgeText}>
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onNavigate?.("settings")}
            activeOpacity={0.7}
          >
            <Ionicons
              name="person-circle-outline"
              size={28}
              color={colors.headerText}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.quickCard, { backgroundColor: colors.cardBg }]}>
          <View style={styles.quickRow}>
            {mockQuickActions.map((qa) => (
              <TouchableOpacity
                key={qa.labelKey}
                style={styles.quickItem}
                activeOpacity={0.8}
                onPress={() => {
                  if (qa.navigateKey === "libraryCard") {
                    onNavigate?.("libraryCard");
                  } else if (qa.navigateKey === "roomBooking") {
                    onNavigate?.("roomBooking");
                  } else if (qa.navigateKey === "scan") {
                    console.log("Scan QR code");
                  } else if (qa.navigateKey === "favorite") {
                    console.log("Favorites");
                  }
                }}
              >
                <View
                  style={[
                    styles.quickIcon,
                    {
                      backgroundColor: colors.inputBg,
                      borderColor: colors.inputBorder,
                    },
                  ]}
                >
                  <Ionicons name={qa.icon} size={18} color={colors.buttonBg} />
                </View>
                <Text
                  style={[styles.quickLabel, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {strings?.[qa.labelKey] || qa.labelKey}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Info & stats */}
        <View style={[styles.card, { backgroundColor: colors.cardBg }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            {strings.yourInfo || "Thông tin của bạn"}
          </Text>
          <Text style={[styles.cardText, { color: colors.text }]}>
            {userName ? `Xin chào, ${userName} 👋👋` : "Xin chào"}
          </Text>
          <View style={styles.statsRow}>
            <View
              style={[
                styles.statBox,
                {
                  backgroundColor: colors.inputBg,
                  borderColor: colors.inputBorder,
                },
              ]}
            >
              <Ionicons name="book-outline" size={18} color={colors.buttonBg} />
              <Text style={[styles.statNumber, { color: colors.text }]}>
                {statsLoading ? "..." : currentMonthStats.borrowCount}
              </Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>
                {strings.borrowed || "Đã mượn"}
              </Text>
            </View>
            <View
              style={[
                styles.statBox,
                {
                  backgroundColor: colors.inputBg,
                  borderColor: colors.inputBorder,
                },
              ]}
            >
              <Ionicons name="time-outline" size={18} color="#e67e22" />
              <Text style={[styles.statNumber, { color: colors.text }]}>
                {statsLoading ? "..." : currentMonthStats.overdueCount}
              </Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>
                {strings.overdue || "Quá hạn"}
              </Text>
            </View>
          </View>
        </View>

        {/* Reward Points Card */}
        <View style={[styles.rewardCard, { backgroundColor: colors.buttonBg }]}>
          <Text style={[styles.rewardTitle, { color: "#FFFFFF" }]}>
            {strings.rewardPoints || "ĐIỂM THƯỞNG TÍCH LŨY"}
          </Text>
          <View style={styles.rewardContent}>
            <View style={styles.rewardLeft}>
              <Text style={[styles.rewardPoints, { color: "#FFFFFF" }]}>
                {statsLoading ? "..." : activityScore.toLocaleString()} điểm
              </Text>
            </View>
            <View style={styles.rewardRight}>
              <View style={styles.rewardRankRow}>
                <Ionicons
                  name={rankInfo.rankIcon}
                  size={20}
                  color={rankInfo.rankColor}
                />
                <Text style={[styles.rewardRank, { color: rankInfo.rankColor }]}>
                  Hạng {rankInfo.rank}
                </Text>
              </View>
            </View>
          </View>
          {rankInfo.nextRank && (
            <View style={styles.rewardProgressSection}>
              <View style={styles.rewardProgressRow}>
                <Text style={[styles.rewardProgressLabel, { color: "#FFFFFF" }]}>
                  {strings.rankProgress || "Tiến độ thăng hạng"}
                </Text>
                <View style={styles.rewardProgressBarContainer}>
                  <View
                    style={[
                      styles.rewardProgressBar,
                      {
                        width: `${rankInfo.progress * 100}%`,
                        backgroundColor: rankInfo.rankColor,
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.rewardProgressBarRemaining,
                      {
                        width: `${(1 - rankInfo.progress) * 100}%`,
                        backgroundColor: "rgba(255, 255, 255, 0.3)",
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.rewardNextPoints, { color: "#FFFFFF" }]}>
                  {rankInfo.pointsNeeded > 0
                    ? `${rankInfo.pointsNeeded} điểm nữa để lên ${rankInfo.nextRank}`
                    : `Đã đạt ${rankInfo.rank}`}
                </Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.forYouSection}>
          <View style={styles.forYouHeader}>
            <Text style={[styles.forYouTitle, { color: colors.text }]}>
              {mockForYou.title}
            </Text>
            <TouchableOpacity>
              <Text style={[styles.forYouViewAll, { color: colors.buttonBg }]}>
                {mockForYou.viewAllText}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Room Booking Card with Image */}
          <TouchableOpacity
            style={[styles.roomBookingCard, { backgroundColor: colors.cardBg }]}
            onPress={() => onNavigate?.("roomBooking")}
            activeOpacity={0.8}
          >
            <View style={styles.libraryImageContainer}>
              <Image
                source={require("../../assets/datphong.png")}
                style={styles.libraryImage}
                resizeMode="cover"
              />
            </View>
            <View style={styles.roomBookingContent}>
              <Text style={[styles.roomBookingTitle, { color: colors.text }]}>
                {mockForYou.roomBooking.title}
              </Text>
              <Text
                style={[styles.roomBookingDescription, { color: colors.muted }]}
              >
                {mockForYou.roomBooking.description}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Monthly Stats Chart */}
        <View style={[styles.card, { backgroundColor: colors.cardBg }]}>
          <View style={styles.cardHeaderRow}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              {strings.monthly || "Thống kê 5 tháng gần nhất"}
            </Text>
            <View style={styles.legendRow}>
              <View
                style={[styles.legendDot, { backgroundColor: colors.buttonBg }]}
              />
              <Text style={[styles.legendText, { color: colors.text }]}>
                {strings.borrowed || "Mượn"}
              </Text>
              <View
                style={[styles.legendDot, { backgroundColor: "#f1c40f" }]}
              />
              <Text style={[styles.legendText, { color: colors.text }]}>
                {strings.returned || "Trả"}
              </Text>
            </View>
          </View>
          {statsLoading ? (
            <View style={{ padding: 20, alignItems: "center" }}>
              <Text style={[styles.loadingText, { color: colors.muted }]}>
                Đang tải...
              </Text>
            </View>
          ) : monthlyStats.length === 0 ? (
            <View style={{ padding: 20, alignItems: "center" }}>
              <Text style={[styles.emptyText, { color: colors.muted }]}>
                Chưa có dữ liệu thống kê
              </Text>
            </View>
          ) : (
            <View style={styles.chartRow}>
              {monthlyStats.map((m, idx) => {
                // Calculate max value for scaling (chỉ tính borrowCount và returnCount)
                const maxValue = Math.max(
                  ...monthlyStats.map(
                    (stat) =>
                      Math.max(
                        stat.borrowCount || 0,
                        stat.returnCount || 0
                      )
                  )
                );

                const borrowHeight =
                  maxValue > 0
                    ? ((m.borrowCount || 0) / maxValue) *
                    CHART_CONFIG.MAX_BAR_HEIGHT +
                    CHART_CONFIG.MIN_BAR_HEIGHT
                    : CHART_CONFIG.MIN_BAR_HEIGHT;
                const returnHeight =
                  maxValue > 0
                    ? ((m.returnCount || 0) / maxValue) *
                    CHART_CONFIG.MAX_BAR_HEIGHT +
                    CHART_CONFIG.MIN_BAR_HEIGHT
                    : CHART_CONFIG.MIN_BAR_HEIGHT;

                // Format month label: "T12" or "12"
                const monthLabel = `T${m.month}`;

                return (
                  <View key={`${m.month}-${m.year}-${idx}`} style={styles.chartCol}>
                    <View style={styles.barGroup}>
                      <View
                        style={[
                          styles.bar,
                          {
                            height: borrowHeight,
                            backgroundColor: colors.buttonBg,
                          },
                        ]}
                      />
                      <View
                        style={[
                          styles.bar,
                          { height: returnHeight, backgroundColor: "#f1c40f" },
                        ]}
                      />
                    </View>
                    <Text style={[styles.chartLabel, { color: colors.text }]}>
                      {monthLabel}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Categories */}
        <View style={[styles.card, { backgroundColor: colors.cardBg }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            {strings.categories || "Thể loại sách nổi bật"}
          </Text>
          <View style={styles.chipsRow}>
            {CATEGORIES.map((item) => (
              <View
                key={item.label}
                style={[styles.chip, { borderColor: item.color }]}
              >
                <View style={[styles.dot, { backgroundColor: item.color }]} />
                <Text style={[styles.chipText, { color: colors.text }]}>
                  {item.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Reading list */}
        <View style={[styles.card, { backgroundColor: colors.cardBg }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            {strings.reading || "Đang đọc"}
          </Text>
          {mockReading.map((item) => (
            <View key={item.title} style={styles.readingRow}>
              <View
                style={[
                  styles.readingIcon,
                  {
                    backgroundColor: colors.inputBg,
                    borderColor: colors.inputBorder,
                  },
                ]}
              >
                <Ionicons
                  name="book-outline"
                  size={16}
                  color={colors.buttonBg}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[styles.readingTitle, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                <View
                  style={[
                    styles.progressBar,
                    { backgroundColor: colors.inputBg },
                  ]}
                >
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${Math.floor(item.progress * 100)}%`,
                        backgroundColor: colors.buttonBg,
                      },
                    ]}
                  />
                </View>
              </View>
              <Text style={[styles.progressText, { color: colors.muted }]}>
                {Math.floor(item.progress * 100)}%
              </Text>
            </View>
          ))}
        </View>

        {/* Featured books */}
        <View style={[styles.card, { backgroundColor: colors.cardBg }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            {strings.featured || "Sách nổi bật"}
          </Text>
          {statsLoading ? (
            <View style={{ padding: 20, alignItems: "center" }}>
              <Text style={[styles.loadingText, { color: colors.muted }]}>
                Đang tải...
              </Text>
            </View>
          ) : popularBooks.length === 0 ? (
            <View style={{ padding: 20, alignItems: "center" }}>
              <Text style={[styles.emptyText, { color: colors.muted }]}>
                Chưa có sách nổi bật
              </Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.coversRow}
              style={styles.coversScrollView}
            >
              {popularBooks.map((book) => (
                <TouchableOpacity
                  key={book.id}
                  style={styles.coverItem}
                  activeOpacity={0.8}
                  onPress={() => {
                    onNavigate?.("bookDetail", { book });
                  }}
                >
                  {book.coverImage ? (
                    <Image
                      source={{ uri: book.coverImage }}
                      style={[
                        styles.coverImage,
                        {
                          backgroundColor: colors.inputBg,
                          borderColor: colors.inputBorder,
                          borderWidth: 1,
                        },
                      ]}
                      resizeMode="cover"
                    />
                  ) : (
                    <View
                      style={[
                        styles.coverPlaceholder,
                        {
                          backgroundColor: colors.inputBg,
                          borderColor: colors.inputBorder,
                        },
                      ]}
                    >
                      <Ionicons
                        name="book-outline"
                        size={24}
                        color={colors.muted}
                      />
                    </View>
                  )}
                  <Text
                    style={[styles.coverLabel, { color: colors.text }]}
                    numberOfLines={2}
                  >
                    {book.title}
                  </Text>
                  {book.author && (
                    <Text
                      style={[styles.coverSubLabel, { color: colors.muted }]}
                      numberOfLines={1}
                    >
                      {book.author}
                    </Text>
                  )}
                  {book.borrowCount !== undefined && (
                    <Text
                      style={[styles.coverSubLabel, { color: colors.muted }]}
                      numberOfLines={1}
                    >
                      {book.borrowCount} lượt mượn
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      </ScrollView>

      <BottomNav
        activeKey="home"
        onChange={(key) => {
          if (key === "settings") onNavigate?.("settings");
          if (key === "library") onNavigate?.("books");
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
