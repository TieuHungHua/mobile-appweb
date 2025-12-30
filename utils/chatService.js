// Firebase Chat Service
import { 
    ref, 
    set, 
    push, 
    onValue, 
    off, 
    update, 
    serverTimestamp,
    query,
    orderByChild,
    limitToLast,
    get,
    onDisconnect
} from 'firebase/database';
import { database } from './firebase';
import { getStoredUserInfo } from './api';

/**
 * Generate chat ID for student-admin chat
 * Format: chat_{studentId}_admin
 */
export const generateChatId = (studentId) => {
    return `chat_${studentId}_admin`;
};

/**
 * Get admin user ID (có thể lấy từ config hoặc database)
 * TODO: Cập nhật logic này để lấy admin ID từ backend/config
 */
export const getAdminId = () => {
    // Tạm thời dùng hardcode, nên lấy từ config hoặc API
    return 'admin001'; // Hoặc lấy từ environment/config
};

/**
 * Get or create chat room for student
 * @param {string} studentId - ID của student
 * @param {object} studentInfo - Thông tin student (name, avatar, etc.)
 * @param {object} adminInfo - Thông tin admin (name, avatar, etc.)
 * @returns {Promise<string>} Chat ID
 */
export const getOrCreateChat = async (studentId, studentInfo, adminInfo) => {
    const chatId = generateChatId(studentId);
    const adminId = getAdminId();
    const chatRef = ref(database, `chats/${chatId}`);
    
    try {
        // Kiểm tra chat đã tồn tại chưa
        const snapshot = await get(chatRef);
        
        if (!snapshot.exists()) {
            // Tạo chat mới
            const now = Date.now();
            const chatData = {
                participants: {
                    [studentId]: {
                        userId: studentId,
                        role: 'student',
                        name: studentInfo.name || studentInfo.username || 'Student',
                        avatar: studentInfo.avatar || '',
                        joinedAt: now
                    },
                    [adminId]: {
                        userId: adminId,
                        role: 'admin',
                        name: adminInfo.name || 'Admin Thư Viện',
                        avatar: adminInfo.avatar || '',
                        joinedAt: now
                    }
                },
                createdAt: now,
                updatedAt: now,
                isActive: true
            };
            
            await set(chatRef, chatData);
            
            // Tạo userChats cho student
            const studentChatRef = ref(database, `userChats/${studentId}/${chatId}`);
            await set(studentChatRef, {
                chatId: chatId,
                lastReadMessageId: '',
                unreadCount: 0,
                lastActivity: now,
                isMuted: false
            });
            
            // Tạo userChats cho admin
            const adminChatRef = ref(database, `userChats/${adminId}/${chatId}`);
            await set(adminChatRef, {
                chatId: chatId,
                lastReadMessageId: '',
                unreadCount: 0,
                lastActivity: now,
                isMuted: false
            });
            
            console.log('[ChatService] Created new chat:', chatId);
        } else {
            console.log('[ChatService] Chat already exists:', chatId);
        }
        
        return chatId;
    } catch (error) {
        console.error('[ChatService] Error getting/creating chat:', error);
        throw error;
    }
};

/**
 * Send a message
 * @param {string} chatId - Chat ID
 * @param {string} senderId - ID người gửi
 * @param {string} text - Nội dung tin nhắn
 * @param {string} type - Loại tin nhắn (default: "text")
 * @param {object} metadata - Metadata bổ sung
 * @returns {Promise<string>} Message ID
 */
export const sendMessage = async (chatId, senderId, text, type = 'text', metadata = {}) => {
    try {
        const messagesRef = ref(database, `chats/${chatId}/messages`);
        const newMessageRef = push(messagesRef);
        const messageId = newMessageRef.key;
        const timestamp = Date.now();
        
        // Lấy danh sách participants để set readBy
        const chatRef = ref(database, `chats/${chatId}/participants`);
        const participantsSnapshot = await get(chatRef);
        const participants = participantsSnapshot.val() || {};
        const readBy = {};
        
        // Set readBy: người gửi = true, người nhận = false
        Object.keys(participants).forEach(userId => {
            readBy[userId] = userId === senderId;
        });
        
        const messageData = {
            messageId: messageId,
            senderId: senderId,
            text: text.trim(),
            timestamp: timestamp,
            type: type,
            readBy: readBy,
            metadata: metadata
        };
        
        await set(newMessageRef, messageData);
        
        // Cập nhật lastMessage
        const lastMessageRef = ref(database, `chats/${chatId}/lastMessage`);
        await set(lastMessageRef, {
            messageId: messageId,
            text: text.trim(),
            senderId: senderId,
            timestamp: timestamp
        });
        
        // Cập nhật updatedAt
        await update(ref(database, `chats/${chatId}`), {
            updatedAt: timestamp
        });
        
        // Cập nhật lastActivity và unreadCount trong userChats
        const participantsList = Object.keys(participants);
        const updates = {};
        
        // Lấy unreadCount của người nhận trước (nếu có)
        const receiverId = participantsList.find(userId => userId !== senderId);
        let receiverUnreadCount = 0;
        
        if (receiverId) {
            const receiverChatRef = ref(database, `userChats/${receiverId}/${chatId}`);
            const receiverChatSnapshot = await get(receiverChatRef);
            receiverUnreadCount = receiverChatSnapshot.exists() 
                ? (receiverChatSnapshot.val().unreadCount || 0) 
                : 0;
        }
        
        // Build updates object
        participantsList.forEach(userId => {
            const userChatRef = `userChats/${userId}/${chatId}`;
            updates[`${userChatRef}/lastActivity`] = timestamp;
            
            if (userId === senderId) {
                // Người gửi: reset unreadCount về 0
                updates[`${userChatRef}/unreadCount`] = 0;
            } else {
                // Người nhận: tăng unreadCount lên 1
                updates[`${userChatRef}/unreadCount`] = receiverUnreadCount + 1;
            }
        });
        
        await update(ref(database), updates);
        
        console.log('[ChatService] Message sent:', messageId);
        return messageId;
    } catch (error) {
        console.error('[ChatService] Error sending message:', error);
        throw error;
    }
};

/**
 * Listen to messages in a chat
 * @param {string} chatId - Chat ID
 * @param {function} callback - Callback function (messages) => void
 * @returns {function} Unsubscribe function
 */
export const listenMessages = (chatId, callback) => {
    const messagesRef = ref(database, `chats/${chatId}/messages`);
    
    // Query để lấy messages theo timestamp, giới hạn 50 tin nhắn gần nhất
    const messagesQuery = query(messagesRef, orderByChild('timestamp'), limitToLast(50));
    
    const unsubscribe = onValue(messagesQuery, (snapshot) => {
        if (snapshot.exists()) {
            const messagesData = snapshot.val();
            // Convert object to array và sort theo timestamp
            const messages = Object.values(messagesData)
                .sort((a, b) => a.timestamp - b.timestamp);
            callback(messages);
        } else {
            callback([]);
        }
    }, (error) => {
        console.error('[ChatService] Error listening messages:', error);
        callback([]);
    });
    
    return () => {
        off(messagesQuery);
    };
};

/**
 * Load more messages (pagination)
 * @param {string} chatId - Chat ID
 * @param {number} beforeTimestamp - Load messages trước timestamp này
 * @param {number} limit - Số lượng messages (default: 20)
 * @returns {Promise<Array>} Array of messages
 */
export const loadMoreMessages = async (chatId, beforeTimestamp, limit = 20) => {
    try {
        const messagesRef = ref(database, `chats/${chatId}/messages`);
        const messagesQuery = query(
            messagesRef, 
            orderByChild('timestamp'),
            limitToLast(limit)
        );
        
        const snapshot = await get(messagesQuery);
        
        if (snapshot.exists()) {
            const messagesData = snapshot.val();
            const messages = Object.values(messagesData)
                .filter(msg => msg.timestamp < beforeTimestamp)
                .sort((a, b) => a.timestamp - b.timestamp);
            return messages;
        }
        
        return [];
    } catch (error) {
        console.error('[ChatService] Error loading more messages:', error);
        return [];
    }
};

/**
 * Update read status when user reads messages
 * @param {string} chatId - Chat ID
 * @param {string} userId - ID người đọc
 */
export const updateReadStatus = async (chatId, userId) => {
    try {
        const timestamp = Date.now();
        
        // Lấy tất cả messages
        const messagesRef = ref(database, `chats/${chatId}/messages`);
        const messagesSnapshot = await get(messagesRef);
        
        if (!messagesSnapshot.exists()) {
            return;
        }
        
        const messages = messagesSnapshot.val();
        const updates = {};
        let newLastReadMessageId = '';
        let latestTimestamp = 0;
        let unreadCount = 0;
        
        // Duyệt qua tất cả messages để đánh dấu đã đọc và tìm message mới nhất
        Object.values(messages).forEach(msg => {
            // Đếm unread (messages chưa đọc bởi user này)
            if (!msg.readBy || !msg.readBy[userId]) {
                unreadCount++;
                // Đánh dấu đã đọc
                updates[`chats/${chatId}/messages/${msg.messageId}/readBy/${userId}`] = true;
            }
            
            // Tìm message mới nhất (timestamp lớn nhất)
            if (msg.timestamp > latestTimestamp) {
                latestTimestamp = msg.timestamp;
                newLastReadMessageId = msg.messageId;
            }
        });
        
        // Cập nhật readBy cho các messages chưa đọc
        if (Object.keys(updates).length > 0) {
            await update(ref(database), updates);
        }
        
        // Cập nhật lastReadMessageId và unreadCount trong userChats
        const userChatRef = ref(database, `userChats/${userId}/${chatId}`);
        await update(userChatRef, {
            lastReadMessageId: newLastReadMessageId,
            unreadCount: 0, // Đã đọc hết khi mở chat
            lastActivity: timestamp
        });
        
        console.log('[ChatService] Read status updated for user:', userId);
    } catch (error) {
        console.error('[ChatService] Error updating read status:', error);
    }
};

/**
 * Set typing indicator
 * @param {string} userId - User ID
 * @param {boolean} isTyping - Đang gõ hay không
 */
export const setTypingIndicator = async (userId, isTyping) => {
    try {
        const presenceRef = ref(database, `presence/${userId}/typing`);
        await set(presenceRef, isTyping);
    } catch (error) {
        console.error('[ChatService] Error setting typing indicator:', error);
    }
};

/**
 * Set user presence (online/offline)
 * @param {string} userId - User ID
 * @param {boolean} isOnline - Online hay không
 */
export const setPresence = async (userId, isOnline) => {
    try {
        const presenceRef = ref(database, `presence/${userId}`);
        const updates = {
            online: isOnline,
            lastSeen: Date.now(),
            typing: false
        };
        
        await update(presenceRef, updates);
        
        // Set onDisconnect để tự động set offline khi disconnect
        if (isOnline) {
            onDisconnect(presenceRef).update({
                online: false,
                lastSeen: Date.now()
            });
        }
    } catch (error) {
        console.error('[ChatService] Error setting presence:', error);
    }
};

/**
 * Listen to user presence
 * @param {string} userId - User ID
 * @param {function} callback - Callback function (presence) => void
 * @returns {function} Unsubscribe function
 */
export const listenPresence = (userId, callback) => {
    const presenceRef = ref(database, `presence/${userId}`);
    
    const unsubscribe = onValue(presenceRef, (snapshot) => {
        if (snapshot.exists()) {
            callback(snapshot.val());
        } else {
            callback({ online: false, lastSeen: null, typing: false });
        }
    }, (error) => {
        console.error('[ChatService] Error listening presence:', error);
        callback({ online: false, lastSeen: null, typing: false });
    });
    
    return () => {
        off(presenceRef);
    };
};

/**
 * Get chat info
 * @param {string} chatId - Chat ID
 * @returns {Promise<object>} Chat info
 */
export const getChatInfo = async (chatId) => {
    try {
        const chatRef = ref(database, `chats/${chatId}`);
        const snapshot = await get(chatRef);
        
        if (snapshot.exists()) {
            return snapshot.val();
        }
        
        return null;
    } catch (error) {
        console.error('[ChatService] Error getting chat info:', error);
        return null;
    }
};

