import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import SettingsPanel from "../../components/SettingsPanel";
import {
  authAPI,
  storeToken,
  storeRefreshToken,
  storeUserInfo,
} from "../../utils/api";
import { createStyles } from "./Login.styles";
import {
  INITIAL_STATE,
  VALIDATION_MESSAGES,
  USER_ICON_DIMENSIONS,
  LOGIN_CONFIG,
} from "./Login.mock";

export default function LoginScreen({
  onNavigateToRegister,
  onNavigateToForgotPassword,
  onNavigateHome,
  onToggleTheme,
  onSelectLanguage,
  theme,
  lang,
  strings,
  colors,
}) {
  const [username, setUsername] = useState(INITIAL_STATE.username);
  const [password, setPassword] = useState(INITIAL_STATE.password);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const styles = useMemo(() => createStyles(colors), [colors]);

  const handleLogin = async () => {
    if (!username.trim()) {
      setError(
        strings.usernameRequired || VALIDATION_MESSAGES.USERNAME_REQUIRED
      );
      return;
    }

    if (!password.trim()) {
      setError(
        strings.passwordRequired || VALIDATION_MESSAGES.PASSWORD_REQUIRED
      );
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await authAPI.login(username.trim(), password);

      if (response.access_token) {
        await storeToken(response.access_token);
      }
      if (response.refresh_token) {
        await storeRefreshToken(response.refresh_token);
      }
      if (response.user) {
        await storeUserInfo(response.user);
      }

      onNavigateHome?.();
    } catch (err) {
      console.error("Login error:", err);
      const errorMessage =
        err.message || strings.loginError || VALIDATION_MESSAGES.LOGIN_ERROR;
      setError(errorMessage);
      Alert.alert(strings.error || "Lỗi", errorMessage, [
        { text: strings.ok || "OK" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    onNavigateToForgotPassword();
  };

  const handleUsernameChange = (text) => {
    setUsername(text);
    setError("");
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    setError("");
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={
          Platform.OS === "ios"
            ? LOGIN_CONFIG.KEYBOARD_OFFSET_IOS
            : LOGIN_CONFIG.KEYBOARD_OFFSET_ANDROID
        }
      >
        <View
          style={[styles.container, { backgroundColor: colors.background }]}
        >
          <StatusBar style={theme === "dark" ? "light" : "dark"} />

          {/* Header */}
          <View style={[styles.header, { backgroundColor: colors.headerBg }]}>
            <Text style={[styles.headerTitle, { color: colors.headerText }]}>
              {strings.appTitle}
            </Text>
          </View>

          {/* Login Card */}
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.cardContainer}>
              <View
                style={[styles.loginCard, { backgroundColor: colors.cardBg }]}
              >
                {/* User Icon */}
                <View style={styles.userIconContainer}>
                  <View
                    style={[
                      styles.userIconCircle,
                      {
                        backgroundColor: colors.inputBg,
                        borderColor: colors.inputBorder,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.userIconHead,
                        { backgroundColor: colors.buttonBg },
                      ]}
                    />
                    <View
                      style={[
                        styles.userIconBody,
                        { backgroundColor: colors.buttonBg },
                      ]}
                    />
                  </View>
                </View>

                {/* Form */}
                <View style={styles.form}>
                  {/* Error Message */}
                  {error ? (
                    <View style={styles.errorContainer}>
                      <Text
                        style={[
                          styles.errorText,
                          { color: colors.error || "#ff4444" },
                        ]}
                      >
                        {error}
                      </Text>
                    </View>
                  ) : null}

                  {/* Username Input */}
                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: colors.label }]}>
                      {strings.username}
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
                      onChangeText={handleUsernameChange}
                      autoCapitalize="none"
                      placeholderTextColor={colors.placeholder}
                      editable={!loading}
                      placeholder={strings.usernamePlaceholder}
                    />
                  </View>

                  {/* Password Input */}
                  <View style={styles.inputGroup}>
                    <View style={styles.passwordHeader}>
                      <Text style={[styles.label, { color: colors.label }]}>
                        {strings.password}
                      </Text>
                      <TouchableOpacity onPress={handleForgotPassword}>
                        <Text
                          style={[
                            styles.forgotPassword,
                            { color: colors.muted },
                          ]}
                        >
                          {strings.forgotPassword}
                        </Text>
                      </TouchableOpacity>
                    </View>
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
                      onChangeText={handlePasswordChange}
                      secureTextEntry
                      autoCapitalize="none"
                      placeholderTextColor={colors.placeholder}
                      editable={!loading}
                      placeholder={strings.passwordPlaceholder}
                    />
                  </View>

                  {/* Buttons */}
                  <View style={styles.loginButtonContainer}>
                    <TouchableOpacity
                      style={[
                        styles.loginButton,
                        {
                          backgroundColor: loading
                            ? colors.buttonDisabled || colors.muted
                            : colors.buttonBg,
                          opacity: loading ? 0.6 : 1,
                        },
                      ]}
                      onPress={handleLogin}
                      disabled={loading}
                    >
                      {loading ? (
                        <ActivityIndicator
                          size="small"
                          color={colors.buttonText}
                        />
                      ) : (
                        <Text
                          style={[
                            styles.buttonText,
                            { color: colors.buttonText },
                          ]}
                        >
                          {strings.login}
                        </Text>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.loginButton,
                        {
                          backgroundColor: "transparent",
                          borderWidth: 1.5,
                          borderColor: colors.buttonBg,
                          opacity: loading ? 0.6 : 1,
                        },
                      ]}
                      onPress={onNavigateToRegister}
                      disabled={loading}
                    >
                      <Text
                        style={[styles.buttonText, { color: colors.buttonBg }]}
                      >
                        {strings.register}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>

          <SettingsPanel
            theme={theme}
            lang={lang}
            colors={colors}
            strings={strings}
            onToggleTheme={onToggleTheme}
            onSelectLanguage={onSelectLanguage}
          />
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}
