import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { CameraOverlay } from '../components/CameraOverlay';
import logger from '../utils/logger';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';


type CameraFacing = 'front' | 'back';

export const CameraScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [facing, setFacing] = useState<CameraFacing>('front');

  useEffect(() => {
    // Request permissions if they haven't been determined yet
    if (permission === null) {
      requestCameraPermissions();
    }
  }, [permission]);

  const requestCameraPermissions = async () => {
    try {
      await requestPermission();
    } catch (error) {
      logger.error('Error requesting camera permissions', error as Error, { component: 'CameraScreen' });
      Alert.alert(
        'Permission Error',
        'Could not request camera permissions. Please try again or check your device settings.'
      );
    }
  };

  const onCameraReady = () => {
    setIsCameraReady(true);
    logger.debug('Camera ready', { component: 'CameraScreen' });
  };

  const takePicture = async () => {
    if (cameraRef.current && isCameraReady && !isProcessing) {
      try {
        setIsProcessing(true);
        logger.info('Taking picture', { component: 'CameraScreen' });
        
        const photo = await cameraRef.current.takePictureAsync({
          quality: 1,
        });
        
        logger.info('Picture taken successfully', { 
          component: 'CameraScreen',
          photoUri: photo.uri,
          width: photo.width,
          height: photo.height
        });
        
        navigation.navigate('Upload', { photoUri: photo.uri });
      } catch (error) {
        const typedError = error as Error;
        logger.error('Error taking picture', typedError, { 
          component: 'CameraScreen',
          cameraReady: isCameraReady
        });
        
        Alert.alert(
          'Camera Error',
          'Failed to take a picture. Please try again.',
          [{ text: 'OK' }]
        );
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  // If permission is still loading
  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Requesting camera permission...</Text>
      </View>
    );
  }

  // If permission is denied
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>No access to camera</Text>
        <Text style={styles.subText}>
          We need camera access to take passport photos
        </Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={requestPermission}
        >
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, styles.backButton]} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        onCameraReady={onCameraReady}
        onMountError={(error: { message: string }) => {
          logger.error('Camera mount error', new Error(error.message), { component: 'CameraScreen' });
          Alert.alert('Camera Error', 'Could not initialize camera. Please restart the app.');
        }}
      >
        <TouchableOpacity 
          style={styles.closeButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={30} color="white" />
        </TouchableOpacity>
        <CameraOverlay />
        <View style={styles.controls}>
          <TouchableOpacity style={styles.controlButton} onPress={toggleCameraFacing}>
            <Ionicons name="camera-reverse" size={30} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.captureButton, 
              !isCameraReady && styles.buttonDisabled,
              isProcessing && styles.buttonProcessing
            ]}
            onPress={takePicture}
            disabled={!isCameraReady || isProcessing}
          >
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton} onPress={toggleCameraFacing}>
            <Ionicons name="information-circle" size={30} color="white" />
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  controls: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    marginBottom: 40,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#000',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonProcessing: {
    backgroundColor: '#cccccc',
  },
  backButton: {
    marginTop: 15,
    backgroundColor: '#3498db',
  },
  button: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    width: 200,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    color: 'black',
    fontWeight: 'bold',
  },
  text: {
    color: 'white',
    fontSize: 20,
    textAlign: 'center',
    marginTop: 50,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  subText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginHorizontal: 40,
    marginBottom: 20,
  },
  controlButton: {
    // backgroundColor: 'rgba(255, 255, 255, 0.3)',
    // padding: 10,
    // borderRadius: 20,
    alignSelf: 'flex-end',
    color: 'white',
    fontSize: 24,
    marginBottom: 20,

  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 20,
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
  },
});
