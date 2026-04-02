import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';
import * as FileSystem from 'expo-file-system';
import { router } from 'expo-router';

export default function CameraScreen() {
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  const cameraRef = useRef<Camera>(null);
  const [capturing, setCapturing] = useState(false);

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission]);

  async function handleCapture() {
    if (!cameraRef.current || capturing) return;
    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePhoto({
        flash: 'off',
      });

      // Copy from temp path to app cache so it persists
      const cacheUri =
        FileSystem.cacheDirectory + `food_${Date.now()}.jpg`;
      await FileSystem.copyAsync({
        from: 'file://' + photo.path,
        to: cacheUri,
      });

      router.push({
        pathname: '/log/scan-result',
        params: { photoUri: cacheUri },
      });
    } catch (e) {
      console.error('Capture failed:', e);
      setCapturing(false);
    }
  }

  if (!hasPermission) {
    return (
      <View className="flex-1 bg-black items-center justify-center px-8">
        <Text className="text-white text-center mb-4">
          Camera permission is required to scan food.
        </Text>
        <Pressable
          onPress={requestPermission}
          className="bg-white rounded-2xl px-6 py-3"
        >
          <Text className="font-bold text-black">Grant Permission</Text>
        </Pressable>
        <Pressable onPress={() => router.back()} className="mt-4">
          <Text className="text-gray-400 text-sm">Go back</Text>
        </Pressable>
      </View>
    );
  }

  if (!device) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <Text className="text-white">No camera device found.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <Camera
        ref={cameraRef}
        style={{ flex: 1 }}
        device={device}
        isActive={true}
        photo={true}
      />

      {/* Back button */}
      <Pressable
        onPress={() => router.back()}
        className="absolute top-14 left-5 w-10 h-10 rounded-full bg-black/50 items-center justify-center"
      >
        <Text className="text-white text-lg">←</Text>
      </Pressable>

      {/* Hint */}
      <View className="absolute top-14 left-0 right-0 items-center">
        <View className="bg-black/40 rounded-full px-4 py-1.5">
          <Text className="text-white text-xs font-medium">
            Point at your food
          </Text>
        </View>
      </View>

      {/* Shutter button */}
      <View className="absolute bottom-12 left-0 right-0 items-center">
        <Pressable
          onPress={handleCapture}
          disabled={capturing}
          className="w-20 h-20 rounded-full border-4 border-white items-center justify-center"
          style={{ backgroundColor: capturing ? '#666' : 'rgba(255,255,255,0.2)' }}
        >
          {capturing ? (
            <ActivityIndicator color="white" />
          ) : (
            <View className="w-14 h-14 rounded-full bg-white" />
          )}
        </Pressable>
      </View>
    </View>
  );
}
