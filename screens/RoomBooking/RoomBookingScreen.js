import { StatusBar } from "expo-status-bar";
import { useMemo, useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { createStyles } from "./RoomBooking.styles";
import { mockTimeSlots } from "./RoomBooking.mock";
import { roomsAPI, bookingsAPI } from "../../utils/api";

export default function RoomBookingScreen({
  theme,
  lang,
  strings,
  colors,
  onNavigate,
}) {
  const styles = useMemo(() => createStyles(colors), [colors]);

  /**
   * Tạo ngày bắt đầu từ hôm nay và 5 ngày tiếp theo
   * @returns {Array}
   */
  const generateDates = useMemo(() => {
    const dates = [];
    const today = new Date();
    const dayNames = ["CN", "Th2", "Th3", "Th4", "Th5", "Th6", "Th7"];

    for (let i = 0; i < 5; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const day = date.getDate();
      const dayName = dayNames[date.getDay()];
      const month = date.getMonth() + 1;
      const year = date.getFullYear();

      const label = `${dayName} ${day}`;
      const value = `${year}-${month.toString().padStart(2, "0")}-${day
        .toString()
        .padStart(2, "0")}`;

      dates.push({ label, value });
    }

    return dates;
  }, []);

  const [selectedDate, setSelectedDate] = useState(generateDates[0]);
  const [selectedTime, setSelectedTime] = useState(mockTimeSlots[0]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [purpose, setPurpose] = useState("");
  const [studentCount, setStudentCount] = useState(5);
  const [rooms, setRooms] = useState([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successBookingInfo, setSuccessBookingInfo] = useState(null);
  const navigateTimeoutRef = useRef(null);
  const scrollViewRef = useRef(null);
  const purposeInputRef = useRef(null);

  const convertToISO8601 = (dateValue, timeSlot) => {
    const [startTime, endTime] = timeSlot.split("-");
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    const date = new Date(dateValue);
    const startDate = new Date(date);
    startDate.setHours(startHour, startMinute, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(endHour, endMinute, 0, 0);

    const timezoneOffset = 7;
    const offsetHours = timezoneOffset;
    const offsetMinutes = 0;
    const offsetSign = offsetHours >= 0 ? "+" : "-";
    const offsetString = `${offsetSign}${Math.abs(offsetHours)
      .toString()
      .padStart(2, "0")}:${offsetMinutes.toString().padStart(2, "0")}`;

    const formatISO8601 = (dateObj) => {
      const year = dateObj.getFullYear();
      const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
      const day = dateObj.getDate().toString().padStart(2, "0");
      const hours = dateObj.getHours().toString().padStart(2, "0");
      const minutes = dateObj.getMinutes().toString().padStart(2, "0");
      const seconds = dateObj.getSeconds().toString().padStart(2, "0");
      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${offsetString}`;
    };

    return {
      start_at: formatISO8601(startDate),
      end_at: formatISO8601(endDate),
    };
  };

  /**
   * lấy danh sách phòng
   */
  useEffect(() => {
    const fetchRooms = async () => {
      setIsLoadingRooms(true);
      try {
        const { start_at, end_at } = convertToISO8601(
          selectedDate.value,
          selectedTime
        );

        const response = await roomsAPI.getRooms({
          start_at,
          end_at,
          page: 1,
          pageSize: 50,
        });

        // convert API hiện thị trên UI

        const transformedRooms = response.items.map((room) => ({
          id: room.id,
          name: room.name,
          capacity: room.capacity,
          status: room.availability?.is_available ? "available" : "booked",
          amenities: room.resources || [],
          image_url: room.image_url,
        }));

        setRooms(transformedRooms);
        // reset phòng đã chọn nếu không còn trong danh sách
        if (
          selectedRoom &&
          !transformedRooms.find((r) => r.id === selectedRoom.id)
        ) {
          setSelectedRoom(null);
        }
      } catch (error) {
        console.error("[RoomBooking] Error fetching rooms:", error);

        Alert.alert("Lỗi", `Không thể tải danh sách phòng: ${error.message}`);
      } finally {
        setIsLoadingRooms(false);
      }
    };

    fetchRooms();
  }, [selectedDate, selectedTime]);

  const handleConfirm = async () => {
    if (!selectedRoom) {
      Alert.alert("Lỗi", "Vui lòng chọn phòng");
      return;
    }
    if (!purpose.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập mục đích đăng ký");
      return;
    }
    if (studentCount < 1 || studentCount > selectedRoom.capacity) {
      Alert.alert(
        "Lỗi",
        `Số lượng sinh viên phải từ 1 đến ${selectedRoom.capacity} người`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const { start_at, end_at } = convertToISO8601(
        selectedDate.value,
        selectedTime
      );

      const bookingData = {
        room_id: selectedRoom.id,
        start_at,
        end_at,
        purpose: purpose.trim(),
        attendee_count: studentCount,
      };

      const booking = await bookingsAPI.create(bookingData);

      setSuccessBookingInfo({
        roomName: selectedRoom.name,
        time: selectedTime,
        date: selectedDate.label,
      });
      setShowSuccessModal(true);

      // chuyển đến trang phòng đã đặt sau 10 giây
      const timeoutId = setTimeout(() => {
        setShowSuccessModal(false);
        onNavigate?.("bookedRooms");
      }, 10000);

      navigateTimeoutRef.current = timeoutId;
    } catch (error) {
      console.error("[RoomBooking] Error creating booking:", error);
      let errorMessage = "Không thể đặt phòng. Vui lòng thử lại.";

      // xử lý lỗi cụ thể
      if (error.message.includes("409") || error.message.includes("trùng")) {
        errorMessage =
          "Phòng này đã được đặt trong khung giờ này. Vui lòng chọn phòng hoặc thời gian khác.";
      } else if (
        error.message.includes("401") ||
        error.message.includes("đăng nhập")
      ) {
        errorMessage = "Vui lòng đăng nhập để đặt phòng.";
      } else if (error.message.includes("404")) {
        errorMessage = "Phòng không tồn tại. Vui lòng chọn phòng khác.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert("Lỗi", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const incrementCount = () => {
    if (studentCount < 20) {
      setStudentCount(studentCount + 1);
    }
  };

  const decrementCount = () => {
    if (studentCount > 1) {
      setStudentCount(studentCount - 1);
    }
  };

  /**
   * Handle focus on purpose input - scroll to make it visible
   */
  const handlePurposeFocus = () => {
    // Delay to ensure keyboard is shown
    setTimeout(
      () => {
        if (scrollViewRef.current) {
          // Scroll to end to show the input form
          scrollViewRef.current.scrollToEnd({ animated: true });
        }
      },
      Platform.OS === "ios" ? 300 : 100
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: "#F6F7F8" }]}>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />

      <View style={[styles.header, { backgroundColor: colors.headerBg }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => onNavigate?.("home")}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={colors.headerText} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.headerText }]}>
          {strings.roomBooking || "Đặt phòng họp nhóm"}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {/* chọn thời gian */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Chọn thời gian
              </Text>
              <TouchableOpacity>
                <Text style={[styles.linkText, { color: colors.buttonBg }]}>
                  Lịch đầy đủ
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.dateScrollContainer}
            >
              {generateDates.map((date) => (
                <TouchableOpacity
                  key={date.value}
                  style={[
                    styles.dateCard,
                    {
                      backgroundColor:
                        selectedDate.value === date.value
                          ? colors.buttonBg
                          : colors.cardBg,
                      borderColor: colors.inputBorder,
                    },
                  ]}
                  onPress={() => setSelectedDate(date)}
                >
                  <Text
                    style={[
                      styles.dateText,
                      {
                        color:
                          selectedDate.value === date.value
                            ? colors.buttonText
                            : colors.text,
                      },
                    ]}
                  >
                    {date.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.timeScrollContainer}
            >
              {mockTimeSlots.map((time) => (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.timeCard,
                    {
                      backgroundColor:
                        selectedTime === time ? colors.buttonBg : colors.cardBg,
                      borderColor: colors.inputBorder,
                    },
                  ]}
                  onPress={() => setSelectedTime(time)}
                >
                  <Text
                    style={[
                      styles.timeText,
                      {
                        color:
                          selectedTime === time
                            ? colors.buttonText
                            : colors.text,
                      },
                    ]}
                  >
                    {time}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* danh sách phòng */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Danh sách phòng
            </Text>
            {isLoadingRooms ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.buttonBg} />
                <Text style={[styles.loadingText, { color: colors.muted }]}>
                  Đang tải danh sách phòng...
                </Text>
              </View>
            ) : rooms.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="cube-outline" size={48} color={colors.muted} />
                <Text style={[styles.emptyText, { color: colors.muted }]}>
                  Không có phòng nào khả dụng trong khung giờ này
                </Text>
              </View>
            ) : (
              rooms.map((room) => {
                const isSelected = selectedRoom?.id === room.id;
                return (
                  <TouchableOpacity
                    key={room.id}
                    style={[
                      styles.roomCard,
                      {
                        backgroundColor: colors.cardBg,
                        borderColor: isSelected
                          ? colors.buttonBg
                          : "transparent",
                        borderWidth: isSelected ? 2 : 0,
                      },
                    ]}
                    onPress={() => setSelectedRoom(room)}
                  >
                    {isSelected && (
                      <View
                        style={[
                          styles.checkmark,
                          { backgroundColor: colors.buttonBg },
                        ]}
                      >
                        <Ionicons
                          name="checkmark"
                          size={16}
                          color={colors.buttonText}
                        />
                      </View>
                    )}
                    <View
                      style={[
                        styles.roomIcon,
                        { backgroundColor: colors.inputBg },
                      ]}
                    >
                      <Ionicons
                        name="cube-outline"
                        size={24}
                        color={colors.buttonBg}
                      />
                    </View>
                    <View style={styles.roomInfo}>
                      <Text style={[styles.roomName, { color: colors.text }]}>
                        {room.name}
                      </Text>
                      <View style={styles.roomDetails}>
                        <View style={styles.roomDetailItem}>
                          <Ionicons
                            name="people-outline"
                            size={14}
                            color={colors.muted}
                          />
                          <Text
                            style={[
                              styles.roomDetailText,
                              { color: colors.muted },
                            ]}
                          >
                            {room.capacity} người
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.statusBadge,
                            {
                              backgroundColor:
                                room.status === "available"
                                  ? "#2ecc71"
                                  : colors.inputBg,
                            },
                          ]}
                        >
                          <View
                            style={[
                              styles.statusDot,
                              {
                                backgroundColor:
                                  room.status === "available"
                                    ? "#FFFFFF"
                                    : colors.muted,
                              },
                            ]}
                          />
                          <Text
                            style={[
                              styles.statusText,
                              {
                                color:
                                  room.status === "available"
                                    ? "#FFFFFF"
                                    : colors.muted,
                              },
                            ]}
                          >
                            {room.status === "available"
                              ? "Còn trống"
                              : "Đã kín"}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.amenitiesRow}>
                        {room.amenities.map((amenity, idx) => (
                          <View
                            key={idx}
                            style={[
                              styles.amenityTag,
                              { backgroundColor: colors.inputBg },
                            ]}
                          >
                            <Text
                              style={[
                                styles.amenityText,
                                { color: colors.muted },
                              ]}
                            >
                              {amenity}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Chi tiết đăng ký
            </Text>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                Mục đích đăng ký
              </Text>
              <TextInput
                ref={purposeInputRef}
                style={[
                  styles.textInput,
                  {
                    backgroundColor: colors.inputBg,
                    borderColor: colors.inputBorder,
                    color: colors.text,
                  },
                ]}
                value={purpose}
                onChangeText={setPurpose}
                placeholder="Nhập mục đích đăng ký..."
                placeholderTextColor={colors.placeholder}
                multiline
                onFocus={handlePurposeFocus}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                Số lượng sinh viên
              </Text>
              <View
                style={[
                  styles.quantitySelector,
                  {
                    backgroundColor: colors.inputBg,
                    borderColor: colors.inputBorder,
                  },
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.quantityButton,
                    {
                      backgroundColor:
                        studentCount > 1 ? colors.buttonBg : colors.inputBg,
                    },
                  ]}
                  onPress={decrementCount}
                  disabled={studentCount <= 1}
                >
                  <Text
                    style={[
                      styles.quantityButtonText,
                      {
                        color:
                          studentCount > 1 ? colors.buttonText : colors.muted,
                      },
                    ]}
                  >
                    -
                  </Text>
                </TouchableOpacity>
                <Text style={[styles.quantityValue, { color: colors.text }]}>
                  {studentCount}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.quantityButton,
                    {
                      backgroundColor:
                        studentCount < 20 ? colors.buttonBg : colors.inputBg,
                    },
                  ]}
                  onPress={incrementCount}
                  disabled={studentCount >= 20}
                >
                  <Text
                    style={[
                      styles.quantityButtonText,
                      {
                        color:
                          studentCount < 20 ? colors.buttonText : colors.muted,
                      },
                    ]}
                  >
                    +
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={[styles.footer, { backgroundColor: colors.cardBg }]}>
        <TouchableOpacity
          style={[
            styles.confirmButton,
            {
              backgroundColor: colors.buttonBg,
              opacity: isSubmitting ? 0.6 : 1,
            },
          ]}
          onPress={handleConfirm}
          activeOpacity={0.8}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={colors.buttonText} />
          ) : (
            <Text
              style={[styles.confirmButtonText, { color: colors.buttonText }]}
            >
              Xác nhận đặt phòng
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Popup thành công */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowSuccessModal(false);
          onNavigate?.("bookedRooms");
        }}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, { backgroundColor: colors.cardBg }]}
          >
            <View style={styles.modalIconContainer}>
              <View
                style={[
                  styles.modalIconCircle,
                  { backgroundColor: colors.buttonBg + "20" },
                ]}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={64}
                  color={colors.buttonBg}
                />
              </View>
            </View>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Đặt phòng thành công!
            </Text>
            {successBookingInfo && (
              <View style={styles.modalInfoContainer}>
                <View style={styles.modalInfoRow}>
                  <Ionicons
                    name="cube-outline"
                    size={20}
                    color={colors.muted}
                  />
                  <Text style={[styles.modalInfoText, { color: colors.text }]}>
                    {successBookingInfo.roomName}
                  </Text>
                </View>
                <View style={styles.modalInfoRow}>
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color={colors.muted}
                  />
                  <Text style={[styles.modalInfoText, { color: colors.text }]}>
                    {successBookingInfo.date}
                  </Text>
                </View>
                <View style={styles.modalInfoRow}>
                  <Ionicons
                    name="time-outline"
                    size={20}
                    color={colors.muted}
                  />
                  <Text style={[styles.modalInfoText, { color: colors.text }]}>
                    {successBookingInfo.time}
                  </Text>
                </View>
              </View>
            )}
            <Text style={[styles.modalSubtext, { color: colors.muted }]}>
              Đang chuyển đến trang phòng đã đặt...
            </Text>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.buttonBg }]}
              onPress={() => {
                if (navigateTimeoutRef.current) {
                  clearTimeout(navigateTimeoutRef.current);
                }
                setShowSuccessModal(false);
                onNavigate?.("bookedRooms");
              }}
              activeOpacity={0.8}
            >
              <Text
                style={[styles.modalButtonText, { color: colors.buttonText }]}
              >
                Xem phòng đã đặt
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
