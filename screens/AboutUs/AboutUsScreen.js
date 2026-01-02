import { StatusBar } from "expo-status-bar";
import { useMemo, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  PanResponder,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { createStyles } from "./AboutUs.styles";
import { aboutSections, contactInfo, getSectionIcon } from "./AboutUs.data";

export default function AboutUsScreen({
  theme,
  lang,
  strings,
  colors,
  onNavigate,
}) {
  const styles = useMemo(() => createStyles(colors), [colors]);

  // Pan responder for swipe back gesture
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return (
          gestureState.dx > 12 &&
          Math.abs(gestureState.dy) < Math.abs(gestureState.dx) &&
          evt.nativeEvent.pageX < 20
        );
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx > 50) {
          onNavigate?.("settings");
        }
      },
    })
  ).current;

  const handleContactPress = (action) => {
    if (action) {
      Linking.openURL(action).catch((err) =>
        console.error("Failed to open URL:", err)
      );
    }
  };

  return (
    <View
      style={[styles.container, { backgroundColor: colors.background }]}
      {...panResponder.panHandlers}
    >
      <StatusBar style={theme === "dark" ? "light" : "dark"} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.headerBg }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => onNavigate?.("settings")}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={colors.headerText} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.headerText }]}>
          {strings.aboutUs || "Về chúng tôi"}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View
          style={[
            styles.heroCard,
            { backgroundColor: colors.cardBg, borderColor: colors.inputBorder },
          ]}
        >
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: colors.buttonBg + "20" },
            ]}
          >
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
          <View
            key={index}
            style={[
              styles.sectionCard,
              {
                backgroundColor: colors.cardBg,
                borderColor: colors.inputBorder,
              },
            ]}
          >
            <View style={styles.sectionHeader}>
              <View
                style={[
                  styles.sectionIcon,
                  { backgroundColor: colors.buttonBg + "15" },
                ]}
              >
                <Ionicons
                  name={getSectionIcon(index)}
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
        <View
          style={[
            styles.contactCard,
            { backgroundColor: colors.cardBg, borderColor: colors.inputBorder },
          ]}
        >
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
              <View
                style={[
                  styles.contactIconContainer,
                  { backgroundColor: colors.inputBg },
                ]}
              >
                <Ionicons
                  name={contact.icon}
                  size={20}
                  color={colors.buttonBg}
                />
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
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={colors.muted}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer */}
        <View
          style={[
            styles.footerCard,
            { backgroundColor: colors.cardBg, borderColor: colors.inputBorder },
          ]}
        >
          <Ionicons name="heart" size={20} color="#e74c3c" />
          <Text style={[styles.footerText, { color: colors.muted }]}>
            Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
