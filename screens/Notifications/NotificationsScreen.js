import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { createStyles } from "./Notifications.styles";
import { mockNotifications } from "./Notifications.mock";

export default function NotificationsScreen({
  theme,
  lang,
  strings,
  colors,
  onNavigate,
}) {
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [activeTab, setActiveTab] = useState("all"); // 'all', 'unread', 'urgent'
  const [notifications, setNotifications] = useState(mockNotifications);

  const filteredNotifications = notifications.filter((notif) => {
    if (activeTab === "unread") return !notif.read;
    if (activeTab === "urgent") return notif.urgent;
    return true;
  });

  const handleMarkAllRead = () => {
    setNotifications(
      notifications.map((notif) => ({ ...notif, read: true }))
    );
  };

  const handleNotificationPress = (notif) => {
    setNotifications(
      notifications.map((n) =>
        n.id === notif.id ? { ...n, read: true } : n
      )
    );
  };

  const getIconName = (type) => {
    switch (type) {
      case "overdue":
        return "warning";
      case "due":
        return "calendar";
      case "hold":
        return "book";
      case "info":
        return "information-circle";
      case "returned":
        return "checkmark-circle";
      default:
        return "notifications";
    }
  };

  const getIconColor = (type, urgent) => {
    if (urgent) return "#e74c3c";
    switch (type) {
      case "overdue":
        return "#e74c3c";
      case "due":
        return colors.buttonBg;
      case "hold":
        return "#2ecc71";
      case "info":
        return colors.muted;
      case "returned":
        return colors.muted;
      default:
        return colors.buttonBg;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: "#F6F7F8" }]}>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.headerBg }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => onNavigate?.("home")}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={colors.headerText} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.headerText }]}>
          {strings.notifications || "Notifications"}
        </Text>
        <TouchableOpacity onPress={handleMarkAllRead} activeOpacity={0.7}>
          <Text style={[styles.markAllRead, { color: colors.headerText }]}>
            {strings.markAllRead || "Mark all read"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Bar */}
      <View style={[styles.tabBar, { backgroundColor: colors.cardBg }]}>
        {["all", "unread", "urgent"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && {
                backgroundColor: colors.inputBg,
              },
            ]}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    activeTab === tab ? colors.buttonBg : colors.muted,
                  fontWeight: activeTab === tab ? "700" : "500",
                },
              ]}
            >
              {tab === "all"
                ? strings.all || "All"
                : tab === "unread"
                ? strings.unread || "Unread"
                : strings.urgent || "Urgent"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Notifications List */}
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {filteredNotifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="notifications-off-outline"
              size={60}
              color={colors.muted}
            />
            <Text style={[styles.emptyText, { color: colors.muted }]}>
              {strings.noNotifications || "No notifications"}
            </Text>
          </View>
        ) : (
          filteredNotifications.map((notif) => (
            <TouchableOpacity
              key={notif.id}
              style={[
                styles.notificationCard,
                {
                  backgroundColor: colors.cardBg,
                  borderLeftColor: notif.urgent ? "#e74c3c" : "transparent",
                },
              ]}
              onPress={() => handleNotificationPress(notif)}
              activeOpacity={0.7}
            >
              {/* Icon */}
              <View
                style={[
                  styles.iconContainer,
                  {
                    backgroundColor:
                      getIconColor(notif.type, notif.urgent) + "20",
                  },
                ]}
              >
                <Ionicons
                  name={getIconName(notif.type)}
                  size={24}
                  color={getIconColor(notif.type, notif.urgent)}
                />
              </View>

              {/* Content */}
              <View style={styles.notificationContent}>
                <View style={styles.notificationHeader}>
                  <Text
                    style={[styles.notificationTitle, { color: colors.text }]}
                    numberOfLines={1}
                  >
                    {notif.title}
                  </Text>
                  {!notif.read && (
                    <View
                      style={[
                        styles.unreadDot,
                        { backgroundColor: colors.buttonBg },
                      ]}
                    />
                  )}
                </View>
                <Text
                  style={[styles.notificationText, { color: colors.muted }]}
                  numberOfLines={2}
                >
                  {notif.description}
                </Text>
              </View>

              {/* Timestamp */}
              <Text style={[styles.timestamp, { color: colors.muted }]}>
                {notif.timestamp}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

