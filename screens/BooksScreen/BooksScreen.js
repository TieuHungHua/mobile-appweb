import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  LayoutAnimation,
  UIManager,
  Animated,
  PanResponder,
  Dimensions,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import BottomNav from "../../components/BottomNav";
import { createStyles } from "./Books.styles";
import { mockBooks } from "./Books.mock";

export default function BooksScreen({
  theme,
  lang,
  strings,
  colors,
  onNavigate,
  searchValue = "",
  onChangeSearch,
}) {
  const styles = useMemo(() => createStyles(colors), [colors]);
  const search = searchValue;
  const [tab, setTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;
  const openRowRef = useRef(null);
  const scrollViewRef = useRef(null);
  const screenWidth = Dimensions.get("window").width;
  const isScrollingRef = useRef(false);

  useEffect(() => {
    if (
      Platform.OS === "android" &&
      UIManager.setLayoutAnimationEnabledExperimental
    ) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  const filtered = mockBooks.filter((b) => {
    if (tab === "available" && b.status !== "available") return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const page = Math.min(currentPage, totalPages);
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        if (isScrollingRef.current) return false;

        const isHorizontalSwipe =
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy) &&
          Math.abs(gestureState.dx) > 15;

        return isHorizontalSwipe;
      },
      onPanResponderGrant: () => {
        if (scrollViewRef.current) {
          scrollViewRef.current.setNativeProps({ scrollEnabled: false });
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (scrollViewRef.current) {
          scrollViewRef.current.setNativeProps({ scrollEnabled: true });
        }

        const swipeThreshold = screenWidth * 0.2; // 20% of screen width

        if (gestureState.dx > swipeThreshold && page > 1) {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setCurrentPage((p) => Math.max(1, p - 1));
        } else if (gestureState.dx < -swipeThreshold && page < totalPages) {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setCurrentPage((p) => Math.min(totalPages, p + 1));
        }
      },
      onPanResponderTerminate: () => {
        if (scrollViewRef.current) {
          scrollViewRef.current.setNativeProps({ scrollEnabled: true });
        }
      },
    })
  ).current;

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [tab, search]);

  return (
    <View
      style={[styles.container, { backgroundColor: colors.background }]}
      {...panResponder.panHandlers}
    >
      <StatusBar style={theme === "dark" ? "light" : "dark"} />

      <View style={[styles.topBar, { backgroundColor: colors.headerBg }]}>
        <View
          style={[
            styles.searchBox,
            {
              backgroundColor: colors.cardBg,
              borderColor: colors.inputBorder,
            },
          ]}
        >
          <Ionicons name="search" size={18} color={colors.muted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            value={search}
            onChangeText={onChangeSearch}
            placeholder={strings.search || "Tìm kiếm sách..."}
            placeholderTextColor={colors.placeholder}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => onChangeSearch?.("")}>
              <Ionicons name="close-circle" size={18} color={colors.muted} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[
            styles.actionBtn,
            {
              backgroundColor: colors.cardBg,
              borderColor: colors.inputBorder,
            },
          ]}
          activeOpacity={0.7}
        >
          <Ionicons name="filter-outline" size={20} color={colors.buttonBg} />
        </TouchableOpacity>
      </View>

      <View style={[styles.tabs, { backgroundColor: colors.background }]}>
        {[
          { key: "all", label: strings.all || "Tất cả" },
          { key: "category", label: strings.category || "Thể loại" },
          { key: "available", label: strings.available || "Sẵn có" },
        ].map((item) => {
          const active = tab === item.key;
          return (
            <TouchableOpacity
              key={item.key}
              style={[
                styles.tabItem,
                active && {
                  backgroundColor: colors.buttonBg + "15",
                },
              ]}
              onPress={() => setTab(item.key)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color: active ? colors.buttonBg : colors.text,
                    fontWeight: active ? "700" : "500",
                  },
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={() => {
          isScrollingRef.current = true;
        }}
        onScrollEndDrag={() => {
          setTimeout(() => {
            isScrollingRef.current = false;
          }, 100);
        }}
        onMomentumScrollEnd={() => {
          isScrollingRef.current = false;
        }}
      >
        <View style={styles.listAndFooter}>
          {pageData.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View
                style={[
                  styles.emptyIconContainer,
                  { backgroundColor: colors.inputBg },
                ]}
              >
                <Ionicons name="book-outline" size={64} color={colors.muted} />
              </View>
              <Text style={[styles.emptyText, { color: colors.muted }]}>
                {strings.noBooks || "Không tìm thấy sách nào"}
              </Text>
              {search.trim() && (
                <Text style={[styles.emptySubtext, { color: colors.muted }]}>
                  {strings.tryDifferentSearch ||
                    "Thử tìm kiếm với từ khóa khác"}
                </Text>
              )}
            </View>
          ) : (
            <View style={styles.booksList}>
              {pageData.map((b) => {
                const renderRightActions = (progress, dragX) => {
                  const translateX = dragX.interpolate({
                    inputRange: [-200, -50, 0],
                    outputRange: [0, 75, 200],
                    extrapolate: "clamp",
                  });
                  return (
                    <Animated.View
                      style={[
                        styles.swipeActions,
                        { transform: [{ translateX }] },
                      ]}
                    >
                      <TouchableOpacity
                        style={[
                          styles.swipeBtn,
                          { backgroundColor: "#f0f0f0" },
                        ]}
                      >
                        <Ionicons
                          name="bookmark-outline"
                          size={18}
                          color={colors.text}
                        />
                        <Text
                          style={[styles.swipeText, { color: colors.text }]}
                          numberOfLines={1}
                        >
                          {strings.save || "Lưu"}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.swipeBtn,
                          { backgroundColor: "#f6c344" },
                        ]}
                      >
                        <Ionicons
                          name="heart-outline"
                          size={18}
                          color="#1f1f1f"
                        />
                        <Text
                          style={[styles.swipeText, { color: "#1f1f1f" }]}
                          numberOfLines={1}
                        >
                          {strings.favorite || "Thích"}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.swipeBtn,
                          { backgroundColor: colors.buttonBg },
                        ]}
                      >
                        <Ionicons
                          name="library-outline"
                          size={18}
                          color={colors.buttonText}
                        />
                        <Text
                          style={[
                            styles.swipeText,
                            { color: colors.buttonText },
                          ]}
                          numberOfLines={1}
                        >
                          {strings.borrow || "Mượn"}
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
                      style={[
                        styles.bookCard,
                        {
                          backgroundColor: colors.cardBg,
                          borderColor: colors.inputBorder,
                        },
                      ]}
                      activeOpacity={0.7}
                      onPress={() => onNavigate?.("bookDetail")}
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
                        <Ionicons
                          name="book-outline"
                          size={28}
                          color={colors.buttonBg}
                        />
                      </View>
                      <View style={styles.bookInfo}>
                        <Text
                          style={[styles.bookTitle, { color: colors.text }]}
                          numberOfLines={2}
                        >
                          {b.title}
                        </Text>
                        <Text
                          style={[styles.bookAuthor, { color: colors.muted }]}
                          numberOfLines={1}
                        >
                          {b.author}
                        </Text>
                        <View style={styles.bookFooter}>
                          <View
                            style={[
                              styles.statusBadge,
                              {
                                backgroundColor:
                                  b.status === "available"
                                    ? "#2ecc71" + "20"
                                    : colors.inputBg,
                              },
                            ]}
                          >
                            <View
                              style={[
                                styles.statusDot,
                                {
                                  backgroundColor:
                                    b.status === "available"
                                      ? "#2ecc71"
                                      : colors.muted,
                                },
                              ]}
                            />
                            <Text
                              style={[
                                styles.statusText,
                                {
                                  color:
                                    b.status === "available"
                                      ? "#2ecc71"
                                      : colors.muted,
                                },
                              ]}
                            >
                              {b.status === "available"
                                ? strings.available || "Có sẵn"
                                : strings.borrowed || "Đã mượn"}
                            </Text>
                          </View>
                          {b.due && (
                            <Text
                              style={[styles.dueDate, { color: colors.muted }]}
                              numberOfLines={1}
                            >
                              {strings.due || "Hạn"}: {b.due}
                            </Text>
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                  </Swipeable>
                );
              })}
            </View>
          )}

          <View style={styles.paginationSpacer} />

          <View style={styles.paginationRow}>
            <TouchableOpacity
              style={[
                styles.pageIconBtn,
                {
                  borderColor: colors.inputBorder,
                  backgroundColor: colors.cardBg,
                  opacity: page <= 1 ? 0.4 : 1,
                },
              ]}
              disabled={page <= 1}
              onPress={() => setCurrentPage((p) => Math.max(1, p - 1))}
              activeOpacity={0.7}
            >
              <Ionicons
                name="chevron-back"
                size={20}
                color={page <= 1 ? colors.muted : colors.text}
              />
            </TouchableOpacity>

            <View
              style={[
                styles.pageInfoPill,
                {
                  backgroundColor: colors.cardBg,
                  borderColor: colors.inputBorder,
                },
              ]}
            >
              <Text style={[styles.pageInfoText, { color: colors.text }]}>
                {strings.page || "Trang"} {page}/{totalPages}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.pageIconBtn,
                {
                  borderColor: colors.inputBorder,
                  backgroundColor: colors.cardBg,
                  opacity: page >= totalPages ? 0.4 : 1,
                },
              ]}
              disabled={page >= totalPages}
              onPress={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              activeOpacity={0.7}
            >
              <Ionicons
                name="chevron-forward"
                size={20}
                color={page >= totalPages ? colors.muted : colors.text}
              />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <BottomNav
        activeKey="library"
        onChange={(key) => {
          if (key === "home") onNavigate?.("home");
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
    </View>
  );
}
