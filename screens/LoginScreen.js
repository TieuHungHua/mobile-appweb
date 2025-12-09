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
} from 'react-native';
import SettingsPanel from '../components/SettingsPanel';

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

    const styles = useMemo(() => createStyles(colors), [colors]);

    const handleLogin = () => {
        onNavigateHome?.();
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
                                    {/* Tên đăng nhập */}
                                    <View style={styles.inputGroup}>
                                        <Text style={[styles.label, { color: colors.label }]}>{strings.username}</Text>
                                        <TextInput
                                            style={[styles.input, { borderColor: colors.inputBorder, backgroundColor: colors.inputBg, color: colors.text }]}
                                            value={username}
                                            onChangeText={setUsername}
                                            autoCapitalize="none"
                                            placeholderTextColor={colors.placeholder}
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
                                            onChangeText={setPassword}
                                            secureTextEntry
                                            autoCapitalize="none"
                                            placeholderTextColor={colors.placeholder}
                                        />
                                    </View>

                                    {/* Buttons */}
                                    <View style={styles.loginButtonContainer}>
                                        <TouchableOpacity style={[styles.loginButton, { backgroundColor: colors.buttonBg }]} onPress={handleLogin}>
                                            <Text style={[styles.buttonText, { color: colors.buttonText }]}>{strings.login}</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity style={[styles.loginButton, { backgroundColor: colors.buttonBg }]} onPress={onNavigateToRegister}>
                                            <Text style={[styles.buttonText, { color: colors.buttonText }]}>{strings.register}</Text>
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
    });

