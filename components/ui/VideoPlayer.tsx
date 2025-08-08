import { useEvent } from 'expo'
import { useVideoPlayer, VideoView } from 'expo-video'
import React, { useRef, useState } from 'react'
import { Button, StyleSheet, View } from 'react-native'

const videoSource =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'

const VideoPlayer = ({ source }: { source: string }) => {
  const ref = useRef<VideoView>(null) // ✅ FIXED typing
  const [useControls, setUseControls] = useState(false)

  const player = useVideoPlayer(source, (player) => {
    player.loop = false
    player.pause()
  })

  const { isPlaying } = useEvent(player, 'playingChange', {
    isPlaying: player.playing,
  })

  const handlePlay = () => {
    if (!isPlaying) {
      setUseControls(true) // Enable native controls
      player.play()
      ref.current?.enterFullscreen()
    } else {
      setUseControls(false) // Enable native controls
      player.pause()
    }
  }

  return (
    <View className="mb-10">
      <VideoView
        ref={ref}
        style={styles.video}
        player={player}
        nativeControls={useControls} // toggle based on play state
        allowsFullscreen
        allowsPictureInPicture={false}
        onFullscreenExit={handlePlay}
      />
      <View className="absolute inset-0 items-center justify-center">
        <Button title={isPlaying ? 'Pause' : 'Play'} onPress={handlePlay} />
      </View>
    </View>
  )
}

export default VideoPlayer

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 50,
    marginBottom: 20,
  },
  video: {
    width: 250,
    height: 200,
    backgroundColor: 'black',
  },
  controlsContainer: {
    padding: 10,
  },
})
