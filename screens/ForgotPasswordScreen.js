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
} from 'react-native';

export default function ForgotPasswordScreen({
    onNavigateToLogin,
    theme,
    strings,
    colors,
}) {
    const [email, setEmail] = useState('');

    const styles = useMemo(() => createStyles(colors), [colors]);

    const handleSendReset = () => {
        console.log('Gửi email reset mật khẩu cho:', email);
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

                    {/* Card quên mật khẩu */}
                    <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                        <View style={styles.cardContainer}>
                            <View style={[styles.forgotPasswordCard, { backgroundColor: colors.cardBg }]}>
                                {/* Title */}
                                <Text style={[styles.forgotPasswordTitle, { color: colors.text }]}>{strings.forgotTitle}</Text>

                                {/* Form */}
                                <View style={styles.form}>
                                    <Text style={[styles.forgotPasswordDescription, { color: colors.muted }]}>{strings.forgotDesc}</Text>

                                    {/* Email/Tên đăng nhập */}
                                    <View style={styles.inputGroup}>
                                        <Text style={[styles.label, { color: colors.label }]}>
                                            {strings.email} / {strings.username} <Text style={[styles.required, { color: colors.error }]}>*</Text>
                                        </Text>
                                        <TextInput
                                            style={[styles.input, { borderColor: colors.inputBorder, backgroundColor: colors.inputBg, color: colors.text }]}
                                            value={email}
                                            onChangeText={setEmail}
                                            placeholder={strings.email}
                                            autoCapitalize="none"
                                            keyboardType="email-address"
                                            placeholderTextColor={colors.placeholder}
                                        />
                                    </View>

                                    {/* Button */}
                                    <TouchableOpacity style={[styles.forgotPasswordButton, { backgroundColor: colors.buttonBg }]} onPress={handleSendReset}>
                                        <Text style={[styles.buttonText, { color: colors.buttonText }]}>{strings.forgotSend}</Text>
                                    </TouchableOpacity>

                                    {/* Nút trở về đăng nhập */}
                                    <TouchableOpacity style={[styles.backButton, { borderColor: colors.outline }]} onPress={onNavigateToLogin}>
                                        <Text style={[styles.backButtonText, { color: colors.outline }]}>{strings.backToLogin}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </ScrollView>

                    {/* Settings removed on this screen */}
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
        forgotPasswordCard: {
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
        forgotPasswordTitle: {
            fontSize: 20,
            fontWeight: 'bold',
            marginBottom: 15,
            textAlign: 'center',
        },
        forgotPasswordDescription: {
            fontSize: 14,
            marginBottom: 25,
            textAlign: 'center',
            lineHeight: 20,
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
        forgotPasswordButton: {
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
        switchText: {
            fontSize: 14,
            fontWeight: '500',
        },
    });

