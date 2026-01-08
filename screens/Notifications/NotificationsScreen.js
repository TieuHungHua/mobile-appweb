import { StatusBar } from "expo-status-bar";
import { useMemo, useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createStyles } from "./Notifications.styles";
import { notificationsAPI } from "../../utils/api";

// Key để lưu read notifications trong AsyncStorage
const READ_NOTIFICATIONS_KEY = "@read_notifications";

export default function NotificationsScreen({
  theme,
  lang,
  strings,
  colors,
  onNavigate,
}) {
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [activeTab, setActiveTab] = useState("all"); // 'all', 'unread', 'urgent'
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [apiNotAvailable, setApiNotAvailable] = useState(false);
  const [readNotificationIds, setReadNotificationIds] = useState(new Set());

  // Load read notification IDs từ AsyncStorage
  const loadReadNotifications = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(READ_NOTIFICATIONS_KEY);
      if (stored) {
        const ids = JSON.parse(stored);
        setReadNotificationIds(new Set(ids));
        return new Set(ids);
      }
      return new Set();
    } catch (error) {
      console.error("[Notifications] Error loading read notifications:", error);
      return new Set();
    }
  }, []);

  // Save read notification IDs vào AsyncStorage
  const saveReadNotifications = useCallback(async (ids) => {
    try {
      const idsArray = Array.from(ids);
      await AsyncStorage.setItem(READ_NOTIFICATIONS_KEY, JSON.stringify(idsArray));
      setReadNotificationIds(ids);
    } catch (error) {
      console.error("[Notifications] Error saving read notifications:", error);
    }
  }, []);

  // Mark notification as read (lưu vào AsyncStorage)
  const markNotificationAsRead = useCallback(
    async (notificationId) => {
      const newReadIds = new Set(readNotificationIds);
      newReadIds.add(notificationId);
      await saveReadNotifications(newReadIds);
    },
    [readNotificationIds, saveReadNotifications]
  );

  // Mark all notifications as read
  const markAllNotificationsAsRead = useCallback(
    async (notificationIds) => {
      const newReadIds = new Set(readNotificationIds);
      notificationIds.forEach((id) => newReadIds.add(id));
      await saveReadNotifications(newReadIds);
    },
    [readNotificationIds, saveReadNotifications]
  );

  // Load read notifications khi component mount
  useEffect(() => {
    loadReadNotifications();
  }, [loadReadNotifications]);

  // Format timestamp từ backend
  const formatTimestamp = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Map dữ liệu từ NotificationLog sang format frontend
  // NotificationLog có: id, userId, borrowId, title, body, status, sentAt, createdAt, read
  const mapNotification = useCallback((item) => {
    const title = item.title || "";
    const body = item.body || "";

    // Lấy thông tin từ NotificationLog
    const borrowId = item.borrowId;

    // Lấy book info từ borrow.book hoặc trực tiếp từ item
    const book = item.borrow?.book || item.book;
    const bookId = book?.id || item.bookId;
    const bookTitle = book?.title || item.bookTitle;

    // Check read status từ backend response
    // Backend có field isRead hoặc read trong response
    const isRead = item.isRead !== undefined ? item.isRead : (item.read !== undefined ? item.read : false);

    // Tính daysUntilDue từ borrow nếu có
    let daysUntilDue = null;
    if (item.borrow) {
      const dueAt = item.borrow.dueAt || item.borrow.due_at;
      if (dueAt) {
        const dueDate = new Date(dueAt);
        const now = new Date();
        const diffMs = dueDate - now;
        daysUntilDue = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      }
    }

    // Xác định type và urgent từ title/body và daysUntilDue
    let type = "info";
    let urgent = false;

    // Phân loại notification theo tài liệu backend
    // 1. Nhắc nhở -3 ngày: daysUntilDue = 3
    // 2. Nhắc nhở -1 ngày: daysUntilDue = 1
    // 3. Nhắc nhở đúng ngày: daysUntilDue = 0
    // 4. Quá hạn: daysUntilDue < 0

    if (daysUntilDue !== null && !isNaN(daysUntilDue)) {
      if (daysUntilDue < 0) {
        // Quá hạn
        type = "overdue";
        urgent = true;
      } else if (daysUntilDue === 0) {
        // Hết hạn hôm nay
        type = "due";
        urgent = true;
      } else if (daysUntilDue === 1) {
        // Còn 1 ngày
        type = "due";
        urgent = true;
      } else if (daysUntilDue <= 3) {
        // Còn 2-3 ngày
        type = "due";
        urgent = daysUntilDue <= 2;
      } else {
        type = "due";
        urgent = false;
      }
    } else {
      // Nếu không có daysUntilDue, phân loại từ title/body
      if (title.includes("Hạn trả sách hôm nay") || title.includes("hôm nay")) {
        type = "due";
        urgent = true;
        daysUntilDue = 0;
      } else if (title.includes("Nhắc nhở trả sách")) {
        type = "due";
        if (body.includes("ngày mai") || body.includes("1 ngày")) {
          urgent = true;
          daysUntilDue = 1;
        } else if (body.includes("3 ngày")) {
          urgent = false;
          daysUntilDue = 3;
        }
      } else if (title.includes("quá hạn") || body.includes("quá hạn")) {
        type = "overdue";
        urgent = true;
        daysUntilDue = -1;
      } else if (body.includes("trả") || title.includes("trả")) {
        type = "returned";
      } else if (body.includes("mượn") || title.includes("mượn")) {
        type = "hold";
      }
    }

    return {
      id: item.id,
      type,
      title,
      description: body,
      timestamp: formatTimestamp(item.sentAt || item.createdAt),
      read: isRead,
      urgent,
      borrowId,
      bookId,
      bookTitle,
      daysUntilDue,
      status: item.status, // pending, sent, failed
      userId: item.userId,
      user: item.user, // User info nếu có
      borrow: item.borrow, // Borrow info nếu có
    };
  }, []);

  // Load notifications từ API
  const loadNotifications = useCallback(
    async (pageNum = 1, silent = false) => {
      try {
        if (!silent) {
          setLoading(true);
        }

        // Gọi API với pagination và filter theo tab
        const isReadFilter = activeTab === "unread" ? false : undefined;
        const res = await notificationsAPI.getNotifications({
          page: pageNum,
          limit: 20,
          isRead: isReadFilter, // Filter unread nếu tab là "unread"
        });

        const data = res.data || res || [];
        // Load read notifications từ storage trước khi map
        const readIds = await loadReadNotifications();
        setReadNotificationIds(readIds);
        const mapped = data.map(mapNotification);

        if (pageNum === 1) {
          setNotifications(mapped);
        } else {
          setNotifications((prev) => [...prev, ...mapped]);
        }

        // Check if has more
        const pagination = res.pagination;
        if (pagination) {
          setHasMore(pagination.hasNextPage || false);
        } else {
          setHasMore(mapped.length === 20);
        }
        setApiNotAvailable(false);
      } catch (err) {
        console.error("[Notifications] Load error:", err);
        // Set empty array nếu API không tồn tại
        if (pageNum === 1) {
          setNotifications([]);
          // Kiểm tra nếu là lỗi 404 (endpoint không tồn tại)
          if (err.message && err.message.includes("404")) {
            setApiNotAvailable(true);
          }
        }
        if (!silent && err.message && !err.message.includes("404")) {
          // Chỉ hiển thị alert nếu không phải lỗi 404 (endpoint không tồn tại)
          Alert.alert("Lỗi", err.message || "Không thể tải thông báo");
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [activeTab]
  );

  // Load khi tab thay đổi
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    loadNotifications(1, false);
  }, [activeTab, loadNotifications]);

  // Refresh
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    loadNotifications(1, true);
  }, [loadNotifications]);

  // Filter notifications theo tab (client-side filtering)
  // Note: Backend đã filter theo status/userId, nhưng chúng ta vẫn filter thêm ở client
  // để xử lý "unread" và "urgent" tabs
  const filteredNotifications = useMemo(() => {
    return notifications.filter((notif) => {
      if (activeTab === "unread") return !notif.read;
      if (activeTab === "urgent") return notif.urgent;
      return true; // "all" tab - hiển thị tất cả
    });
  }, [notifications, activeTab]);

  const handleMarkAllRead = async () => {
    try {
      // Gọi API để đánh dấu tất cả đã đọc
      const res = await notificationsAPI.markAllAsRead();

      // Update UI - mark tất cả notifications là đã đọc
      setNotifications(
        notifications.map((notif) => ({ ...notif, read: true, isRead: true }))
      );

      // Hiển thị thông báo với số lượng đã đánh dấu
      const count = res.count || notifications.filter((n) => !n.read && !n.isRead).length;
      Alert.alert(
        "Thành công",
        `Đã đánh dấu ${count} thông báo là đã đọc`
      );
    } catch (err) {
      console.error("[Notifications] Mark all read error:", err);
      Alert.alert("Lỗi", err.message || "Không thể đánh dấu đã đọc. Vui lòng thử lại.");
    }
  };

  const handleNotificationPress = async (notif) => {
    // Mark as read nếu chưa đọc
    if (!notif.read && !notif.isRead) {
      try {
        // Gọi API để đánh dấu đã đọc
        await notificationsAPI.markAsRead(notif.id);

        // Update UI
        setNotifications(
          notifications.map((n) =>
            n.id === notif.id ? { ...n, read: true, isRead: true } : n
          )
        );
      } catch (err) {
        console.error("[Notifications] Mark read error:", err);
        // Vẫn update UI dù có lỗi (optimistic update)
        setNotifications(
          notifications.map((n) =>
            n.id === notif.id ? { ...n, read: true, isRead: true } : n
          )
        );
      }
    }

    // Navigate dựa trên notification type và data
    if (notif.borrowId) {
      // Nếu có borrowId, navigate đến MyBookshelf với tab "borrowed"
      // để user có thể xem chi tiết và thực hiện gia hạn/trả sách
      onNavigate?.("myBookshelf", { activeTab: "borrowed" });
    } else if (notif.bookId) {
      // Nếu có bookId, navigate đến BookDetail
      // Cần fetch book data trước hoặc pass bookId
      onNavigate?.("bookDetail", { bookId: notif.bookId });
    }
    // Nếu không có borrowId hoặc bookId, chỉ mark as read, không navigate
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
      {loading && notifications.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.buttonBg} />
          <Text style={[styles.loadingText, { color: colors.muted }]}>
            Đang tải thông báo...
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.buttonBg]}
              tintColor={colors.buttonBg}
            />
          }
        >
          {filteredNotifications.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="notifications-off-outline"
                size={60}
                color={colors.muted}
              />
              <Text style={[styles.emptyText, { color: colors.muted }]}>
                {apiNotAvailable
                  ? "Backend chưa hỗ trợ tính năng xem danh sách thông báo.\nBạn sẽ nhận thông báo nhắc hạn trả sách qua push notifications khi đăng nhập."
                  : strings.noNotifications || "Chưa có thông báo"}
              </Text>
              {apiNotAvailable && (
                <Text
                  style={[
                    styles.emptySubText,
                    { color: colors.muted, marginTop: 8 },
                  ]}
                >
                  Thông báo sẽ được gửi tự động vào 8:00 sáng hàng ngày khi sách sắp hết hạn.
                </Text>
              )}
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
                  {/* Hiển thị bookTitle nếu có */}
                  {notif.bookTitle && (
                    <Text
                      style={[styles.bookTitleText, { color: colors.text }]}
                      numberOfLines={1}
                    >
                      {notif.bookTitle}
                    </Text>
                  )}
                  {/* Hiển thị daysUntilDue nếu có */}
                  {notif.daysUntilDue !== undefined && notif.daysUntilDue !== null && (
                    <Text
                      style={[
                        styles.daysLeftText,
                        {
                          color:
                            notif.daysUntilDue < 0
                              ? "#e74c3c" // Quá hạn - đỏ
                              : notif.daysUntilDue === 0
                                ? "#e74c3c" // Hết hạn hôm nay - đỏ
                                : notif.daysUntilDue === 1
                                  ? "#f39c12" // Còn 1 ngày - cam
                                  : colors.muted, // Còn nhiều ngày - xám
                          fontWeight: notif.daysUntilDue <= 1 ? "600" : "500",
                        },
                      ]}
                    >
                      {notif.daysUntilDue < 0
                        ? `⚠️ Quá hạn ${Math.abs(notif.daysUntilDue)} ngày`
                        : notif.daysUntilDue === 0
                          ? "⏰ Hết hạn hôm nay"
                          : notif.daysUntilDue === 1
                            ? "⏰ Còn 1 ngày"
                            : `⏰ Còn ${notif.daysUntilDue} ngày`}
                    </Text>
                  )}
                </View>

                {/* Timestamp */}
                <Text style={[styles.timestamp, { color: colors.muted }]}>
                  {notif.timestamp}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

