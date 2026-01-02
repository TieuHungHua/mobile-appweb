import { StatusBar } from "expo-status-bar";
import { useMemo, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  PanResponder,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { createStyles } from "./PrivacyPolicy.styles";
import {
  policySections,
  POLICY_TITLE,
  POLICY_FOOTER_TEXT,
  INTRO_DESCRIPTION,
  DATE_FORMAT_OPTIONS,
  LOCALE,
} from "./PrivacyPolicy.mock";

export default function PrivacyPolicyScreen({
  theme,
  lang,
  strings,
  colors,
  onNavigate,
}) {
  const styles = useMemo(() => createStyles(colors), [colors]);

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

  const lastUpdatedDate = new Date().toLocaleDateString(
    LOCALE,
    DATE_FORMAT_OPTIONS
  );

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
          {strings.privacyPolicy || "Chính sách bảo mật"}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Introduction Card */}
        <View
          style={[
            styles.introCard,
            { backgroundColor: colors.cardBg, borderColor: colors.inputBorder },
          ]}
        >
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: colors.buttonBg + "20" },
            ]}
          >
            <Ionicons
              name="shield-checkmark"
              size={32}
              color={colors.buttonBg}
            />
          </View>
          <Text style={[styles.introTitle, { color: colors.text }]}>
            {POLICY_TITLE}
          </Text>
          <Text style={[styles.introText, { color: colors.muted }]}>
            {strings.lastUpdated || "Cập nhật lần cuối"}: {lastUpdatedDate}
          </Text>
          <Text style={[styles.introDescription, { color: colors.muted }]}>
            {INTRO_DESCRIPTION}
          </Text>
        </View>

        {/* Policy Sections */}
        {policySections.map((section, index) => (
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
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {section.title}
            </Text>
            <Text style={[styles.sectionContent, { color: colors.muted }]}>
              {section.content}
            </Text>
          </View>
        ))}

        {/* Footer Card */}
        <View
          style={[
            styles.footerCard,
            { backgroundColor: colors.cardBg, borderColor: colors.inputBorder },
          ]}
        >
          <Ionicons
            name="information-circle-outline"
            size={24}
            color={colors.buttonBg}
          />
          <Text style={[styles.footerText, { color: colors.muted }]}>
            {POLICY_FOOTER_TEXT}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
