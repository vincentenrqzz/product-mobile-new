import { Linking } from 'react-native'

const openWazeAppStore = () => {
  const link =
    'itms-apps://apps.apple.com/tr/app/waze-navigation-live-traffic/id323229106?l=tr'
  Linking.openURL(link).catch((err) => {})
}

export default openWazeAppStore
