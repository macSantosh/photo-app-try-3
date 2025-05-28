import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { UploadScreen } from '../screens/UploadScreen';
import { COLORS } from '../utils/styles';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.primary.white },
        }}
      >
        <Stack.Screen 
          name="Upload" 
          component={UploadScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
