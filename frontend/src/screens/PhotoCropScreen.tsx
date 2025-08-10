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

// Standard passport photo dimensions for digital use
const PASSPORT_PHOTO_SIZE = 600; // 600x600 pixels (2x2 inches at 300 DPI)

// US Visa Photo Requirements (in pixels, assuming 300 DPI for high quality)
const HEAD_HEIGHT_MIN = 300; // 1 inch at 300 DPI
const HEAD_HEIGHT_MAX = 413; // 1 3/8 inches at 300 DPI
const EYE_HEIGHT_MIN = 338; // 1 1/8 inches at 300 DPI
const EYE_HEIGHT_MAX = 413; // 1 3/8 inches at 300 DPI

type ImageLayoutInfo = {
  width: number;
  height: number;
  displayedWidth: number;
  displayedHeight: number;
  x: number;
  y: number;
  scale: number;
};

export const PhotoCropScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'PhotoCrop'>>();
  const [imageLayout, setImageLayout] = useState<ImageLayoutInfo | null>(null);
  const [isCropping, setCropping] = useState(false);
  const [showGuidelines, setShowGuidelines] = useState(true);
  
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
  
  const handleImageLoad = () => {
    if (imageRef.current) {
      // Get the original image dimensions first
      Image.getSize(route.params?.photoUri, 
        (originalWidth, originalHeight) => {
          logger.debug('Original image dimensions', {
            component: 'PhotoCropScreen',
            originalWidth,
            originalHeight,
            aspectRatio: originalWidth / originalHeight
          });

          // Then measure the displayed image container
          imageRef.current?.measure((x, y, width, height, pageX, pageY) => {
            logger.debug('Image container dimensions', {
              component: 'PhotoCropScreen',
              container: { width, height, x, y, pageX, pageY },
              original: { originalWidth, originalHeight },
              platform: Platform.OS
            });
            
            const imageInfo = {
              width: originalWidth,  // Original image dimensions
              height: originalHeight,
              displayedWidth: width, // Container dimensions
              displayedHeight: height,
              x: pageX,
              y: pageY,
              scale: 1
            };
            setImageLayout(imageInfo);
            
            // Reset transformations
            scale.value = withTiming(1);
            translateX.value = withTiming(0);
            translateY.value = withTiming(0);
            savedScale.value = 1;
            savedTranslateX.value = 0;
            savedTranslateY.value = 0;
          });
        },
        (error) => {
          logger.error('Failed to get image size', error, { component: 'PhotoCropScreen' });
        }
      );
    }
  };

  const cropImage = async () => {
    if (!imageLayout) {
      Alert.alert('Error', 'Cannot crop image, image layout information is missing.');
      return;
    }

    try {
      setCropping(true);

      // Original image dimensions
      const originalWidth = imageLayout.width;
      const originalHeight = imageLayout.height;
      
      // Container dimensions where image is displayed
      const containerWidth = imageLayout.displayedWidth;
      const containerHeight = imageLayout.displayedHeight;
      
      // Current transformations
      const currentScale = scale.value;
      const currentTranslateX = translateX.value;
      const currentTranslateY = translateY.value;

      // Calculate how the image is actually displayed within the container with resizeMode: 'contain'
      const containerAspectRatio = containerWidth / containerHeight;
      const imageAspectRatio = originalWidth / originalHeight;
      
      let displayedImageWidth, displayedImageHeight;
      let displayedImageOffsetX, displayedImageOffsetY;
      
      if (imageAspectRatio > containerAspectRatio) {
        // Image is wider - it will be constrained by container width
        displayedImageWidth = containerWidth;
        displayedImageHeight = containerWidth / imageAspectRatio;
        displayedImageOffsetX = 0;
        displayedImageOffsetY = (containerHeight - displayedImageHeight) / 2;
      } else {
        // Image is taller - it will be constrained by container height
        displayedImageWidth = containerHeight * imageAspectRatio;
        displayedImageHeight = containerHeight;
        displayedImageOffsetX = (containerWidth - displayedImageWidth) / 2;
        displayedImageOffsetY = 0;
      }

      // Calculate the scale factor between displayed image and original image
      const imageDisplayScale = displayedImageWidth / originalWidth;

      // Calculate the center of the crop frame (which is at the center of the container)
      const cropFrameCenterX = containerWidth / 2;
      const cropFrameCenterY = containerHeight / 2;

      // Calculate the position on the displayed image (accounting for transformations)
      const scaledImageWidth = displayedImageWidth * currentScale;
      const scaledImageHeight = displayedImageHeight * currentScale;
      
      // Position of the top-left corner of the scaled image
      const imageTopLeftX = displayedImageOffsetX + (displayedImageWidth - scaledImageWidth) / 2 + currentTranslateX;
      const imageTopLeftY = displayedImageOffsetY + (displayedImageHeight - scaledImageHeight) / 2 + currentTranslateY;

      // Convert crop frame center to position on the scaled displayed image
      const cropCenterOnImageX = (cropFrameCenterX - imageTopLeftX) / currentScale;
      const cropCenterOnImageY = (cropFrameCenterY - imageTopLeftY) / currentScale;

      // Convert to original image coordinates
      const cropCenterOriginalX = cropCenterOnImageX / imageDisplayScale;
      const cropCenterOriginalY = cropCenterOnImageY / imageDisplayScale;

      // Calculate crop size in original image coordinates
      const cropSizeOriginal = (cropFrameSize / currentScale) / imageDisplayScale;

      // Calculate crop area bounds
      const originX = Math.max(0, Math.min(
        cropCenterOriginalX - cropSizeOriginal / 2,
        originalWidth - cropSizeOriginal
      ));
      const originY = Math.max(0, Math.min(
        cropCenterOriginalY - cropSizeOriginal / 2,
        originalHeight - cropSizeOriginal
      ));

      const finalCropWidth = Math.min(cropSizeOriginal, originalWidth - originX);
      const finalCropHeight = Math.min(cropSizeOriginal, originalHeight - originY);

      const cropArea = {
        originX,
        originY,
        width: finalCropWidth,
        height: finalCropHeight
      };

      logger.debug('Detailed crop calculation', {
        component: 'PhotoCropScreen',
        original: { width: originalWidth, height: originalHeight },
        container: { width: containerWidth, height: containerHeight },
        displayed: { 
          width: displayedImageWidth, 
          height: displayedImageHeight,
          offsetX: displayedImageOffsetX,
          offsetY: displayedImageOffsetY 
        },
        scaling: { 
          imageDisplayScale,
          currentScale,
          translateX: currentTranslateX,
          translateY: currentTranslateY
        },
        cropFrame: {
          size: cropFrameSize,
          centerX: cropFrameCenterX,
          centerY: cropFrameCenterY
        },
        calculations: {
          scaledImageWidth,
          scaledImageHeight,
          imageTopLeftX,
          imageTopLeftY,
          cropCenterOnImageX,
          cropCenterOnImageY,
          cropCenterOriginalX,
          cropCenterOriginalY,
          cropSizeOriginal
        },
        cropArea
      });

      // Perform the actual crop operation
      const cropResult = await ImageManipulator.manipulateAsync(
        route.params?.photoUri,
        [
          {
            crop: cropArea
          }
        ],
        { compress: 1.0, format: ImageManipulator.SaveFormat.JPEG }
      );
      
      // Resize the cropped image to standard passport photo dimensions
      const finalResult = await ImageManipulator.manipulateAsync(
        cropResult.uri,
        [
          {
            resize: {
              width: PASSPORT_PHOTO_SIZE,
              height: PASSPORT_PHOTO_SIZE
            }
          }
        ],
        { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
      );
      
      logger.debug('Cropped and resized image result', {
        component: 'PhotoCropScreen',
        cropResultUri: cropResult.uri,
        cropResultWidth: cropResult.width,
        cropResultHeight: cropResult.height,
        finalResultUri: finalResult.uri,
        finalResultWidth: finalResult.width,
        finalResultHeight: finalResult.height,
        cropFrameSize,
        originalImageSize: { width: originalWidth, height: originalHeight },
        actualCropSize: { width: finalCropWidth, height: finalCropHeight },
        screenDimensions: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT }
      });

      // Navigate to preview screen with the final processed image
      navigation.navigate('PhotoPreview', { photoUri: finalResult.uri });
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
      if (!imageLayout) return;
      
      // Calculate new scale with bounds
      const newScale = savedScale.value * e.scale;
      const minScale = 0.5;
      const maxScale = Math.max(3, cropFrameSize / Math.min(imageLayout.displayedWidth, imageLayout.displayedHeight));
      
      // Apply scale with bounds
      scale.value = Math.min(Math.max(newScale, minScale), maxScale);
      
      // Adjust translation to keep the image centered on the pinch point
      const focalX = e.focalX - imageLayout.x;
      const focalY = e.focalY - imageLayout.y;
      
      translateX.value = savedTranslateX.value + (focalX - focalX * e.scale);
      translateY.value = savedTranslateY.value + (focalY - focalY * e.scale);
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  // Define pan gesture
  const panGesture = Gesture.Pan()
    .onStart(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    })
    .onUpdate((e) => {
      if (!imageLayout) return;

      // Calculate scaled dimensions
      const scaledWidth = imageLayout.displayedWidth * scale.value;
      const scaledHeight = imageLayout.displayedHeight * scale.value;

      // Calculate bounds based on current scale and image dimensions
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
        <Text style={styles.title}>Position & Crop Photo</Text>
        <TouchableOpacity 
          style={styles.guidelineToggle}
          onPress={() => setShowGuidelines(!showGuidelines)}
        >
          <Ionicons 
            name={showGuidelines ? "eye-off-outline" : "eye-outline"} 
            size={24} 
            color={colors.text.light} 
          />
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
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

          {/* Crop frame with passport guidelines */}
          <View 
            style={[
              styles.cropFrame, 
              { 
                width: cropFrameSize, 
                height: cropFrameSize,
              }
            ]}
          >
            {/* Head positioning guidelines */}
            {showGuidelines && (
              <View style={[styles.guidelineContainer, { width: cropFrameSize, height: cropFrameSize }]}>
                {/* Vertical center guideline */}
                <View 
                  style={[
                    styles.verticalGuideline,
                    { 
                      left: cropFrameSize * 0.5 - 1,
                      height: cropFrameSize * 0.8,
                      top: cropFrameSize * 0.1,
                    }
                  ]}
                />
                
                {/* Face oval outline */}
                <View 
                  style={[
                    styles.faceOval,
                    { 
                      left: cropFrameSize * 0.5 - (cropFrameSize * 0.25),
                      top: cropFrameSize * 0.12,
                      width: cropFrameSize * 0.5,
                      height: cropFrameSize * 0.7,
                    }
                  ]}
                />
                
                {/* Chin guideline - approximately 18% from bottom */}
                <View 
                  style={[
                    styles.horizontalGuideline,
                    { 
                      bottom: cropFrameSize * 0.18,
                    }
                  ]}
                />
                <Text style={[styles.guidelineLabel, { 
                  bottom: cropFrameSize * 0.18 - 25, 
                  left: cropFrameSize * 0.5 - 15,
                }]}>
                  Chin
                </Text>
                
                {/* Top of head guideline - approximately 12% from top */}
                <View 
                  style={[
                    styles.horizontalGuideline,
                    { 
                      top: cropFrameSize * 0.12,
                    }
                  ]}
                />
                <Text style={[styles.guidelineLabel, { 
                  top: cropFrameSize * 0.12 - 25, 
                  left: cropFrameSize * 0.5 - 25,
                }]}>
                  Top of Head
                </Text>
                
                {/* Eye level guideline - approximately 50% from bottom */}
                <View 
                  style={[
                    styles.horizontalGuideline,
                    styles.eyeGuideline,
                    { 
                      bottom: cropFrameSize * 0.5,
                    }
                  ]}
                />
                <Text style={[styles.guidelineLabel, styles.eyeLabel, { bottom: cropFrameSize * 0.5 -8, right: 8 }]}>
                  Eye Level
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Action buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="close-circle-outline" size={24} color={colors.primary.navy} />
            <Text style={styles.secondaryButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.primaryButton, isCropping && styles.buttonDisabled]}
            onPress={cropImage}
            disabled={isCropping}
          >
            {isCropping ? (
              <ActivityIndicator size="small" color={colors.text.light} />
            ) : (
              <>
                <Text style={styles.primaryButtonText}>Apply Crop</Text>
                <Ionicons name="checkmark-circle-outline" size={24} color={colors.text.light} />
              </>
            )}
          </TouchableOpacity>
        </View>
        
        <View style={styles.tipContainer}>
          <Ionicons name="information-circle" size={20} color={colors.primary.navy} />
          <Text style={styles.tipText}>
            Position your face within the guidelines. Pinch to zoom and drag to adjust. Tap the eye icon to toggle guide lines.
          </Text>
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
  guidelineToggle: {
    padding: spacing.sm,
  },
  rightPlaceholder: {
    width: 40, // Match back button width for center alignment
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
    borderStyle: 'solid',
    zIndex: 10,
    pointerEvents: 'none', // Allow touch events to pass through to the image below
  },
  guidelineContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  horizontalGuideline: {
    position: 'absolute',
    height: 2,
    backgroundColor: 'transparent',
    borderTopWidth: 2,
    borderTopColor: '#FFFFFF',
    borderStyle: 'dashed',
    opacity: 0.8,
    left: '20%',
    right: '20%',
  },
  verticalGuideline: {
    position: 'absolute',
    width: 2,
    backgroundColor: 'transparent',
    borderLeftWidth: 2,
    borderLeftColor: '#FFFFFF',
    borderStyle: 'dashed',
    opacity: 0.8,
  },
  faceOval: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderStyle: 'dashed',
    borderRadius: 1000, // Very high value to make it oval
    backgroundColor: 'transparent',
    opacity: 0.8,
    pointerEvents: 'none',
  },
  eyeGuideline: {
    backgroundColor: 'transparent',
    borderTopColor: '#FFFFFF',
    borderStyle: 'dashed',
    opacity: 0.8,
    height: 2,
  },
  guidelineLabel: {
    position: 'absolute',
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.primary,
    fontWeight: '600',
    color: '#FFFFFF',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    opacity: 0.9,
  },
  eyeLabel: {
    color: '#FFFFFF',
    fontWeight: '700',
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
  secondaryButton: {
    flex: 1,
    backgroundColor: colors.background.light,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
    ...shadows.sm,
  },
  primaryButtonText: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.text.light,
  },
  secondaryButtonText: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.primary.navy,
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
