import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { UploadScreen } from '../screens/UploadScreen';
import { CameraScreen } from '../screens/CameraScreen';
import { PhotoPreviewScreen } from '../screens/PhotoPreviewScreen';
import { PhotoCropScreen } from '../screens/PhotoCropScreen';
import { colors } from '../utils/styles';
import { RootStackParamList } from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.primary.white },
        }}
      >
        <Stack.Screen 
          name="Upload" 
          component={UploadScreen}
        />
        <Stack.Screen
          name="Camera"
          component={CameraScreen}
          options={{
            animation: 'slide_from_bottom',
            gestureEnabled: true,
            gestureDirection: 'vertical',
          }}
        />
        <Stack.Screen 
          name="PhotoPreview" 
          component={PhotoPreviewScreen}
          options={{
            animation: 'slide_from_bottom',
            gestureDirection: 'vertical',
          }}
        />
        <Stack.Screen 
          name="PhotoCrop" 
          component={PhotoCropScreen}
          options={{
            animation: 'slide_from_right',
            gestureEnabled: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
