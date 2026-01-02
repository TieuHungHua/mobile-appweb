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
} from "react-native";
import { createStyles } from "./ForgotPassword.styles";
import { INITIAL_STATE } from "./ForgotPassword.mock";

export default function ForgotPasswordScreen({
  onNavigateToLogin,
  theme,
  strings,
  colors,
}) {
  const [email, setEmail] = useState(INITIAL_STATE.email);
  const styles = useMemo(() => createStyles(colors), [colors]);

  const handleSendReset = () => {
    console.log("Gửi email reset mật khẩu cho:", email);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
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

          {/* Card */}
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.cardContainer}>
              <View
                style={[
                  styles.forgotPasswordCard,
                  { backgroundColor: colors.cardBg },
                ]}
              >
                {/* Title */}
                <Text
                  style={[styles.forgotPasswordTitle, { color: colors.text }]}
                >
                  {strings.forgotTitle}
                </Text>

                {/* Form */}
                <View style={styles.form}>
                  <Text
                    style={[
                      styles.forgotPasswordDescription,
                      { color: colors.muted },
                    ]}
                  >
                    {strings.forgotDesc}
                  </Text>

                  {/* Email/Username Input */}
                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: colors.label }]}>
                      {strings.email} / {strings.username}{" "}
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
                      value={email}
                      onChangeText={setEmail}
                      placeholder={strings.email}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      placeholderTextColor={colors.placeholder}
                    />
                  </View>

                  {/* Send Reset Button */}
                  <TouchableOpacity
                    style={[
                      styles.forgotPasswordButton,
                      { backgroundColor: colors.buttonBg },
                    ]}
                    onPress={handleSendReset}
                  >
                    <Text
                      style={[styles.buttonText, { color: colors.buttonText }]}
                    >
                      {strings.forgotSend}
                    </Text>
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
