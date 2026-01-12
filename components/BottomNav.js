import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const NAV_ITEMS = [
  { key: "home", labelKey: "home", icon: "home-outline", activeIcon: "home" },
  {
    key: "library",
    labelKey: "library",
    icon: "book-outline",
    activeIcon: "book",
  },
  {
    key: "chats",
    labelKey: "chats",
    icon: "chatbubble-ellipses-outline",
    activeIcon: "chatbubble-ellipses",
  },
  {
    key: "settings",
    labelKey: "settings",
    icon: "person-outline",
    activeIcon: "person",
  },
];

export default function BottomNav({ activeKey, onChange, colors, strings }) {
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: "#FFFFFF",
          borderTopColor: colors.buttonBg + "40",
        },
      ]}
    >
      {NAV_ITEMS.map((item) => {
        const active = activeKey === item.key;
        return (
          <TouchableOpacity
            key={item.key}
            style={styles.item}
            onPress={() => onChange?.(item.key)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={active ? item.activeIcon : item.icon}
              size={24}
              color={active ? colors.buttonBg : colors.muted}
            />
            <Text
              style={[
                styles.label,
                {
                  color: active ? colors.buttonBg : "#64748b",
                  fontWeight: active ? "600" : "500",
                },
              ]}
              numberOfLines={1}
            >
              {strings?.[item.labelKey] || item.labelKey}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: Platform.OS === "ios" ? 28 : 12,
    borderTopWidth: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -2 },
    elevation: 5,
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    gap: 4,
  },
  label: {
    fontSize: 12,
    marginTop: 2,
  },
});
