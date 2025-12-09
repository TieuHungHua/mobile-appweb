import { StatusBar } from 'expo-status-bar';
import { useMemo, useRef } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Platform, PanResponder } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const policySections = [
  {
    title: '1. Thu thập thông tin',
    content: 'Chúng tôi thu thập thông tin cá nhân của bạn khi bạn đăng ký tài khoản, sử dụng dịch vụ, hoặc liên hệ với chúng tôi. Thông tin thu thập bao gồm:\n\n• Họ và tên\n• Mã sinh viên\n• Email (@hcmut.edu.vn)\n• Số điện thoại\n• Ngày sinh\n• Giới tính\n• Lịch sử mượn sách\n• Sách yêu thích và đã lưu',
  },
  {
    title: '2. Mục đích sử dụng thông tin',
    content: 'Thông tin cá nhân của bạn được sử dụng để:\n\n• Quản lý tài khoản và xác thực danh tính\n• Xử lý yêu cầu mượn/trả sách\n• Gửi thông báo về hạn trả sách\n• Cải thiện chất lượng dịch vụ\n• Thống kê và phân tích dữ liệu\n• Liên hệ hỗ trợ khi cần thiết',
  },
  {
    title: '3. Bảo mật thông tin',
    content: 'Chúng tôi cam kết bảo vệ thông tin cá nhân của bạn:\n\n• Mã hóa dữ liệu trong quá trình truyền tải\n• Sử dụng các biện pháp bảo mật tiên tiến\n• Giới hạn quyền truy cập thông tin chỉ cho nhân viên có thẩm quyền\n• Không chia sẻ thông tin với bên thứ ba mà không có sự đồng ý của bạn\n• Tuân thủ các quy định về bảo vệ dữ liệu cá nhân',
  },
  {
    title: '4. Quyền của người dùng',
    content: 'Bạn có quyền:\n\n• Truy cập và xem thông tin cá nhân của mình\n• Chỉnh sửa thông tin cá nhân\n• Yêu cầu xóa tài khoản và dữ liệu\n• Từ chối nhận thông báo marketing\n• Khiếu nại về việc xử lý dữ liệu cá nhân\n• Rút lại sự đồng ý bất cứ lúc nào',
  },
  {
    title: '5. Cookie và công nghệ theo dõi',
    content: 'Ứng dụng có thể sử dụng cookie và công nghệ tương tự để:\n\n• Ghi nhớ tùy chọn của bạn\n• Cải thiện trải nghiệm người dùng\n• Phân tích cách sử dụng ứng dụng\n\nBạn có thể quản lý cookie trong cài đặt thiết bị của mình.',
  },
  {
    title: '6. Chia sẻ thông tin',
    content: 'Chúng tôi không bán hoặc cho thuê thông tin cá nhân của bạn. Thông tin chỉ được chia sẻ trong các trường hợp:\n\n• Với sự đồng ý của bạn\n• Theo yêu cầu pháp lý\n• Để bảo vệ quyền và an toàn của chúng tôi\n• Với các đối tác dịch vụ đáng tin cậy (đã ký thỏa thuận bảo mật)',
  },
  {
    title: '7. Lưu trữ dữ liệu',
    content: 'Dữ liệu của bạn được lưu trữ:\n\n• Trên các máy chủ an toàn\n• Trong thời gian cần thiết để cung cấp dịch vụ\n• Tuân thủ các quy định về lưu trữ dữ liệu\n• Được xóa khi bạn yêu cầu hoặc không còn cần thiết',
  },
  {
    title: '8. Thay đổi chính sách',
    content: 'Chúng tôi có thể cập nhật chính sách bảo mật này theo thời gian. Mọi thay đổi sẽ được thông báo:\n\n• Qua ứng dụng\n• Qua email\n• Cập nhật ngày "Cập nhật lần cuối" ở đầu trang\n\nViệc bạn tiếp tục sử dụng dịch vụ sau khi có thay đổi được coi là chấp nhận chính sách mới.',
  },
  {
    title: '9. Liên hệ',
    content: 'Nếu bạn có câu hỏi hoặc lo ngại về chính sách bảo mật này, vui lòng liên hệ:\n\n• Email: privacy@library.hcmut.edu.vn\n• Điện thoại: (028) 3865 0000\n• Địa chỉ: Thư viện Đại học Bách Khoa TP.HCM\n• Thời gian: Thứ 2 - Thứ 6, 8:00 - 17:00',
  },
];

export default function PrivacyPolicyScreen({ theme, lang, strings, colors, onNavigate }) {
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
          {strings.privacyPolicy || 'Chính sách bảo mật'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Introduction */}
        <View style={[styles.introCard, { backgroundColor: colors.cardBg, borderColor: colors.inputBorder }]}>
          <View style={[styles.iconContainer, { backgroundColor: colors.buttonBg + '20' }]}>
            <Ionicons name="shield-checkmark" size={32} color={colors.buttonBg} />
          </View>
          <Text style={[styles.introTitle, { color: colors.text }]}>
            Chính sách bảo mật thông tin
          </Text>
          <Text style={[styles.introText, { color: colors.muted }]}>
            Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' })}
          </Text>
          <Text style={[styles.introDescription, { color: colors.muted }]}>
            Chúng tôi cam kết bảo vệ quyền riêng tư và thông tin cá nhân của bạn. Chính sách này giải thích cách chúng tôi thu thập, sử dụng và bảo vệ thông tin của bạn.
          </Text>
        </View>

        {/* Policy Sections */}
        {policySections.map((section, index) => (
          <View key={index} style={[styles.sectionCard, { backgroundColor: colors.cardBg, borderColor: colors.inputBorder }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {section.title}
            </Text>
            <Text style={[styles.sectionContent, { color: colors.muted }]}>
              {section.content}
            </Text>
          </View>
        ))}

        {/* Footer */}
        <View style={[styles.footerCard, { backgroundColor: colors.cardBg, borderColor: colors.inputBorder }]}>
          <Ionicons name="information-circle-outline" size={24} color={colors.buttonBg} />
          <Text style={[styles.footerText, { color: colors.muted }]}>
            Bằng việc sử dụng ứng dụng này, bạn đồng ý với chính sách bảo mật của chúng tôi.
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
    introCard: {
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    iconContainer: {
      width: 64,
      height: 64,
      borderRadius: 32,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    introTitle: {
      fontSize: 20,
      fontWeight: '700',
      marginBottom: 8,
      textAlign: 'center',
    },
    introText: {
      fontSize: 12,
      marginBottom: 12,
      textAlign: 'center',
    },
    introDescription: {
      fontSize: 14,
      lineHeight: 22,
      textAlign: 'center',
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
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      marginBottom: 12,
    },
    sectionContent: {
      fontSize: 14,
      lineHeight: 22,
    },
    footerCard: {
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
      marginTop: 8,
    },
    footerText: {
      flex: 1,
      fontSize: 13,
      lineHeight: 20,
    },
  });

