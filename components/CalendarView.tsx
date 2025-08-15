
import React, { useState, useEffect, useCallback } from 'react';
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
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 16,
    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
    elevation: 6,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  navButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    minWidth: 44,
    alignItems: 'center',
    boxShadow: '0 4px 12px rgba(255, 107, 107, 0.3)',
    elevation: 4,
  },
  navButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 18,
  },
  instructionBanner: {
    backgroundColor: colors.info,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
    boxShadow: '0 4px 12px rgba(116, 185, 255, 0.3)',
    elevation: 4,
  },
  instructionText: {
    fontSize: 14,
    color: colors.white,
    textAlign: 'center',
    fontWeight: '600',
  },
  weekHeader: {
    flexDirection: 'row',
    marginBottom: 12,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 8,
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    elevation: 3,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
    color: colors.text,
    paddingVertical: 6,
    fontSize: 12, // Reduced from 15 to 12
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 8, // Reduced from 12 to 8
    boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
    elevation: 8,
  },
  dayContainer: {
    width: '14.285714%', // More precise calculation for 7 days
    aspectRatio: 1,
    padding: 2, // Reduced from 4 to 2
  },
  dayButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12, // Reduced from 16 to 12
    backgroundColor: colors.white,
    borderWidth: 1.5, // Reduced from 2 to 1.5
    borderColor: colors.border,
    position: 'relative',
    boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
    elevation: 2,
    minHeight: 36, // Added minimum height for consistency
  },
  dayText: {
    fontSize: 13, // Reduced from 16 to 13
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  
  // FIXED AVAILABILITY COLORS - Green for available, Red for occupied
  availableDay: {
    backgroundColor: colors.available, // Green for available dates
    borderColor: colors.available,
    boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
    elevation: 4,
  },
  occupiedDay: {
    backgroundColor: colors.occupied, // Red for occupied dates
    borderColor: colors.occupied,
    boxShadow: '0 4px 12px rgba(244, 67, 54, 0.3)',
    elevation: 4,
  },
  multipleEventsDay: {
    backgroundColor: '#D32F2F', // Darker red for multiple events
    borderColor: '#D32F2F',
    boxShadow: '0 4px 12px rgba(211, 47, 47, 0.4)',
    elevation: 5,
  },
  selectedDay: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    borderWidth: 2.5, // Slightly thicker for selected
    boxShadow: '0 6px 16px rgba(255, 107, 107, 0.4)',
    elevation: 6,
  },
  todayDay: {
    backgroundColor: colors.today,
    borderColor: colors.today,
    borderWidth: 2.5, // Slightly thicker for today
    boxShadow: '0 4px 12px rgba(69, 183, 209, 0.4)',
    elevation: 5,
  },
  pastDay: {
    backgroundColor: colors.past,
    borderColor: colors.past,
    opacity: 0.6,
  },
  otherMonthDay: {
    backgroundColor: colors.lightGray,
    borderColor: colors.lightGray,
    opacity: 0.4,
  },
  
  // FIXED TEXT COLORS
  availableText: {
    color: colors.white, // White text on green background
    fontWeight: 'bold',
    fontSize: 13, // Consistent with dayText
  },
  occupiedText: {
    color: colors.white, // White text on red background
    fontWeight: 'bold',
    fontSize: 13, // Consistent with dayText
  },
  selectedText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 13, // Consistent with dayText
  },
  todayText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 13, // Consistent with dayText
  },
  pastText: {
    color: colors.textMuted,
    fontSize: 13, // Consistent with dayText
  },
  otherMonthText: {
    color: colors.textMuted,
    fontSize: 13, // Consistent with dayText
  },
  
  eventCount: {
    position: 'absolute',
    top: 1,
    right: 1,
    backgroundColor: colors.white,
    borderRadius: 8, // Reduced from 12 to 8
    minWidth: 16, // Reduced from 20 to 16
    height: 16, // Reduced from 20 to 16
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
    elevation: 3,
  },
  eventCountText: {
    color: colors.danger,
    fontSize: 9, // Reduced from 10 to 9
    fontWeight: 'bold',
  },
  legend: {
    marginTop: 20, // Reduced from 24 to 20
    padding: 20, // Reduced from 24 to 20
    backgroundColor: colors.white,
    borderRadius: 16,
    boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
    elevation: 8,
  },
  legendTitle: {
    fontSize: 18, // Reduced from 20 to 18
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16, // Reduced from 20 to 16
    textAlign: 'center',
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12, // Reduced from 16 to 12
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: '45%',
    marginBottom: 10, // Reduced from 12 to 10
  },
  legendColor: {
    width: 24, // Reduced from 28 to 24
    height: 24, // Reduced from 28 to 24
    borderRadius: 10, // Reduced from 12 to 10
    marginRight: 10, // Reduced from 12 to 10
    borderWidth: 1.5, // Reduced from 2 to 1.5
    borderColor: colors.border,
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
    elevation: 2,
  },
  legendText: {
    fontSize: 13, // Reduced from 14 to 13
    color: colors.text,
    fontWeight: '600',
    flex: 1,
  },
});

const CalendarView: React.FC<CalendarViewProps> = ({ events, onDateSelect, selectedDate }) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);

  const generateCalendarDays = useCallback(() => {
    console.log('🗓️ Generating calendar days with improved alignment...');
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
    
    console.log('✅ Calendar days generated with better alignment:', days.length);
    setCalendarDays(days);
  }, [currentMonth, events]);

  useEffect(() => {
    generateCalendarDays();
  }, [currentMonth, events, generateCalendarDays]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
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
      styles_array.push(styles.multipleEventsDay);
    } else if (day.hasEvent) {
      // OCCUPIED - RED
      styles_array.push(styles.occupiedDay);
    } else {
      // AVAILABLE - GREEN
      styles_array.push(styles.availableDay);
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
      // OCCUPIED - WHITE TEXT
      styles_array.push(styles.occupiedText);
    } else {
      // AVAILABLE - WHITE TEXT
      styles_array.push(styles.availableText);
    }
    
    return styles_array;
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Instruction Banner */}
      <View style={styles.instructionBanner}>
        <Text style={styles.instructionText}>
          🎯 Verde = Disponible | Rojo = Ocupado | Selecciona una fecha disponible
        </Text>
      </View>

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
              activeOpacity={0.7}
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
        <Text style={styles.legendTitle}>🎨 Leyenda del Calendario</Text>
        
        <View style={styles.legendGrid}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: colors.available }]} />
            <Text style={styles.legendText}>✅ Disponible</Text>
          </View>
          
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: colors.occupied }]} />
            <Text style={styles.legendText}>❌ Ocupado</Text>
          </View>
          
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: colors.today }]} />
            <Text style={styles.legendText}>📅 Hoy</Text>
          </View>
          
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: colors.primary }]} />
            <Text style={styles.legendText}>🎯 Seleccionada</Text>
          </View>
          
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: colors.past }]} />
            <Text style={styles.legendText}>⏰ Fecha pasada</Text>
          </View>
          
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#D32F2F' }]} />
            <Text style={styles.legendText}>🔥 Múltiples eventos</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default CalendarView;
