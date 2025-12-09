import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const NAV_ITEMS = [
  { key: 'home', labelKey: 'home', icon: 'home-outline', activeIcon: 'home' },
  { key: 'library', labelKey: 'library', icon: 'book-outline', activeIcon: 'book' },
  { key: 'chats', labelKey: 'chats', icon: 'chatbubble-ellipses-outline', activeIcon: 'chatbubble-ellipses' },
  { key: 'settings', labelKey: 'settings', icon: 'settings-outline', activeIcon: 'settings' },
];

export default function BottomNav({ activeKey, onChange, colors, strings }) {
  return (
    <View style={[styles.container, { backgroundColor: colors.cardBg, borderColor: colors.inputBorder }]}>
      {NAV_ITEMS.map((item) => {
        const active = activeKey === item.key;
        return (
          <TouchableOpacity
            key={item.key}
            style={[styles.item, active && { backgroundColor: colors.buttonBg }]}
            onPress={() => onChange?.(item.key)}
            activeOpacity={0.8}
          >
            <Ionicons
              name={active ? item.activeIcon : item.icon}
              size={22}
              color={active ? colors.buttonText : colors.text}
            />
            <Text style={[styles.label, { color: active ? colors.buttonText : colors.text }]} numberOfLines={1}>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 12,
    gap: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
  },
});


