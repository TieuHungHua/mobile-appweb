import { StatusBar } from "expo-status-bar";
import { useMemo } from "react";
import { View, Text, TouchableOpacity } from "react-native";

import { createStyles } from "./Start.styles";

export default function StartScreen({
  theme,
  lang,
  strings,
  colors,
  onNavigate,
  onToggleTheme,
  onSelectLanguage,
}) {
  const styles = useMemo(() => createStyles(colors), [colors]);

  const fullDescription = strings.startDescription || "";
  const splitIndex = fullDescription.indexOf("Đại học Bách Khoa");
  const descriptionLine1 =
    splitIndex > 0
      ? fullDescription.substring(0, splitIndex).trim()
      : fullDescription;
  const descriptionLine2 =
    splitIndex > 0 ? fullDescription.substring(splitIndex).trim() : "";

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* HERO - Blue Section */}
      <View style={[styles.heroSection, { backgroundColor: colors.headerBg }]}>
        <View style={styles.heroContent}>
          <Text style={[styles.heroTitle, { color: colors.buttonText }]}>
            {strings.startWelcomeTitle}
          </Text>

          <Text style={[styles.heroSubtitle, { color: colors.buttonText }]}>
            {strings.startWelcomeSubtitle}
          </Text>

          <View style={styles.descriptionContainer}>
            <Text
              style={[styles.heroDescription, { color: colors.buttonText }]}
            >
              {descriptionLine1}
            </Text>
            <Text
              style={[styles.heroDescription, { color: colors.buttonText }]}
            >
              {descriptionLine2}
            </Text>
          </View>
        </View>
      </View>

      {/* Bottom - White Section */}
      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: colors.headerBg }]}
          onPress={() => onNavigate?.("login")}
          activeOpacity={0.9}
        >
          <Text style={[styles.primaryText, { color: colors.buttonText }]}>
            {strings.startPrimary || strings.login}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
