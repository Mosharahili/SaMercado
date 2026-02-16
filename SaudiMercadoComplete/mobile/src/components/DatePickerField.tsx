import React, { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLanguage } from '@hooks/useLanguage';

type DatePickerFieldProps = {
  label: string;
  value?: string;
  placeholder?: string;
  onChange: (value?: string) => void;
};

const weekDaysAr = ['ن', 'ث', 'ر', 'خ', 'ج', 'س', 'ح'];
const weekDaysEn = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const monthLabel = (date: Date, locale: 'ar-SA' | 'en-US') =>
  date.toLocaleDateString(locale, {
    month: 'long',
    year: 'numeric',
  });

const normalizeWeekday = (date: Date) => {
  // JS Sunday=0; we use Monday-first layout.
  const weekday = date.getDay();
  return weekday === 0 ? 6 : weekday - 1;
};

export const DatePickerField = ({ label, value, placeholder, onChange }: DatePickerFieldProps) => {
  const { isRTL, tr, locale } = useLanguage();
  const weekDays = isRTL ? weekDaysAr : weekDaysEn;
  const textDirectionStyle = {
    textAlign: isRTL ? 'right' : 'left',
  } as const;
  const rowDirectionStyle = { } as const;
  const selectedDate = value ? new Date(value) : undefined;
  const [visible, setVisible] = useState(false);
  const [viewDate, setViewDate] = useState<Date>(
    selectedDate && !Number.isNaN(selectedDate.getTime()) ? selectedDate : new Date()
  );

  const calendarCells = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const firstWeekday = normalizeWeekday(firstDay);
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: Array<number | null> = [];
    for (let i = 0; i < firstWeekday; i += 1) cells.push(null);
    for (let day = 1; day <= daysInMonth; day += 1) cells.push(day);
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [viewDate]);

  const formattedValue =
    selectedDate && !Number.isNaN(selectedDate.getTime())
      ? selectedDate.toLocaleDateString(locale)
      : placeholder || tr('اختر التاريخ', 'Select date');

  const selectedDay =
    selectedDate && !Number.isNaN(selectedDate.getTime()) && selectedDate.getFullYear() === viewDate.getFullYear() && selectedDate.getMonth() === viewDate.getMonth()
      ? selectedDate.getDate()
      : null;

  const pickDay = (day: number) => {
    const chosen = new Date(viewDate.getFullYear(), viewDate.getMonth(), day, 12, 0, 0);
    onChange(chosen.toISOString());
    setVisible(false);
  };

  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, textDirectionStyle]}>{label}</Text>
      <Pressable onPress={() => setVisible(true)} style={styles.field}>
        <Text style={[styles.fieldText, textDirectionStyle]}>{formattedValue}</Text>
      </Pressable>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <View style={[styles.headerRow, rowDirectionStyle, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
              <Pressable onPress={() => setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))} style={styles.navBtn}>
                <Text style={styles.navText}>{isRTL ? '◀' : '▶'}</Text>
              </Pressable>
              <Text style={[styles.monthTitle, textDirectionStyle]}>{monthLabel(viewDate, locale)}</Text>
              <Pressable onPress={() => setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))} style={styles.navBtn}>
                <Text style={styles.navText}>{isRTL ? '▶' : '◀'}</Text>
              </Pressable>
            </View>

            <View style={[styles.weekRow, rowDirectionStyle]}>
              {weekDays.map((day) => (
                <Text key={day} style={styles.weekLabel}>
                  {day}
                </Text>
              ))}
            </View>

            <View style={[styles.daysGrid, rowDirectionStyle]}>
              {calendarCells.map((day, index) => {
                if (!day) {
                  return <View key={`empty-${index}`} style={styles.dayCell} />;
                }

                const isSelected = selectedDay === day;
                return (
                  <Pressable key={`day-${day}`} style={[styles.dayCell, isSelected ? styles.daySelected : null]} onPress={() => pickDay(day)}>
                    <Text style={[styles.dayText, isSelected ? styles.dayTextSelected : null]}>{day}</Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={[styles.actionRow, rowDirectionStyle]}>
              <Pressable onPress={() => setVisible(false)} style={[styles.actionBtn, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
                <Text style={styles.actionText}>{tr('إغلاق', 'Close')}</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  onChange(undefined);
                  setVisible(false);
                }}
                style={[styles.actionDanger, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}
              >
                <Text style={styles.actionDangerText}>{tr('مسح التاريخ', 'Clear date')}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    gap: 4,
  },
  label: {
    color: '#0f2f3d',
    fontWeight: '700',
  },
  field: {
    borderWidth: 1,
    borderColor: '#99f6e4',
    borderRadius: 10,
    backgroundColor: '#f0fdfa',
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  fieldText: {
    color: '#0f2f3d',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 12,
    gap: 8,
  },
  headerRow: {
    justifyContent: 'space-between',
  },
  navBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ecfeff',
  },
  navText: {
    color: '#0f766e',
    fontWeight: '800',
  },
  monthTitle: {
    color: '#0f2f3d',
    fontWeight: '900',
    fontSize: 16,
  },
  weekRow: {
      },
  weekLabel: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    color: '#4a6572',
    fontWeight: '700',
  },
  daysGrid: {
        flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  daySelected: {
    backgroundColor: '#0d9488',
  },
  dayText: {
    color: '#0f2f3d',
    fontWeight: '600',
  },
  dayTextSelected: {
    color: 'white',
    fontWeight: '800',
  },
  actionRow: {
        gap: 8,
    marginTop: 4,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 8,
    backgroundColor: '#ecfeff',
    paddingVertical: 9,
  },
  actionText: {
    color: '#0f766e',
    fontWeight: '700',
  },
  actionDanger: {
    flex: 1,
    borderRadius: 8,
    backgroundColor: '#fee2e2',
    paddingVertical: 9,
  },
  actionDangerText: {
    color: '#b91c1c',
    fontWeight: '700',
  },
});
