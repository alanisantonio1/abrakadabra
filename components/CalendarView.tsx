
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { colors, commonStyles } from '../styles/commonStyles';
import { Event, CalendarDay } from '../types';

interface CalendarViewProps {
  events: Event[];
  onDateSelect: (date: string) => void;
  selectedDate?: string;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  navButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  navButtonText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  weekHeader: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
    color: colors.gray,
    paddingVertical: 8,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayContainer: {
    width: '14.28%', // 7 days per week
    aspectRatio: 1,
    padding: 2,
  },
  dayButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  dayText: {
    fontSize: 16,
    color: colors.text,
  },
  // Day states
  currentMonthDay: {
    backgroundColor: colors.white,
  },
  otherMonthDay: {
    backgroundColor: colors.lightGray,
  },
  todayDay: {
    backgroundColor: colors.info,
    borderColor: colors.primary,
    borderWidth: 2,
  },
  selectedDay: {
    backgroundColor: colors.primary,
  },
  pastDay: {
    backgroundColor: colors.lightGray,
  },
  hasEventDay: {
    backgroundColor: colors.success,
  },
  hasMultipleEventsDay: {
    backgroundColor: colors.warning,
  },
  // Text states
  todayText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  selectedText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  pastText: {
    color: colors.gray,
  },
  hasEventText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  otherMonthText: {
    color: colors.gray,
  },
  eventCount: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: colors.danger,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventCountText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  legend: {
    marginTop: 20,
    padding: 15,
    backgroundColor: colors.lightGray,
    borderRadius: 10,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  legendColor: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginRight: 10,
  },
  legendText: {
    fontSize: 14,
    color: colors.text,
  },
});

const CalendarView: React.FC<CalendarViewProps> = ({ events, onDateSelect, selectedDate }) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);

  useEffect(() => {
    generateCalendarDays();
  }, [currentMonth, events]);

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // Get first day of the month and how many days in month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Get the day of week for the first day (0 = Sunday, 1 = Monday, etc.)
    const startDayOfWeek = firstDay.getDay();
    
    // Calculate days from previous month to show
    const prevMonth = new Date(year, month - 1, 0);
    const daysFromPrevMonth = startDayOfWeek;
    
    // Calculate days from next month to show (to fill the grid)
    const totalCells = Math.ceil((daysInMonth + daysFromPrevMonth) / 7) * 7;
    const daysFromNextMonth = totalCells - daysInMonth - daysFromPrevMonth;
    
    const days: CalendarDay[] = [];
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    
    // Add days from previous month
    for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
      const day = prevMonth.getDate() - i;
      const date = new Date(year, month - 1, day);
      const dateString = date.toISOString().split('T')[0];
      
      days.push({
        date: dateString,
        isCurrentMonth: false,
        isToday: dateString === todayString,
        isPast: date < today,
        hasEvent: events.some(e => e.date === dateString),
        eventCount: events.filter(e => e.date === dateString).length,
      });
    }
    
    // Add days from current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = date.toISOString().split('T')[0];
      
      days.push({
        date: dateString,
        isCurrentMonth: true,
        isToday: dateString === todayString,
        isPast: date < today,
        hasEvent: events.some(e => e.date === dateString),
        eventCount: events.filter(e => e.date === dateString).length,
      });
    }
    
    // Add days from next month
    for (let day = 1; day <= daysFromNextMonth; day++) {
      const date = new Date(year, month + 1, day);
      const dateString = date.toISOString().split('T')[0];
      
      days.push({
        date: dateString,
        isCurrentMonth: false,
        isToday: dateString === todayString,
        isPast: date < today,
        hasEvent: events.some(e => e.date === dateString),
        eventCount: events.filter(e => e.date === dateString).length,
      });
    }
    
    setCalendarDays(days);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const isCurrentMonth = (date: string): boolean => {
    const calendarDay = calendarDays.find(day => day.date === date);
    return calendarDay?.isCurrentMonth || false;
  };

  const isToday = (date: string): boolean => {
    const today = new Date().toISOString().split('T')[0];
    return date === today;
  };

  const isPastDate = (date: string): boolean => {
    const today = new Date();
    const dateObj = new Date(date);
    return dateObj < today;
  };

  const getDateStyle = (day: CalendarDay) => {
    const styles_array = [styles.dayButton];
    
    if (!day.isCurrentMonth) {
      styles_array.push(styles.otherMonthDay);
    } else if (day.date === selectedDate) {
      styles_array.push(styles.selectedDay);
    } else if (day.isToday) {
      styles_array.push(styles.todayDay);
    } else if (day.isPast) {
      styles_array.push(styles.pastDay);
    } else if (day.eventCount > 1) {
      styles_array.push(styles.hasMultipleEventsDay);
    } else if (day.hasEvent) {
      styles_array.push(styles.hasEventDay);
    } else {
      styles_array.push(styles.currentMonthDay);
    }
    
    return styles_array;
  };

  const getTextStyle = (day: CalendarDay) => {
    const styles_array = [styles.dayText];
    
    if (!day.isCurrentMonth) {
      styles_array.push(styles.otherMonthText);
    } else if (day.date === selectedDate) {
      styles_array.push(styles.selectedText);
    } else if (day.isToday) {
      styles_array.push(styles.todayText);
    } else if (day.isPast) {
      styles_array.push(styles.pastText);
    } else if (day.hasEvent) {
      styles_array.push(styles.hasEventText);
    }
    
    return styles_array;
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <ScrollView style={styles.container}>
      {/* Month Navigation */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigateMonth('prev')}
        >
          <Text style={styles.navButtonText}>‹</Text>
        </TouchableOpacity>
        
        <Text style={styles.monthTitle}>
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </Text>
        
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigateMonth('next')}
        >
          <Text style={styles.navButtonText}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Week Header */}
      <View style={styles.weekHeader}>
        {weekDays.map((day) => (
          <Text key={day} style={styles.weekDay}>
            {day}
          </Text>
        ))}
      </View>

      {/* Calendar Grid */}
      <View style={styles.calendarGrid}>
        {calendarDays.map((day) => (
          <View key={day.date} style={styles.dayContainer}>
            <TouchableOpacity
              style={getDateStyle(day)}
              onPress={() => onDateSelect(day.date)}
              disabled={!day.isCurrentMonth}
            >
              <Text style={getTextStyle(day)}>
                {new Date(day.date).getDate()}
              </Text>
              
              {day.eventCount > 0 && (
                <View style={styles.eventCount}>
                  <Text style={styles.eventCountText}>
                    {day.eventCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Leyenda</Text>
        
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: colors.info }]} />
          <Text style={styles.legendText}>Hoy</Text>
        </View>
        
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: colors.success }]} />
          <Text style={styles.legendText}>Disponible con eventos</Text>
        </View>
        
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: colors.warning }]} />
          <Text style={styles.legendText}>Múltiples eventos</Text>
        </View>
        
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: colors.lightGray }]} />
          <Text style={styles.legendText}>Fecha pasada</Text>
        </View>
        
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: colors.primary }]} />
          <Text style={styles.legendText}>Fecha seleccionada</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default CalendarView;
