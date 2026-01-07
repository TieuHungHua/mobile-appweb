import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { createStyles } from "./FAQ.styles";
import { faqItems } from "./FAQ.mock";

export default function FAQScreen({
  theme,
  lang,
  strings,
  colors,
  onNavigate,
}) {
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [expandedItems, setExpandedItems] = useState({});
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Toggle expand/collapse FAQ item
   */
  const toggleItem = (itemId) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  /**
   * Handle submit feedback
   */
  const handleSubmitFeedback = async () => {
    if (!title.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tiêu đề");
      return;
    }
    if (!content.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập nội dung phản hồi");
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Integrate with API when available
      // await feedbackAPI.submit({ title: title.trim(), content: content.trim() });
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      Alert.alert(
        "Thành công",
        "Phản hồi của bạn đã được gửi thành công. Chúng tôi sẽ phản hồi qua email trong vòng 24h.",
        [
          {
            text: "OK",
            onPress: () => {
              setTitle("");
              setContent("");
            },
          },
        ]
      );
    } catch (error) {
      console.error("[FAQ] Error submitting feedback:", error);
      Alert.alert(
        "Lỗi",
        "Không thể gửi phản hồi. Vui lòng thử lại sau."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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
          {strings.faqTitle || "Hỗ trợ & Gửi ý kiến"}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* FAQ Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {strings.faqSectionTitle || "Câu hỏi thường gặp"}
            </Text>

            <View style={styles.faqList}>
              {faqItems.map((item) => {
                const isExpanded = expandedItems[item.id];
                return (
                  <View
                    key={item.id}
                    style={[
                      styles.faqItem,
                      {
                        backgroundColor: colors.cardBg,
                        borderColor: colors.inputBorder,
                      },
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.faqHeader}
                      onPress={() => toggleItem(item.id)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.faqHeaderLeft}>
                        <View
                          style={[
                            styles.faqIconContainer,
                            { backgroundColor: colors.buttonBg + "20" },
                          ]}
                        >
                          <Ionicons
                            name={item.icon}
                            size={20}
                            color={colors.buttonBg}
                          />
                        </View>
                        <Text style={[styles.faqQuestion, { color: colors.text }]}>
                          {item.question}
                        </Text>
                      </View>
                      <Ionicons
                        name={isExpanded ? "chevron-up" : "chevron-down"}
                        size={20}
                        color={colors.muted}
                      />
                    </TouchableOpacity>

                    {isExpanded && (
                      <View style={styles.faqAnswerContainer}>
                        <Text style={[styles.faqAnswer, { color: colors.muted }]}>
                          {item.answer}
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Feedback Form Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {strings.feedbackSectionTitle || "Gửi lỗi / Ý kiến"}
            </Text>

            <View
              style={[
                styles.feedbackForm,
                {
                  backgroundColor: colors.cardBg,
                  borderColor: colors.inputBorder,
                },
              ]}
            >
              {/* Title Input */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  {strings.feedbackTitleLabel || "Tiêu đề"}
                </Text>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: colors.inputBg,
                      borderColor: colors.inputBorder,
                      color: colors.text,
                    },
                  ]}
                  value={title}
                  onChangeText={setTitle}
                  placeholder={
                    strings.feedbackTitlePlaceholder ||
                    "Nhập tiêu đề (Ví dụ: Lỗi ứng dụng...)"
                  }
                  placeholderTextColor={colors.placeholder}
                  editable={!isSubmitting}
                />
              </View>

              {/* Content Input */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  {strings.feedbackContentLabel || "Nội dung phản hồi"}
                </Text>
                <TextInput
                  style={[
                    styles.textArea,
                    {
                      backgroundColor: colors.inputBg,
                      borderColor: colors.inputBorder,
                      color: colors.text,
                    },
                  ]}
                  value={content}
                  onChangeText={setContent}
                  placeholder={
                    strings.feedbackContentPlaceholder ||
                    "Mô tả chi tiết vấn đề hoặc ý kiến đóng góp của bạn để chúng tôi có thể hỗ trợ tốt nhất..."
                  }
                  placeholderTextColor={colors.placeholder}
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                  editable={!isSubmitting}
                />
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  {
                    backgroundColor: colors.buttonBg,
                    opacity: isSubmitting ? 0.6 : 1,
                  },
                ]}
                onPress={handleSubmitFeedback}
                disabled={isSubmitting}
                activeOpacity={0.8}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color={colors.buttonText} />
                ) : (
                  <>
                    <Text
                      style={[
                        styles.submitButtonText,
                        { color: colors.buttonText },
                      ]}
                    >
                      {strings.feedbackSubmitButton || "Gửi phản hồi"}
                    </Text>
                    <Ionicons
                      name="send"
                      size={18}
                      color={colors.buttonText}
                      style={styles.submitIcon}
                    />
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Helper Text */}
            <Text style={[styles.helperText, { color: colors.muted }]}>
              {strings.feedbackHelperText ||
                "Phản hồi của bạn sẽ được gửi đến đội ngũ kỹ thuật và ban quản lý thư viện. Chúng tôi sẽ phản hồi qua email sinh viên trong vòng 24h."}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

