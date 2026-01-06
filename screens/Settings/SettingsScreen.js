import { StatusBar } from "expo-status-bar";
import { useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BottomNav from "../../components/BottomNav";
import { createStyles } from "./Settings.styles";
import {
  INITIAL_STATE,
  USER_INFO,
  SETTINGS_MENU_ITEMS,
  GENERAL_MENU_ITEMS,
  SWITCH_COLORS,
  SECTION_LABELS,
  LOGOUT_ICON,
  SETTINGS_HEADER_ICON,
  AVATAR_ICON_SIZE,
  CHEVRON_ICON_SIZE,
  LOGOUT_BUTTON_ICON_SIZE,
} from "./Settings.mock";
import { getStoredUserInfo } from "../../utils/api";

export default function SettingsScreen({
  theme,
  lang,
  strings,
  colors,
  onNavigate,
}) {
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    INITIAL_STATE.notificationsEnabled
  );
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(
    INITIAL_STATE.autoUpdateEnabled
  );
  const [userName, setUserName] = useState(USER_INFO.NAME);

  // Load user info from storage
  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const userInfo = await getStoredUserInfo();
        if (userInfo) {
          // Use name from userInfo if available, otherwise use username
          const displayName = userInfo.name || userInfo.username || userInfo.fullName || USER_INFO.NAME;
          setUserName(displayName);
        }
      } catch (error) {
        console.error("Error loading user info:", error);
      }
    };
    loadUserInfo();
  }, []);

  const toggleState = (key) => {
    if (key === "notificationsEnabled") {
      setNotificationsEnabled(!notificationsEnabled);
    } else if (key === "autoUpdateEnabled") {
      setAutoUpdateEnabled(!autoUpdateEnabled);
    }
  };

  const getToggleValue = (key) => {
    if (key === "notificationsEnabled") return notificationsEnabled;
    if (key === "autoUpdateEnabled") return autoUpdateEnabled;
    return false;
  };

  const renderSettingItem = (item) => {
    if (item.type === "button") {
      return (
        <TouchableOpacity
          key={item.id}
          style={styles.settingItem}
          activeOpacity={0.7}
          onPress={() => onNavigate?.(item.navigate)}
        >
          <Text
            style={[styles.settingLabel, { color: item.color || colors.text }]}
          >
            {strings[item.label] || item.defaultLabel}
          </Text>
          <Ionicons
            name={item.icon}
            size={CHEVRON_ICON_SIZE}
            color={colors.muted}
          />
        </TouchableOpacity>
      );
    } else if (item.type === "toggle") {
      return (
        <View key={item.id} style={styles.settingItem}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>
            {strings[item.label] || item.defaultLabel}
          </Text>
          <Switch
            value={getToggleValue(item.key)}
            onValueChange={() => toggleState(item.key)}
            trackColor={{
              false: SWITCH_COLORS.TRACK_FALSE,
              true: colors.buttonBg,
            }}
            thumbColor={SWITCH_COLORS.THUMB}
          />
        </View>
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.headerBg }]}>
        <View style={styles.headerContent}>
          <Ionicons
            name={SETTINGS_HEADER_ICON}
            size={24}
            color={colors.headerText}
          />
          <Text style={[styles.headerTitle, { color: colors.headerText }]}>
            {strings.settings || "Cài đặt"}
          </Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, { backgroundColor: colors.cardBg }]}>
          {/* User Profile Section */}
          <View style={styles.profileSection}>
            <View
              style={[
                styles.avatarContainer,
                {
                  backgroundColor: colors.inputBg,
                  borderColor: colors.inputBorder,
                },
              ]}
            >
              <Ionicons
                name={USER_INFO.AVATAR_ICON}
                size={AVATAR_ICON_SIZE}
                color={colors.buttonBg}
              />
            </View>
            <Text style={[styles.userName, { color: colors.text }]}>
              {userName}
            </Text>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={() => onNavigate?.("login")}
              activeOpacity={0.8}
            >
              <Ionicons
                name={LOGOUT_ICON}
                size={LOGOUT_BUTTON_ICON_SIZE}
                color={colors.text}
              />
            </TouchableOpacity>
          </View>

          {/* Account Settings Section */}
          <Text style={[styles.sectionTitle, { color: colors.muted }]}>
            {strings[SECTION_LABELS.ACCOUNT] || SECTION_LABELS.ACCOUNT_DEFAULT}
          </Text>

          {SETTINGS_MENU_ITEMS.map((item) => renderSettingItem(item))}

          {/* Divider */}
          <View
            style={[styles.divider, { backgroundColor: colors.inputBorder }]}
          />

          {/* General Section */}
          {GENERAL_MENU_ITEMS.map((item) => renderSettingItem(item))}
        </View>
      </ScrollView>

      <BottomNav
        activeKey="settings"
        onChange={(key) => {
          if (key === "home") onNavigate?.("home");
          if (key === "library") onNavigate?.("library");
          if (key === "chats") onNavigate?.("chats");
        }}
        colors={colors}
        strings={{
          ...strings,
          home: "Home",
          library: "Library",
          chats: "Chats",
          settings: strings.settings || "Settings",
        }}
      />
    </View>
  );
}
