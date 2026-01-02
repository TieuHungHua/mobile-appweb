import { StatusBar } from "expo-status-bar";
import { useMemo, useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  Alert,
  Image,
  Modal,
  PanResponder,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { createStyles } from "./EditInformation.styles";
import {
  PASSWORD_MIN_LENGTH,
  GENDER,
  GENDER_OPTIONS,
  VALIDATION_MESSAGES,
  SUCCESS_MESSAGES,
  PERMISSION_MESSAGES,
} from "./EditInformation.mock";

export default function EditInformationScreen({
  theme,
  lang,
  strings,
  colors,
  onNavigate,
}) {
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState(GENDER.MALE);
  const [avatarUri, setAvatarUri] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Pan responder for swipe back gesture
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return (
          gestureState.dx > 12 &&
          Math.abs(gestureState.dy) < Math.abs(gestureState.dx) &&
          evt.nativeEvent.pageX < 20
        );
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx > 50) {
          onNavigate?.("settings");
        }
      },
    })
  ).current;

  const handlePickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          strings?.permissionNeeded || PERMISSION_MESSAGES.PERMISSION_NEEDED,
          strings?.permissionMessage || PERMISSION_MESSAGES.PERMISSION_MESSAGE
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setAvatarUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert(
        strings?.error || "Error",
        strings?.imagePickerError || PERMISSION_MESSAGES.IMAGE_PICKER_ERROR
      );
    }
  };

  const handleDatePicker = () => {
    setShowDatePicker(true);
  };

  const handleDateChange = (event, date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
    if (date) {
      setSelectedDate(date);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      setDateOfBirth(`${day}/${month}/${year}`);
    }
  };

  const confirmDate = () => {
    setShowDatePicker(false);
    const day = String(selectedDate.getDate()).padStart(2, "0");
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const year = selectedDate.getFullYear();
    setDateOfBirth(`${day}/${month}/${year}`);
  };

  const handleSave = () => {
    if (!fullName.trim()) {
      Alert.alert(
        strings?.error || "Error",
        strings?.fullNameRequired || VALIDATION_MESSAGES.FULL_NAME_REQUIRED
      );
      return;
    }
    if (!phone.trim()) {
      Alert.alert(
        strings?.error || "Error",
        strings?.phoneRequired || VALIDATION_MESSAGES.PHONE_REQUIRED
      );
      return;
    }
    if (!dateOfBirth.trim()) {
      Alert.alert(
        strings?.error || "Error",
        strings?.dateOfBirthRequired ||
          VALIDATION_MESSAGES.DATE_OF_BIRTH_REQUIRED
      );
      return;
    }

    setShowPasswordModal(true);
    setPassword("");
    setPasswordError("");
  };

  const handlePasswordConfirm = () => {
    if (!password.trim()) {
      setPasswordError(
        strings?.passwordRequired || VALIDATION_MESSAGES.PASSWORD_REQUIRED
      );
      return;
    }

    if (password.length < PASSWORD_MIN_LENGTH) {
      setPasswordError(
        strings?.passwordIncorrect || VALIDATION_MESSAGES.PASSWORD_INCORRECT
      );
      return;
    }

    setShowPasswordModal(false);
    setPassword("");
    setPasswordError("");

    Alert.alert(
      strings?.success || "Success",
      strings?.saveSuccess || SUCCESS_MESSAGES.SAVE_SUCCESS,
      [
        {
          text: strings?.ok || "OK",
          onPress: () => onNavigate?.("settings"),
        },
      ]
    );
  };

  return (
    <View
      style={[styles.container, { backgroundColor: colors.background }]}
      {...panResponder.panHandlers}
    >
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
          {strings?.personalInformation || "THÔNG TIN CÁ NHÂN"}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* White card container */}
          <View style={[styles.card, { backgroundColor: colors.cardBg }]}>
            {/* Avatar Section */}
            <View style={styles.profileSection}>
              <TouchableOpacity
                style={styles.avatarWrapper}
                onPress={handlePickImage}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.avatarContainer,
                    {
                      backgroundColor: colors.inputBg,
                      borderColor: colors.inputBorder,
                    },
                  ]}
                >
                  {avatarUri ? (
                    <Image
                      source={{ uri: avatarUri }}
                      style={styles.avatarImage}
                    />
                  ) : (
                    <Ionicons name="person" size={50} color={colors.buttonBg} />
                  )}
                </View>
                <View
                  style={[
                    styles.editAvatarBadge,
                    {
                      backgroundColor: colors.buttonBg,
                      borderColor: colors.cardBg,
                    },
                  ]}
                >
                  <Ionicons name="camera" size={16} color={colors.buttonText} />
                </View>
              </TouchableOpacity>
            </View>

            {/* Input Fields */}
            <View style={styles.form}>
              {/* Full Name */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>
                  {strings?.fullName || "Họ và tên"}{" "}
                  <Text style={[styles.required, { color: colors.error }]}>
                    *
                  </Text>
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      borderColor: colors.inputBorder,
                      backgroundColor: colors.inputBg,
                      color: colors.text,
                    },
                  ]}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder={
                    strings?.fullNamePlaceholder || "Họ và tên của bạn"
                  }
                  placeholderTextColor={colors.placeholder}
                />
              </View>

              {/* Phone Number */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>
                  {strings?.phone || "Số điện thoại"}{" "}
                  <Text style={[styles.required, { color: colors.error }]}>
                    *
                  </Text>
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      borderColor: colors.inputBorder,
                      backgroundColor: colors.inputBg,
                      color: colors.text,
                    },
                  ]}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder={
                    strings?.phonePlaceholder || "Nhập số điện thoại"
                  }
                  placeholderTextColor={colors.placeholder}
                  keyboardType="phone-pad"
                />
              </View>

              {/* Date of Birth */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>
                  {strings?.dateOfBirth || "Ngày sinh"}{" "}
                  <Text style={[styles.required, { color: colors.error }]}>
                    *
                  </Text>
                </Text>
                <TouchableOpacity
                  style={[
                    styles.dateInputContainer,
                    {
                      borderColor: colors.inputBorder,
                      backgroundColor: colors.inputBg,
                    },
                  ]}
                  onPress={handleDatePicker}
                  activeOpacity={0.7}
                >
                  <TextInput
                    style={[
                      styles.dateInput,
                      { color: dateOfBirth ? colors.text : colors.placeholder },
                    ]}
                    value={dateOfBirth}
                    editable={false}
                    placeholder={
                      strings?.dateOfBirthPlaceholder ||
                      "Vui lòng chọn ngày sinh"
                    }
                    placeholderTextColor={colors.placeholder}
                  />
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color={colors.muted}
                  />
                </TouchableOpacity>
              </View>

              {/* Gender */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>
                  {strings?.gender || "Giới tính"}{" "}
                  <Text style={[styles.required, { color: colors.error }]}>
                    *
                  </Text>
                </Text>
                <View style={styles.radioContainer}>
                  {GENDER_OPTIONS.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={styles.radioOption}
                      onPress={() => setGender(option.value)}
                      activeOpacity={0.7}
                    >
                      <View
                        style={[
                          styles.radioCircle,
                          { borderColor: colors.inputBorder },
                        ]}
                      >
                        {gender === option.value && (
                          <View
                            style={[
                              styles.radioSelected,
                              { backgroundColor: "#9b59b6" },
                            ]}
                          />
                        )}
                      </View>
                      <Ionicons
                        name={option.value === GENDER.MALE ? "male" : "female"}
                        size={18}
                        color={
                          gender === option.value ? "#9b59b6" : colors.muted
                        }
                      />
                      <Text
                        style={[
                          styles.radioLabel,
                          {
                            color:
                              gender === option.value
                                ? colors.text
                                : colors.muted,
                          },
                        ]}
                      >
                        {strings?.[option.value] || option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.buttonBg }]}
              onPress={handleSave}
              activeOpacity={0.8}
            >
              <Text
                style={[styles.saveButtonText, { color: colors.buttonText }]}
              >
                {strings?.save || "Lưu"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <Modal
          visible={showDatePicker}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowDatePicker(false)}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
              style={[
                styles.modalContent,
                {
                  backgroundColor: colors.cardBg,
                  borderColor: colors.inputBorder,
                },
              ]}
            >
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {strings?.datePicker || "Date Picker"}
              </Text>
              {Platform.OS === "ios" && (
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display="spinner"
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                  style={styles.datePickerIOS}
                />
              )}
              {Platform.OS === "android" && (
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                />
              )}
              {Platform.OS === "ios" && (
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[
                      styles.modalButton,
                      {
                        backgroundColor: colors.inputBg,
                        borderColor: colors.inputBorder,
                      },
                    ]}
                    onPress={() => setShowDatePicker(false)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[styles.modalButtonText, { color: colors.text }]}
                    >
                      {strings?.cancel || "Cancel"}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.modalButton,
                      { backgroundColor: colors.buttonBg },
                    ]}
                    onPress={confirmDate}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.modalButtonText,
                        { color: colors.buttonText },
                      ]}
                    >
                      {strings?.ok || "OK"}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      )}

      {/* Password Confirmation Modal */}
      <Modal
        visible={showPasswordModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowPasswordModal(false);
          setPassword("");
          setPasswordError("");
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <View style={styles.modalOverlayContent}>
            <View
              style={[
                styles.modalContent,
                {
                  backgroundColor: colors.cardBg,
                  borderColor: colors.inputBorder,
                },
              ]}
            >
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {strings?.confirmPassword || "Xác nhận mật khẩu"}
              </Text>
              <Text style={[styles.modalDescription, { color: colors.muted }]}>
                {strings?.enterPasswordToSave ||
                  "Vui lòng nhập mật khẩu để lưu thông tin"}
              </Text>

              <View style={styles.passwordInputGroup}>
                <TextInput
                  style={[
                    styles.passwordInput,
                    {
                      borderColor: passwordError
                        ? colors.error
                        : colors.inputBorder,
                      backgroundColor: colors.inputBg,
                      color: colors.text,
                    },
                  ]}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setPasswordError("");
                  }}
                  placeholder={strings?.password || "Mật khẩu"}
                  placeholderTextColor={colors.placeholder}
                  secureTextEntry
                  autoFocus
                  onSubmitEditing={handlePasswordConfirm}
                />
                {passwordError ? (
                  <Text style={[styles.errorText, { color: colors.error }]}>
                    {passwordError}
                  </Text>
                ) : null}
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    {
                      backgroundColor: colors.inputBg,
                      borderColor: colors.inputBorder,
                    },
                  ]}
                  onPress={() => {
                    setShowPasswordModal(false);
                    setPassword("");
                    setPasswordError("");
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[styles.modalButtonText, { color: colors.text }]}
                  >
                    {strings?.cancel || "Hủy"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    { backgroundColor: colors.buttonBg },
                  ]}
                  onPress={handlePasswordConfirm}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.modalButtonText,
                      { color: colors.buttonText },
                    ]}
                  >
                    {strings?.confirm || "Xác nhận"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
