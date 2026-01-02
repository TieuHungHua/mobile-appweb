import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
  ActivityIndicator,
} from "react-native";
import { authAPI } from "../../utils/api";
import { createStyles } from "./Register.styles";
import {
  INITIAL_STATE,
  USER_TYPES,
  USER_TYPE_ROLES,
  EMAIL_DOMAIN,
  STUDENT_CODE_CONFIG,
  VALIDATION_MESSAGES,
  KEYBOARD_OFFSET_IOS,
  KEYBOARD_OFFSET_ANDROID,
} from "./Register.mock";

export default function RegisterScreen({
  onNavigateToLogin,
  onToggleTheme,
  onSelectLanguage,
  theme,
  lang,
  strings,
  colors,
}) {
  const [username, setUsername] = useState(INITIAL_STATE.username);
  const [password, setPassword] = useState(INITIAL_STATE.password);
  const [confirmPassword, setConfirmPassword] = useState(
    INITIAL_STATE.confirmPassword
  );
  const [email, setEmail] = useState(INITIAL_STATE.email);
  const [phone, setPhone] = useState(INITIAL_STATE.phone);
  const [userType, setUserType] = useState(INITIAL_STATE.userType);
  const [code, setCode] = useState(INITIAL_STATE.code);
  const [emailError, setEmailError] = useState("");
  const [codeError, setCodeError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [registerError, setRegisterError] = useState("");

  const styles = useMemo(() => createStyles(colors), [colors]);

  const validateEmail = (emailValue) => {
    if (!emailValue) {
      setEmailError("");
      return true;
    }
    if (!emailValue.endsWith(EMAIL_DOMAIN)) {
      setEmailError(strings.emailError || VALIDATION_MESSAGES.EMAIL_ERROR);
      return false;
    }
    setEmailError("");
    return true;
  };

  const validateCode = (codeValue) => {
    if (userType !== USER_TYPES.STUDENT) {
      setCodeError("");
      return true;
    }
    if (!codeValue) {
      setCodeError("");
      return true;
    }
    if (!STUDENT_CODE_CONFIG.FORMAT.test(codeValue)) {
      setCodeError(
        strings.studentCodeError || VALIDATION_MESSAGES.STUDENT_CODE_ERROR
      );
      return false;
    }
    setCodeError("");
    return true;
  };

  const handleEmailChange = (text) => {
    setEmail(text);
    validateEmail(text);
  };

  const handleCodeChange = (text) => {
    if (userType === USER_TYPES.STUDENT) {
      const numericText = text.replace(/[^0-9]/g, "");
      setCode(numericText);
      validateCode(numericText);
    } else {
      setCode(text);
      validateCode(text);
    }
  };

  const handleRegister = async () => {
    setRegisterError("");

    if (!validateEmail(email)) {
      return;
    }

    if (userType === USER_TYPES.STUDENT && !validateCode(code)) {
      return;
    }

    if (!username.trim()) {
      setRegisterError(
        strings.usernameRequired || VALIDATION_MESSAGES.USERNAME_REQUIRED
      );
      return;
    }
    if (!password.trim()) {
      setRegisterError(
        strings.passwordRequired || VALIDATION_MESSAGES.PASSWORD_REQUIRED
      );
      return;
    }
    if (!confirmPassword.trim()) {
      setRegisterError(
        strings.confirmPasswordRequired ||
          VALIDATION_MESSAGES.CONFIRM_PASSWORD_REQUIRED
      );
      return;
    }
    if (!phone.trim()) {
      setRegisterError(
        strings.phoneRequired || VALIDATION_MESSAGES.PHONE_REQUIRED
      );
      return;
    }
    if (userType === USER_TYPES.STUDENT && !code.trim()) {
      setRegisterError(
        strings.studentCodeRequired || VALIDATION_MESSAGES.STUDENT_CODE_REQUIRED
      );
      return;
    }

    setIsLoading(true);

    try {
      const role = USER_TYPE_ROLES[userType];

      const registerData = {
        username: username.trim(),
        email: email.trim(),
        phone: phone.trim(),
        role: role,
        password: password,
        confirmPassword: confirmPassword,
      };

      if (userType === USER_TYPES.STUDENT) {
        registerData.studentId = code.trim();
      }

      await authAPI.register(registerData);

      Alert.alert(
        VALIDATION_MESSAGES.REGISTER_SUCCESS,
        VALIDATION_MESSAGES.REGISTER_SUCCESS_DESC,
        [
          {
            text: strings.ok || "OK",
            onPress: () => {
              if (onNavigateToLogin) {
                onNavigateToLogin();
              }
            },
          },
        ]
      );
    } catch (error) {
      const errorMessage =
        error.message ||
        strings.registerError ||
        VALIDATION_MESSAGES.REGISTER_ERROR;
      setRegisterError(errorMessage);
      Alert.alert(strings.registerError || "Lỗi đăng ký", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={
          Platform.OS === "ios" ? KEYBOARD_OFFSET_IOS : KEYBOARD_OFFSET_ANDROID
        }
      >
        <View
          style={[styles.container, { backgroundColor: colors.background }]}
        >
          <StatusBar style={theme === "dark" ? "light" : "dark"} />

          {/* Header */}
          <View style={[styles.header, { backgroundColor: colors.headerBg }]}>
            <Text style={[styles.headerTitle, { color: colors.headerText }]}>
              {strings.uniTitle}
            </Text>
          </View>

          {/* Register Card */}
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.cardContainer}>
              <View
                style={[
                  styles.registerCard,
                  { backgroundColor: colors.cardBg },
                ]}
              >
                {/* Title */}
                <Text style={[styles.registerTitle, { color: colors.text }]}>
                  {strings.registerTitle}
                </Text>

                {/* Form */}
                <View style={styles.form}>
                  {/* Username */}
                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: colors.label }]}>
                      {strings.username}{" "}
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
                      value={username}
                      onChangeText={setUsername}
                      autoCapitalize="none"
                      placeholderTextColor={colors.placeholder}
                    />
                  </View>

                  {/* Email */}
                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: colors.label }]}>
                      {strings.email}{" "}
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
                        emailError ? styles.inputError : null,
                      ]}
                      value={email}
                      onChangeText={handleEmailChange}
                      placeholder={strings.emailExample}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      placeholderTextColor={colors.placeholder}
                    />
                    {emailError ? (
                      <Text style={[styles.errorText, { color: colors.error }]}>
                        {emailError}
                      </Text>
                    ) : null}
                  </View>

                  {/* Phone */}
                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: colors.label }]}>
                      {strings.phone}{" "}
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
                      placeholder={strings.phonePlaceholder}
                      keyboardType="phone-pad"
                      placeholderTextColor={colors.placeholder}
                    />
                  </View>

                  {/* Account Type */}
                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: colors.label }]}>
                      {strings.accountType}{" "}
                      <Text style={[styles.required, { color: colors.error }]}>
                        *
                      </Text>
                    </Text>
                    <View style={styles.radioContainer}>
                      <TouchableOpacity
                        style={styles.radioOption}
                        onPress={() => {
                          setUserType(USER_TYPES.STUDENT);
                          setCode("");
                          setCodeError("");
                        }}
                      >
                        <View
                          style={[
                            styles.radioCircle,
                            { borderColor: colors.buttonBg },
                          ]}
                        >
                          {userType === USER_TYPES.STUDENT && (
                            <View
                              style={[
                                styles.radioSelected,
                                { backgroundColor: colors.buttonBg },
                              ]}
                            />
                          )}
                        </View>
                        <Text
                          style={[styles.radioLabel, { color: colors.label }]}
                        >
                          {strings.student}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.radioOption}
                        onPress={() => {
                          setUserType(USER_TYPES.TEACHER);
                          setCode("");
                          setCodeError("");
                        }}
                      >
                        <View
                          style={[
                            styles.radioCircle,
                            { borderColor: colors.buttonBg },
                          ]}
                        >
                          {userType === USER_TYPES.TEACHER && (
                            <View
                              style={[
                                styles.radioSelected,
                                { backgroundColor: colors.buttonBg },
                              ]}
                            />
                          )}
                        </View>
                        <Text
                          style={[styles.radioLabel, { color: colors.label }]}
                        >
                          {strings.teacher}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Code (Student ID / Teacher Code) */}
                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: colors.label }]}>
                      {userType === USER_TYPES.STUDENT
                        ? strings.studentCode
                        : strings.teacherCode}{" "}
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
                        codeError ? styles.inputError : null,
                      ]}
                      value={code}
                      onChangeText={handleCodeChange}
                      placeholder={
                        userType === USER_TYPES.STUDENT
                          ? strings.studentCodePlaceholder
                          : strings.teacherCodePlaceholder
                      }
                      autoCapitalize="none"
                      keyboardType={
                        userType === USER_TYPES.STUDENT
                          ? STUDENT_CODE_CONFIG.KEYBOARD_TYPE
                          : "default"
                      }
                      maxLength={
                        userType === USER_TYPES.STUDENT
                          ? STUDENT_CODE_CONFIG.MAX_LENGTH
                          : undefined
                      }
                      placeholderTextColor={colors.placeholder}
                    />
                    {codeError ? (
                      <Text style={[styles.errorText, { color: colors.error }]}>
                        {codeError}
                      </Text>
                    ) : null}
                  </View>

                  {/* Password */}
                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: colors.label }]}>
                      {strings.password}{" "}
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
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                      autoCapitalize="none"
                      placeholderTextColor={colors.placeholder}
                    />
                  </View>

                  {/* Confirm Password */}
                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: colors.label }]}>
                      {strings.confirmPassword}{" "}
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
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry
                      autoCapitalize="none"
                      placeholderTextColor={colors.placeholder}
                    />
                  </View>

                  {/* Error Message */}
                  {registerError ? (
                    <View style={styles.errorContainer}>
                      <Text style={[styles.errorText, { color: colors.error }]}>
                        {registerError}
                      </Text>
                    </View>
                  ) : null}

                  {/* Register Button */}
                  <TouchableOpacity
                    style={[
                      styles.registerButton,
                      { backgroundColor: colors.buttonBg },
                      isLoading && styles.registerButtonDisabled,
                    ]}
                    onPress={handleRegister}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color={colors.buttonText} />
                    ) : (
                      <Text
                        style={[
                          styles.buttonText,
                          { color: colors.buttonText },
                        ]}
                      >
                        {strings.register}
                      </Text>
                    )}
                  </TouchableOpacity>

                  {/* Back to Login Button */}
                  <TouchableOpacity
                    style={[styles.backButton, { borderColor: colors.outline }]}
                    onPress={onNavigateToLogin}
                  >
                    <Text
                      style={[styles.backButtonText, { color: colors.outline }]}
                    >
                      {strings.backToLogin}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}
