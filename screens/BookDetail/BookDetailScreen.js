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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BottomNav from "../../components/BottomNav";
import { createStyles } from "./BookDetail.styles";
import { bookMock, detailSections } from "./BookDetail.mock";

export default function BookDetailScreen({
  theme,
  lang,
  strings,
  colors,
  onNavigate,
  hideBottomNav = false,
}) {
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [search, setSearch] = useState("");
  const [showSearchOverlay, setShowSearchOverlay] = useState(false);
  const [recentSearches, setRecentSearches] = useState([
    "lịch sử tìm kiếm",
    "Harry Potter",
    "Kinh tế",
    "Công nghệ AI",
  ]);
  const [openSections, setOpenSections] = useState([]);
  const [isBorrowed, setIsBorrowed] = useState(false);
  const [borrowDue, setBorrowDue] = useState(null);
  const [showBorrowSheet, setShowBorrowSheet] = useState(false);

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
            <Ionicons name="book" size={42} color={colors.buttonBg} />
          </View>
          <Text style={[styles.bookTitle, { color: colors.text }]}>
            {bookMock.title}
          </Text>
          <Text style={[styles.bookAuthor, { color: colors.muted }]}>
            {bookMock.author}
          </Text>
          <View style={styles.tagRow}>
            <View
              style={[
                styles.tag,
                isBorrowed
                  ? { backgroundColor: "#fef4e6", borderColor: "#f39c12" }
                  : { backgroundColor: "#e8f5e9", borderColor: "#2ecc71" },
              ]}
            >
              <Text
                style={[
                  styles.tagText,
                  { color: isBorrowed ? "#f39c12" : "#2ecc71" },
                ]}
              >
                {isBorrowed
                  ? strings.borrowed || "Đã mượn"
                  : strings.available || "Available"}
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
                {bookMock.copies}
              </Text>
            </View>
          </View>
          {isBorrowed && borrowDue && (
            <Text style={[styles.bookMetaCenter, { color: colors.muted }]}>
              {strings.due || "Hạn"}: {borrowDue}
            </Text>
          )}
          <View style={styles.tagRow}>
            {bookMock.tags.map((t) => (
              <View
                key={t}
                style={[
                  styles.tag,
                  {
                    backgroundColor: colors.inputBg,
                    borderColor: colors.inputBorder,
                  },
                ]}
              >
                <Text style={[styles.tagText, { color: colors.text }]}>
                  {t}
                </Text>
              </View>
            ))}
          </View>
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
      </ScrollView>

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
