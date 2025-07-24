// hooks/useAppTheme.ts
import { useColorScheme } from 'react-native'

export const useAppTheme = () => {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'

  const colors = {
    background: isDark ? '#4B4376' : '#F7F9FA',
    buttons: '#00A7D3',
    text: isDark ? '#E0F7FA' : '#333',
    inputBackground: isDark ? 'rgba(224, 247, 250, 0.1)' : '#FFFFFF',
    inputBorder: isDark ? 'rgba(224, 247, 250, 0.3)' : '#E0E0E0',
    inputText: isDark ? '#E0F7FA' : '#333',
    placeholderText: isDark ? 'rgba(224, 247, 250, 0.5)' : '#999',
    cardBackground: isDark ? 'rgba(255, 255, 255, 0.05)' : '#FFFFFF',
    // Add more colors as needed
  }

  return {
    colors,
    isDark,
  }
}
