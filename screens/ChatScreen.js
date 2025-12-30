/**
 * ChatScreen - Màn hình chat 1-1 giữa Student và Admin
 * 
 * Firebase Realtime Database Integration
 * ======================================
 * 
 * ✅ Tính năng đã implement:
 * - Chat realtime với Firebase Realtime Database
 * - Mỗi student chỉ có 1 phòng chat với admin
 * - Typing indicator (hiển thị khi đối phương đang gõ)
 * - Online/Offline status
 * - Read status tracking
 * - Auto scroll khi có tin nhắn mới
 * - Error handling và loading states
 * 
 * 📊 Database Structure:
 * - /chats/{chatId}/ - Thông tin phòng chat và messages
 * - /userChats/{userId}/ - Danh sách chat của từng user
 * - /presence/{userId}/ - Trạng thái online/offline và typing
 * 
 * 🔗 Firebase Console:
 * https://console.firebase.google.com/project/bk-library-e0771/database/bk-library-e0771-default-rtdb/data
 * 
 * 📚 Tài liệu tham khảo:
 * - docs/firebase-chat-database-design.md - Thiết kế database structure
 * - docs/firebase-setup-guide.md - Hướng dẫn setup đầy đủ
 * - docs/firebase-ready.md - Trạng thái setup và hướng dẫn test
 * 
 * ⚠️ Lưu ý:
 * - Chỉ user có role === 'student' mới có thể chat với admin
 * - Admin ID được hardcode trong chatService.js (mặc định: 'admin001')
 * - Cần đảm bảo Firebase config đã được setup trong utils/firebase.js
 * 
 * 🔧 Troubleshooting:
 * - Lỗi "Permission denied": Kiểm tra Security Rules trong Firebase Console
 * - Messages không hiển thị: Kiểm tra console logs và listeners
 * - User không phải student: Chỉ student mới có thể vào chat screen
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import BottomNav from '../components/BottomNav';
import {
    getOrCreateChat,
    sendMessage,
    listenMessages,
    updateReadStatus,
    setTypingIndicator,
    setPresence,
    listenPresence,
    getAdminId,
} from '../utils/chatService';
import { getStoredUserInfo } from '../utils/api';

export default function ChatScreen({ theme, strings, colors, onNavigate }) {
    const styles = useMemo(() => createStyles(colors), [colors]);
    const [status, setStatus] = useState('connecting'); // connecting | connected | error | closed
    const [text, setText] = useState('');
    const [messages, setMessages] = useState([]);
    const [chatId, setChatId] = useState(null);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [adminPresence, setAdminPresence] = useState({ online: false, typing: false });
    const [isLoading, setIsLoading] = useState(true);
    const scrollRef = useRef(null);
    const unsubscribeMessagesRef = useRef(null);
    const unsubscribePresenceRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    /**
     * Initialize chat và setup Firebase listeners
     * 
     * Quy trình:
     * 1. Lấy thông tin user hiện tại từ AsyncStorage
     * 2. Kiểm tra role (chỉ student mới có thể chat)
     * 3. Tạo hoặc lấy chat room với admin
     * 4. Setup realtime listeners cho messages và presence
     * 5. Set user presence = online
     * 
     * Cleanup:
     * - Unsubscribe tất cả listeners khi component unmount
     * - Set user presence = offline
     */
    useEffect(() => {
        let isMounted = true;

        const initializeChat = async () => {
            try {
                setIsLoading(true);
                setStatus('connecting');

                // Lấy thông tin user hiện tại từ AsyncStorage
                const userInfo = await getStoredUserInfo();
                if (!userInfo || !userInfo.id) {
                    console.error('[ChatScreen] User info not found');
                    setStatus('error');
                    setIsLoading(false);
                    return;
                }

                const userId = userInfo.id.toString();
                setCurrentUserId(userId);

                // ⚠️ Kiểm tra role - chỉ student mới có thể chat với admin
                // Admin và các role khác sẽ không thể vào chat screen
                if (userInfo.role !== 'student') {
                    console.warn('[ChatScreen] Only students can chat with admin');
                    setStatus('error');
                    setIsLoading(false);
                    return;
                }

                // Admin info (có thể lấy từ config hoặc API)
                // ⚠️ Admin ID được hardcode trong chatService.js (mặc định: 'admin001')
                // Nếu cần thay đổi, cập nhật hàm getAdminId() trong utils/chatService.js
                const adminId = getAdminId();
                const adminInfo = {
                    name: 'Admin Thư Viện',
                    avatar: '',
                };

                // Tạo hoặc lấy chat room với admin
                // Chat ID format: chat_{studentId}_admin
                // Mỗi student chỉ có 1 phòng chat với admin
                const newChatId = await getOrCreateChat(userId, userInfo, adminInfo);
                if (!isMounted) return;

                setChatId(newChatId);
                setStatus('connected');

                // Set user presence = online
                // Tự động set offline khi disconnect (onDisconnect handler)
                await setPresence(userId, true);

                // ✅ Listen messages realtime từ Firebase
                // Tự động cập nhật khi có tin nhắn mới
                // Giới hạn 50 tin nhắn gần nhất (có thể load thêm với pagination)
                const unsubscribeMessages = listenMessages(newChatId, (firebaseMessages) => {
                    if (!isMounted) return;

                    // Convert Firebase messages format sang format hiện tại
                    const formattedMessages = firebaseMessages.map((msg) => ({
                        id: msg.messageId,
                        sender: msg.senderId === userId ? 'me' : 'admin',
                        senderId: msg.senderId,
                        text: msg.text,
                        at: new Date(msg.timestamp).toISOString(),
                        timestamp: msg.timestamp,
                        type: msg.type || 'text',
                        readBy: msg.readBy || {},
                    }));

                    setMessages(formattedMessages);

                    // ✅ Update read status khi có tin nhắn mới
                    // Đánh dấu tất cả messages là đã đọc khi user mở chat
                    if (formattedMessages.length > 0) {
                        updateReadStatus(newChatId, userId).catch(console.error);
                    }
                });

                unsubscribeMessagesRef.current = unsubscribeMessages;

                // ✅ Listen admin presence (online/offline và typing indicator)
                // Hiển thị trạng thái online/offline và "đang gõ..." của admin
                const unsubscribePresence = listenPresence(adminId, (presence) => {
                    if (!isMounted) return;
                    setAdminPresence(presence || { online: false, typing: false });
                });

                unsubscribePresenceRef.current = unsubscribePresence;

                setIsLoading(false);
            } catch (error) {
                console.error('[ChatScreen] Error initializing chat:', error);
                if (isMounted) {
                    setStatus('error');
                    setIsLoading(false);
                }
            }
        };

        initializeChat();

        return () => {
            isMounted = false;

            // Cleanup listeners
            if (unsubscribeMessagesRef.current) {
                unsubscribeMessagesRef.current();
            }
            if (unsubscribePresenceRef.current) {
                unsubscribePresenceRef.current();
            }
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            // Set offline khi unmount
            if (currentUserId) {
                setPresence(currentUserId, false).catch(console.error);
            }
        };
    }, []);

    /**
     * Auto scroll to bottom when new message arrives
     * Đảm bảo tin nhắn mới luôn hiển thị trên màn hình
     */
    useEffect(() => {
        if (scrollRef.current && messages.length > 0) {
            setTimeout(() => {
                scrollRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages.length]);

    /**
     * Handle typing indicator
     * 
     * Khi user gõ:
     * - Set typing = true ngay lập tức
     * - Sau 3 giây không gõ, tự động set typing = false
     * 
     * Admin sẽ thấy "đang gõ..." khi student đang gõ tin nhắn
     */
    const handleTextChange = (value) => {
        setText(value);

        if (!chatId || !currentUserId) return;

        // Set typing = true để admin biết đang gõ
        setTypingIndicator(currentUserId, true);

        // Clear previous timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set typing = false sau 3 giây không gõ
        typingTimeoutRef.current = setTimeout(() => {
            setTypingIndicator(currentUserId, false);
        }, 3000);
    };

    /**
     * Handle send message
     * 
     * Quy trình:
     * 1. Validate input và connection status
     * 2. Clear typing indicator
     * 3. Gửi message lên Firebase Realtime Database
     * 4. Clear input field
     * 5. Handle errors nếu có
     * 
     * Message sẽ được lưu vào:
     * - /chats/{chatId}/messages/{messageId}
     * - Tự động cập nhật lastMessage và unreadCount
     * - Realtime listener sẽ tự động cập nhật UI
     */
    const handleSendMessage = async () => {
        const value = text.trim();
        if (!value || !chatId || !currentUserId || status !== 'connected') {
            if (status !== 'connected') {
                // Show error message nếu chưa kết nối
                setMessages((prev) => [
                    ...prev,
                    {
                        id: `error-${Date.now()}`,
                        sender: 'system',
                        text: strings?.chatOffline || 'Không thể gửi, chưa kết nối.',
                        at: new Date().toISOString(),
                    },
                ]);
            }
            return;
        }

        // Clear typing indicator khi gửi tin nhắn
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        setTypingIndicator(currentUserId, false);

        try {
            // ✅ Gửi message lên Firebase Realtime Database
            // Message sẽ được lưu và tự động sync realtime
            await sendMessage(chatId, currentUserId, value, 'text', {});
            setText('');
        } catch (error) {
            console.error('[ChatScreen] Error sending message:', error);
            // Hiển thị lỗi cho user
            setMessages((prev) => [
                ...prev,
                {
                    id: `error-${Date.now()}`,
                    sender: 'system',
                    text: strings?.chatError || 'Không thể gửi tin nhắn. Vui lòng thử lại.',
                    at: new Date().toISOString(),
                },
            ]);
        }
    };

    const statusLabel =
        status === 'connected'
            ? adminPresence.online
                ? strings?.chatStatusOnline || 'Online'
                : strings?.chatStatusOffline || 'Offline'
            : status === 'connecting'
                ? strings?.chatStatusConnecting || 'Đang kết nối...'
                : strings?.chatStatusOffline || 'Ngoại tuyến';

    const statusColor =
        status === 'connected'
            ? adminPresence.online
                ? '#2ecc71'
                : '#95a5a6'
            : status === 'connecting'
                ? '#f1c40f'
                : '#e74c3c';

    if (isLoading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={colors.buttonBg} />
                <Text style={[styles.loadingText, { color: colors.text, marginTop: 16 }]}>
                    {strings?.chatStatusConnecting || 'Đang kết nối...'}
                </Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />

            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.headerBg }]}>
                <TouchableOpacity style={styles.backBtn} onPress={() => onNavigate?.('home')}>
                    <Ionicons name="chevron-back" size={22} color={colors.headerText} />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <Text style={[styles.headerTitle, { color: colors.headerText }]}>
                        {strings?.chatTitle || 'Thư viện BK - Admin'}
                    </Text>
                    <View style={styles.statusRow}>
                        <View
                            style={[
                                styles.statusDot,
                                {
                                    backgroundColor: statusColor,
                                },
                            ]}
                        />
                        <Text style={[styles.statusText, { color: colors.headerText }]}>{statusLabel}</Text>
                        {adminPresence.typing && (
                            <Text style={[styles.typingText, { color: colors.headerText }]}>
                                {strings?.chatTyping || 'đang gõ...'}
                            </Text>
                        )}
                    </View>
                </View>
                <TouchableOpacity style={styles.callBtn}>
                    <Ionicons name="call-outline" size={20} color={colors.headerText} />
                </TouchableOpacity>
            </View>

            {/* Messages */}
            <ScrollView
                ref={scrollRef}
                contentContainerStyle={styles.messages}
                showsVerticalScrollIndicator={false}
            >
                {messages.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={[styles.emptyText, { color: colors.muted }]}>
                            {strings?.chatEmpty || 'Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!'}
                        </Text>
                    </View>
                ) : (
                    messages.map((m) => {
                        const isMe = m.sender === 'me';
                        const isSystem = m.sender === 'system';
                        return (
                            <View
                                key={m.id}
                                style={[
                                    styles.bubbleRow,
                                    isMe ? styles.bubbleRowMe : styles.bubbleRowOther,
                                ]}
                            >
                                <View
                                    style={[
                                        styles.bubble,
                                        {
                                            backgroundColor: isSystem
                                                ? colors.inputBg
                                                : isMe
                                                    ? colors.buttonBg
                                                    : colors.cardBg,
                                            borderColor: colors.inputBorder,
                                        },
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.bubbleText,
                                            { color: isMe ? colors.buttonText : colors.text },
                                        ]}
                                    >
                                        {m.text}
                                    </Text>
                                    {!isSystem && (
                                        <Text style={[styles.timeText, { color: isMe ? colors.buttonText : colors.muted }]}>
                                            {new Date(m.at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                        </Text>
                                    )}
                                </View>
                            </View>
                        );
                    })
                )}
            </ScrollView>

            {/* Composer */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 24 : 0}
            >
                <View style={[styles.composer, { borderColor: colors.inputBorder, backgroundColor: colors.cardBg }]}>
                    <TouchableOpacity style={styles.iconBtn}>
                        <Ionicons name="add-circle-outline" size={24} color={colors.muted} />
                    </TouchableOpacity>
                    <TextInput
                        style={[styles.input, { color: colors.text }]}
                        placeholder={strings?.chatPlaceholder || 'Nhập tin nhắn...'}
                        placeholderTextColor={colors.placeholder}
                        value={text}
                        onChangeText={handleTextChange}
                        onSubmitEditing={handleSendMessage}
                        returnKeyType="send"
                        editable={status === 'connected'}
                    />
                    <TouchableOpacity
                        style={[styles.sendBtn, { backgroundColor: colors.buttonBg, opacity: status === 'connected' ? 1 : 0.5 }]}
                        onPress={handleSendMessage}
                        disabled={status !== 'connected'}
                    >
                        <Ionicons name="paper-plane-outline" size={18} color={colors.buttonText} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>

            <BottomNav
                activeKey="chats"
                onChange={(key) => {
                    if (key === 'home') onNavigate?.('home');
                    if (key === 'library') onNavigate?.('library');
                    if (key === 'settings') onNavigate?.('settings');
                }}
                colors={colors}
                strings={{ ...strings, home: 'Home', library: 'Library', chats: 'Chats', settings: 'Settings' }}
            />
        </View>
    );
}

const createStyles = (colors) =>
    StyleSheet.create({
        container: {
            flex: 1,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingTop: Platform.OS === 'ios' ? 42 : 18,
            paddingHorizontal: 12,
            paddingBottom: 10,
            gap: 12,
        },
        backBtn: {
            padding: 6,
        },
        headerInfo: {
            flex: 1,
            gap: 4,
        },
        headerTitle: {
            fontSize: 16,
            fontWeight: '700',
        },
        statusRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
        },
        statusDot: {
            width: 10,
            height: 10,
            borderRadius: 5,
        },
        statusText: {
            fontSize: 12,
            fontWeight: '600',
        },
        callBtn: {
            padding: 8,
        },
        messages: {
            flexGrow: 1,
            paddingHorizontal: 14,
            paddingVertical: 10,
            gap: 10,
        },
        bubbleRow: {
            flexDirection: 'row',
        },
        bubbleRowMe: {
            justifyContent: 'flex-end',
        },
        bubbleRowOther: {
            justifyContent: 'flex-start',
        },
        bubble: {
            maxWidth: '80%',
            borderRadius: 14,
            paddingHorizontal: 12,
            paddingVertical: 10,
            borderWidth: 1,
            shadowColor: '#000',
            shadowOpacity: 0.05,
            shadowRadius: 3,
            shadowOffset: { width: 0, height: 1 },
            elevation: 2,
        },
        bubbleText: {
            fontSize: 14,
            fontWeight: '500',
        },
        composer: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            paddingHorizontal: 12,
            paddingVertical: 10,
            borderTopWidth: 1,
        },
        input: {
            flex: 1,
            fontSize: 14,
            paddingVertical: Platform.OS === 'ios' ? 10 : 6,
        },
        iconBtn: {
            padding: 4,
        },
        sendBtn: {
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderRadius: 12,
            shadowColor: '#000',
            shadowOpacity: 0.08,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 2 },
            elevation: 2,
        },
        loadingText: {
            fontSize: 14,
            marginTop: 8,
        },
        emptyContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 40,
        },
        emptyText: {
            fontSize: 14,
            textAlign: 'center',
        },
        timeText: {
            fontSize: 10,
            marginTop: 4,
            opacity: 0.7,
        },
        typingText: {
            fontSize: 11,
            fontStyle: 'italic',
            marginLeft: 4,
        },
    });

