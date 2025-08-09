import { Audio } from 'expo-av';

// Export a function to play the rest timer sound
export async function playRestTimerSound() {
  try {
    const { sound } = await Audio.Sound.createAsync(
      require('../../assets/sound/sound_effect.mp3')
    );

    await sound.playAsync();

    // Optionally unload sound when playback finishes to free resources
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && (status as any).didJustFinish) {
        sound.unloadAsync();
      }
    });
  } catch (error) {
    console.log('Error playing sound:', error);
  }
}
