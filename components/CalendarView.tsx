
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
    marginBottom: 24,
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 20,
    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
    elevation: 6,
  },
  monthTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  navButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    minWidth: 50,
    alignItems: 'center',
    boxShadow: '0 4px 12px rgba(255, 107, 107, 0.3)',
    elevation: 4,
  },
  navButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 20,
  },
  instructionBanner: {
    backgroundColor: colors.info,
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    alignItems: 'center',
    boxShadow: '0 4px 12px rgba(116, 185, 255, 0.3)',
    elevation: 4,
  },
  instructionText: {
    fontSize: 16,
    color: colors.white,
    textAlign: 'center',
    fontWeight: '600',
  },
  weekHeader: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 12,
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    elevation: 3,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
    color: colors.text,
    paddingVertical: 8,
    fontSize: 15,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 12,
    boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
    elevation: 8,
  },
  dayContainer: {
    width: '14.28%', // 7 days per week
    aspectRatio: 1,
    padding: 4,
  },
  dayButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.border,
    position: 'relative',
    boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
    elevation: 2,
  },
  dayText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
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
    borderWidth: 3,
    boxShadow: '0 6px 16px rgba(255, 107, 107, 0.4)',
    elevation: 6,
  },
  todayDay: {
    backgroundColor: colors.today,
    borderColor: colors.today,
    borderWidth: 3,
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
  },
  occupiedText: {
    color: colors.white, // White text on red background
    fontWeight: 'bold',
  },
  selectedText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  todayText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  pastText: {
    color: colors.textMuted,
  },
  otherMonthText: {
    color: colors.textMuted,
  },
  
  eventCount: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: colors.white,
    borderRadius: 12,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
    elevation: 3,
  },
  eventCountText: {
    color: colors.danger,
    fontSize: 10,
    fontWeight: 'bold',
  },
  legend: {
    marginTop: 24,
    padding: 24,
    backgroundColor: colors.white,
    borderRadius: 20,
    boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
    elevation: 8,
  },
  legendTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: '45%',
    marginBottom: 12,
  },
  legendColor: {
    width: 28,
    height: 28,
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 2,
    borderColor: colors.border,
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
    elevation: 2,
  },
  legendText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
    flex: 1,
  },
});

const CalendarView: React.FC<CalendarViewProps> = ({ events, onDateSelect, selectedDate }) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);

  const generateCalendarDays = useCallback(() => {
    console.log('🗓️ Generating calendar days with fixed availability colors...');
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
    
    console.log('✅ Calendar days generated with availability colors:', days.length);
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
