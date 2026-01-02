import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { createStyles } from "./RoomBooking.styles";
import { mockRooms, mockTimeSlots, mockDates } from "./RoomBooking.mock";

export default function RoomBookingScreen({
  theme,
  lang,
  strings,
  colors,
  onNavigate,
}) {
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [selectedDate, setSelectedDate] = useState(mockDates[0]);
  const [selectedTime, setSelectedTime] = useState(mockTimeSlots[0]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [purpose, setPurpose] = useState("");
  const [studentCount, setStudentCount] = useState(5);

  const handleConfirm = () => {
    if (!selectedRoom) {
      Alert.alert("Lỗi", "Vui lòng chọn phòng");
      return;
    }
    if (!purpose.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập mục đích đăng ký");
      return;
    }
    Alert.alert(
      "Thành công",
      `Đã đặt phòng ${selectedRoom.name} thành công!\nThời gian: ${selectedTime}\nNgày: ${selectedDate.label}`,
      [{ text: "OK", onPress: () => onNavigate?.("bookedRooms") }]
    );
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

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Time Selection Section */}
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
            {mockDates.map((date) => (
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
                        selectedTime === time ? colors.buttonText : colors.text,
                    },
                  ]}
                >
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Room List Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Danh sách phòng
          </Text>
          {mockRooms.map((room) => {
            const isSelected = selectedRoom?.id === room.id;
            return (
              <TouchableOpacity
                key={room.id}
                style={[
                  styles.roomCard,
                  {
                    backgroundColor: colors.cardBg,
                    borderColor: isSelected ? colors.buttonBg : "transparent",
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
                  style={[styles.roomIcon, { backgroundColor: colors.inputBg }]}
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
                        style={[styles.roomDetailText, { color: colors.muted }]}
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
                        {room.status === "available" ? "Còn trống" : "Đã kín"}
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
                          style={[styles.amenityText, { color: colors.muted }]}
                        >
                          {amenity}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
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

      <View style={[styles.footer, { backgroundColor: colors.cardBg }]}>
        <TouchableOpacity
          style={[styles.confirmButton, { backgroundColor: colors.buttonBg }]}
          onPress={handleConfirm}
          activeOpacity={0.8}
        >
          <Text
            style={[styles.confirmButtonText, { color: colors.buttonText }]}
          >
            Xác nhận đặt phòng
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
