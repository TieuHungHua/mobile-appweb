import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Switch, Platform, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNav from '../components/BottomNav';

export default function SettingsScreen({ theme, lang, strings, colors, onNavigate }) {
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(false);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.headerBg }]}>
        <View style={styles.headerContent}>
          <Ionicons name="settings" size={24} color={colors.headerText} />
          <Text style={[styles.headerTitle, { color: colors.headerText }]}>
            {strings.settings || 'Cài đặt'}
          </Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* White card container */}
        <View style={[styles.card, { backgroundColor: colors.cardBg }]}>
          {/* User Profile Section */}
          <View style={styles.profileSection}>
            <View style={[styles.avatarContainer, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
              <Ionicons name="person" size={32} color={colors.buttonBg} />
            </View>
            <Text style={[styles.userName, { color: colors.text }]}>Quang Minh</Text>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={() => onNavigate?.('login')}
              activeOpacity={0.8}
            >
              <Ionicons name="log-out-outline" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Account Settings Section */}
          <Text style={[styles.sectionTitle, { color: colors.muted }]}>
            {strings.accountSettings || 'Thiết lập tài khoản'}
          </Text>

          <TouchableOpacity
            style={styles.settingItem}
            activeOpacity={0.7}
            onPress={() => onNavigate?.('editInformation')}
          >
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              {strings.editInformation || 'Chỉnh sửa thông tin'}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={colors.muted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            activeOpacity={0.7}
            onPress={() => onNavigate?.('changePassword')}
          >
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              {strings.changePassword || 'Thay đổi mật khẩu'}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={colors.muted} />
          </TouchableOpacity>

          <View style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              {strings.enableReturnNotifications || 'Bật thông báo trả sách'}
            </Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#d3d3d3', true: colors.buttonBg }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              {strings.autoUpdate || 'Tự động cập nhật'}
            </Text>
            <Switch
              value={autoUpdateEnabled}
              onValueChange={setAutoUpdateEnabled}
              trackColor={{ false: '#d3d3d3', true: colors.buttonBg }}
              thumbColor="#fff"
            />
          </View>

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: colors.inputBorder }]} />

          {/* General Section */}
          <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
            <Text style={[styles.settingLabel, { color: '#9b59b6' }]}>
              {strings.myBookshelf || 'Tủ sách của tôi'}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={colors.muted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              {strings.aboutUs || 'Về chúng tôi'}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={colors.muted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              {strings.privacyPolicy || 'Chính sách bảo mật'}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={colors.muted} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <BottomNav
        activeKey="settings"
        onChange={(key) => {
          if (key === 'home') onNavigate?.('home');
          if (key === 'library') onNavigate?.('library');
          if (key === 'chats') onNavigate?.('chats');
          // settings: stay on this screen
        }}
        colors={colors}
        strings={{ ...strings, home: 'Home', library: 'Library', chats: 'Chats', settings: strings.settings || 'Settings' }}
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
      paddingTop: Platform.OS === 'ios' ? 44 : 20,
      paddingHorizontal: 16,
      paddingBottom: 12,
    },
    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '700',
    },
    content: {
      padding: 16,
      paddingBottom: 100,
    },
    card: {
      borderRadius: 16,
      padding: 16,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 4,
    },
    profileSection: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 24,
      gap: 12,
    },
    avatarContainer: {
      width: 56,
      height: 56,
      borderRadius: 28,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    userName: {
      flex: 1,
      fontSize: 18,
      fontWeight: '600',
    },
    logoutButton: {
      padding: 8,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: '600',
      marginBottom: 12,
      marginTop: 4,
    },
    settingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 14,
      paddingHorizontal: 4,
    },
    settingLabel: {
      fontSize: 15,
      fontWeight: '500',
    },
    divider: {
      height: 1,
      marginVertical: 8,
      marginHorizontal: -4,
    },
  });

