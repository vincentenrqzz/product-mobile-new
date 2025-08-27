/**
 * Safe date utilities to prevent errors with undefined or invalid dates
 */

export const isValidDate = (date: any): date is Date => {
  return date instanceof Date && !isNaN(date.getTime())
}

export const safeGetTime = (date: any): number => {
  if (!date) return 0
  if (isValidDate(date)) return date.getTime()
  
  // Try to create a Date from the value if it's not a Date object
  if (typeof date === 'string' || typeof date === 'number') {
    const newDate = new Date(date)
    if (isValidDate(newDate)) return newDate.getTime()
  }
  
  return 0
}

export const createSafeDate = (dateValue: any): Date => {
  if (!dateValue) return new Date(0)
  
  if (isValidDate(dateValue)) return dateValue
  
  const date = new Date(dateValue)
  return isValidDate(date) ? date : new Date(0)
}

export const formatSafeDate = (date: any, options?: Intl.DateTimeFormatOptions): string => {
  const safeDate = createSafeDate(date)
  
  if (safeDate.getTime() === 0) {
    return ''
  }
  
  return safeDate.toLocaleDateString('en-US', options)
}

export const formatSafeDateTime = (date: any): string => {
  const safeDate = createSafeDate(date)
  
  if (safeDate.getTime() === 0) {
    return ''
  }
  
  const year = safeDate.getFullYear()
  const month = String(safeDate.getMonth() + 1).padStart(2, '0')
  const day = String(safeDate.getDate()).padStart(2, '0')
  const hours = String(safeDate.getHours()).padStart(2, '0')
  const minutes = String(safeDate.getMinutes()).padStart(2, '0')
  const seconds = String(safeDate.getSeconds()).padStart(2, '0')
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}