import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { COLORS } from '../constants/theme';

/**
 * Reusable Form Controls
 * Shell + Label + Asterisk + Validation error + Formatted inputs.
 */

/* ============================== shell ============================== */

export function FieldShell({ label, required, error, valid, hint, children }) {
  return (
    <View style={styles.field}>
      {label ? (
        <View style={styles.labelRow}>
          <Text style={styles.label}>
            {label}
            {required ? <Text style={styles.asterisk}> *</Text> : null}
          </Text>
          {valid && !error ? <Text style={styles.validCheck}>✓</Text> : null}
        </View>
      ) : null}

      {children}

      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
}

/* ============================ text input ============================ */

export function FormField({
  label,
  required,
  value,
  onChangeText,
  error,
  valid,
  hint,
  placeholder,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  multiline = false,
  maxLength,
  editable = true,
  format,
  displayValue,
  numberOfLines = 4,
}) {
  const [focused, setFocused] = useState(false);

  const handleChange = (text) => {
    if (onChangeText) {
      onChangeText(format ? format(text) : text);
    }
  };

  return (
    <FieldShell label={label} required={required} error={error} valid={valid} hint={hint}>
      <TextInput
        style={[
          styles.input,
          multiline && styles.inputMultiline,
          focused && styles.inputFocused,
          !!error && styles.inputError,
          !editable && styles.inputDisabled,
        ]}
        value={focused ? value : displayValue ?? value}
        onChangeText={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        placeholderTextColor="#AAAAAA"
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        multiline={multiline}
        numberOfLines={multiline ? numberOfLines : 1}
        textAlignVertical={multiline ? 'top' : 'center'}
        maxLength={maxLength}
        editable={editable}
      />
    </FieldShell>
  );
}

/* ============================ select field ============================ */

export function SelectField({
  label,
  required,
  value,
  options = [],
  onSelect,
  error,
  placeholder = 'Select option',
  searchable = false,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const selected = options.find((o) => o.id === value || String(o.id) === String(value));

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label?.toLowerCase().includes(q));
  }, [options, query]);

  const close = () => {
    setOpen(false);
    setQuery('');
  };

  return (
    <FieldShell label={label} required={required} error={error} valid={!!selected}>
      <Pressable
        style={[styles.input, styles.selectInput, !!error && styles.inputError]}
        onPress={() => setOpen(true)}
      >
        <Text style={[styles.selectText, !selected && styles.placeholderText]} numberOfLines={1}>
          {selected ? selected.label : placeholder}
        </Text>
        <Text style={styles.caret}>▾</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="slide" onRequestClose={close}>
        <Pressable style={styles.backdrop} onPress={close}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>{label || 'Select'}</Text>

            {searchable ? (
              <TextInput
                style={styles.searchInput}
                value={query}
                onChangeText={setQuery}
                placeholder="Search..."
                placeholderTextColor="#AAAAAA"
                autoCorrect={false}
              />
            ) : null}

            <FlatList
              data={visible}
              keyExtractor={(item) => String(item.id)}
              keyboardShouldPersistTaps="handled"
              style={styles.sheetList}
              renderItem={({ item }) => {
                const active = item.id === value || String(item.id) === String(value);
                return (
                  <Pressable
                    style={({ pressed }) => [
                      styles.optionRow,
                      active && styles.optionRowActive,
                      pressed && styles.pressed,
                    ]}
                    onPress={() => {
                      if (onSelect) onSelect(item.id);
                      close();
                    }}
                  >
                    <View style={styles.optionTextWrap}>
                      <Text style={[styles.optionText, active && styles.optionTextActive]}>
                        {item.label}
                      </Text>
                      {item.hint ? <Text style={styles.optionHint}>{item.hint}</Text> : null}
                    </View>
                    {active ? <Text style={styles.optionCheck}>✓</Text> : null}
                  </Pressable>
                );
              }}
              ListEmptyComponent={
                <Text style={styles.emptyOption}>No options found</Text>
              }
            />

            <Pressable style={styles.sheetClose} onPress={close}>
              <Text style={styles.sheetCloseText}>Close</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </FieldShell>
  );
}

/* ========================== multi select chips ========================== */

export function MultiSelectField({
  label,
  required,
  options = [],
  values = [],
  onToggle,
  error,
  hint,
}) {
  return (
    <FieldShell
      label={label}
      required={required}
      error={error}
      valid={values && values.length > 0}
      hint={hint}
    >
      <View style={styles.chipWrap}>
        {options.map((option) => {
          const active = values && values.includes(option.id);
          return (
            <Pressable
              key={option.id}
              style={({ pressed }) => [
                styles.chip,
                active && styles.chipActive,
                pressed && styles.pressed,
              ]}
              onPress={() => onToggle && onToggle(option.id)}
            >
              {option.icon ? <Text style={styles.chipIcon}>{option.icon}</Text> : null}
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </FieldShell>
  );
}

/* ============================ yes / no toggle ============================ */

export function ToggleField({ label, required, value, onValueChange, error, hint, yesLabel = 'Yes', noLabel = 'No' }) {
  return (
    <FieldShell label={label} required={required} error={error} hint={hint}>
      <View style={styles.toggleRow}>
        {[
          { id: true, label: yesLabel },
          { id: false, label: noLabel },
        ].map((option) => {
          const active = value === option.id;
          return (
            <Pressable
              key={String(option.id)}
              style={({ pressed }) => [
                styles.toggleButton,
                active && styles.toggleButtonActive,
                pressed && styles.pressed,
              ]}
              onPress={() => onValueChange && onValueChange(option.id)}
            >
              <Text style={[styles.toggleText, active && styles.toggleTextActive]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </FieldShell>
  );
}

/* ============================== checkbox ============================== */

export function CheckboxField({ label, value, onValueChange }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.checkboxRow, pressed && styles.pressed]}
      onPress={() => onValueChange && onValueChange(!value)}
      hitSlop={6}
    >
      <View style={[styles.checkbox, value && styles.checkboxChecked]}>
        {value ? <Text style={styles.checkboxTick}>✓</Text> : null}
      </View>
      <Text style={styles.checkboxLabel}>{label}</Text>
    </Pressable>
  );
}

/* ============================== date field ============================== */

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();

export function DateField({
  label,
  required,
  value,
  onChange,
  error,
  placeholder = 'DD/MM/YYYY',
  minYear = 1940,
  maxYear = new Date().getFullYear(),
}) {
  const [open, setOpen] = useState(false);

  const parsed = value ? new Date(value) : null;
  const valid = parsed && !Number.isNaN(parsed.getTime());

  const [draft, setDraft] = useState(() => {
    const base = valid ? parsed : new Date();
    return { day: base.getDate(), month: base.getMonth(), year: base.getFullYear() };
  });

  const years = useMemo(() => {
    const out = [];
    for (let y = maxYear; y >= minYear; y -= 1) out.push(y);
    return out;
  }, [minYear, maxYear]);

  const days = useMemo(() => {
    const count = daysInMonth(draft.month, draft.year);
    return Array.from({ length: count }, (_, i) => i + 1);
  }, [draft.month, draft.year]);

  const openPicker = () => {
    const base = valid ? parsed : new Date();
    setDraft({ day: base.getDate(), month: base.getMonth(), year: base.getFullYear() });
    setOpen(true);
  };

  const confirm = () => {
    const safeDay = Math.min(draft.day, daysInMonth(draft.month, draft.year));
    const picked = new Date(draft.year, draft.month, safeDay);
    const iso = `${picked.getFullYear()}-${String(picked.getMonth() + 1).padStart(2, '0')}-${String(
      picked.getDate()
    ).padStart(2, '0')}`;
    if (onChange) onChange(iso);
    setOpen(false);
  };

  const display = valid
    ? `${String(parsed.getDate()).padStart(2, '0')}/${String(
        parsed.getMonth() + 1
      ).padStart(2, '0')}/${parsed.getFullYear()}`
    : '';

  const column = (data, selected, onPick, keyPrefix, renderLabel) => (
    <ScrollView
      style={styles.pickerColumn}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.pickerColumnContent}
    >
      {data.map((item) => {
        const active = item === selected;
        return (
          <Pressable
            key={`${keyPrefix}-${item}`}
            style={[styles.pickerItem, active && styles.pickerItemActive]}
            onPress={() => onPick(item)}
          >
            <Text style={[styles.pickerItemText, active && styles.pickerItemTextActive]}>
              {renderLabel ? renderLabel(item) : item}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );

  return (
    <FieldShell label={label} required={required} error={error} valid={!!valid}>
      <Pressable
        style={[styles.input, styles.selectInput, !!error && styles.inputError]}
        onPress={openPicker}
      >
        <Text style={[styles.selectText, !display && styles.placeholderText]}>
          {display || placeholder}
        </Text>
        <Text style={styles.caret}>📅</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>{label || 'Select Date'}</Text>

            <View style={styles.pickerRow}>
              {column(days, draft.day, (day) => setDraft((d) => ({ ...d, day })), 'd')}
              {column(
                MONTHS.map((_, i) => i),
                draft.month,
                (month) => setDraft((d) => ({ ...d, month })),
                'm',
                (i) => MONTHS[i]
              )}
              {column(years, draft.year, (year) => setDraft((d) => ({ ...d, year })), 'y')}
            </View>

            <View style={styles.dateActions}>
              <Pressable style={styles.dateCancel} onPress={() => setOpen(false)}>
                <Text style={styles.dateCancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.dateConfirm} onPress={confirm}>
                <Text style={styles.dateConfirmText}>Done</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </FieldShell>
  );
}

/* =============================== styles =============================== */

const styles = StyleSheet.create({
  field: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primaryDark,
    flex: 1,
  },
  asterisk: {
    color: COLORS.danger,
  },
  validCheck: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.whatsapp,
    marginLeft: 8,
  },
  error: {
    fontSize: 12,
    color: COLORS.danger,
    marginTop: 5,
  },
  hint: {
    fontSize: 12,
    color: COLORS.grayText,
    marginTop: 5,
  },
  pressed: {
    opacity: 0.85,
  },

  /* input */
  input: {
    height: 46,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 15,
    color: COLORS.textDark,
    backgroundColor: COLORS.white,
  },
  inputMultiline: {
    height: 92,
    paddingTop: 12,
  },
  inputFocused: {
    borderColor: COLORS.primaryDark,
  },
  inputError: {
    borderColor: COLORS.danger,
  },
  inputDisabled: {
    backgroundColor: '#F0F0F0',
    color: COLORS.grayText,
  },

  /* select */
  selectInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textDark,
  },
  placeholderText: {
    color: '#AAAAAA',
  },
  caret: {
    fontSize: 14,
    color: COLORS.grayText,
    marginLeft: 8,
  },

  /* modal sheet */
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 30 : 16,
    maxHeight: '75%',
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: 'center',
    marginBottom: 12,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    marginBottom: 12,
  },
  sheetList: {
    flexGrow: 0,
  },
  searchInput: {
    height: 42,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: COLORS.textDark,
    marginBottom: 10,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  optionRowActive: {
    backgroundColor: COLORS.lightBlue,
  },
  optionTextWrap: {
    flex: 1,
  },
  optionText: {
    fontSize: 15,
    color: COLORS.textDark,
  },
  optionTextActive: {
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  optionHint: {
    fontSize: 12,
    color: COLORS.grayText,
    marginTop: 2,
  },
  optionCheck: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    marginLeft: 10,
  },
  emptyOption: {
    fontSize: 14,
    color: COLORS.grayText,
    textAlign: 'center',
    paddingVertical: 24,
  },
  sheetClose: {
    height: 46,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  sheetCloseText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },

  /* chips */
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 2,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: COLORS.white,
  },
  chipActive: {
    borderColor: COLORS.primaryDark,
    backgroundColor: COLORS.lightBlue,
  },
  chipIcon: {
    fontSize: 13,
    marginRight: 5,
  },
  chipText: {
    fontSize: 13,
    color: COLORS.grayText,
  },
  chipTextActive: {
    color: COLORS.primaryDark,
    fontWeight: 'bold',
  },

  /* toggle */
  toggleRow: {
    flexDirection: 'row',
  },
  toggleButton: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    backgroundColor: COLORS.white,
  },
  toggleButtonActive: {
    borderColor: COLORS.primaryDark,
    backgroundColor: COLORS.lightBlue,
  },
  toggleText: {
    fontSize: 14,
    color: COLORS.grayText,
  },
  toggleTextActive: {
    color: COLORS.primaryDark,
    fontWeight: 'bold',
  },

  /* checkbox */
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkboxChecked: {
    borderColor: COLORS.whatsapp,
    backgroundColor: COLORS.whatsapp,
  },
  checkboxTick: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textDark,
  },

  /* date picker */
  pickerRow: {
    flexDirection: 'row',
    height: 220,
  },
  pickerColumn: {
    flex: 1,
  },
  pickerColumnContent: {
    paddingVertical: 4,
  },
  pickerItem: {
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
    marginHorizontal: 4,
  },
  pickerItemActive: {
    backgroundColor: COLORS.lightBlue,
  },
  pickerItemText: {
    fontSize: 15,
    color: COLORS.grayText,
  },
  pickerItemTextActive: {
    color: COLORS.primaryDark,
    fontWeight: 'bold',
  },
  dateActions: {
    flexDirection: 'row',
    marginTop: 14,
  },
  dateCancel: {
    flex: 1,
    height: 46,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  dateCancelText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.grayText,
  },
  dateConfirm: {
    flex: 1,
    height: 46,
    borderRadius: 8,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateConfirmText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.white,
  },
});

export default FormField;
