
import { format, isAfter, isFuture, startOfDay, isBefore, isToday, parseISO } from "date-fns";
import { toZonedTime } from "date-fns-tz";

const BANGLADESH_TIMEZONE = "Asia/Dhaka";

export const getBangladeshTime = () => {
  return toZonedTime(new Date(), BANGLADESH_TIMEZONE);
};

export const isAfter11PM = (date: Date) => {
  const bdTime = getBangladeshTime();
  const bdDate = format(bdTime, "yyyy-MM-dd");
  const cutoffTime = toZonedTime(new Date(`${bdDate} 23:50:00`), BANGLADESH_TIMEZONE);
  return isAfter(bdTime, cutoffTime);
};

export const isAfter1150PM = (date: Date) => {
  const bdTime = getBangladeshTime();
  const bdDate = format(date, "yyyy-MM-dd");
  const cutoffTime = toZonedTime(new Date(`${bdDate} 23:50:00`), BANGLADESH_TIMEZONE);
  return isAfter(bdTime, cutoffTime);
};

export const isInLateWindow = () => {
  const bdTime = getBangladeshTime();
  const bdDate = format(bdTime, "yyyy-MM-dd");
  const lateStartTime = toZonedTime(new Date(`${bdDate} 11:50:00`), BANGLADESH_TIMEZONE);
  const lateEndTime = toZonedTime(new Date(`${bdDate} 11:55:00`), BANGLADESH_TIMEZONE);
  
  return isAfter(bdTime, lateStartTime) && isBefore(bdTime, lateEndTime);
};

export const isPastDate = (date: Date) => {
  const bdTime = startOfDay(getBangladeshTime());
  return isBefore(startOfDay(date), bdTime);
};

export const isFutureDate = (date: Date) => {
  const bdTime = getBangladeshTime();
  return isFuture(startOfDay(date)) || isAfter(startOfDay(date), startOfDay(bdTime));
};

export const canMarkAttendance = (date: Date) => {
  const today = getBangladeshTime();
  const isDateToday = isToday(toZonedTime(date, BANGLADESH_TIMEZONE));
  
  // Can mark attendance for today (but will be marked as "Late" after 11:50 PM)
  if (isDateToday) return true;
  
  // Can mark attendance for future dates
  if (isFutureDate(date)) return true;
  
  // Cannot mark attendance for past dates
  return false;
};

export const getAutomaticStatus = (date: Date): "present" | "absent" | "late" => {
  const isDateToday = format(date, "yyyy-MM-dd") === format(getBangladeshTime(), "yyyy-MM-dd");
  
  if (isDateToday) {
    if (isInLateWindow()) {
      return "late";
    }
    return isAfter1150PM(date) ? "late" : "present";
  }
  
  // Past dates are automatically marked as absent
  if (isPastDate(date)) {
    return "absent";
  }
  
  return "absent"; // Default for future dates
};
