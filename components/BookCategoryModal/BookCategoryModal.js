import { useMemo, useState } from "react";
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { createStyles } from "./BookCategoryModal.styles";
import { bookCategories } from "./BookCategoryModal.mock";

export default function BookCategoryModal({
  visible,
  onClose,
  onContinue,
  onSkip,
  theme,
  colors,
  strings,
}) {
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [selectedSubcategories, setSelectedSubcategories] = useState({});

  const toggleCategory = (categoryId) => {
    const newSelected = new Set(selectedCategories);
    if (newSelected.has(categoryId)) {
      newSelected.delete(categoryId);
      const newSubcategories = { ...selectedSubcategories };
      delete newSubcategories[categoryId];
      setSelectedSubcategories(newSubcategories);
    } else {
      newSelected.add(categoryId);
    }
    setSelectedCategories(newSelected);
  };

  /**
   * Toggle subcategory selection
   */
  const toggleSubcategory = (categoryId, subcategoryId) => {
    const categorySubs = selectedSubcategories[categoryId] || new Set();
    const newSubs = new Set(categorySubs);
    if (newSubs.has(subcategoryId)) {
      newSubs.delete(subcategoryId);
    } else {
      newSubs.add(subcategoryId);
    }
    setSelectedSubcategories({
      ...selectedSubcategories,
      [categoryId]: newSubs,
    });
  };

  const handleContinue = () => {
    const preferences = {
      categories: Array.from(selectedCategories),
      subcategories: Object.keys(selectedSubcategories).reduce((acc, catId) => {
        acc[catId] = Array.from(selectedSubcategories[catId]);
        return acc;
      }, {}),
    };
    onContinue?.(preferences);
  };

  const handleSkip = () => {
    onSkip?.();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.cardBg }]}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.progressBarContainer}>
            <View
              style={[styles.progressBar, { backgroundColor: colors.inputBg }]}
            >
              <View
                style={[
                  styles.progressBarFill,
                  { backgroundColor: colors.buttonBg, width: "33%" },
                ]}
              />
            </View>
          </View>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={[styles.helpText, { color: colors.muted }]}>
              {strings.bookCategoryHelp || "Trợ giúp"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={[styles.title, { color: colors.text }]}>
              {strings.bookCategoryTitle ||
                "Bạn đang quan tâm đến loại sách nào?"}
            </Text>
            <Text style={[styles.description, { color: colors.muted }]}>
              {strings.bookCategoryDescription ||
                "Chọn một hoặc nhiều thể loại để chúng tôi gợi ý sách phù hợp hơn cho bạn."}
            </Text>
          </View>

          {/* Categories Grid */}
          <View style={styles.categoriesGrid}>
            {bookCategories.map((category) => {
              const isSelected = selectedCategories.has(category.id);
              return (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryCard,
                    {
                      backgroundColor: isSelected
                        ? colors.buttonBg + "15"
                        : colors.cardBg,
                      borderColor: isSelected ? colors.buttonBg : "transparent",
                    },
                  ]}
                  onPress={() => toggleCategory(category.id)}
                  activeOpacity={0.7}
                >
                  {isSelected && (
                    <View
                      style={[
                        styles.checkmarkBadge,
                        { backgroundColor: colors.buttonBg },
                      ]}
                    >
                      <Ionicons
                        name="checkmark"
                        size={14}
                        color={colors.buttonText}
                      />
                    </View>
                  )}
                  <View
                    style={[
                      styles.categoryIconContainer,
                      {
                        backgroundColor: isSelected
                          ? colors.buttonBg + "20"
                          : colors.inputBg,
                      },
                    ]}
                  >
                    <Ionicons
                      name={category.icon}
                      size={28}
                      color={isSelected ? colors.buttonBg : colors.muted}
                    />
                  </View>
                  <Text
                    style={[
                      styles.categoryLabel,
                      {
                        color: isSelected ? colors.buttonBg : colors.text,
                        fontWeight: isSelected ? "700" : "500",
                      },
                    ]}
                  >
                    {category.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {selectedCategories.size > 0 && (
            <View style={styles.subcategoriesSection}>
              {Array.from(selectedCategories).map((categoryId) => {
                const category = bookCategories.find(
                  (c) => c.id === categoryId
                );
                if (!category || !category.subcategories) return null;

                const categorySubs =
                  selectedSubcategories[categoryId] || new Set();

                return (
                  <View
                    key={categoryId}
                    style={[
                      styles.subcategoriesContainer,
                      {
                        backgroundColor: colors.cardBg,
                        borderColor: colors.inputBorder,
                      },
                    ]}
                  >
                    <View style={styles.subcategoriesHeader}>
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color={colors.buttonBg}
                      />
                      <Text
                        style={[
                          styles.subcategoriesTitle,
                          { color: colors.text },
                        ]}
                      >
                        {strings.bookCategoryDetailsFor || "Chi tiết cho"}{" "}
                        {category.label}
                      </Text>
                    </View>
                    <View style={styles.subcategoriesList}>
                      {category.subcategories.map((subcategory) => {
                        const isSubSelected = categorySubs.has(subcategory.id);
                        return (
                          <TouchableOpacity
                            key={subcategory.id}
                            style={[
                              styles.subcategoryChip,
                              {
                                backgroundColor: isSubSelected
                                  ? colors.buttonBg
                                  : colors.inputBg,
                                borderColor: isSubSelected
                                  ? colors.buttonBg
                                  : colors.inputBorder,
                              },
                            ]}
                            onPress={() =>
                              toggleSubcategory(categoryId, subcategory.id)
                            }
                            activeOpacity={0.7}
                          >
                            {isSubSelected && (
                              <Ionicons
                                name="checkmark"
                                size={16}
                                color={colors.buttonText}
                                style={styles.subcategoryCheckmark}
                              />
                            )}
                            <Text
                              style={[
                                styles.subcategoryLabel,
                                {
                                  color: isSubSelected
                                    ? colors.buttonText
                                    : colors.text,
                                },
                              ]}
                            >
                              {subcategory.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          <View style={styles.footerSpacer} />
        </ScrollView>

        <View style={[styles.footer, { backgroundColor: colors.cardBg }]}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              {
                backgroundColor: colors.buttonBg,
                opacity: selectedCategories.size === 0 ? 0.5 : 1,
              },
            ]}
            onPress={handleContinue}
            disabled={selectedCategories.size === 0}
            activeOpacity={0.8}
          >
            <Text
              style={[styles.continueButtonText, { color: colors.buttonText }]}
            >
              {strings.bookCategoryContinue || "Gửi "}
            </Text>
            <Ionicons
              name="arrow-forward"
              size={20}
              color={colors.buttonText}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            activeOpacity={0.7}
          >
            <Text style={[styles.skipButtonText, { color: colors.muted }]}>
              {strings.bookCategorySkip || "Bỏ qua bước này"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
