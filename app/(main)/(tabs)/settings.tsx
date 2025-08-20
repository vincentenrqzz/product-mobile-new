import ParallaxScrollView from '@/components/ParallaxScrollView'
import AppLogo from '@/components/ui/AppLogo'
import { pendingImages, pendingTasks } from '@/lib/constants'
import { startQueueLoop, stopQueueLoop } from '@/services/queues/startQueueLoop'
import useAuthStore from '@/store/auth'
import useTaskStore from '@/store/tasks'
import useUserInfoStore from '@/store/userInfo'
import { MaterialIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { Text, TouchableOpacity, View } from 'react-native'

export default function Settings() {
  //built-in
  const router = useRouter()
  //store
  const { logout, envState } = useAuthStore()
  const { userInfo } = useUserInfoStore()
  const { setPendingImages, setPendingTasks } = useTaskStore()

  return (
    <View className="flex-1">
      <ParallaxScrollView
        // headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
        headerBackgroundColor={{ light: '#FFF', dark: '#FFF' }}
        headerContent={
          <View>
            <View className="flex-row items-center justify-between">
              <AppLogo />
              <Text className="text-lg font-bold">
                {envState} - Version 1.9.2
              </Text>
            </View>
            {/* User info */}
            <View className="flex-row items-center gap-3 border-b-2 border-b-gray-100 py-4">
              <View className="rounded-full bg-gray-500 p-4">
                <MaterialIcons name="person" size={24} color="#fff" />
              </View>
              <View>
                <Text className="text-xl font-bold">
                  {`${userInfo?.name} ${userInfo?.family_name}`}
                </Text>
                <Text className="text-lg">{userInfo?.email}</Text>
              </View>
            </View>
          </View>
        }
        // 👇 key line for ScrollView content
      >
        {/* Make the inner container take all available height */}
        <View className=" flex-grow gap-4 bg-white" style={{ flex: 1 }}>
          {/* Change password */}
          <TouchableOpacity
            className="flex-row items-center justify-between rounded-xl  p-3"
            onPress={() => {
              router.push('/(main)/change-password')
            }}
          >
            <View className="flex-row gap-4 bg-white">
              <MaterialIcons name="password" size={24} />
              <Text className="text-xl font-bold">Change password</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} />
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center justify-between rounded-xl  p-3"
            onPress={async () => {
              startQueueLoop()
              setPendingImages(pendingImages)
              setPendingTasks(pendingTasks)
            }}
          >
            <View className="flex-row gap-4 bg-white">
              <MaterialIcons name="task-alt" size={24} />
              <Text className="text-xl font-bold">Submit task</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} />
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-row items-center justify-between rounded-xl  p-3"
            onPress={async () => {
              stopQueueLoop()
            }}
          >
            <View className="flex-row gap-4 bg-white">
              <MaterialIcons name="stop-circle" size={24} />
              <Text className="text-xl font-bold">Stop task</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} />
          </TouchableOpacity>
        </View>
      </ParallaxScrollView>
      {/* Logout at the very bottom */}
      <TouchableOpacity
        onPress={logout}
        className="mx-auto w-full  items-center justify-center rounded-xl bg-blue-500 p-3"
        style={[
          {
            position: 'absolute',
            bottom: 90,
            width: '90%',
            left: 20,
            right: 20,
          },
        ]}
      >
        <View className="flex-row  gap-4">
          {/* <MaterialIcons name="logout" size={24} color="black" /> */}
          <Text className="text-xl font-bold text-white ">Log out</Text>
        </View>
      </TouchableOpacity>
    </View>
  )
}
