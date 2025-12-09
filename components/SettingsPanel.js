import { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsPanel({ theme, lang, colors, strings, onToggleTheme, onSelectLanguage }) {
    const [open, setOpen] = useState(false);

    const selectedLangStyle = (target) => (lang === target ? [styles.langChip, styles.langChipSelected, { borderColor: colors.buttonBg, backgroundColor: colors.buttonBg }] : [styles.langChip, { borderColor: colors.inputBorder, backgroundColor: colors.cardBg }]);
    const selectedLangText = (target) => (lang === target ? [styles.langText, { color: colors.buttonText }] : [styles.langText, { color: colors.text }]);

    return (
        <>
            <TouchableOpacity
                style={[styles.fab, { backgroundColor: colors.cardBg, borderColor: colors.inputBorder, shadowColor: '#000' }]}
                onPress={() => setOpen((v) => !v)}
                activeOpacity={0.8}
            >
                <Ionicons name="settings-outline" size={24} color={colors.text} />
            </TouchableOpacity>

            {open && (
                <View style={[styles.panel, { backgroundColor: colors.cardBg, borderColor: colors.inputBorder, shadowColor: '#000' }]}>
                    {/* Theme switch with circle feel */}
                    <View style={styles.row}>
                        <View style={[styles.circleWrapper, { borderColor: colors.inputBorder, backgroundColor: colors.inputBg }]}>
                            <Switch
                                value={theme === 'dark'}
                                onValueChange={onToggleTheme}
                                trackColor={{ false: '#b0c4de', true: '#4f9df7' }}
                                thumbColor="#fff"
                            />
                        </View>
                        <Text style={[styles.label, { color: colors.text }]}>{strings.themeLabel}</Text>
                    </View>

                    {/* Language horizontal pills */}
                    <View style={styles.row}>
                        <View style={styles.langRow}>
                            <TouchableOpacity style={selectedLangStyle('vi')} onPress={() => onSelectLanguage('vi')}>
                                <Text style={selectedLangText('vi')}>{strings.vi}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={selectedLangStyle('en')} onPress={() => onSelectLanguage('en')}>
                                <Text style={selectedLangText('en')}>{strings.en}</Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={[styles.label, { color: colors.text }]}>{strings.langLabel}</Text>
                    </View>
                </View>
            )}
        </>
    );
}

const styles = StyleSheet.create({
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 52,
        height: 52,
        borderRadius: 26,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        shadowOpacity: 0.2,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 6,
    },
    panel: {
        position: 'absolute',
        bottom: 88,
        right: 16,
        padding: 14,
        borderRadius: 14,
        borderWidth: 1,
        shadowOpacity: 0.15,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 8,
        gap: 12,
        minWidth: 220,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
    },
    circleWrapper: {
        padding: 6,
        borderWidth: 1,
        borderRadius: 999,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
    },
    langRow: {
        flexDirection: 'row',
        gap: 8,
    },
    langChip: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 999,
        borderWidth: 1,
    },
    langChipSelected: {
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 1 },
        elevation: 2,
    },
    langText: {
        width: 90,
        textAlign: 'center',
        fontSize: 13,
        fontWeight: '600',
    },
});

