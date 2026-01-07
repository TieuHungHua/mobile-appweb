import AsyncStorage from "@react-native-async-storage/async-storage";

const LAST_SHOWN_KEY = "book_category_modal_last_shown";
const PREFERENCES_KEY = "book_category_preferences";
const MODAL_COMPLETED_KEY = "book_category_modal_completed";

/**
 * Check if modal should be shown
 * @returns {Promise<boolean>}
 */
export const shouldShowBookCategoryModal = async () => {
  try {
    // Check if user has already completed the modal
    const completed = await AsyncStorage.getItem(MODAL_COMPLETED_KEY);
    if (completed === "true") {
      // Check if 1 week has passed since last shown
      const lastShownStr = await AsyncStorage.getItem(LAST_SHOWN_KEY);
      if (lastShownStr) {
        const lastShown = new Date(lastShownStr);
        const now = new Date();
        const daysDiff = (now - lastShown) / (1000 * 60 * 60 * 24);
        return daysDiff >= 7; // Show again after 1 week
      }
      return false; // Never shown before but completed
    }
    // First time - show modal
    return true;
  } catch (error) {
    console.error("[BookCategoryModal] Error checking should show:", error);
    return false;
  }
};

/**
 * Mark modal as shown
 */
export const markModalAsShown = async () => {
  try {
    await AsyncStorage.setItem(LAST_SHOWN_KEY, new Date().toISOString());
  } catch (error) {
    console.error("[BookCategoryModal] Error marking as shown:", error);
  }
};

/**
 * Mark modal as completed
 */
export const markModalAsCompleted = async () => {
  try {
    await AsyncStorage.setItem(MODAL_COMPLETED_KEY, "true");
    await AsyncStorage.setItem(LAST_SHOWN_KEY, new Date().toISOString());
  } catch (error) {
    console.error("[BookCategoryModal] Error marking as completed:", error);
  }
};

/**
 * Save book category preferences
 * @param {object} preferences - { categories: [], subcategories: {} }
 */
export const saveBookCategoryPreferences = async (preferences) => {
  try {
    await AsyncStorage.setItem(
      PREFERENCES_KEY,
      JSON.stringify(preferences)
    );
  } catch (error) {
    console.error("[BookCategoryModal] Error saving preferences:", error);
  }
};

/**
 * Get saved book category preferences
 * @returns {Promise<object|null>}
 */
export const getBookCategoryPreferences = async () => {
  try {
    const prefsStr = await AsyncStorage.getItem(PREFERENCES_KEY);
    return prefsStr ? JSON.parse(prefsStr) : null;
  } catch (error) {
    console.error("[BookCategoryModal] Error getting preferences:", error);
    return null;
  }
};

