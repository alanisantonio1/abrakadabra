
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { colors, commonStyles } from '../styles/commonStyles';
import { Event, CalendarDay } from '../types';

interface CalendarViewProps {
  events: Event[];
  onDateSelect: (date: string) => void;
  selectedDate?: string;
}

const CalendarView: React.FC<CalendarViewProps> = ({ events, onDateSelect, selectedDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);

  useEffect(() => {
    generateCalendarDays();
  }, [currentMonth, events]);

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days: CalendarDay[] = [];
    const current = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      const dateString = current.toISOString().split('T')[0];
      const dayEvents = events.filter(event => event.date === dateString);
      
      days.push({
        date: dateString,
        isAvailable: dayEvents.length === 0,
        events: dayEvents
      });

      current.setDate(current.getDate() + 1);
    }

    setCalendarDays(days);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentMonth(newMonth);
  };

  const isCurrentMonth = (date: string) => {
    const day = new Date(date);
    return day.getMonth() === currentMonth.getMonth();
  };

  const isToday = (date: string) => {
    const today = new Date().toISOString().split('T')[0];
    return date === today;
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigateMonth('prev')} style={styles.navButton}>
          <Text style={styles.navButtonText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.monthTitle}>
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </Text>
        <TouchableOpacity onPress={() => navigateMonth('next')} style={styles.navButton}>
          <Text style={styles.navButtonText}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.weekHeader}>
        {dayNames.map(day => (
          <Text key={day} style={styles.weekDay}>{day}</Text>
        ))}
      </View>

      <View style={styles.calendar}>
        {calendarDays.map((day, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dayButton,
              !isCurrentMonth(day.date) && styles.otherMonth,
              !day.isAvailable && styles.bookedDay,
              day.isAvailable && styles.availableDay,
              isToday(day.date) && styles.today,
              selectedDate === day.date && styles.selectedDay
            ]}
            onPress={() => onDateSelect(day.date)}
          >
            <Text style={[
              styles.dayText,
              !isCurrentMonth(day.date) && styles.otherMonthText,
              !day.isAvailable && styles.bookedDayText,
              selectedDate === day.date && styles.selectedDayText
            ]}>
              {new Date(day.date).getDate()}
            </Text>
            {day.events.length > 0 && (
              <View style={styles.eventIndicator}>
                <Text style={styles.eventCount}>{day.events.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: colors.success }]} />
          <Text style={styles.legendText}>Disponible</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: colors.error }]} />
          <Text style={styles.legendText}>Ocupado</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    margin: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  navButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.backgroundAlt,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  weekHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: colors.textLight,
    paddingVertical: 8,
  },
  calendar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayButton: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    margin: 1,
    position: 'relative',
  },
  availableDay: {
    backgroundColor: colors.success + '20',
    borderWidth: 1,
    borderColor: colors.success,
  },
  bookedDay: {
    backgroundColor: colors.error + '20',
    borderWidth: 1,
    borderColor: colors.error,
  },
  today: {
    backgroundColor: colors.warning + '40',
    borderWidth: 2,
    borderColor: colors.warning,
  },
  selectedDay: {
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  otherMonth: {
    opacity: 0.3,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  bookedDayText: {
    color: colors.error,
    fontWeight: '600',
  },
  selectedDayText: {
    color: colors.backgroundAlt,
    fontWeight: '600',
  },
  otherMonthText: {
    color: colors.textLight,
  },
  eventIndicator: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: colors.secondary,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventCount: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.backgroundAlt,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: colors.textLight,
  },
});

export default CalendarView;
