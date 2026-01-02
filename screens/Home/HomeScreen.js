import { StatusBar } from "expo-status-bar";
import { useMemo, useRef, useState } from "react";
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
            onPress={() => onNavigate?.("notifications")}
            activeOpacity={0.7}
          >
            <Ionicons
              name="notifications-outline"
              size={22}
              color={colors.headerText}
            />
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
            "{GREETING}"
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
                {STAT_INITIAL.borrowed}
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
                {STAT_INITIAL.overdue}
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
                {mockRewardPoints.currentPoints.toLocaleString()} điểm
              </Text>
            </View>
            <View style={styles.rewardRight}>
              <View style={styles.rewardRankRow}>
                <Ionicons
                  name={mockRewardPoints.rankIcon}
                  size={20}
                  color="#f1c40f"
                />
                <Text style={[styles.rewardRank, { color: "#f1c40f" }]}>
                  {mockRewardPoints.currentRank}
                </Text>
              </View>
              <Text style={[styles.rewardRanking, { color: "#FFFFFF" }]}>
                {mockRewardPoints.ranking}
              </Text>
            </View>
          </View>
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
                      width: `${mockRewardPoints.progress * 100}%`,
                      backgroundColor: "#f1c40f",
                    },
                  ]}
                />
                <View
                  style={[
                    styles.rewardProgressBarRemaining,
                    {
                      width: `${(1 - mockRewardPoints.progress) * 100}%`,
                      backgroundColor: "rgba(255, 255, 255, 0.3)",
                    },
                  ]}
                />
              </View>
              <Text style={[styles.rewardNextPoints, { color: "#FFFFFF" }]}>
                {mockRewardPoints.nextRankPoints} điểm nữa
              </Text>
            </View>
          </View>
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

        <View style={[styles.card, { backgroundColor: colors.cardBg }]}>
          <View style={styles.cardHeaderRow}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              {strings.monthly || "Thống kê theo tháng"}
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
          <View style={styles.chartRow}>
            {mockMonthlyStats.map((m) => {
              const borrowHeight =
                (m.borrowed / CHART_CONFIG.MAX_VALUE) *
                  CHART_CONFIG.MAX_BAR_HEIGHT +
                CHART_CONFIG.MIN_BAR_HEIGHT;
              const returnHeight =
                (m.returned / CHART_CONFIG.MAX_VALUE) *
                  CHART_CONFIG.MAX_BAR_HEIGHT +
                CHART_CONFIG.MIN_BAR_HEIGHT;
              return (
                <View key={m.month} style={styles.chartCol}>
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
                    {m.month}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Categories */}
        <View style={[styles.card, { backgroundColor: colors.cardBg }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            {strings.categories || "Thể loại sách"}
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
          <View style={styles.coversRow}>
            {mockFeatured.map((b, idx) => (
              <View key={idx} style={styles.coverItem}>
                <View
                  style={[
                    styles.coverPlaceholder,
                    {
                      backgroundColor: colors.inputBg,
                      borderColor: colors.inputBorder,
                    },
                  ]}
                />
                <Text
                  style={[styles.coverLabel, { color: colors.text }]}
                  numberOfLines={1}
                >
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
