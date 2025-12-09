import { StatusBar } from 'expo-status-bar';
import { useMemo, useRef } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Platform, PanResponder, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const aboutSections = [
  {
    title: 'Giới thiệu',
    content: 'Thư viện Đại học Bách Khoa TP.HCM là một trong những thư viện lớn và hiện đại nhất tại Việt Nam, phục vụ hàng chục nghìn sinh viên, giảng viên và nhân viên của trường. Chúng tôi cam kết cung cấp nguồn tài liệu phong phú và dịch vụ thư viện chất lượng cao.',
  },
  {
    title: 'Sứ mệnh',
    content: 'Sứ mệnh của chúng tôi là:\n\n• Cung cấp nguồn tài liệu học thuật đa dạng và cập nhật\n• Hỗ trợ nghiên cứu và học tập của sinh viên, giảng viên\n• Xây dựng môi trường học tập hiện đại và thân thiện\n• Phát triển văn hóa đọc trong cộng đồng\n• Áp dụng công nghệ tiên tiến để nâng cao trải nghiệm người dùng',
  },
  {
    title: 'Tầm nhìn',
    content: 'Trở thành thư viện số hàng đầu tại Việt Nam, là nơi kết nối tri thức, thúc đẩy sáng tạo và nghiên cứu khoa học, góp phần xây dựng một cộng đồng học thuật phát triển bền vững.',
  },
  {
    title: 'Dịch vụ',
    content: 'Chúng tôi cung cấp các dịch vụ:\n\n• Mượn/trả sách trực tuyến\n• Tìm kiếm và tra cứu tài liệu\n• Đọc sách điện tử (e-book)\n• Phòng đọc và không gian học tập\n• Hỗ trợ nghiên cứu và tư vấn thông tin\n• Đào tạo kỹ năng thông tin\n• Dịch vụ photocopy và in ấn',
  },
  {
    title: 'Bộ sưu tập',
    content: 'Thư viện sở hữu:\n\n• Hơn 500,000 đầu sách in\n• Hơn 50,000 tài liệu điện tử\n• Hàng nghìn tạp chí khoa học\n• Cơ sở dữ liệu học thuật quốc tế\n• Tài liệu tham khảo đa dạng các lĩnh vực\n• Bộ sưu tập tài liệu quý hiếm',
  },
  {
    title: 'Đội ngũ',
    content: 'Chúng tôi có đội ngũ nhân viên chuyên nghiệp, nhiệt tình và giàu kinh nghiệm, luôn sẵn sàng hỗ trợ bạn trong việc tìm kiếm thông tin và sử dụng các dịch vụ thư viện.',
  },
  {
    title: 'Công nghệ',
    content: 'Ứng dụng thư viện được phát triển với:\n\n• Giao diện hiện đại, thân thiện với người dùng\n• Hệ thống quản lý thông minh\n• Tìm kiếm nhanh chóng và chính xác\n• Thông báo tự động về hạn trả sách\n• Quản lý tài khoản cá nhân dễ dàng\n• Bảo mật thông tin cao',
  },
];

const contactInfo = [
  { icon: 'location', label: 'Địa chỉ', value: '268 Lý Thường Kiệt, Phường 14, Quận 10, TP.HCM', action: null },
  { icon: 'call', label: 'Điện thoại', value: '(028) 3865 0000', action: 'tel:02838650000' },
  { icon: 'mail', label: 'Email', value: 'library@hcmut.edu.vn', action: 'mailto:library@hcmut.edu.vn' },
  { icon: 'globe', label: 'Website', value: 'https://library.hcmut.edu.vn', action: 'https://library.hcmut.edu.vn' },
  { icon: 'time', label: 'Giờ làm việc', value: 'Thứ 2 - Thứ 6: 7:30 - 17:00\nThứ 7: 7:30 - 11:30', action: null },
];

export default function AboutUsScreen({ theme, lang, strings, colors, onNavigate }) {
  const styles = useMemo(() => createStyles(colors), [colors]);

  // Pan responder for swipe back gesture
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return gestureState.dx > 12 && Math.abs(gestureState.dy) < Math.abs(gestureState.dx) && evt.nativeEvent.pageX < 20;
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx > 50) {
          onNavigate?.('settings');
        }
      },
    })
  ).current;

  const handleContactPress = (action) => {
    if (action) {
      Linking.openURL(action).catch((err) => console.error('Failed to open URL:', err));
    }
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
          {strings.aboutUs || 'Về chúng tôi'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={[styles.heroCard, { backgroundColor: colors.cardBg, borderColor: colors.inputBorder }]}>
          <View style={[styles.iconContainer, { backgroundColor: colors.buttonBg + '20' }]}>
            <Ionicons name="library" size={40} color={colors.buttonBg} />
          </View>
          <Text style={[styles.heroTitle, { color: colors.text }]}>
            Thư viện Đại học Bách Khoa TP.HCM
          </Text>
          <Text style={[styles.heroSubtitle, { color: colors.muted }]}>
            Nơi kết nối tri thức, thúc đẩy sáng tạo
          </Text>
        </View>

        {/* About Sections */}
        {aboutSections.map((section, index) => (
          <View key={index} style={[styles.sectionCard, { backgroundColor: colors.cardBg, borderColor: colors.inputBorder }]}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: colors.buttonBg + '15' }]}>
                <Ionicons 
                  name={
                    index === 0 ? 'information-circle' :
                    index === 1 ? 'flag' :
                    index === 2 ? 'eye' :
                    index === 3 ? 'grid' :
                    index === 4 ? 'book' :
                    index === 5 ? 'people' :
                    'hardware-chip'
                  } 
                  size={20} 
                  color={colors.buttonBg} 
                />
              </View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {section.title}
              </Text>
            </View>
            <Text style={[styles.sectionContent, { color: colors.muted }]}>
              {section.content}
            </Text>
          </View>
        ))}

        {/* Contact Section */}
        <View style={[styles.contactCard, { backgroundColor: colors.cardBg, borderColor: colors.inputBorder }]}>
          <View style={styles.contactHeader}>
            <Ionicons name="call-outline" size={24} color={colors.buttonBg} />
            <Text style={[styles.contactTitle, { color: colors.text }]}>
              Liên hệ với chúng tôi
            </Text>
          </View>
          {contactInfo.map((contact, index) => (
            <TouchableOpacity
              key={index}
              style={styles.contactItem}
              onPress={() => handleContactPress(contact.action)}
              activeOpacity={contact.action ? 0.7 : 1}
              disabled={!contact.action}
            >
              <View style={[styles.contactIconContainer, { backgroundColor: colors.inputBg }]}>
                <Ionicons name={contact.icon} size={20} color={colors.buttonBg} />
              </View>
              <View style={styles.contactInfo}>
                <Text style={[styles.contactLabel, { color: colors.muted }]}>
                  {contact.label}
                </Text>
                <Text style={[styles.contactValue, { color: colors.text }]}>
                  {contact.value}
                </Text>
              </View>
              {contact.action && (
                <Ionicons name="chevron-forward" size={18} color={colors.muted} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer */}
        <View style={[styles.footerCard, { backgroundColor: colors.cardBg, borderColor: colors.inputBorder }]}>
          <Ionicons name="heart" size={20} color="#e74c3c" />
          <Text style={[styles.footerText, { color: colors.muted }]}>
            Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!
          </Text>
        </View>
      </ScrollView>
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
    content: {
      padding: 16,
      paddingBottom: 30,
      gap: 16,
    },
    heroCard: {
      borderRadius: 16,
      padding: 24,
      borderWidth: 1,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 3 },
      elevation: 3,
    },
    iconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    heroTitle: {
      fontSize: 22,
      fontWeight: '700',
      marginBottom: 8,
      textAlign: 'center',
    },
    heroSubtitle: {
      fontSize: 14,
      textAlign: 'center',
      fontStyle: 'italic',
    },
    sectionCard: {
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      shadowColor: '#000',
      shadowOpacity: 0.03,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 1 },
      elevation: 1,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      gap: 12,
    },
    sectionIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sectionTitle: {
      fontSize: 17,
      fontWeight: '700',
      flex: 1,
    },
    sectionContent: {
      fontSize: 14,
      lineHeight: 22,
    },
    contactCard: {
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      shadowColor: '#000',
      shadowOpacity: 0.03,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 1 },
      elevation: 1,
    },
    contactHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 16,
    },
    contactTitle: {
      fontSize: 17,
      fontWeight: '700',
    },
    contactItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      gap: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.inputBorder + '40',
    },
    contactIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    contactInfo: {
      flex: 1,
      gap: 4,
    },
    contactLabel: {
      fontSize: 12,
      fontWeight: '500',
    },
    contactValue: {
      fontSize: 14,
      lineHeight: 20,
    },
    footerCard: {
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      marginTop: 8,
    },
    footerText: {
      fontSize: 13,
      lineHeight: 20,
      textAlign: 'center',
    },
  });

