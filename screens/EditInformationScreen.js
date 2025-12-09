import { StatusBar } from 'expo-status-bar';
import { useMemo, useState, useRef } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, Platform, KeyboardAvoidingView, Alert, Image, Modal, PanResponder } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function EditInformationScreen({ theme, lang, strings, colors, onNavigate }) {
    const styles = useMemo(() => createStyles(colors), [colors]);
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [gender, setGender] = useState('male'); // 'male' or 'female'
    const [avatarUri, setAvatarUri] = useState(null);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');

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

    const handlePickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(
                    strings.permissionNeeded || 'Permission needed',
                    strings.permissionMessage || 'We need camera roll permissions to change your avatar'
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
            console.error('Error picking image:', error);
            Alert.alert(
                strings.error || 'Error',
                strings.imagePickerError || 'Failed to pick image. Please try again.'
            );
        }
    };

    const handleDatePicker = () => {
        setShowDatePicker(true);
    };

    const handleDateChange = (event, date) => {
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
        }
        if (date) {
            setSelectedDate(date);
            // Format date as dd/mm/yyyy
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            setDateOfBirth(`${day}/${month}/${year}`);
        }
        if (Platform.OS === 'ios') {
            // On iOS, we'll use a modal with confirm button
        }
    };

    const confirmDate = () => {
        setShowDatePicker(false);
        const day = String(selectedDate.getDate()).padStart(2, '0');
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const year = selectedDate.getFullYear();
        setDateOfBirth(`${day}/${month}/${year}`);
    };

    const handleSave = () => {
        // Validate required fields
        if (!fullName.trim()) {
            Alert.alert(strings.error || 'Error', strings.fullNameRequired || 'Vui lòng nhập họ và tên');
            return;
        }
        if (!phone.trim()) {
            Alert.alert(strings.error || 'Error', strings.phoneRequired || 'Vui lòng nhập số điện thoại');
            return;
        }
        if (!dateOfBirth.trim()) {
            Alert.alert(strings.error || 'Error', strings.dateOfBirthRequired || 'Vui lòng chọn ngày sinh');
            return;
        }

        // Show password modal
        setShowPasswordModal(true);
        setPassword('');
        setPasswordError('');
    };

    const handlePasswordConfirm = () => {
        if (!password.trim()) {
            setPasswordError(strings.passwordRequired || 'Vui lòng nhập mật khẩu');
            return;
        }

        // TODO: Verify password with backend
        // For now, just check if password is not empty
        // In real app, you would call API to verify password

        // Simulate password verification
        if (password.length < 6) {
            setPasswordError(strings.passwordIncorrect || 'Mật khẩu không đúng');
            return;
        }

        // Password is correct, proceed to save
        setShowPasswordModal(false);
        setPassword('');
        setPasswordError('');

        // TODO: Implement actual save logic with API call
        Alert.alert(
            strings.success || 'Success',
            strings.saveSuccess || 'Đã lưu thông tin thành công',
            [
                {
                    text: strings.ok || 'OK',
                    onPress: () => onNavigate?.('settings'),
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
                    {strings.personalInformation || 'THÔNG TIN CÁ NHÂN'}
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
                        {/* Avatar Section */}
                        <View style={styles.profileSection}>
                            <TouchableOpacity
                                style={styles.avatarWrapper}
                                onPress={handlePickImage}
                                activeOpacity={0.8}
                            >
                                <View style={[styles.avatarContainer, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
                                    {avatarUri ? (
                                        <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
                                    ) : (
                                        <Ionicons name="person" size={50} color={colors.buttonBg} />
                                    )}
                                </View>
                                <View style={[styles.editAvatarBadge, { backgroundColor: colors.buttonBg, borderColor: colors.cardBg }]}>
                                    <Ionicons name="camera" size={16} color={colors.buttonText} />
                                </View>
                            </TouchableOpacity>
                        </View>

                        {/* Input Fields */}
                        <View style={styles.form}>
                            {/* Full Name */}
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: colors.text }]}>
                                    {strings.fullName || 'Họ và tên'} <Text style={[styles.required, { color: colors.error }]}>*</Text>
                                </Text>
                                <TextInput
                                    style={[styles.input, { borderColor: colors.inputBorder, backgroundColor: colors.inputBg, color: colors.text }]}
                                    value={fullName}
                                    onChangeText={setFullName}
                                    placeholder={strings.fullNamePlaceholder || 'Họ và tên của bạn'}
                                    placeholderTextColor={colors.placeholder}
                                />
                            </View>

                            {/* Phone Number */}
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: colors.text }]}>
                                    {strings.phone || 'Số điện thoại'} <Text style={[styles.required, { color: colors.error }]}>*</Text>
                                </Text>
                                <TextInput
                                    style={[styles.input, { borderColor: colors.inputBorder, backgroundColor: colors.inputBg, color: colors.text }]}
                                    value={phone}
                                    onChangeText={setPhone}
                                    placeholder={strings.phonePlaceholder || 'Nhập số điện thoại'}
                                    placeholderTextColor={colors.placeholder}
                                    keyboardType="phone-pad"
                                />
                            </View>

                            {/* Date of Birth */}
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: colors.text }]}>
                                    {strings.dateOfBirth || 'Ngày sinh'} <Text style={[styles.required, { color: colors.error }]}>*</Text>
                                </Text>
                                <TouchableOpacity
                                    style={[styles.dateInputContainer, { borderColor: colors.inputBorder, backgroundColor: colors.inputBg }]}
                                    onPress={handleDatePicker}
                                    activeOpacity={0.7}
                                >
                                    <TextInput
                                        style={[styles.dateInput, { color: dateOfBirth ? colors.text : colors.placeholder }]}
                                        value={dateOfBirth}
                                        editable={false}
                                        placeholder={strings.dateOfBirthPlaceholder || 'Vui lòng chọn ngày sinh'}
                                        placeholderTextColor={colors.placeholder}
                                    />
                                    <Ionicons name="calendar-outline" size={20} color={colors.muted} />
                                </TouchableOpacity>
                            </View>

                            {/* Gender */}
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: colors.text }]}>
                                    {strings.gender || 'Giới tính'} <Text style={[styles.required, { color: colors.error }]}>*</Text>
                                </Text>
                                <View style={styles.radioContainer}>
                                    <TouchableOpacity
                                        style={styles.radioOption}
                                        onPress={() => setGender('male')}
                                        activeOpacity={0.7}
                                    >
                                        <View style={[styles.radioCircle, { borderColor: colors.inputBorder }]}>
                                            {gender === 'male' && <View style={[styles.radioSelected, { backgroundColor: '#9b59b6' }]} />}
                                        </View>
                                        <Ionicons name="male" size={18} color={gender === 'male' ? '#9b59b6' : colors.muted} />
                                        <Text style={[styles.radioLabel, { color: gender === 'male' ? colors.text : colors.muted }]}>
                                            {strings.male || 'Nam'}
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.radioOption}
                                        onPress={() => setGender('female')}
                                        activeOpacity={0.7}
                                    >
                                        <View style={[styles.radioCircle, { borderColor: colors.inputBorder }]}>
                                            {gender === 'female' && <View style={[styles.radioSelected, { backgroundColor: '#9b59b6' }]} />}
                                        </View>
                                        <Ionicons name="female" size={18} color={gender === 'female' ? '#9b59b6' : colors.muted} />
                                        <Text style={[styles.radioLabel, { color: gender === 'female' ? colors.text : colors.muted }]}>
                                            {strings.female || 'Nữ'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
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

            {/* Date Picker Modal */}
            {showDatePicker && (
                <Modal
                    visible={showDatePicker}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setShowDatePicker(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={[styles.modalContent, { backgroundColor: colors.cardBg, borderColor: colors.inputBorder }]}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>
                                {strings.datePicker || 'Date Picker'}
                            </Text>
                            {Platform.OS === 'ios' && (
                                <DateTimePicker
                                    value={selectedDate}
                                    mode="date"
                                    display="spinner"
                                    onChange={handleDateChange}
                                    maximumDate={new Date()}
                                    style={styles.datePickerIOS}
                                />
                            )}
                            {Platform.OS === 'android' && (
                                <DateTimePicker
                                    value={selectedDate}
                                    mode="date"
                                    display="default"
                                    onChange={handleDateChange}
                                    maximumDate={new Date()}
                                />
                            )}
                            {Platform.OS === 'ios' && (
                                <View style={styles.modalActions}>
                                    <TouchableOpacity
                                        style={[styles.modalButton, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}
                                        onPress={() => setShowDatePicker(false)}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={[styles.modalButtonText, { color: colors.text }]}>
                                            {strings.cancel || 'Cancel'}
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.modalButton, { backgroundColor: colors.buttonBg }]}
                                        onPress={confirmDate}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={[styles.modalButtonText, { color: colors.buttonText }]}>
                                            {strings.ok || 'OK'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    </View>
                </Modal>
            )}

            {/* Password Confirmation Modal */}
            <Modal
                visible={showPasswordModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => {
                    setShowPasswordModal(false);
                    setPassword('');
                    setPasswordError('');
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
                                {strings.confirmPassword || 'Xác nhận mật khẩu'}
                            </Text>
                            <Text style={[styles.modalDescription, { color: colors.muted }]}>
                                {strings.enterPasswordToSave || 'Vui lòng nhập mật khẩu để lưu thông tin'}
                            </Text>

                            <View style={styles.passwordInputGroup}>
                                <TextInput
                                    style={[
                                        styles.passwordInput,
                                        {
                                            borderColor: passwordError ? colors.error : colors.inputBorder,
                                            backgroundColor: colors.inputBg,
                                            color: colors.text,
                                        },
                                    ]}
                                    value={password}
                                    onChangeText={(text) => {
                                        setPassword(text);
                                        setPasswordError('');
                                    }}
                                    placeholder={strings.password || 'Mật khẩu'}
                                    placeholderTextColor={colors.placeholder}
                                    secureTextEntry
                                    autoFocus
                                    onSubmitEditing={handlePasswordConfirm}
                                />
                                {passwordError ? (
                                    <Text style={[styles.errorText, { color: colors.error }]}>{passwordError}</Text>
                                ) : null}
                            </View>

                            <View style={styles.modalActions}>
                                <TouchableOpacity
                                    style={[styles.modalButton, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}
                                    onPress={() => {
                                        setShowPasswordModal(false);
                                        setPassword('');
                                        setPasswordError('');
                                    }}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[styles.modalButtonText, { color: colors.text }]}>
                                        {strings.cancel || 'Hủy'}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalButton, { backgroundColor: colors.buttonBg }]}
                                    onPress={handlePasswordConfirm}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[styles.modalButtonText, { color: colors.buttonText }]}>
                                        {strings.confirm || 'Xác nhận'}
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
        profileSection: {
            alignItems: 'center',
            marginBottom: 30,
        },
        avatarWrapper: {
            position: 'relative',
        },
        avatarContainer: {
            width: 100,
            height: 100,
            borderRadius: 50,
            borderWidth: 2,
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
        },
        avatarImage: {
            width: '100%',
            height: '100%',
            borderRadius: 50,
        },
        editAvatarBadge: {
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: 32,
            height: 32,
            borderRadius: 16,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 3,
        },
        form: {
            width: '100%',
            marginBottom: 20,
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
        input: {
            borderWidth: 1,
            borderRadius: 10,
            paddingHorizontal: 15,
            paddingVertical: 12,
            fontSize: 15,
            height: 48,
        },
        dateInputContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderRadius: 10,
            paddingHorizontal: 15,
            height: 48,
        },
        dateInput: {
            flex: 1,
            fontSize: 15,
            paddingVertical: 12,
        },
        radioContainer: {
            flexDirection: 'row',
            gap: 20,
            marginTop: 8,
        },
        radioOption: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
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
        radioLabel: {
            fontSize: 15,
            fontWeight: '500',
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
            paddingTop: Platform.OS === 'ios' ? 250 : 280, // Tăng giá trị này để modal cao hơn
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
            marginBottom: 16,
            textAlign: 'center',
        },
        datePickerIOS: {
            height: 200,
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
        modalDescription: {
            fontSize: 14,
            marginBottom: 20,
            textAlign: 'center',
        },
        passwordInputGroup: {
            marginBottom: 20,
        },
        passwordInput: {
            borderWidth: 1,
            borderRadius: 10,
            paddingHorizontal: 15,
            paddingVertical: 12,
            fontSize: 15,
            height: 48,
        },
        errorText: {
            fontSize: 12,
            marginTop: 5,
        },
    });

