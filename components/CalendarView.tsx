
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
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  navButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    minWidth: 40,
    alignItems: 'center',
    boxShadow: '0 4px 12px rgba(255, 107, 107, 0.3)',
    elevation: 4,
  },
  navButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
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
    fontSize: 13,
    color: colors.white,
    textAlign: 'center',
    fontWeight: '600',
  },
  weekHeader: {
    flexDirection: 'row',
    marginBottom: 12,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 6,
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    elevation: 3,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
    color: colors.text,
    paddingVertical: 4,
    fontSize: 11,
  },
  calendarGrid: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 6,
    boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
    elevation: 8,
  },
  calendarRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  dayContainer: {
    flex: 1,
    aspectRatio: 1,
    padding: 1,
  },
  emptyDayContainer: {
    flex: 1,
    aspectRatio: 1,
    padding: 1,
  },
  dayButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
    position: 'relative',
    boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
    elevation: 2,
    minHeight: 32,
  },
  dayText: {
    fontSize: 12,
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
    borderWidth: 2.5,
    boxShadow: '0 6px 16px rgba(255, 107, 107, 0.4)',
    elevation: 6,
  },
  todayDay: {
    backgroundColor: colors.today,
    borderColor: colors.today,
    borderWidth: 2.5,
    boxShadow: '0 4px 12px rgba(69, 183, 209, 0.4)',
    elevation: 5,
  },
  pastDay: {
    backgroundColor: colors.past,
    borderColor: colors.past,
    opacity: 0.6,
  },
  
  // FIXED TEXT COLORS
  availableText: {
    color: colors.white, // White text on green background
    fontWeight: 'bold',
    fontSize: 12,
  },
  occupiedText: {
    color: colors.white, // White text on red background
    fontWeight: 'bold',
    fontSize: 12,
  },
  selectedText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 12,
  },
  todayText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 12,
  },
  pastText: {
    color: colors.textMuted,
    fontSize: 12,
  },
  
  eventCount: {
    position: 'absolute',
    top: 1,
    right: 1,
    backgroundColor: colors.white,
    borderRadius: 6,
    minWidth: 14,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
    elevation: 3,
  },
  eventCountText: {
    color: colors.danger,
    fontSize: 8,
    fontWeight: 'bold',
  },
  legend: {
    marginTop: 20,
    padding: 16,
    backgroundColor: colors.white,
    borderRadius: 16,
    boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
    elevation: 8,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: '45%',
    marginBottom: 8,
  },
  legendColor: {
    width: 20,
    height: 20,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1.5,
    borderColor: colors.border,
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
    elevation: 2,
  },
  legendText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '600',
    flex: 1,
  },
});

// Helper function to get the correct number of days in a month
const getDaysInMonth = (year: number, month: number): number => {
  // Create a date for the first day of the next month, then subtract one day
  // This gives us the last day of the current month
  return new Date(year, month + 1, 0).getDate();
};

// Helper function to validate that we have the correct number of days for each month
const validateMonthDays = (year: number, month: number, expectedDays: number): boolean => {
  const actualDays = getDaysInMonth(year, month);
  console.log(`📅 Month ${month + 1}/${year}: Expected ${expectedDays} days, Got ${actualDays} days`);
  return actualDays === expectedDays;
};

const CalendarView: React.FC<CalendarViewProps> = ({ events, onDateSelect, selectedDate }) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [calendarRows, setCalendarRows] = useState<(CalendarDay | null)[][]>([]);

  const generateCalendarDays = useCallback(() => {
    console.log('🗓️ Generating calendar days for current month only...');
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth(); // 0-based (0 = January, 11 = December)
    
    // Get the correct number of days in this month
    const daysInMonth = getDaysInMonth(year, month);
    
    // Validate against expected days for common months
    const monthDaysMap: { [key: number]: number } = {
      0: 31,  // January
      1: year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 29 : 28, // February (leap year check)
      2: 31,  // March
      3: 30,  // April
      4: 31,  // May
      5: 30,  // June
      6: 31,  // July
      7: 31,  // August
      8: 30,  // September
      9: 31,  // October
      10: 30, // November
      11: 31  // December
    };
    
    const expectedDays = monthDaysMap[month];
    if (daysInMonth !== expectedDays) {
      console.error(`❌ CALENDAR ERROR: Month ${month + 1}/${year} should have ${expectedDays} days but got ${daysInMonth}`);
    } else {
      console.log(`✅ CALENDAR CORRECT: Month ${month + 1}/${year} has correct ${daysInMonth} days`);
    }
    
    // Get first day of the month and its day of week
    const firstDay = new Date(year, month, 1);
    const startDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time for accurate comparison
    const todayString = today.toISOString().split('T')[0];
    
    console.log(`📅 ${getMonthName(month)} ${year}: ${daysInMonth} days, starts on ${getDayName(startDayOfWeek)}`);
    
    // Create array to hold all calendar cells (including empty ones for alignment)
    const allCells: (CalendarDay | null)[] = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startDayOfWeek; i++) {
      allCells.push(null);
    }
    
    // Add all days of the current month (1 to daysInMonth)
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      date.setHours(0, 0, 0, 0); // Reset time for accurate comparison
      const dateString = date.toISOString().split('T')[0];
      
      const dayEvents = events.filter(e => e.date === dateString);
      
      allCells.push({
        date: dateString,
        isCurrentMonth: true,
        isToday: dateString === todayString,
        isPast: date < today,
        hasEvent: dayEvents.length > 0,
        eventCount: dayEvents.length,
      });
    }
    
    // Organize cells into rows of 7 days each
    const rows: (CalendarDay | null)[][] = [];
    for (let i = 0; i < allCells.length; i += 7) {
      const row = allCells.slice(i, i + 7);
      // Ensure each row has exactly 7 cells
      while (row.length < 7) {
        row.push(null);
      }
      rows.push(row);
    }
    
    console.log(`✅ Calendar generated: ${daysInMonth} days in ${rows.length} rows`);
    console.log(`📊 Total cells: ${allCells.length}, Empty cells at start: ${startDayOfWeek}`);
    
    // Log the actual days being displayed for verification
    const actualDays = allCells.filter(cell => cell !== null).map(cell => cell ? new Date(cell.date).getDate() : null);
    console.log(`🔍 Days displayed: ${actualDays.join(', ')}`);
    
    setCalendarRows(rows);
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
    console.log(`🔄 Navigating to: ${getMonthName(newMonth.getMonth())} ${newMonth.getFullYear()}`);
  };

  const getDateStyle = (day: CalendarDay) => {
    const styles_array = [styles.dayButton];
    
    if (day.date === selectedDate) {
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
    
    if (day.date === selectedDate) {
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
          🎯 Verde = Disponible | Rojo = Ocupado | Solo días del mes actual
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

      {/* Calendar Grid - Only Current Month Days */}
      <View style={styles.calendarGrid}>
        {calendarRows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.calendarRow}>
            {row.map((day, dayIndex) => (
              <View key={`${rowIndex}-${dayIndex}`} style={day ? styles.dayContainer : styles.emptyDayContainer}>
                {day ? (
                  <TouchableOpacity
                    style={getDateStyle(day)}
                    onPress={() => onDateSelect(day.date)}
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
                ) : (
                  // Empty cell for alignment - completely invisible
                  <View style={{ flex: 1 }} />
                )}
              </View>
            ))}
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

// Helper functions for better logging
const getMonthName = (month: number): string => {
  const names = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  return names[month];
};

const getDayName = (day: number): string => {
  const names = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return names[day];
};

export default CalendarView;
