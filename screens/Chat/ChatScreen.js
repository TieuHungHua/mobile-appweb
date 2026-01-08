import { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import BottomNav from "../../components/BottomNav";
import {
  getOrCreateChat,
  sendMessage,
  listenMessages,
  updateReadStatus,
  setTypingIndicator,
  setPresence,
  listenPresence,
  getAdminId,
} from "../../utils/chatService";
import { getStoredUserInfo } from "../../utils/api";
import { createStyles } from "./Chat.styles";
import {
  CHAT_STATUS,
  TYPING_TIMEOUT,
  MESSAGE_TYPE,
  getStatusInfo,
} from "./Chat.mock";

export default function ChatScreen({ theme, strings, colors, onNavigate }) {
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [status, setStatus] = useState(CHAT_STATUS.CONNECTING);
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const [chatId, setChatId] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [adminPresence, setAdminPresence] = useState({
    online: false,
    typing: false,
  });
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
        setStatus(CHAT_STATUS.CONNECTING);

        // Lấy thông tin user hiện tại từ AsyncStorage
        const userInfo = await getStoredUserInfo();
        if (!userInfo || !userInfo.id) {
          console.error("[ChatScreen] User info not found");
          setStatus(CHAT_STATUS.ERROR);
          setIsLoading(false);
          return;
        }

        const userId = userInfo.id.toString();
        setCurrentUserId(userId);

        // ⚠️ Kiểm tra role - chỉ student mới có thể chat với admin
        if (userInfo.role !== "student") {
          console.warn("[ChatScreen] Only students can chat with admin");
          setStatus(CHAT_STATUS.ERROR);
          setIsLoading(false);
          return;
        }

        // Admin info
        const adminId = getAdminId();
        const adminInfo = {
          name: "Admin Thư Viện",
          avatar: "",
        };

        // Tạo hoặc lấy chat room với admin
        const newChatId = await getOrCreateChat(userId, userInfo, adminInfo);
        if (!isMounted) return;

        setChatId(newChatId);
        setStatus(CHAT_STATUS.CONNECTED);

        // Set user presence = online
        await setPresence(userId, true);

        // ✅ Listen messages realtime từ Firebase
        const unsubscribeMessages = listenMessages(
          newChatId,
          (firebaseMessages) => {
            if (!isMounted) return;

            // Convert Firebase messages format sang format hiện tại
            const formattedMessages = firebaseMessages.map((msg) => ({
              id: msg.messageId,
              sender: msg.senderId === userId ? "me" : "admin",
              senderId: msg.senderId,
              text: msg.text,
              at: new Date(msg.timestamp).toISOString(),
              timestamp: msg.timestamp,
              type: msg.type || MESSAGE_TYPE.TEXT,
              readBy: msg.readBy || {},
            }));

            setMessages(formattedMessages);

            // ✅ Update read status khi có tin nhắn mới
            if (formattedMessages.length > 0) {
              updateReadStatus(newChatId, userId).catch(console.error);
            }
          }
        );

        unsubscribeMessagesRef.current = unsubscribeMessages;

        // ✅ Listen admin presence (online/offline và typing indicator)
        const unsubscribePresence = listenPresence(adminId, (presence) => {
          if (!isMounted) return;
          setAdminPresence(presence || { online: false, typing: false });
        });

        unsubscribePresenceRef.current = unsubscribePresence;

        setIsLoading(false);
      } catch (error) {
        console.error("[ChatScreen] Error initializing chat:", error);
        if (isMounted) {
          setStatus(CHAT_STATUS.ERROR);
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
    }, TYPING_TIMEOUT);
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
    if (
      !value ||
      !chatId ||
      !currentUserId ||
      status !== CHAT_STATUS.CONNECTED
    ) {
      if (status !== CHAT_STATUS.CONNECTED) {
        // Show error message nếu chưa kết nối
        setMessages((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            sender: "system",
            text: strings?.chatOffline || "Không thể gửi, chưa kết nối.",
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
      await sendMessage(chatId, currentUserId, value, MESSAGE_TYPE.TEXT, {});
      setText("");
    } catch (error) {
      console.error("[ChatScreen] Error sending message:", error);
      // Hiển thị lỗi cho user
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          sender: "system",
          text:
            strings?.chatError || "Không thể gửi tin nhắn. Vui lòng thử lại.",
          at: new Date().toISOString(),
        },
      ]);
    }
  };

  const { label: statusLabel, color: statusColor } = getStatusInfo(
    status,
    adminPresence,
    strings
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.headerBg }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => onNavigate?.("home")}
        >
          <Ionicons name="chevron-back" size={22} color={colors.headerText} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={[styles.headerTitle, { color: colors.headerText }]}>
            {strings?.chatTitle || "Thư viện BK - Admin"}
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
            <Text style={[styles.statusText, { color: colors.headerText }]}>
              {statusLabel}
            </Text>
            {adminPresence.typing && (
              <Text style={[styles.typingText, { color: colors.headerText }]}>
                {strings?.chatTyping || "đang gõ..."}
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
        {isLoading ? (
          <View
            style={[
              styles.emptyContainer,
              {
                justifyContent: "center",
                alignItems: "center",
                minHeight: 200,
              },
            ]}
          >
            <ActivityIndicator size="large" color={colors.buttonBg} />
            <Text
              style={[styles.emptyText, { color: colors.muted, marginTop: 16 }]}
            >
              {strings?.chatStatusConnecting || "Đang kết nối..."}
            </Text>
          </View>
        ) : messages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View
              style={[
                styles.emptyIconContainer,
                { backgroundColor: colors.inputBg },
              ]}
            >
              <Ionicons
                name="chatbubbles-outline"
                size={64}
                color={colors.muted}
              />
            </View>
            <Text style={[styles.emptyText, { color: colors.muted }]}>
              {strings?.chatEmpty ||
                "Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!"}
            </Text>
          </View>
        ) : (
          messages.map((m) => {
            const isMe = m.sender === "me";
            const isSystem = m.sender === "system";
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
                    <Text
                      style={[
                        styles.timeText,
                        { color: isMe ? colors.buttonText : colors.muted },
                      ]}
                    >
                      {new Date(m.at).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
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
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 24 : 0}
      >
        <View
          style={[
            styles.composer,
            { borderColor: colors.inputBorder, backgroundColor: colors.cardBg },
          ]}
        >
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: colors.inputBg + "80" }]}
            activeOpacity={0.7}
          >
            <Ionicons
              name="add-circle-outline"
              size={26}
              color={colors.buttonBg}
            />
          </TouchableOpacity>
          <TextInput
            style={[
              styles.input,
              {
                color: colors.text,
                backgroundColor: colors.inputBg,
                borderColor: colors.inputBorder,
              },
            ]}
            placeholder={strings?.chatPlaceholder || "Nhập tin nhắn..."}
            placeholderTextColor={colors.placeholder}
            value={text}
            onChangeText={handleTextChange}
            onSubmitEditing={handleSendMessage}
            returnKeyType="send"
            editable={status === CHAT_STATUS.CONNECTED}
            multiline
          />
          <TouchableOpacity
            style={[
              styles.sendBtn,
              {
                backgroundColor: colors.buttonBg,
                opacity: status === CHAT_STATUS.CONNECTED ? 1 : 0.5,
              },
            ]}
            onPress={handleSendMessage}
            disabled={status !== CHAT_STATUS.CONNECTED}
          >
            <Ionicons
              name="paper-plane-outline"
              size={18}
              color={colors.buttonText}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <BottomNav
        activeKey="chats"
        onChange={(key) => {
          if (key === "home") onNavigate?.("home");
          if (key === "library") onNavigate?.("library");
          if (key === "settings") onNavigate?.("settings");
        }}
        colors={colors}
        strings={{
          ...strings,
          home: "Home",
          library: "Library",
          chats: "Chats",
          settings: "Settings",
        }}
      />
    </View>
  );
}
