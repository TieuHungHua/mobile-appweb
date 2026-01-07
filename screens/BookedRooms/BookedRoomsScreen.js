import { StatusBar } from "expo-status-bar";
import { useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { createStyles } from "./BookedRooms.styles";
import { bookingsAPI, getStoredUserInfo } from "../../utils/api";

export default function BookedRoomsScreen({
  theme,
  lang,
  strings,
  colors,
  onNavigate,
}) {
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  const formatDate = (isoDate) => {
    try {
      const date = new Date(isoDate);
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return isoDate;
    }
  };

  /**
   * chuyển đổi thời gian từ ISO 8601 sang định dạng hiển thị
   * @param {string} startAt - Start time ISO 8601
   * @param {string} endAt - End time ISO 8601
   * @returns {string} định dạng hiển thị (ví dụ: "09:00 - 11:00")
   */
  const formatTime = (startAt, endAt) => {
    try {
      const start = new Date(startAt);
      const end = new Date(endAt);
      const startTime = `${start.getHours().toString().padStart(2, "0")}:${start
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;
      const endTime = `${end.getHours().toString().padStart(2, "0")}:${end
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;
      return `${startTime} - ${endTime}`;
    } catch {
      return `${startAt} - ${endAt}`;
    }
  };

  /**
   * lấy danh sách phòng đã đặt
   */
  useEffect(() => {
    const fetchBookings = async () => {
      setIsLoading(true);
      try {
        const userInfo = await getStoredUserInfo();
        const userId = userInfo?.id;

        const criteria = {
          page: 1,
          pageSize: 50,
          filters: [],
          sorts: [
            {
              field: "start_at",
              dir: "DESC",
            },
          ],
        };

        // lọc theo user_id nếu đã đăng nhập
        if (userId) {
          criteria.filters.push({
            field: "user_id",
            op: "EQ",
            value: userId,
          });
        }

        const response = await bookingsAPI.search(criteria);

        // convert API hiện thị trên UI
        const transformedRooms = response.items.map((booking) => ({
          id: booking.id,
          name: booking.room?.name || "Phòng không xác định",
          capacity: booking.room?.capacity || 0,
          date: formatDate(booking.start_at),
          time: formatTime(booking.start_at, booking.end_at),
          purpose: booking.purpose || "",
          status: booking.status || "pending",
          image: booking.room?.image_url || null,
          booking: booking,
        }));

        setRooms(transformedRooms);
      } catch (error) {
        console.error("[BookedRooms] Error fetching bookings:", error);
        Alert.alert(
          "Lỗi",
          `Không thể tải danh sách phòng đã đặt: ${error.message}`
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "#2ecc71"; // Green
      case "pending":
        return "#f39c12"; // Orange
      case "completed":
        return "#95a5a6"; // Gray
      case "cancelled":
        return "#e74c3c"; // Red
      default:
        return colors.muted;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "approved":
        return "Đã duyệt";
      case "pending":
        return "Chờ duyệt";
      case "completed":
        return "Hoàn thành";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const getButtonConfig = (status) => {
    switch (status) {
      case "approved":
      case "pending":
        return {
          text: "Hủy đặt phòng",
          icon: "close",
          color: status === "approved" ? "#e74c3c" : "#f39c12",
        };
      case "completed":
        return {
          text: "Xem chi tiết",
          icon: "eye",
          color: colors.buttonBg,
        };
      case "cancelled":
        return {
          text: "Chi tiết",
          icon: "information-circle",
          color: colors.muted,
        };
      default:
        return {
          text: "Chi tiết",
          icon: "chevron-forward",
          color: colors.muted,
        };
    }
  };

  /**
   * lấy chi tiết phòng đã đặt
   */
  const fetchBookingDetail = async (bookingId) => {
    setIsLoadingDetail(true);
    try {
      const booking = await bookingsAPI.getById(bookingId);
      setSelectedBooking(booking);
      setShowDetailModal(true);
    } catch (error) {
      console.error("[BookedRooms] Error fetching booking detail:", error);
      Alert.alert(
        "Lỗi",
        `Không thể tải thông tin chi tiết: ${
          error.message || "Vui lòng thử lại"
        }`
      );
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleViewDetail = async (room) => {
    if (room.booking?.id) {
      // Use existing booking data if available
      setSelectedBooking(room.booking);
      setShowDetailModal(true);
    } else {
      await fetchBookingDetail(room.id);
    }
  };

  const handleCancelPress = (room) => {
    setSelectedBooking(room.booking || { id: room.id });
    setCancelReason("");
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedBooking?.id) return;

    if (!cancelReason.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập lý do hủy đặt phòng");
      return;
    }

    setIsCancelling(true);
    try {
      await bookingsAPI.cancel(selectedBooking.id, cancelReason.trim());

      const userInfo = await getStoredUserInfo();
      const userId = userInfo?.id;

      const criteria = {
        page: 1,
        pageSize: 50,
        filters: [],
        sorts: [
          {
            field: "start_at",
            dir: "DESC",
          },
        ],
      };

      if (userId) {
        criteria.filters.push({
          field: "user_id",
          op: "EQ",
          value: userId,
        });
      }

      const response = await bookingsAPI.search(criteria);
      const transformedRooms = response.items.map((booking) => ({
        id: booking.id,
        name: booking.room?.name || "Phòng không xác định",
        capacity: booking.room?.capacity || 0,
        date: formatDate(booking.start_at),
        time: formatTime(booking.start_at, booking.end_at),
        purpose: booking.purpose || "",
        status: booking.status || "pending",
        image: booking.room?.image_url || null,
        booking: booking,
      }));

      setRooms(transformedRooms);
      setShowCancelModal(false);
      setCancelReason("");
      Alert.alert("Thành công", "Đã hủy đặt phòng thành công");
    } catch (error) {
      console.error("[BookedRooms] Error cancelling booking:", error);
      let errorMessage = "Không thể hủy đặt phòng. Vui lòng thử lại.";
      if (error.message.includes("400")) {
        errorMessage = "Không thể hủy đặt phòng ở trạng thái này.";
      } else if (error.message.includes("401")) {
        errorMessage = "Vui lòng đăng nhập để hủy đặt phòng.";
      } else if (error.message.includes("403")) {
        errorMessage = "Bạn không có quyền hủy đặt phòng này.";
      } else if (error.message.includes("404")) {
        errorMessage = "Không tìm thấy đặt phòng này.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      Alert.alert("Lỗi", errorMessage);
    } finally {
      setIsCancelling(false);
    }
  };

  /**
   * Handle button press based on status
   */
  const handleButtonPress = async (room) => {
    const config = getButtonConfig(room.status);
    if (room.status === "approved" || room.status === "pending") {
      handleCancelPress(room);
    } else {
      handleViewDetail(room);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: "#F6F7F8" }]}>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.headerBg }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => onNavigate?.("settings")}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={colors.headerText} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.headerText }]}>
          {strings.bookedRooms || "Phòng đã đặt"}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.buttonBg} />
            <Text style={[styles.loadingText, { color: colors.muted }]}>
              Đang tải danh sách phòng đã đặt...
            </Text>
          </View>
        ) : rooms.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={48} color={colors.muted} />
            <Text style={[styles.emptyText, { color: colors.muted }]}>
              Bạn chưa có phòng nào đã đặt
            </Text>
          </View>
        ) : (
          rooms.map((room) => {
            const statusColor = getStatusColor(room.status);
            const buttonConfig = getButtonConfig(room.status);

            return (
              <View
                key={room.id}
                style={[
                  styles.roomCard,
                  {
                    backgroundColor: colors.cardBg,
                    borderLeftColor: statusColor,
                  },
                ]}
              >
                {/* Status Badge */}
                <View style={styles.statusBadgeContainer}>
                  <View
                    style={[styles.statusDot, { backgroundColor: statusColor }]}
                  />
                  <Text style={[styles.statusText, { color: statusColor }]}>
                    {getStatusText(room.status)}
                  </Text>
                </View>

                {/* Room Info */}
                <View style={styles.roomContent}>
                  <View style={styles.roomInfo}>
                    <Text style={[styles.roomName, { color: colors.text }]}>
                      {room.name}
                    </Text>

                    {/* Room Details */}
                    <View style={styles.detailsContainer}>
                      <View style={styles.detailRow}>
                        <Ionicons
                          name="people-outline"
                          size={16}
                          color={colors.muted}
                        />
                        <Text
                          style={[styles.detailText, { color: colors.muted }]}
                        >
                          Sức chứa: {room.capacity} người
                        </Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Ionicons
                          name="calendar-outline"
                          size={16}
                          color={colors.muted}
                        />
                        <Text
                          style={[styles.detailText, { color: colors.muted }]}
                        >
                          Ngày: {room.date}
                        </Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Ionicons
                          name="time-outline"
                          size={16}
                          color={colors.muted}
                        />
                        <Text
                          style={[styles.detailText, { color: colors.muted }]}
                        >
                          Giờ: {room.time}
                        </Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Ionicons
                          name="document-text-outline"
                          size={16}
                          color={colors.muted}
                        />
                        <Text
                          style={[styles.detailText, { color: colors.muted }]}
                          numberOfLines={2}
                        >
                          Mục đích: {room.purpose}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Room Image */}
                  <View style={styles.imageContainer}>
                    {room.image ? (
                      <Image
                        source={room.image}
                        style={styles.roomImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View
                        style={[
                          styles.roomImagePlaceholder,
                          { backgroundColor: colors.inputBg },
                        ]}
                      >
                        <Ionicons
                          name="cube-outline"
                          size={40}
                          color={colors.muted}
                        />
                      </View>
                    )}
                  </View>
                </View>

                {/* Action Button */}
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    { backgroundColor: buttonConfig.color + "20" },
                  ]}
                  onPress={() => handleButtonPress(room)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={buttonConfig.icon}
                    size={18}
                    color={buttonConfig.color}
                  />
                  <Text
                    style={[
                      styles.actionButtonText,
                      { color: buttonConfig.color },
                    ]}
                  >
                    {buttonConfig.text}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Booking Detail Modal */}
      <Modal
        visible={showDetailModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, { backgroundColor: colors.cardBg }]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Chi tiết đặt phòng
              </Text>
              <TouchableOpacity
                onPress={() => setShowDetailModal(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {isLoadingDetail ? (
              <View style={styles.modalLoadingContainer}>
                <ActivityIndicator size="large" color={colors.buttonBg} />
              </View>
            ) : selectedBooking ? (
              <ScrollView
                showsVerticalScrollIndicator={false}
                style={styles.modalScrollView}
              >
                {/* Room Info */}
                <View style={styles.modalSection}>
                  <Text
                    style={[styles.modalSectionTitle, { color: colors.text }]}
                  >
                    Thông tin phòng
                  </Text>
                  <View style={styles.modalInfoRow}>
                    <Ionicons
                      name="cube-outline"
                      size={20}
                      color={colors.muted}
                    />
                    <Text
                      style={[styles.modalInfoText, { color: colors.text }]}
                    >
                      {selectedBooking.room?.name || "Phòng không xác định"}
                    </Text>
                  </View>
                  <View style={styles.modalInfoRow}>
                    <Ionicons
                      name="people-outline"
                      size={20}
                      color={colors.muted}
                    />
                    <Text
                      style={[styles.modalInfoText, { color: colors.text }]}
                    >
                      Sức chứa: {selectedBooking.room?.capacity || 0} người
                    </Text>
                  </View>
                  {selectedBooking.room?.resources &&
                    selectedBooking.room.resources.length > 0 && (
                      <View style={styles.modalInfoRow}>
                        <Ionicons
                          name="settings-outline"
                          size={20}
                          color={colors.muted}
                        />
                        <View style={styles.modalResourcesContainer}>
                          {selectedBooking.room.resources.map(
                            (resource, idx) => (
                              <View
                                key={idx}
                                style={[
                                  styles.modalResourceTag,
                                  { backgroundColor: colors.inputBg },
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.modalResourceText,
                                    { color: colors.muted },
                                  ]}
                                >
                                  {resource}
                                </Text>
                              </View>
                            )
                          )}
                        </View>
                      </View>
                    )}
                </View>

                {/* Booking Info */}
                <View style={styles.modalSection}>
                  <Text
                    style={[styles.modalSectionTitle, { color: colors.text }]}
                  >
                    Thông tin đặt phòng
                  </Text>
                  <View style={styles.modalInfoRow}>
                    <Ionicons
                      name="calendar-outline"
                      size={20}
                      color={colors.muted}
                    />
                    <Text
                      style={[styles.modalInfoText, { color: colors.text }]}
                    >
                      Ngày: {formatDate(selectedBooking.start_at)}
                    </Text>
                  </View>
                  <View style={styles.modalInfoRow}>
                    <Ionicons
                      name="time-outline"
                      size={20}
                      color={colors.muted}
                    />
                    <Text
                      style={[styles.modalInfoText, { color: colors.text }]}
                    >
                      Giờ:{" "}
                      {formatTime(
                        selectedBooking.start_at,
                        selectedBooking.end_at
                      )}
                    </Text>
                  </View>
                  <View style={styles.modalInfoRow}>
                    <Ionicons
                      name="people-outline"
                      size={20}
                      color={colors.muted}
                    />
                    <Text
                      style={[styles.modalInfoText, { color: colors.text }]}
                    >
                      Số lượng: {selectedBooking.attendee_count || 0} người
                    </Text>
                  </View>
                  <View style={styles.modalInfoRow}>
                    <Ionicons
                      name="document-text-outline"
                      size={20}
                      color={colors.muted}
                    />
                    <Text
                      style={[styles.modalInfoText, { color: colors.text }]}
                    >
                      Mục đích: {selectedBooking.purpose || "Không có"}
                    </Text>
                  </View>
                  <View style={styles.modalInfoRow}>
                    <Ionicons
                      name="flag-outline"
                      size={20}
                      color={colors.muted}
                    />
                    <Text
                      style={[styles.modalInfoText, { color: colors.text }]}
                    >
                      Trạng thái: {getStatusText(selectedBooking.status)}
                    </Text>
                  </View>
                </View>

                {/* Additional Info */}
                {(selectedBooking.approved_at ||
                  selectedBooking.cancelled_at ||
                  selectedBooking.cancel_reason) && (
                  <View style={styles.modalSection}>
                    <Text
                      style={[styles.modalSectionTitle, { color: colors.text }]}
                    >
                      Thông tin bổ sung
                    </Text>
                    {selectedBooking.approved_at && (
                      <View style={styles.modalInfoRow}>
                        <Ionicons
                          name="checkmark-circle-outline"
                          size={20}
                          color="#2ecc71"
                        />
                        <Text
                          style={[styles.modalInfoText, { color: colors.text }]}
                        >
                          Đã duyệt: {formatDate(selectedBooking.approved_at)}
                        </Text>
                      </View>
                    )}
                    {selectedBooking.cancelled_at && (
                      <View style={styles.modalInfoRow}>
                        <Ionicons
                          name="close-circle-outline"
                          size={20}
                          color="#e74c3c"
                        />
                        <Text
                          style={[styles.modalInfoText, { color: colors.text }]}
                        >
                          Đã hủy: {formatDate(selectedBooking.cancelled_at)}
                        </Text>
                      </View>
                    )}
                    {selectedBooking.cancel_reason && (
                      <View style={styles.modalInfoRow}>
                        <Ionicons
                          name="information-circle-outline"
                          size={20}
                          color={colors.muted}
                        />
                        <Text
                          style={[styles.modalInfoText, { color: colors.text }]}
                        >
                          Lý do hủy: {selectedBooking.cancel_reason}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </ScrollView>
            ) : null}
          </View>
        </View>
      </Modal>

      {/* Cancel Booking Modal */}
      <Modal
        visible={showCancelModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowCancelModal(false);
          setCancelReason("");
        }}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, { backgroundColor: colors.cardBg }]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Hủy đặt phòng
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowCancelModal(false);
                  setCancelReason("");
                }}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSubtext, { color: colors.muted }]}>
              Bạn có chắc chắn muốn hủy đặt phòng này? Vui lòng nhập lý do hủy.
            </Text>

            <View style={styles.modalInputContainer}>
              <Text style={[styles.modalInputLabel, { color: colors.text }]}>
                Lý do hủy
              </Text>
              <TextInput
                style={[
                  styles.modalTextInput,
                  {
                    backgroundColor: colors.inputBg,
                    borderColor: colors.inputBorder,
                    color: colors.text,
                  },
                ]}
                value={cancelReason}
                onChangeText={setCancelReason}
                placeholder="Nhập lý do hủy đặt phòng..."
                placeholderTextColor={colors.placeholder}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.modalButtonCancel,
                  { borderColor: colors.inputBorder },
                ]}
                onPress={() => {
                  setShowCancelModal(false);
                  setCancelReason("");
                }}
                disabled={isCancelling}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>
                  Hủy
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.modalButtonConfirm,
                  {
                    backgroundColor: colors.buttonBg,
                    opacity: isCancelling ? 0.6 : 1,
                  },
                ]}
                onPress={handleConfirmCancel}
                disabled={isCancelling || !cancelReason.trim()}
              >
                {isCancelling ? (
                  <ActivityIndicator size="small" color={colors.buttonText} />
                ) : (
                  <Text
                    style={[
                      styles.modalButtonText,
                      { color: colors.buttonText },
                    ]}
                  >
                    Xác nhận hủy
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
