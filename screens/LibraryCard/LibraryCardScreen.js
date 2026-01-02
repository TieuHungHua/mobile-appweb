import { StatusBar } from "expo-status-bar";
import { useMemo, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { createStyles } from "./LibraryCard.styles";
import { getStoredUserInfo } from "../../utils/api";

export default function LibraryCardScreen({
  theme,
  lang,
  strings,
  colors,
  onNavigate,
}) {
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const loadUserInfo = async () => {
      const info = await getStoredUserInfo();
      setUserInfo(info);
    };
    loadUserInfo();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: "#F6F7F8" }]}>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />

      <View style={[styles.header, { backgroundColor: colors.headerBg }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => onNavigate?.("home")}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={colors.headerText} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.headerText }]}>
          {strings.libraryCard || "Thẻ thư viện"}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, { backgroundColor: colors.cardBg }]}>
          <View
            style={[
              styles.userIconContainer,
              { borderColor: colors.inputBorder },
            ]}
          >
            <Ionicons name="person-outline" size={60} color={colors.buttonBg} />
          </View>

          <Text style={[styles.libraryName, { color: colors.buttonBg }]}>
            THƯ VIỆN BÁCH KHOA
          </Text>

          <View
            style={[
              styles.qrContainer,
              { borderColor: colors.inputBorder + "80" },
            ]}
          >
            <Image
              source={require("../../assets/thethuvien.png")}
              style={styles.qrCodeImage}
              resizeMode="contain"
            />
          </View>

          {/* User Name */}
          <Text style={[styles.userName, { color: colors.text }]}>
            {userInfo?.name || userInfo?.username || "Nguyễn Văn An"}
          </Text>

          {/* Student ID */}
          <View
            style={[
              styles.studentIdBadge,
              { backgroundColor: colors.muted + "40" },
            ]}
          >
            <Text style={[styles.studentIdText, { color: "#FFFFFF" }]}>
              MSSV: {userInfo?.studentId || userInfo?.id || "2212019"}
            </Text>
          </View>

          <View style={styles.instructionsContainer}>
            <Ionicons name="scan-outline" size={20} color={colors.buttonBg} />
            <Text style={[styles.instructionsText, { color: colors.buttonBg }]}>
              Đưa mã vào máy quét để check-in
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
