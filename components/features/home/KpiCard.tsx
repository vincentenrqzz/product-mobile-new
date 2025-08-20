import { FontAwesome5 } from '@expo/vector-icons'
import { Text, View } from 'react-native'

const KpiCard = ({
  title,
  value,
  icon,
  bgColor,
  lightBG,
}: {
  title: string
  value: number
  icon: string
  bgColor: string
  lightBG: string
}) => (
  <View className={`gap-4 rounded-xl p-3 ${bgColor}`} style={{ width: '48%' }}>
    <View className="flex-row justify-between">
      <FontAwesome5 name={icon} size={24} color="#FFF" />
      <View className={`rounded-full  px-2 ${lightBG}`}>
        <Text className="text-lg font-bold text-white">Today</Text>
      </View>
    </View>
    <View>
      <Text className="text-4xl font-bold text-white">{value}</Text>
      <Text className="text-xl font-bold text-white">{title}</Text>
    </View>
  </View>
)

export default KpiCard
