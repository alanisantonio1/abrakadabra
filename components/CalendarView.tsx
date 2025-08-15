
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
const validateMonthDays = (year: number, month: number): number => {
  const actualDays = getDaysInMonth(year, month);
  
  // Expected days for each month
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
  
  console.log(`📅 CALENDAR VALIDATION: ${getMonthName(month)} ${year}`);
  console.log(`   Expected days: ${expectedDays}`);
  console.log(`   Actual days: ${actualDays}`);
  
  if (actualDays !== expectedDays) {
    console.error(`❌ CALENDAR ERROR: Month ${month + 1}/${year} should have ${expectedDays} days but got ${actualDays}`);
  } else {
    console.log(`✅ CALENDAR CORRECT: ${getMonthName(month)} ${year} has correct ${actualDays} days`);
  }
  
  return actualDays;
};

// FIXED: Helper function to format date correctly without timezone issues
const formatDateString = (year: number, month: number, day: number): string => {
  // Use local date formatting to avoid timezone issues
  const monthStr = (month + 1).toString().padStart(2, '0');
  const dayStr = day.toString().padStart(2, '0');
  return `${year}-${monthStr}-${dayStr}`;
};

// FIXED: Helper function to parse date string correctly
const parseDateString = (dateString: string): { year: number; month: number; day: number } => {
  const parts = dateString.split('-');
  return {
    year: parseInt(parts[0], 10),
    month: parseInt(parts[1], 10) - 1, // Convert to 0-based month
    day: parseInt(parts[2], 10)
  };
};

// FIXED: Helper function to get day of week correctly
const getDayOfWeek = (dateString: string): number => {
  const { year, month, day } = parseDateString(dateString);
  // Create date in local timezone to avoid day shifting
  const date = new Date(year, month, day);
  return date.getDay(); // 0 = Sunday, 1 = Monday, etc.
};

// FIXED: Helper function to format date for display
const formatDateForDisplay = (dateString: string): string => {
  const { year, month, day } = parseDateString(dateString);
  const date = new Date(year, month, day);
  const dayOfWeek = getDayOfWeek(dateString);
  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  
  return `${dayNames[dayOfWeek]} ${day} de ${monthNames[month]}`;
};

const CalendarView: React.FC<CalendarViewProps> = ({ events, onDateSelect, selectedDate }) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [calendarRows, setCalendarRows] = useState<(CalendarDay | null)[][]>([]);

  const generateCalendarDays = useCallback(() => {
    console.log('🗓️ ===== GENERATING CALENDAR =====');
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth(); // 0-based (0 = January, 11 = December)
    
    console.log(`📅 Generating calendar for: ${getMonthName(month)} ${year} (month index: ${month})`);
    
    // Get the correct number of days in this month
    const daysInMonth = validateMonthDays(year, month);
    
    // Get first day of the month and its day of week
    const firstDay = new Date(year, month, 1);
    const startDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    console.log(`📅 First day of ${getMonthName(month)}: ${getDayName(startDayOfWeek)} (index: ${startDayOfWeek})`);
    console.log(`📅 Days in ${getMonthName(month)}: ${daysInMonth}`);
    
    // Create today's date for comparison (in local timezone)
    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth();
    const todayDate = today.getDate();
    
    console.log(`📅 Today: ${todayYear}-${todayMonth + 1}-${todayDate}`);
    
    // Create array to hold all calendar cells (including empty ones for alignment)
    const allCells: (CalendarDay | null)[] = [];
    
    // Add empty cells for days before the first day of the month
    console.log(`📅 Adding ${startDayOfWeek} empty cells at the beginning`);
    for (let i = 0; i < startDayOfWeek; i++) {
      allCells.push(null);
    }
    
    // Add all days of the current month ONLY (1 to daysInMonth)
    console.log(`📅 Adding days 1 to ${daysInMonth} for ${getMonthName(month)} ${year}`);
    for (let day = 1; day <= daysInMonth; day++) {
      // FIXED: Use proper date formatting without timezone issues
      const dateString = formatDateString(year, month, day);
      
      // Check if this is today
      const isToday = (year === todayYear && month === todayMonth && day === todayDate);
      
      // Check if this date is in the past
      const isPast = (year < todayYear) || 
                    (year === todayYear && month < todayMonth) || 
                    (year === todayYear && month === todayMonth && day < todayDate);
      
      // Find events for this date
      const dayEvents = events.filter(e => e.date === dateString);
      
      // FIXED: Log the day of week for verification
      const dayOfWeek = getDayOfWeek(dateString);
      const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      console.log(`📅 Day ${day}: ${dateString} (${dayNames[dayOfWeek]}) - Events: ${dayEvents.length} - Today: ${isToday} - Past: ${isPast}`);
      
      allCells.push({
        date: dateString,
        isCurrentMonth: true,
        isToday: isToday,
        isPast: isPast,
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
    
    console.log(`✅ Calendar generated successfully:`);
    console.log(`   - Month: ${getMonthName(month)} ${year}`);
    console.log(`   - Days in month: ${daysInMonth}`);
    console.log(`   - Empty cells at start: ${startDayOfWeek}`);
    console.log(`   - Total cells: ${allCells.length}`);
    console.log(`   - Rows: ${rows.length}`);
    
    // Log the actual days being displayed for verification
    const actualDays = allCells
      .filter(cell => cell !== null)
      .map(cell => cell ? parseDateString(cell.date).day : null);
    console.log(`🔍 Days displayed: [${actualDays.join(', ')}]`);
    
    // Verify no days from other months are included
    const datesFromOtherMonths = allCells
      .filter(cell => cell !== null)
      .filter(cell => {
        if (!cell) return false;
        const { year: cellYear, month: cellMonth } = parseDateString(cell.date);
        return cellMonth !== month || cellYear !== year;
      });
    
    if (datesFromOtherMonths.length > 0) {
      console.error(`❌ ERROR: Found ${datesFromOtherMonths.length} dates from other months!`);
      datesFromOtherMonths.forEach(cell => {
        if (cell) {
          const { year: cellYear, month: cellMonth } = parseDateString(cell.date);
          console.error(`   - ${cell.date} (${getMonthName(cellMonth)} ${cellYear})`);
        }
      });
    } else {
      console.log(`✅ VERIFICATION PASSED: All dates belong to ${getMonthName(month)} ${year}`);
    }
    
    console.log('🗓️ ===== CALENDAR GENERATION COMPLETE =====');
    
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

  // FIXED: Date selection handler with proper logging
  const handleDateSelect = (dateString: string) => {
    console.log('🎯 ===== DATE SELECTION =====');
    console.log(`📅 Selected date string: ${dateString}`);
    console.log(`📅 Formatted display: ${formatDateForDisplay(dateString)}`);
    console.log(`📅 Day of week: ${getDayOfWeek(dateString)} (${['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][getDayOfWeek(dateString)]})`);
    
    // Call the parent's onDateSelect with the correct date string
    onDateSelect(dateString);
  };

  // FIXED: Get date style - only show red for dates with actual events, not selected dates
  const getDateStyle = (day: CalendarDay) => {
    const styles_array = [styles.dayButton];
    
    // Priority order: Today > Past > Multiple Events > Has Event > Selected > Available
    if (day.isToday) {
      styles_array.push(styles.todayDay);
    } else if (day.isPast) {
      styles_array.push(styles.pastDay);
    } else if (day.eventCount > 1) {
      // MULTIPLE EVENTS - Darker red
      styles_array.push(styles.multipleEventsDay);
    } else if (day.hasEvent) {
      // OCCUPIED - RED (only for dates with actual events)
      styles_array.push(styles.occupiedDay);
    } else if (day.date === selectedDate) {
      // SELECTED - Primary color (only if no events)
      styles_array.push(styles.selectedDay);
    } else {
      // AVAILABLE - GREEN
      styles_array.push(styles.availableDay);
    }
    
    return styles_array;
  };

  // FIXED: Get text style - match the date style logic
  const getTextStyle = (day: CalendarDay) => {
    const styles_array = [styles.dayText];
    
    if (day.isToday) {
      styles_array.push(styles.todayText);
    } else if (day.isPast) {
      styles_array.push(styles.pastText);
    } else if (day.hasEvent) {
      // OCCUPIED - WHITE TEXT (for any date with events)
      styles_array.push(styles.occupiedText);
    } else if (day.date === selectedDate) {
      // SELECTED - WHITE TEXT (only if no events)
      styles_array.push(styles.selectedText);
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
          🎯 Verde = Disponible | Rojo = Ocupado (solo con eventos reservados)
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
                    onPress={() => handleDateSelect(day.date)}
                    activeOpacity={0.7}
                  >
                    <Text style={getTextStyle(day)}>
                      {parseDateString(day.date).day}
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
            <Text style={styles.legendText}>❌ Ocupado (con eventos)</Text>
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
