import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Keyboard,
    TouchableWithoutFeedback,
    KeyboardAvoidingView,
    Platform,
    Switch,
    Alert,
    ActivityIndicator,
} from 'react-native';
import SettingsPanel from '../components/SettingsPanel';
import { authAPI, storeToken, storeRefreshToken, storeUserInfo } from '../utils/api';

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
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showLangList, setShowLangList] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const styles = useMemo(() => createStyles(colors), [colors]);

    const handleLogin = async () => {
        // Validate input
        if (!username.trim()) {
            setError(strings.usernameRequired || 'Vui lòng nhập tên đăng nhập');
            return;
        }

        if (!password.trim()) {
            setError(strings.passwordRequired || 'Vui lòng nhập mật khẩu');
            return;
        }

        setError('');
        setLoading(true);

        try {
            // Call login API
            const response = await authAPI.login(username.trim(), password);

            // Store tokens and user info
            if (response.access_token) {
                await storeToken(response.access_token);
            }
            if (response.refresh_token) {
                await storeRefreshToken(response.refresh_token);
            }
            if (response.user) {
                await storeUserInfo(response.user);
            }

            // Navigate to home on success
            onNavigateHome?.();
        } catch (err) {
            console.error('Login error:', err);
            const errorMessage = err.message || strings.loginError || 'Đăng nhập thất bại. Vui lòng thử lại.';
            setError(errorMessage);
            Alert.alert(
                strings.error || 'Lỗi',
                errorMessage,
                [{ text: strings.ok || 'OK' }]
            );
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = () => {
        onNavigateToForgotPassword();
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

                    {/* Header màu xanh */}
                    <View style={[styles.header, { backgroundColor: colors.headerBg }]}>
                        <Text style={[styles.headerTitle, { color: colors.headerText }]}>{strings.appTitle}</Text>
                    </View>

                    {/* Card đăng nhập */}
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                        keyboardDismissMode="on-drag"
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.cardContainer}>
                            <View style={[styles.loginCard, { backgroundColor: colors.cardBg }]}>
                                {/* Icon người dùng */}
                                <View style={styles.userIconContainer}>
                                    <View style={[styles.userIconCircle, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
                                        <View style={[styles.userIconHead, { backgroundColor: colors.buttonBg }]} />
                                        <View style={[styles.userIconBody, { backgroundColor: colors.buttonBg }]} />
                                    </View>
                                </View>

                                {/* Form đăng nhập */}
                                <View style={styles.form}>
                                    {/* Error message */}
                                    {error ? (
                                        <View style={styles.errorContainer}>
                                            <Text style={[styles.errorText, { color: colors.error || '#ff4444' }]}>{error}</Text>
                                        </View>
                                    ) : null}

                                    {/* Tên đăng nhập */}
                                    <View style={styles.inputGroup}>
                                        <Text style={[styles.label, { color: colors.label }]}>{strings.username}</Text>
                                        <TextInput
                                            style={[styles.input, { borderColor: colors.inputBorder, backgroundColor: colors.inputBg, color: colors.text }]}
                                            value={username}
                                            onChangeText={(text) => {
                                                setUsername(text);
                                                setError(''); // Clear error when user types
                                            }}
                                            autoCapitalize="none"
                                            placeholderTextColor={colors.placeholder}
                                            editable={!loading}
                                        />
                                    </View>

                                    {/* Mật khẩu */}
                                    <View style={styles.inputGroup}>
                                        <View style={styles.passwordHeader}>
                                            <Text style={[styles.label, { color: colors.label }]}>{strings.password}</Text>
                                            <TouchableOpacity onPress={handleForgotPassword}>
                                                <Text style={[styles.forgotPassword, { color: colors.muted }]}>{strings.forgotPassword}</Text>
                                            </TouchableOpacity>
                                        </View>
                                        <TextInput
                                            style={[styles.input, { borderColor: colors.inputBorder, backgroundColor: colors.inputBg, color: colors.text }]}
                                            value={password}
                                            onChangeText={(text) => {
                                                setPassword(text);
                                                setError(''); // Clear error when user types
                                            }}
                                            secureTextEntry
                                            autoCapitalize="none"
                                            placeholderTextColor={colors.placeholder}
                                            editable={!loading}
                                        />
                                    </View>

                                    {/* Buttons */}
                                    <View style={styles.loginButtonContainer}>
                                        <TouchableOpacity
                                            style={[
                                                styles.loginButton,
                                                {
                                                    backgroundColor: loading ? colors.buttonDisabled || colors.muted : colors.buttonBg,
                                                    opacity: loading ? 0.6 : 1,
                                                }
                                            ]}
                                            onPress={handleLogin}
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <ActivityIndicator size="small" color={colors.buttonText} />
                                            ) : (
                                                <Text style={[styles.buttonText, { color: colors.buttonText }]}>{strings.login}</Text>
                                            )}
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[
                                                styles.loginButton,
                                                {
                                                    backgroundColor: 'transparent',
                                                    borderWidth: 1.5,
                                                    borderColor: colors.buttonBg,
                                                    opacity: loading ? 0.6 : 1,
                                                }
                                            ]}
                                            onPress={onNavigateToRegister}
                                            disabled={loading}
                                        >
                                            <Text style={[styles.buttonText, { color: colors.buttonBg }]}>{strings.register}</Text>
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
            paddingBottom: 200, // chừa chỗ cho FAB settings và keyboard
        },
        cardContainer: {
            marginTop: -15,
        },
        loginCard: {
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
        userIconContainer: {
            alignItems: 'center',
            marginBottom: 30,
            marginTop: 10,
        },
        userIconCircle: {
            width: 100,
            height: 100,
            borderRadius: 50,
            borderWidth: 1,
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
        },
        userIconHead: {
            width: 32,
            height: 32,
            borderRadius: 16,
            position: 'absolute',
            top: 20,
        },
        userIconBody: {
            width: 45,
            height: 35,
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            borderBottomLeftRadius: 22,
            borderBottomRightRadius: 22,
            position: 'absolute',
            top: 48,
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
        passwordHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 10,
        },
        input: {
            borderWidth: 1.5,
            borderRadius: 10,
            paddingHorizontal: 15,
            paddingVertical: 13,
            fontSize: 15,
            height: 48,
        },
        forgotPassword: {
            fontSize: 13,
        },
        loginButtonContainer: {
            marginTop: 15,
        },
        loginButton: {
            width: '100%',
            borderRadius: 10,
            paddingVertical: 15,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 10,
        },
        buttonText: {
            fontSize: 15,
            fontWeight: 'bold',
        },
        switchRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
        },
        switchText: {
            fontSize: 14,
            fontWeight: '500',
        },
        langButton: {
            paddingVertical: 10,
            paddingHorizontal: 12,
            borderRadius: 8,
            borderWidth: 1,
        },
        langList: {
            marginTop: 6,
            borderRadius: 8,
            borderWidth: 1,
            overflow: 'hidden',
        },
        langItem: {
            paddingVertical: 10,
            paddingHorizontal: 12,
        },
        errorContainer: {
            marginBottom: 15,
            padding: 12,
            borderRadius: 8,
            backgroundColor: 'rgba(255, 68, 68, 0.1)',
        },
        errorText: {
            fontSize: 14,
            textAlign: 'center',
        },
    });

