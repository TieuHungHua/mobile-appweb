import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import {
    StyleSheet,
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
} from 'react-native';
import { authAPI } from '../utils/api';

export default function RegisterScreen({
    onNavigateToLogin,
    onToggleTheme,
    onSelectLanguage,
    theme,
    lang,
    strings,
    colors,
}) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [userType, setUserType] = useState('student'); // 'student' hoặc 'teacher'
    const [code, setCode] = useState('');
    const [emailError, setEmailError] = useState('');
    const [codeError, setCodeError] = useState('');
    const [showLangList, setShowLangList] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [registerError, setRegisterError] = useState('');

    const styles = useMemo(() => createStyles(colors), [colors]);

    const validateEmail = (emailValue) => {
        if (!emailValue) {
            setEmailError('');
            return true;
        }
        if (!emailValue.endsWith('@hcmut.edu.vn')) {
            setEmailError(strings.emailError);
            return false;
        }
        setEmailError('');
        return true;
    };

    const validateCode = (codeValue) => {
        if (userType !== 'student') {
            setCodeError('');
            return true;
        }
        if (!codeValue) {
            setCodeError('');
            return true;
        }
        if (!/^\d{7}$/.test(codeValue)) {
            setCodeError(strings.studentCodeError);
            return false;
        }
        setCodeError('');
        return true;
    };

    const handleEmailChange = (text) => {
        setEmail(text);
        validateEmail(text);
    };

    const handleCodeChange = (text) => {
        if (userType === 'student') {
            const numericText = text.replace(/[^0-9]/g, '');
            setCode(numericText);
            validateCode(numericText);
        } else {
            setCode(text);
            validateCode(text);
        }
    };

    const handleRegister = async () => {
        // Clear previous errors
        setRegisterError('');

        // Validate email
        if (!validateEmail(email)) {
            return;
        }

        // Validate code if student
        if (userType === 'student' && !validateCode(code)) {
            return;
        }

        // Basic validation
        if (!username.trim()) {
            setRegisterError('Vui lòng nhập tên đăng nhập');
            return;
        }
        if (!password.trim()) {
            setRegisterError('Vui lòng nhập mật khẩu');
            return;
        }
        if (!confirmPassword.trim()) {
            setRegisterError('Vui lòng xác nhận mật khẩu');
            return;
        }
        if (!phone.trim()) {
            setRegisterError('Vui lòng nhập số điện thoại');
            return;
        }
        if (userType === 'student' && !code.trim()) {
            setRegisterError('Vui lòng nhập mã sinh viên');
            return;
        }

        setIsLoading(true);

        try {
            // Map userType: 'teacher' -> 'lecturer' for API
            const role = userType === 'student' ? 'student' : 'lecturer';

            // Prepare register data
            const registerData = {
                username: username.trim(),
                email: email.trim(),
                phone: phone.trim(),
                role: role,
                password: password,
                confirmPassword: confirmPassword,
            };

            // Add studentId if student
            if (userType === 'student') {
                registerData.studentId = code.trim();
            }

            // Call register API
            const response = await authAPI.register(registerData);

            // Success
            Alert.alert(
                'Đăng ký thành công',
                'Tài khoản của bạn đã được tạo thành công!',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            // Navigate to login or handle success
                            if (onNavigateToLogin) {
                                onNavigateToLogin();
                            }
                        },
                    },
                ]
            );
        } catch (error) {
            // Handle error
            const errorMessage = error.message || 'Đăng ký thất bại. Vui lòng thử lại.';
            setRegisterError(errorMessage);
            Alert.alert('Lỗi đăng ký', errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <View style={[styles.container, { backgroundColor: colors.background }]}>
                    <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />

                    {/* Header */}
                    <View style={[styles.header, { backgroundColor: colors.headerBg }]}>
                        <Text style={[styles.headerTitle, { color: colors.headerText }]}>{strings.uniTitle}</Text>
                    </View>

                    {/* Card đăng ký */}
                    <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                        <View style={styles.cardContainer}>
                            <View style={[styles.registerCard, { backgroundColor: colors.cardBg }]}>
                                {/* Title */}
                                <Text style={[styles.registerTitle, { color: colors.text }]}>{strings.registerTitle}</Text>

                                {/* Form đăng ký */}
                                <View style={styles.form}>
                                    {/* Tên đăng nhập */}
                                    <View style={styles.inputGroup}>
                                        <Text style={[styles.label, { color: colors.label }]}>
                                            {strings.username} <Text style={[styles.required, { color: colors.error }]}>*</Text>
                                        </Text>
                                        <TextInput
                                            style={[styles.input, { borderColor: colors.inputBorder, backgroundColor: colors.inputBg, color: colors.text }]}
                                            value={username}
                                            onChangeText={setUsername}
                                            autoCapitalize="none"
                                            placeholderTextColor={colors.placeholder}
                                        />
                                    </View>

                                    {/* Email */}
                                    <View style={styles.inputGroup}>
                                        <Text style={[styles.label, { color: colors.label }]}>
                                            {strings.email} <Text style={[styles.required, { color: colors.error }]}>*</Text>
                                        </Text>
                                        <TextInput
                                            style={[
                                                styles.input,
                                                { borderColor: colors.inputBorder, backgroundColor: colors.inputBg, color: colors.text },
                                                emailError ? styles.inputError : null,
                                            ]}
                                            value={email}
                                            onChangeText={handleEmailChange}
                                            placeholder={strings.emailExample}
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                            placeholderTextColor={colors.placeholder}
                                        />
                                        {emailError ? <Text style={[styles.errorText, { color: colors.error }]}>{emailError}</Text> : null}
                                    </View>

                                    {/* Số điện thoại */}
                                    <View style={styles.inputGroup}>
                                        <Text style={[styles.label, { color: colors.label }]}>
                                            {strings.phone} <Text style={[styles.required, { color: colors.error }]}>*</Text>
                                        </Text>
                                        <TextInput
                                            style={[styles.input, { borderColor: colors.inputBorder, backgroundColor: colors.inputBg, color: colors.text }]}
                                            value={phone}
                                            onChangeText={setPhone}
                                            placeholder={strings.phonePlaceholder}
                                            keyboardType="phone-pad"
                                            placeholderTextColor={colors.placeholder}
                                        />
                                    </View>

                                    {/* Loại người dùng */}
                                    <View style={styles.inputGroup}>
                                        <Text style={[styles.label, { color: colors.label }]}>
                                            {strings.accountType} <Text style={[styles.required, { color: colors.error }]}>*</Text>
                                        </Text>
                                        <View style={styles.radioContainer}>
                                            <TouchableOpacity
                                                style={styles.radioOption}
                                                onPress={() => {
                                                    setUserType('student');
                                                    setCode('');
                                                    setCodeError('');
                                                }}
                                            >
                                                <View style={[styles.radioCircle, { borderColor: colors.buttonBg }]}>
                                                    {userType === 'student' && <View style={[styles.radioSelected, { backgroundColor: colors.buttonBg }]} />}
                                                </View>
                                                <Text style={[styles.radioLabel, { color: colors.label }]}>{strings.student}</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={styles.radioOption}
                                                onPress={() => {
                                                    setUserType('teacher');
                                                    setCode('');
                                                    setCodeError('');
                                                }}
                                            >
                                                <View style={[styles.radioCircle, { borderColor: colors.buttonBg }]}>
                                                    {userType === 'teacher' && <View style={[styles.radioSelected, { backgroundColor: colors.buttonBg }]} />}
                                                </View>
                                                <Text style={[styles.radioLabel, { color: colors.label }]}>{strings.teacher}</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    {/* Mã sinh viên/Giảng viên */}
                                    <View style={styles.inputGroup}>
                                        <Text style={[styles.label, { color: colors.label }]}>
                                            {userType === 'student' ? strings.studentCode : strings.teacherCode} <Text style={[styles.required, { color: colors.error }]}>*</Text>
                                        </Text>
                                        <TextInput
                                            style={[
                                                styles.input,
                                                { borderColor: colors.inputBorder, backgroundColor: colors.inputBg, color: colors.text },
                                                codeError ? styles.inputError : null,
                                            ]}
                                            value={code}
                                            onChangeText={handleCodeChange}
                                            placeholder={userType === 'student' ? strings.studentCodePlaceholder : strings.teacherCodePlaceholder}
                                            autoCapitalize="none"
                                            keyboardType={userType === 'student' ? 'numeric' : 'default'}
                                            maxLength={userType === 'student' ? 7 : undefined}
                                            placeholderTextColor={colors.placeholder}
                                        />
                                        {codeError ? <Text style={[styles.errorText, { color: colors.error }]}>{codeError}</Text> : null}
                                    </View>

                                    {/* Mật khẩu */}
                                    <View style={styles.inputGroup}>
                                        <Text style={[styles.label, { color: colors.label }]}>
                                            {strings.password} <Text style={[styles.required, { color: colors.error }]}>*</Text>
                                        </Text>
                                        <TextInput
                                            style={[styles.input, { borderColor: colors.inputBorder, backgroundColor: colors.inputBg, color: colors.text }]}
                                            value={password}
                                            onChangeText={setPassword}
                                            secureTextEntry
                                            autoCapitalize="none"
                                            placeholderTextColor={colors.placeholder}
                                        />
                                    </View>

                                    {/* Nhập lại mật khẩu */}
                                    <View style={styles.inputGroup}>
                                        <Text style={[styles.label, { color: colors.label }]}>
                                            {strings.confirmPassword} <Text style={[styles.required, { color: colors.error }]}>*</Text>
                                        </Text>
                                        <TextInput
                                            style={[styles.input, { borderColor: colors.inputBorder, backgroundColor: colors.inputBg, color: colors.text }]}
                                            value={confirmPassword}
                                            onChangeText={setConfirmPassword}
                                            secureTextEntry
                                            autoCapitalize="none"
                                            placeholderTextColor={colors.placeholder}
                                        />
                                    </View>

                                    {/* Error message */}
                                    {registerError ? (
                                        <View style={styles.errorContainer}>
                                            <Text style={[styles.errorText, { color: colors.error }]}>{registerError}</Text>
                                        </View>
                                    ) : null}

                                    {/* Button */}
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
                                            <Text style={[styles.buttonText, { color: colors.buttonText }]}>{strings.register}</Text>
                                        )}
                                    </TouchableOpacity>

                                    {/* Nút trở về đăng nhập */}
                                    <TouchableOpacity style={[styles.backButton, { borderColor: colors.outline }]} onPress={onNavigateToLogin}>
                                        <Text style={[styles.backButtonText, { color: colors.outline }]}>{strings.backToLogin}</Text>
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

const createStyles = (colors) =>
    StyleSheet.create({
        container: {
            flex: 1,
        },
        header: {
            paddingTop: 50,
            paddingBottom: 20,
            paddingHorizontal: 20,
            alignItems: 'center',
            justifyContent: 'center',
        },
        headerTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            letterSpacing: 0.5,
        },
        scrollContent: {
            flexGrow: 1,
            paddingHorizontal: 20,
            paddingTop: 50,
            paddingBottom: 30,
            justifyContent: 'center',
        },
        cardContainer: {
            marginTop: -15,
        },
        registerCard: {
            borderRadius: 25,
            padding: 30,
            marginTop: 0,
            shadowColor: '#000',
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 5,
        },
        registerTitle: {
            fontSize: 20,
            fontWeight: 'bold',
            marginBottom: 25,
            textAlign: 'center',
        },
        form: {
            width: '100%',
        },
        inputGroup: {
            marginBottom: 20,
        },
        label: {
            fontSize: 15,
            marginBottom: 10,
            fontWeight: '400',
        },
        required: {
            fontSize: 15,
        },
        input: {
            borderWidth: 1.5,
            borderRadius: 10,
            paddingHorizontal: 15,
            paddingVertical: 13,
            fontSize: 15,
            height: 48,
        },
        inputError: {
            borderColor: colors.error,
        },
        errorText: {
            fontSize: 12,
            marginTop: 5,
        },
        errorContainer: {
            marginBottom: 15,
            padding: 10,
            borderRadius: 8,
            backgroundColor: colors.error + '15',
        },
        radioContainer: {
            flexDirection: 'row',
            marginTop: 10,
            gap: 20,
        },
        radioOption: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        radioCircle: {
            width: 20,
            height: 20,
            borderRadius: 10,
            borderWidth: 2,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 8,
        },
        radioSelected: {
            width: 10,
            height: 10,
            borderRadius: 5,
        },
        radioLabel: {
            fontSize: 15,
        },
        registerButton: {
            width: '100%',
            borderRadius: 10,
            paddingVertical: 15,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 10,
        },
        registerButtonDisabled: {
            opacity: 0.6,
        },
        buttonText: {
            fontSize: 15,
            fontWeight: 'bold',
        },
        backButton: {
            width: '100%',
            backgroundColor: 'transparent',
            borderRadius: 10,
            paddingVertical: 15,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 15,
            borderWidth: 1.5,
        },
        backButtonText: {
            fontSize: 15,
            fontWeight: '500',
        },
        footer: {
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderTopWidth: 1,
            borderColor: colors.inputBorder,
            backgroundColor: colors.cardBg,
            gap: 12,
        },
        footerItem: {
            gap: 6,
        },
        footerLabel: {
            fontSize: 14,
            fontWeight: '600',
        },
        switchRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
        },
    });

