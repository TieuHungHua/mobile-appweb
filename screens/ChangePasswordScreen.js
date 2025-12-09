import { StatusBar } from 'expo-status-bar';
import { useMemo, useState, useRef } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, Platform, KeyboardAvoidingView, Alert, PanResponder, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ChangePasswordScreen({ theme, lang, strings, colors, onNavigate }) {
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState('sms'); // 'sms' or 'email'
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Pan responder for swipe back gesture
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only respond to horizontal swipes from the left edge
        return gestureState.dx > 12 && Math.abs(gestureState.dy) < Math.abs(gestureState.dx) && evt.nativeEvent.pageX < 20;
      },
      onPanResponderRelease: (evt, gestureState) => {
        // If swiped right more than 50px, navigate back
        if (gestureState.dx > 50) {
          onNavigate?.('settings');
        }
      },
    })
  ).current;

  const validateForm = () => {
    const newErrors = {};

    if (!currentPassword.trim()) {
      newErrors.currentPassword = strings.currentPasswordRequired || 'Vui lòng nhập mật khẩu hiện tại';
    }

    if (!newPassword.trim()) {
      newErrors.newPassword = strings.newPasswordRequired || 'Vui lòng nhập mật khẩu mới';
    } else if (newPassword.length < 6) {
      newErrors.newPassword = strings.passwordMinLength || 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = strings.confirmPasswordRequired || 'Vui lòng xác nhận mật khẩu mới';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = strings.passwordNotMatch || 'Mật khẩu xác nhận không khớp';
    }

    if (currentPassword && newPassword && currentPassword === newPassword) {
      newErrors.newPassword = strings.passwordSameAsOld || 'Mật khẩu mới phải khác mật khẩu hiện tại';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    // Show verification modal
    setShowVerificationModal(true);
    setOtpSent(false);
    setOtp('');
    setOtpError('');
    setCountdown(0);
  };

  const handleSendOTP = () => {
    // TODO: Call API to send OTP via SMS or Email
    // For now, simulate sending OTP
    setOtpSent(true);
    setCountdown(60); // 60 seconds countdown
    
    // Start countdown
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    Alert.alert(
      strings.otpSent || 'OTP đã được gửi',
      verificationMethod === 'sms'
        ? strings.otpSentToPhone || 'Mã OTP đã được gửi đến số điện thoại của bạn'
        : strings.otpSentToEmail || 'Mã OTP đã được gửi đến email của bạn'
    );
  };

  const handleVerifyOTP = () => {
    if (!otp.trim()) {
      setOtpError(strings.otpRequired || 'Vui lòng nhập mã OTP');
      return;
    }

    if (otp.length !== 6) {
      setOtpError(strings.otpInvalid || 'Mã OTP phải có 6 số');
      return;
    }

    // TODO: Verify OTP with backend
    // For now, accept any 6-digit code as valid (demo mode)
    // In production, verify OTP with backend API

    // OTP is correct, proceed to change password
    setShowVerificationModal(false);
    setOtp('');
    setOtpError('');
    setOtpSent(false);
    setCountdown(0);

    // TODO: Implement actual password change logic with API call
    Alert.alert(
      strings.success || 'Thành công',
      strings.passwordChangedSuccess || 'Đã thay đổi mật khẩu thành công',
      [
        {
          text: strings.ok || 'OK',
          onPress: () => {
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setErrors({});
            onNavigate?.('settings');
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]} {...panResponder.panHandlers}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.headerBg }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => onNavigate?.('settings')}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={colors.headerText} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.headerText }]}>
          {strings.changePassword || 'Thay đổi mật khẩu'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* White card container */}
          <View style={[styles.card, { backgroundColor: colors.cardBg }]}>
            <Text style={[styles.description, { color: colors.muted }]}>
              {strings.changePasswordDescription || 'Vui lòng nhập mật khẩu hiện tại và mật khẩu mới của bạn'}
            </Text>

            {/* Current Password */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                {strings.currentPassword || 'Mật khẩu hiện tại'} <Text style={[styles.required, { color: colors.error }]}>*</Text>
              </Text>
              <View style={[styles.passwordInputContainer, { borderColor: errors.currentPassword ? colors.error : colors.inputBorder, backgroundColor: colors.inputBg }]}>
                <TextInput
                  style={[styles.passwordInput, { color: colors.text }]}
                  value={currentPassword}
                  onChangeText={(text) => {
                    setCurrentPassword(text);
                    if (errors.currentPassword) {
                      setErrors((prev) => ({ ...prev, currentPassword: '' }));
                    }
                  }}
                  placeholder={strings.currentPasswordPlaceholder || 'Nhập mật khẩu hiện tại'}
                  placeholderTextColor={colors.placeholder}
                  secureTextEntry={!showCurrentPassword}
                  autoFocus
                />
                <TouchableOpacity
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={showCurrentPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colors.muted}
                  />
                </TouchableOpacity>
              </View>
              {errors.currentPassword ? (
                <Text style={[styles.errorText, { color: colors.error }]}>{errors.currentPassword}</Text>
              ) : null}
            </View>

            {/* New Password */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                {strings.newPassword || 'Mật khẩu mới'} <Text style={[styles.required, { color: colors.error }]}>*</Text>
              </Text>
              <View style={[styles.passwordInputContainer, { borderColor: errors.newPassword ? colors.error : colors.inputBorder, backgroundColor: colors.inputBg }]}>
                <TextInput
                  style={[styles.passwordInput, { color: colors.text }]}
                  value={newPassword}
                  onChangeText={(text) => {
                    setNewPassword(text);
                    if (errors.newPassword) {
                      setErrors((prev) => ({ ...prev, newPassword: '' }));
                    }
                  }}
                  placeholder={strings.newPasswordPlaceholder || 'Nhập mật khẩu mới (tối thiểu 6 ký tự)'}
                  placeholderTextColor={colors.placeholder}
                  secureTextEntry={!showNewPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colors.muted}
                  />
                </TouchableOpacity>
              </View>
              {errors.newPassword ? (
                <Text style={[styles.errorText, { color: colors.error }]}>{errors.newPassword}</Text>
              ) : null}
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                {strings.confirmNewPassword || 'Xác nhận mật khẩu mới'} <Text style={[styles.required, { color: colors.error }]}>*</Text>
              </Text>
              <View style={[styles.passwordInputContainer, { borderColor: errors.confirmPassword ? colors.error : colors.inputBorder, backgroundColor: colors.inputBg }]}>
                <TextInput
                  style={[styles.passwordInput, { color: colors.text }]}
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (errors.confirmPassword) {
                      setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                    }
                  }}
                  placeholder={strings.confirmPasswordPlaceholder || 'Nhập lại mật khẩu mới'}
                  placeholderTextColor={colors.placeholder}
                  secureTextEntry={!showConfirmPassword}
                  onSubmitEditing={handleSave}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colors.muted}
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword ? (
                <Text style={[styles.errorText, { color: colors.error }]}>{errors.confirmPassword}</Text>
              ) : null}
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.buttonBg }]}
              onPress={handleSave}
              activeOpacity={0.8}
            >
              <Text style={[styles.saveButtonText, { color: colors.buttonText }]}>
                {strings.save || 'Lưu'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* OTP Verification Modal */}
      <Modal
        visible={showVerificationModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowVerificationModal(false);
          setOtp('');
          setOtpError('');
          setOtpSent(false);
          setCountdown(0);
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <View style={styles.modalOverlayContent}>
            <View style={[styles.modalContent, { backgroundColor: colors.cardBg, borderColor: colors.inputBorder }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {strings.verifyIdentity || 'Xác thực danh tính'}
              </Text>
              <Text style={[styles.modalDescription, { color: colors.muted }]}>
                {strings.selectVerificationMethod || 'Chọn phương thức xác thực để nhận mã OTP'}
              </Text>

              {/* Verification Method Selection */}
              {!otpSent && (
                <View style={styles.verificationMethods}>
                  <TouchableOpacity
                    style={[
                      styles.methodOption,
                      {
                        borderColor: verificationMethod === 'sms' ? colors.buttonBg : colors.inputBorder,
                        backgroundColor: verificationMethod === 'sms' ? colors.inputBg : 'transparent',
                      },
                    ]}
                    onPress={() => setVerificationMethod('sms')}
                    activeOpacity={0.7}
                  >
                    <View style={styles.methodContent}>
                      <Ionicons
                        name="phone-portrait-outline"
                        size={24}
                        color={verificationMethod === 'sms' ? colors.buttonBg : colors.muted}
                      />
                      <View style={styles.methodInfo}>
                        <Text style={[styles.methodTitle, { color: colors.text }]}>
                          {strings.smsVerification || 'Xác thực qua SMS'}
                        </Text>
                        <Text style={[styles.methodSubtitle, { color: colors.muted }]}>
                          {strings.smsVerificationDesc || 'Nhận mã OTP qua tin nhắn SMS'}
                        </Text>
                      </View>
                      <View style={[styles.radioCircle, { borderColor: verificationMethod === 'sms' ? colors.buttonBg : colors.inputBorder }]}>
                        {verificationMethod === 'sms' && <View style={[styles.radioSelected, { backgroundColor: colors.buttonBg }]} />}
                      </View>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.methodOption,
                      {
                        borderColor: verificationMethod === 'email' ? colors.buttonBg : colors.inputBorder,
                        backgroundColor: verificationMethod === 'email' ? colors.inputBg : 'transparent',
                      },
                    ]}
                    onPress={() => setVerificationMethod('email')}
                    activeOpacity={0.7}
                  >
                    <View style={styles.methodContent}>
                      <Ionicons
                        name="mail-outline"
                        size={24}
                        color={verificationMethod === 'email' ? colors.buttonBg : colors.muted}
                      />
                      <View style={styles.methodInfo}>
                        <Text style={[styles.methodTitle, { color: colors.text }]}>
                          {strings.emailVerification || 'Xác thực qua Email'}
                        </Text>
                        <Text style={[styles.methodSubtitle, { color: colors.muted }]}>
                          {strings.emailVerificationDesc || 'Nhận mã OTP qua email'}
                        </Text>
                      </View>
                      <View style={[styles.radioCircle, { borderColor: verificationMethod === 'email' ? colors.buttonBg : colors.inputBorder }]}>
                        {verificationMethod === 'email' && <View style={[styles.radioSelected, { backgroundColor: colors.buttonBg }]} />}
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
              )}

              {/* OTP Input Section */}
              {otpSent && (
                <View style={styles.otpSection}>
                  <Text style={[styles.otpLabel, { color: colors.text }]}>
                    {strings.enterOTP || 'Nhập mã OTP'}
                  </Text>
                  <TextInput
                    style={[
                      styles.otpInput,
                      {
                        borderColor: otpError ? colors.error : colors.inputBorder,
                        backgroundColor: colors.inputBg,
                        color: colors.text,
                      },
                    ]}
                    value={otp}
                    onChangeText={(text) => {
                      // Only allow numbers
                      const numericText = text.replace(/[^0-9]/g, '').slice(0, 6);
                      setOtp(numericText);
                      setOtpError('');
                    }}
                    placeholder="000000"
                    placeholderTextColor={colors.placeholder}
                    keyboardType="number-pad"
                    maxLength={6}
                    autoFocus
                    onSubmitEditing={handleVerifyOTP}
                  />
                  {otpError ? (
                    <Text style={[styles.errorText, { color: colors.error }]}>{otpError}</Text>
                  ) : null}
                  
                  {countdown > 0 ? (
                    <Text style={[styles.countdownText, { color: colors.muted }]}>
                      {strings.resendOTPIn || 'Gửi lại mã sau'} {countdown}s
                    </Text>
                  ) : (
                    <TouchableOpacity
                      onPress={handleSendOTP}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.resendText, { color: colors.buttonBg }]}>
                        {strings.resendOTP || 'Gửi lại mã OTP'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}
                  onPress={() => {
                    setShowVerificationModal(false);
                    setOtp('');
                    setOtpError('');
                    setOtpSent(false);
                    setCountdown(0);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.modalButtonText, { color: colors.text }]}>
                    {strings.cancel || 'Hủy'}
                  </Text>
                </TouchableOpacity>
                {!otpSent ? (
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: colors.buttonBg }]}
                    onPress={handleSendOTP}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.modalButtonText, { color: colors.buttonText }]}>
                      {strings.sendOTP || 'Gửi OTP'}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: colors.buttonBg }]}
                    onPress={handleVerifyOTP}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.modalButtonText, { color: colors.buttonText }]}>
                      {strings.verify || 'Xác nhận'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      paddingTop: Platform.OS === 'ios' ? 44 : 20,
      paddingHorizontal: 16,
      paddingBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    backButton: {
      padding: 4,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '700',
      flex: 1,
      textAlign: 'center',
    },
    headerSpacer: {
      width: 32,
    },
    keyboardView: {
      flex: 1,
    },
    content: {
      padding: 16,
      paddingBottom: 30,
    },
    card: {
      borderRadius: 16,
      padding: 20,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 4,
    },
    description: {
      fontSize: 14,
      marginBottom: 24,
      lineHeight: 20,
    },
    inputGroup: {
      marginBottom: 20,
    },
    label: {
      fontSize: 15,
      fontWeight: '500',
      marginBottom: 8,
    },
    required: {
      fontSize: 15,
    },
    passwordInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderRadius: 10,
      paddingHorizontal: 15,
      height: 48,
    },
    passwordInput: {
      flex: 1,
      fontSize: 15,
      paddingVertical: 12,
    },
    errorText: {
      fontSize: 12,
      marginTop: 5,
    },
    saveButton: {
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 10,
    },
    saveButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalOverlayContent: {
      flex: 1,
      justifyContent: 'flex-start',
      alignItems: 'center',
      padding: 20,
      paddingTop: Platform.OS === 'ios' ? 150 : 120,
    },
    modalContent: {
      borderRadius: 16,
      padding: 20,
      width: '100%',
      maxWidth: 400,
      borderWidth: 1,
      shadowColor: '#000',
      shadowOpacity: 0.3,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 5 },
      elevation: 10,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 8,
      textAlign: 'center',
    },
    modalDescription: {
      fontSize: 14,
      marginBottom: 20,
      textAlign: 'center',
      lineHeight: 20,
    },
    verificationMethods: {
      gap: 12,
      marginBottom: 20,
    },
    methodOption: {
      borderWidth: 2,
      borderRadius: 12,
      padding: 16,
    },
    methodContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    methodInfo: {
      flex: 1,
    },
    methodTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 4,
    },
    methodSubtitle: {
      fontSize: 13,
    },
    radioCircle: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioSelected: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    otpSection: {
      marginBottom: 20,
    },
    otpLabel: {
      fontSize: 15,
      fontWeight: '500',
      marginBottom: 12,
    },
    otpInput: {
      borderWidth: 1,
      borderRadius: 10,
      paddingHorizontal: 15,
      paddingVertical: 12,
      fontSize: 20,
      height: 56,
      textAlign: 'center',
      letterSpacing: 8,
      fontWeight: '600',
    },
    countdownText: {
      fontSize: 13,
      textAlign: 'center',
      marginTop: 12,
    },
    resendText: {
      fontSize: 14,
      fontWeight: '600',
      textAlign: 'center',
      marginTop: 12,
    },
    modalActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 20,
      gap: 12,
    },
    modalButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
    },
    modalButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },
  });

