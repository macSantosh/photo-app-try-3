import React, { useState, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  Dimensions, 
  Platform, 
  ActivityIndicator,
  Alert 
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { colors, typography, spacing, borderRadius, shadows } from '../utils/styles';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../types';
import { Ionicons } from '@expo/vector-icons';
import * as ImageManipulator from 'expo-image-manipulator';
import logger from '../utils/logger';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// US Visa Photo Constants
const PASSPORT_ASPECT_RATIO = 1; // 1:1 square for passport photos
const CROP_PADDING = 20;

// US Visa Photo Requirements (in pixels, assuming 300 DPI for high quality)
const HEAD_HEIGHT_MIN = 300; // 1 inch at 300 DPI
const HEAD_HEIGHT_MAX = 413; // 1 3/8 inches at 300 DPI
const EYE_HEIGHT_MIN = 338; // 1 1/8 inches at 300 DPI
const EYE_HEIGHT_MAX = 413; // 1 3/8 inches at 300 DPI

type ImageLayoutInfo = {
  width: number;
  height: number;
  x: number;
  y: number;
  scale: number;
};

export const PhotoCropScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'PhotoCrop'>>();
  const [imageLayout, setImageLayout] = useState<ImageLayoutInfo | null>(null);
  const [isCropping, setCropping] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  
  const imageRef = useRef<Image>(null);
  
  // Gesture values
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  // Calculate the crop frame dimensions
  const cropFrameSize = Math.min(SCREEN_WIDTH - CROP_PADDING * 2, SCREEN_HEIGHT * 0.5);
  
  // Calculate guide positions based on US visa requirements
  const headHeightMin = cropFrameSize * (HEAD_HEIGHT_MIN / 600); // 600px is 2 inches at 300 DPI
  const headHeightMax = cropFrameSize * (HEAD_HEIGHT_MAX / 600);
  const eyeHeightMin = cropFrameSize * (EYE_HEIGHT_MIN / 600);
  const eyeHeightMax = cropFrameSize * (EYE_HEIGHT_MAX / 600);

  const handleImageLoad = () => {
    if (imageRef.current) {
      imageRef.current.measure((x, y, width, height, pageX, pageY) => {
        const imageInfo = {
          width,
          height,
          x: pageX,
          y: pageY,
          scale: 1
        };
        setImageLayout(imageInfo);
        // Reset transformations when image loads
        scale.value = 1;
        translateX.value = 0;
        translateY.value = 0;
        savedScale.value = 1;
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      });
    }
  };

  const cropImage = async () => {
    if (!imageLayout) {
      Alert.alert('Error', 'Cannot crop image, image layout information is missing.');
      return;
    }

    try {
      setCropping(true);

      // Calculate the visible portion of the image
      const imageWidth = imageLayout.width;
      const imageHeight = imageLayout.height;
      const scaledWidth = imageWidth * scale.value;
      const scaledHeight = imageHeight * scale.value;

      // Calculate the center point of the visible image
      const centerX = (imageWidth / 2) + (translateX.value / scale.value);
      const centerY = (imageHeight / 2) + (translateY.value / scale.value);

      // Calculate the crop area
      const cropSize = cropFrameSize / scale.value;
      const cropArea = {
        originX: Math.max(0, centerX - (cropSize / 2)),
        originY: Math.max(0, centerY - (cropSize / 2)),
        width: cropSize,
        height: cropSize
      };

      // Ensure crop area doesn't exceed image bounds
      cropArea.originX = Math.min(cropArea.originX, imageWidth - cropArea.width);
      cropArea.originY = Math.min(cropArea.originY, imageHeight - cropArea.height);

      logger.debug('Cropping image with parameters', {
        component: 'PhotoCropScreen',
        cropArea,
        imageLayout,
        transform: { scale: scale.value, translateX: translateX.value, translateY: translateY.value }
      });

      // Perform the actual crop operation
      const result = await ImageManipulator.manipulateAsync(
        route.params?.photoUri,
        [
          {
            crop: cropArea
          }
        ],
        { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
      );

      // Navigate to preview screen with the cropped image
      navigation.navigate('PhotoPreview', { photoUri: result.uri });
    } catch (error) {
      logger.error('Failed to crop image', error as Error, { component: 'PhotoCropScreen' });
      Alert.alert(
        'Error',
        'Failed to crop the image. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setCropping(false);
    }
  };

  // Define pinch gesture
  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      savedScale.value = scale.value;
    })
    .onUpdate((e) => {
      // Limit scale between 0.5 and 3
      const newScale = savedScale.value * e.scale;
      scale.value = Math.min(Math.max(newScale, 0.5), 3);
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  // Define pan gesture
  const panGesture = Gesture.Pan()
    .onStart(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    })
    .onUpdate((e) => {
      if (!imageLayout) return;

      // Calculate bounds based on current scale and image dimensions
      const scaledWidth = imageLayout.width * scale.value;
      const scaledHeight = imageLayout.height * scale.value;
      const maxTranslateX = Math.max(0, (scaledWidth - cropFrameSize) / 2);
      const maxTranslateY = Math.max(0, (scaledHeight - cropFrameSize) / 2);

      // Apply translation with bounds
      translateX.value = Math.min(
        Math.max(savedTranslateX.value + e.translationX, -maxTranslateX),
        maxTranslateX
      );
      translateY.value = Math.min(
        Math.max(savedTranslateY.value + e.translationY, -maxTranslateY),
        maxTranslateY
      );
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  // Combine gestures
  const combinedGesture = Gesture.Simultaneous(pinchGesture, panGesture);

  // Animated styles for image
  const animatedImageStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.light} />
        </TouchableOpacity>
        <Text style={styles.title}>Crop Photo</Text>
        <TouchableOpacity 
          style={styles.guideButton}
          onPress={() => setShowGuide(!showGuide)}
        >
          <Ionicons name={showGuide ? "eye-off" : "eye"} size={24} color={colors.text.light} />
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionText}>US Visa Photo Requirements:</Text>
          <Text style={styles.instructionDetail}>• Head height: 1" to 1 3/8" (25mm to 35mm)</Text>
          <Text style={styles.instructionDetail}>• Eye height: 1 1/8" to 1 3/8" from bottom</Text>
          <Text style={styles.instructionDetail}>• Neutral expression, both eyes open</Text>
          <Text style={styles.instructionDetail}>• Face centered in frame</Text>
          <Text style={styles.instructionDetail}>• White or off-white background</Text>
        </View>

        {/* Photo area with crop overlay */}
        <View style={styles.photoContainer}>
          <GestureDetector gesture={combinedGesture}>
            <Animated.View style={[styles.imageContainer, animatedImageStyle]}>
              <Image
                ref={imageRef}
                source={{ uri: route.params?.photoUri }}
                style={styles.image}
                resizeMode="contain"
                onLoad={handleImageLoad}
              />
            </Animated.View>
          </GestureDetector>

          {/* Crop frame */}
          <View 
            style={[
              styles.cropFrame, 
              { 
                width: cropFrameSize, 
                height: cropFrameSize,
              }
            ]}
          />

          {/* Guide overlays */}
          {showGuide && (
            <View 
              style={[
                styles.guideOverlay, 
                { 
                  width: cropFrameSize, 
                  height: cropFrameSize,
                }
              ]}
            >
              {/* Head height guides */}
              <View style={[
                styles.headGuide, 
                { 
                  height: headHeightMin,
                  top: cropFrameSize * 0.1,
                  borderColor: colors.secondary.orange
                }
              ]}>
                <Text style={styles.guideText}>Min Head Height</Text>
              </View>

              <View style={[
                styles.headGuide, 
                { 
                  height: headHeightMax,
                  top: cropFrameSize * 0.1,
                  borderColor: colors.secondary.red
                }
              ]}>
                <Text style={styles.guideText}>Max Head Height</Text>
              </View>

              {/* Eye height guides */}
              <View style={[
                styles.eyeLine, 
                { 
                  top: cropFrameSize - eyeHeightMin,
                  borderColor: colors.secondary.green
                }
              ]}>
                <Text style={styles.eyeLineText}>Min Eye Height</Text>
              </View>

              <View style={[
                styles.eyeLine, 
                { 
                  top: cropFrameSize - eyeHeightMax,
                  borderColor: colors.secondary.orange
                }
              ]}>
                <Text style={styles.eyeLineText}>Max Eye Height</Text>
              </View>

              {/* Center vertical line */}
              <View style={styles.centerLine} />
            </View>
          )}
        </View>

        {/* Action buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.primaryButton, isCropping && styles.buttonDisabled]}
            onPress={cropImage}
            disabled={isCropping}
          >
            {isCropping ? (
              <ActivityIndicator color={colors.text.light} />
            ) : (
              <>
                <Ionicons name="crop" size={24} color={colors.text.light} />
                <Text style={styles.buttonText}>Crop Photo</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary.navy,
    paddingTop: Platform.OS === 'ios' ? spacing.xxl + spacing.md : spacing.xl,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  backButton: {
    padding: spacing.sm,
  },
  guideButton: {
    padding: spacing.sm,
  },
  title: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.xl,
    fontWeight: '700',
    color: colors.text.light,
  },
  contentContainer: {
    flex: 1,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  instructionsContainer: {
    backgroundColor: colors.background.light,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    width: '100%',
    ...shadows.sm,
  },
  instructionText: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  instructionDetail: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  photoContainer: {
    width: '100%',
    height: SCREEN_HEIGHT * 0.5,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: colors.background.light,
    borderRadius: borderRadius.lg,
    ...shadows.md,
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  cropFrame: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: colors.secondary.green,
    backgroundColor: 'transparent',
  },
  guideOverlay: {
    position: 'absolute',
    backgroundColor: 'transparent',
  },
  headGuide: {
    position: 'absolute',
    width: '100%',
    borderWidth: 2,
    borderStyle: 'dashed',
    backgroundColor: 'transparent',
  },
  guideText: {
    position: 'absolute',
    top: -20,
    left: 10,
    color: colors.text.light,
    fontSize: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 4,
    borderRadius: 4,
  },
  eyeLine: {
    position: 'absolute',
    width: '100%',
    borderWidth: 2,
    borderStyle: 'dashed',
    backgroundColor: 'transparent',
  },
  eyeLineText: {
    position: 'absolute',
    bottom: -20,
    left: 10,
    color: colors.text.light,
    fontSize: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 4,
    borderRadius: 4,
  },
  centerLine: {
    position: 'absolute',
    width: 2,
    height: '100%',
    backgroundColor: colors.secondary.green,
    left: '50%',
    transform: [{ translateX: -1 }],
  },
  actionButtons: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: colors.primary.navy,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
    ...shadows.sm,
  },
  buttonText: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.text.light,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    backgroundColor: colors.background.light,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...shadows.sm,
  },
  tipText: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginLeft: spacing.sm,
  }
});
