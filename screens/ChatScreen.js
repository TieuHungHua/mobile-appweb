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
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import BottomNav from '../components/BottomNav';

const SOCKET_URL = 'wss://echo.websocket.events';

export default function ChatScreen({ theme, strings, colors, onNavigate }) {
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [status, setStatus] = useState('connecting'); // connecting | connected | error | closed
  const [text, setText] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      sender: 'admin',
      text: strings?.chatWelcome || 'Chào bạn! Bạn cần tìm sách gì?',
      at: new Date().toISOString(),
    },
  ]);
  const socketRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    const ws = new WebSocket(SOCKET_URL);
    socketRef.current = ws;
    setStatus('connecting');

    ws.onopen = () => {
      setStatus('connected');
      ws.send('Client joined at ' + new Date().toISOString());
    };

    ws.onmessage = (event) => {
      const data = typeof event.data === 'string' ? event.data : '';
      if (!data) return;
      setMessages((prev) => [
        ...prev,
        {
          id: `srv-${Date.now()}`,
          sender: 'admin',
          text: data,
          at: new Date().toISOString(),
        },
      ]);
    };

    ws.onerror = () => setStatus('error');
    ws.onclose = () => setStatus('closed');

    return () => {
      ws.close();
      socketRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollToEnd({ animated: true });
    }
  }, [messages.length]);

  const sendMessage = () => {
    const value = text.trim();
    if (!value) return;

    const newMsg = {
      id: `me-${Date.now()}`,
      sender: 'me',
      text: value,
      at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMsg]);
    setText('');

    if (socketRef.current && status === 'connected') {
      socketRef.current.send(value);
    } else {
      setMessages((prev) => [
        ...prev,
        {
          id: `warn-${Date.now()}`,
          sender: 'system',
          text: strings?.chatOffline || 'Không thể gửi, socket chưa kết nối.',
          at: new Date().toISOString(),
        },
      ]);
    }
  };

  const statusLabel =
    status === 'connected'
      ? strings?.chatStatusOnline || 'Online'
      : status === 'connecting'
      ? strings?.chatStatusConnecting || 'Đang kết nối...'
      : strings?.chatStatusOffline || 'Ngoại tuyến';

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
                  backgroundColor:
                    status === 'connected' ? '#2ecc71' : status === 'connecting' ? '#f1c40f' : '#e74c3c',
                },
              ]}
            />
            <Text style={[styles.statusText, { color: colors.headerText }]}>{statusLabel}</Text>
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
        {messages.map((m) => {
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
              </View>
            </View>
          );
        })}
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
            onChangeText={setText}
            onSubmitEditing={sendMessage}
            returnKeyType="send"
          />
          <TouchableOpacity style={[styles.sendBtn, { backgroundColor: colors.buttonBg }]} onPress={sendMessage}>
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
        strings={{ ...strings, home: 'Home', library: strings?.books || 'Sách', chats: 'Chats', settings: 'Settings' }}
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
  });

