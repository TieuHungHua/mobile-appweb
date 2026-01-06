import { StatusBar } from "expo-status-bar";
import { useMemo, useState, useRef, useEffect } from "react";
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
  MAJOR_OPTIONS,
  VALIDATION_MESSAGES,
  SUCCESS_MESSAGES,
  PERMISSION_MESSAGES,
} from "./EditInformation.mock";
import { getStoredUserInfo, userAPI } from "../../utils/api";

export default function EditInformationScreen({
  theme,
  lang,
  strings,
  colors,
  onNavigate,
}) {
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [studentId, setStudentId] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showMajorPicker, setShowMajorPicker] = useState(false);
  const [gender, setGender] = useState(GENDER.MALE);
  const [avatarUri, setAvatarUri] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [classMajor, setClassMajor] = useState("");

  // Load user info when component mounts
  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        // First try to get from storage
        let userInfo = await getStoredUserInfo();
        console.log("[EditInformation] Loaded user info from storage:", userInfo);

        // Only fetch from API if we don't have user info at all
        // If we have user info but missing some fields, we'll use what we have
        if (!userInfo) {
          try {
            console.log("[EditInformation] No user info in storage, fetching from API...");
            userInfo = await userAPI.getProfile();
            console.log("[EditInformation] Loaded user info from API:", userInfo);
          } catch (apiError) {
            console.error("[EditInformation] Error fetching from API:", apiError);
            // If API fails, show error but don't break the flow
            // User can still edit with empty form
            userInfo = null;
          }
        }

        if (userInfo) {
          // Set user ID
          if (userInfo.id || userInfo._id) {
            setUserId(userInfo.id || userInfo._id);
          }

          // Set form fields with existing user data
          // Display Name
          const displayName = userInfo.name || userInfo.fullName || userInfo.displayName || userInfo.username || "";
          if (displayName) {
            console.log("[EditInformation] Setting fullName:", displayName);
            setFullName(displayName);
          }

          // Email
          if (userInfo.email) {
            console.log("[EditInformation] Setting email:", userInfo.email);
            setEmail(userInfo.email);
          }

          // Student ID
          if (userInfo.studentId || userInfo.lecturerId) {
            const id = userInfo.studentId || userInfo.lecturerId;
            console.log("[EditInformation] Setting studentId:", id);
            setStudentId(id);
          }

          // Phone
          if (userInfo.phone) {
            console.log("[EditInformation] Setting phone:", userInfo.phone);
            setPhone(userInfo.phone);
          }

          // Class/Major
          if (userInfo.classMajor || userInfo.class || userInfo.major) {
            const major = userInfo.classMajor || userInfo.class || userInfo.major;
            console.log("[EditInformation] Setting classMajor:", major);
            setClassMajor(major);
          }

          // Date of birth - convert to YYYY-MM-DD format for API
          if (userInfo.dateOfBirth || userInfo.birthDate || userInfo.dob) {
            const dob = userInfo.dateOfBirth || userInfo.birthDate || userInfo.dob;
            console.log("[EditInformation] Setting dateOfBirth:", dob);

            let dateObj;
            if (typeof dob === "string") {
              if (dob.includes("/")) {
                // DD/MM/YYYY format
                const [day, month, year] = dob.split("/");
                dateObj = new Date(year, month - 1, day);
              } else if (dob.includes("-")) {
                // YYYY-MM-DD or ISO format
                dateObj = new Date(dob);
              } else {
                dateObj = new Date(dob);
              }
            } else {
              dateObj = new Date(dob);
            }

            if (!isNaN(dateObj.getTime())) {
              setSelectedDate(dateObj);
              // Format as YYYY-MM-DD for API
              const year = dateObj.getFullYear();
              const month = String(dateObj.getMonth() + 1).padStart(2, "0");
              const day = String(dateObj.getDate()).padStart(2, "0");
              const formattedDate = `${year}-${month}-${day}`;
              setDateOfBirth(formattedDate);
            }
          }

          // Gender - support male, female, other
          if (userInfo.gender) {
            console.log("[EditInformation] Setting gender:", userInfo.gender);
            if (userInfo.gender === "female" || userInfo.gender === GENDER.FEMALE) {
              setGender(GENDER.FEMALE);
            } else if (userInfo.gender === "other") {
              setGender(GENDER.OTHER || "other");
            } else {
              setGender(GENDER.MALE);
            }
          }

          // Avatar
          if (userInfo.avatar || userInfo.avatarUri || userInfo.profileImage) {
            const avatar = userInfo.avatar || userInfo.avatarUri || userInfo.profileImage;
            console.log("[EditInformation] Setting avatar:", avatar);
            setAvatarUri(avatar);
          }
        } else {
          console.log("[EditInformation] No user info found in storage");
        }
      } catch (error) {
        console.error("[EditInformation] Error loading user info:", error);
      }
    };
    loadUserInfo();
  }, []);

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
      // Format as YYYY-MM-DD for API
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      setDateOfBirth(`${year}-${month}-${day}`);
    }
  };

  const confirmDate = () => {
    setShowDatePicker(false);
    // Format as YYYY-MM-DD for API
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDate.getDate()).padStart(2, "0");
    setDateOfBirth(`${year}-${month}-${day}`);
  };

  const handleSave = () => {
    if (!fullName.trim()) {
      Alert.alert(
        strings?.error || "Error",
        strings?.fullNameRequired || VALIDATION_MESSAGES.FULL_NAME_REQUIRED
      );
      return;
    }

    if (!userId) {
      Alert.alert(
        strings?.error || "Lỗi",
        "Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại."
      );
      return;
    }

    setShowPasswordModal(true);
    setPassword("");
    setPasswordError("");
  };

  const handlePasswordConfirm = async () => {
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

    try {
      setLoading(true);
      setPasswordError("");

      if (!userId) {
        throw new Error("Không tìm thấy ID người dùng");
      }

      // Prepare update data according to API spec
      // Note: Password is not sent in body, authentication is done via Bearer token
      const updateData = {
        userId,
      };

      // Add optional fields (only if they have values)
      if (fullName.trim()) {
        updateData.displayName = fullName.trim();
      }
      if (email.trim()) {
        updateData.email = email.trim();
      }
      if (studentId.trim()) {
        updateData.studentId = studentId.trim();
      }
      if (classMajor.trim()) {
        updateData.classMajor = classMajor.trim();
      }
      if (dateOfBirth.trim()) {
        updateData.dateOfBirth = dateOfBirth.trim(); // Already in YYYY-MM-DD format
      }
      if (gender) {
        // Convert gender to API format: male, female, other
        const genderValue = gender === GENDER.FEMALE ? "female" :
          (gender === "other" || gender === GENDER.OTHER) ? "other" : "male";
        updateData.gender = genderValue;
      }

      // Get user role from stored info if available
      const userInfo = await getStoredUserInfo();
      if (userInfo?.role) {
        updateData.role = userInfo.role;
      }

      // Add avatar URI if selected (will be uploaded as file)
      if (avatarUri) {
        // Check if it's a local URI (starts with file:// or content://) or remote URL
        const isLocalUri = avatarUri.startsWith("file://") ||
          avatarUri.startsWith("content://") ||
          avatarUri.startsWith("ph://") ||
          avatarUri.startsWith("/");
        if (isLocalUri) {
          updateData.avatarUri = avatarUri;
        } else {
          // If it's already a remote URL, we might not need to upload again
          // But API expects file upload, so we'll skip it if it's already a URL
          console.log("[EditInformation] Avatar is already a remote URL, skipping upload");
        }
      }

      // Call API to update profile with FormData
      const response = await userAPI.updateProfile(updateData);

      setShowPasswordModal(false);
      setPassword("");
      setPasswordError("");
      setLoading(false);

      Alert.alert(
        strings?.success || "Thành công",
        strings?.saveSuccess || SUCCESS_MESSAGES.SAVE_SUCCESS,
        [
          {
            text: strings?.ok || "OK",
            onPress: () => onNavigate?.("settings"),
          },
        ]
      );
    } catch (error) {
      console.error("Error updating profile:", error);
      setLoading(false);
      setPasswordError(
        error.message || strings?.updateError || "Không thể cập nhật thông tin"
      );
    }
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

              {/* Email */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>
                  {strings?.email || "Email"}
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
                  value={email}
                  onChangeText={setEmail}
                  placeholder={
                    strings?.emailPlaceholder || "Nhập email"
                  }
                  placeholderTextColor={colors.placeholder}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {/* Student ID */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>
                  {strings?.studentId || "Mã sinh viên/Giảng viên"}
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
                  value={studentId}
                  onChangeText={setStudentId}
                  placeholder={
                    strings?.studentIdPlaceholder || "Nhập mã sinh viên/giảng viên"
                  }
                  placeholderTextColor={colors.placeholder}
                />
              </View>

              {/* Class/Major */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>
                  {strings?.classMajor || "Lớp/Chuyên ngành"}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.dateInputContainer,
                    {
                      borderColor: colors.inputBorder,
                      backgroundColor: colors.inputBg,
                    },
                  ]}
                  onPress={() => setShowMajorPicker(true)}
                  activeOpacity={0.7}
                >
                  <TextInput
                    style={[
                      styles.dateInput,
                      { color: classMajor ? colors.text : colors.placeholder },
                    ]}
                    value={classMajor}
                    editable={false}
                    placeholder={
                      strings?.classMajorPlaceholder || "Chọn ngành học"
                    }
                    placeholderTextColor={colors.placeholder}
                  />
                  <Ionicons
                    name="chevron-down-outline"
                    size={20}
                    color={colors.muted}
                  />
                </TouchableOpacity>
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
                        name={
                          option.value === GENDER.MALE
                            ? "male"
                            : option.value === GENDER.FEMALE
                              ? "female"
                              : "person"
                        }
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
      {/* Major Picker Modal */}
      {showMajorPicker && (
        <Modal
          visible={showMajorPicker}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowMajorPicker(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowMajorPicker(false)}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
              style={[
                styles.modalContent,
                {
                  backgroundColor: colors.cardBg,
                  borderColor: colors.inputBorder,
                  maxHeight: "70%",
                },
              ]}
            >
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {strings?.selectMajor || "Chọn ngành học"}
              </Text>
              <ScrollView
                style={styles.majorList}
                showsVerticalScrollIndicator={true}
              >
                {MAJOR_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.majorOption,
                      {
                        backgroundColor:
                          classMajor === option.value
                            ? colors.buttonBg + "20"
                            : "transparent",
                        borderBottomColor: colors.inputBorder,
                      },
                    ]}
                    onPress={() => {
                      setClassMajor(option.value);
                      setShowMajorPicker(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.majorOptionText,
                        {
                          color:
                            classMajor === option.value
                              ? colors.buttonBg
                              : colors.text,
                          fontWeight:
                            classMajor === option.value ? "600" : "400",
                        },
                      ]}
                    >
                      {option.label}
                    </Text>
                    {classMajor === option.value && (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color={colors.buttonBg}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    { backgroundColor: colors.buttonBg },
                  ]}
                  onPress={() => setShowMajorPicker(false)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.modalButtonText,
                      { color: colors.buttonText },
                    ]}
                  >
                    {strings?.close || "Đóng"}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      )}

      {/* Major Picker Modal */}
      {showMajorPicker && (
        <Modal
          visible={showMajorPicker}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowMajorPicker(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowMajorPicker(false)}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
              style={[
                styles.modalContent,
                {
                  backgroundColor: colors.cardBg,
                  borderColor: colors.inputBorder,
                  maxHeight: "70%",
                },
              ]}
            >
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {strings?.selectMajor || "Chọn ngành học"}
              </Text>
              <ScrollView
                style={styles.majorList}
                showsVerticalScrollIndicator={true}
              >
                {MAJOR_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.majorOption,
                      {
                        backgroundColor:
                          classMajor === option.value
                            ? colors.buttonBg + "20"
                            : "transparent",
                        borderBottomColor: colors.inputBorder,
                      },
                    ]}
                    onPress={() => {
                      setClassMajor(option.value);
                      setShowMajorPicker(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.majorOptionText,
                        {
                          color:
                            classMajor === option.value
                              ? colors.buttonBg
                              : colors.text,
                          fontWeight:
                            classMajor === option.value ? "600" : "400",
                        },
                      ]}
                    >
                      {option.label}
                    </Text>
                    {classMajor === option.value && (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color={colors.buttonBg}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    { backgroundColor: colors.buttonBg },
                  ]}
                  onPress={() => setShowMajorPicker(false)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.modalButtonText,
                      { color: colors.buttonText },
                    ]}
                  >
                    {strings?.close || "Đóng"}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      )}

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
                    {
                      backgroundColor: colors.buttonBg,
                      opacity: loading ? 0.6 : 1,
                    },
                  ]}
                  onPress={handlePasswordConfirm}
                  activeOpacity={0.7}
                  disabled={loading}
                >
                  <Text
                    style={[
                      styles.modalButtonText,
                      { color: colors.buttonText },
                    ]}
                  >
                    {loading
                      ? (strings?.saving || "Đang lưu...")
                      : (strings?.confirm || "Xác nhận")}
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
