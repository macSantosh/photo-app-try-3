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
  Alert,
  ScrollView,
  SafeAreaView
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { colors, typography, spacing, borderRadius, shadows } from '../utils/styles';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../types';
import { Ionicons } from '@expo/vector-icons';
import * as ImageManipulator from 'expo-image-manipulator';
import logger from '../utils/logger';
import { StepIndicator } from '../components/StepIndicator';
import { CropOverlay, GuidelineConfig } from '../components/CropOverlay';
import { US_PASSPORT_GUIDELINES, getGuidelinesByCountry, CountryCode } from '../utils/photoGuidelines';
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
  width: number;              // Original image width
  height: number;             // Original image height
  displayedWidth: number;     // Actual displayed width (with contain)
  displayedHeight: number;    // Actual displayed height (with contain)
  containerWidth: number;     // Full container width
  containerHeight: number;    // Full container height
  offsetX: number;           // Image offset from container left
  offsetY: number;           // Image offset from container top
  x: number;                 // Container position (relative)
  y: number;                 // Container position (relative)
  scale: number;
};

export const PhotoCropScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'PhotoCrop'>>();
  const [imageLayout, setImageLayout] = useState<ImageLayoutInfo | null>(null);
  const [isCropping, setCropping] = useState(false);
  const [showGuidelines, setShowGuidelines] = useState(true);
  
  // Configuration for guidelines - can be changed for different countries
  // This could be passed as a prop or set based on user selection
  const [selectedCountry] = useState<CountryCode>('US'); // Default to US
  const [guidelinesConfig] = useState<GuidelineConfig>(getGuidelinesByCountry(selectedCountry));
  
  const imageRef = useRef<Image>(null);
  
  // Gesture values
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  // Calculate the crop frame dimensions (80% of photo container size for proper spacing)
  const cropFrameSize = Math.min(SCREEN_WIDTH - CROP_PADDING * 2, SCREEN_HEIGHT * 0.4) * 0.8;
  
  const handleImageLoad = () => {
    if (imageRef.current) {
      // Add delay to ensure layout is complete on Android native builds
      setTimeout(() => {
        Image.getSize(route.params?.photoUri, 
          (originalWidth, originalHeight) => {
            // Then measure the displayed image container
            imageRef.current?.measure((x, y, width, height, pageX, pageY) => {
              const containerWidth = width;
              const containerHeight = height;
              
              // Calculate actual displayed image dimensions with resizeMode: 'contain'
              const containerAspectRatio = containerWidth / containerHeight;
              const imageAspectRatio = originalWidth / originalHeight;
              
              let actualDisplayedWidth, actualDisplayedHeight;
              let imageOffsetX = 0, imageOffsetY = 0;
              
              if (imageAspectRatio > containerAspectRatio) {
                // Image is wider - constrained by container width
                actualDisplayedWidth = containerWidth;
                actualDisplayedHeight = containerWidth / imageAspectRatio;
                imageOffsetY = (containerHeight - actualDisplayedHeight) / 2;
              } else {
                // Image is taller - constrained by container height  
                actualDisplayedWidth = containerHeight * imageAspectRatio;
                actualDisplayedHeight = containerHeight;
                imageOffsetX = (containerWidth - actualDisplayedWidth) / 2;
              }
              
              const imageInfo: ImageLayoutInfo = {
                width: originalWidth,
                height: originalHeight,
                displayedWidth: actualDisplayedWidth, // Actual displayed size
                displayedHeight: actualDisplayedHeight,
                containerWidth: containerWidth, // Full container size
                containerHeight: containerHeight,
                offsetX: imageOffsetX, // Image offset within container
                offsetY: imageOffsetY,
                x: 0, // Use relative coordinates instead of pageX
                y: 0, // Use relative coordinates instead of pageY
                scale: 1
              };
              
              // Check for extremely large images that might cause performance issues
              const totalPixels = originalWidth * originalHeight;
              const maxRecommendedPixels = 50 * 1000 * 1000; // 50 megapixels
              
              if (totalPixels > maxRecommendedPixels) {
                console.warn('Large image detected:', {
                  dimensions: `${originalWidth}x${originalHeight}`,
                  totalPixels: totalPixels,
                  megapixels: (totalPixels / 1000000).toFixed(1)
                });
              }
              
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
      }, 100); // Small delay to ensure layout completion on Android
    }
  };

  const cropImage = async () => {
    if (!imageLayout) {
      Alert.alert('Error', 'Cannot crop image, image layout information is missing.');
      return;
    }

    try {
      setCropping(true);

      // Original image dimensions (actual pixels)
      const originalWidth = imageLayout.width;
      const originalHeight = imageLayout.height;
      
      // Displayed image dimensions on screen (screen pixels)
      const displayedImageWidth = imageLayout.displayedWidth;
      const displayedImageHeight = imageLayout.displayedHeight;
      
      // Container dimensions (screen pixels)
      const containerWidth = imageLayout.containerWidth;
      const containerHeight = imageLayout.containerHeight;
      
      // Current user transformations (screen space)
      const currentScale = scale.value;
      const currentTranslateX = translateX.value;
      const currentTranslateY = translateY.value;

      // CRITICAL: Calculate the ratio between original image and displayed image
      // This accounts for how the image is scaled down to fit the screen
      const originalToDisplayedRatio = originalWidth / displayedImageWidth;

      // Calculate crop frame center in container coordinates (screen pixels)
      const cropFrameCenterX = containerWidth / 2;
      const cropFrameCenterY = containerHeight / 2;

      // Calculate where the displayed image actually sits within the container
      const imageDisplayLeftX = imageLayout.offsetX;
      const imageDisplayTopY = imageLayout.offsetY;

      // Account for user transformations (zoom/pan) on the displayed image
      const scaledDisplayedWidth = displayedImageWidth * currentScale;
      const scaledDisplayedHeight = displayedImageHeight * currentScale;
      
      // Calculate the actual position of the scaled image within the container
      const scaledImageLeftX = imageDisplayLeftX + (displayedImageWidth - scaledDisplayedWidth) / 2 + currentTranslateX;
      const scaledImageTopY = imageDisplayTopY + (displayedImageHeight - scaledDisplayedHeight) / 2 + currentTranslateY;

      // Convert crop frame position to coordinates within the scaled displayed image
      const cropLeftOnScaledImage = cropFrameCenterX - cropFrameSize / 2 - scaledImageLeftX;
      const cropTopOnScaledImage = cropFrameCenterY - cropFrameSize / 2 - scaledImageTopY;

      // Convert to coordinates on the original displayed image (before user scaling)
      const cropLeftOnDisplayedImage = cropLeftOnScaledImage / currentScale;
      const cropTopOnDisplayedImage = cropTopOnScaledImage / currentScale;
      const cropSizeOnDisplayedImage = cropFrameSize / currentScale;

      // FINAL STEP: Convert to original image coordinates (actual pixels)
      const originalCropX = cropLeftOnDisplayedImage * originalToDisplayedRatio;
      const originalCropY = cropTopOnDisplayedImage * originalToDisplayedRatio;
      const originalCropSize = cropSizeOnDisplayedImage * originalToDisplayedRatio;

      // Ensure crop area is within original image bounds
      const finalCropX = Math.max(0, Math.min(originalCropX, originalWidth - originalCropSize));
      const finalCropY = Math.max(0, Math.min(originalCropY, originalHeight - originalCropSize));
      const finalCropWidth = Math.min(originalCropSize, originalWidth - finalCropX);
      const finalCropHeight = Math.min(originalCropSize, originalHeight - finalCropY);

      const cropArea = {
        originX: finalCropX,
        originY: finalCropY,
        width: finalCropWidth,
        height: finalCropHeight
      };

      // Perform the actual crop operation on the original high-resolution image
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
      // Use container-relative coordinates instead of screen coordinates
      const containerCenterX = imageLayout.containerWidth / 2;
      const containerCenterY = imageLayout.containerHeight / 2;
      
      translateX.value = savedTranslateX.value + (containerCenterX - containerCenterX * e.scale);
      translateY.value = savedTranslateY.value + (containerCenterY - containerCenterY * e.scale);
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
      // Ensure crop frame stays within the scaled image bounds
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
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.light} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Position & Crop Photo</Text>
        </View>
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

      {/* Step indicator */}
      <StepIndicator currentStep={2} />

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.contentContainer}>
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

          {/* Crop overlay with guidelines, shadow curtain, and dimensions */}
          <CropOverlay
            cropFrameSize={cropFrameSize}
            containerHeight={SCREEN_HEIGHT * 0.4}
            showGuidelines={showGuidelines}
            guidelines={guidelinesConfig}
          />
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
        
        {/* Instructions card */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>Cropping Instructions:</Text>
          <View style={styles.instructionsList}>
            <Text style={styles.instructionItem}>• Position your face within the guidelines</Text>
            <Text style={styles.instructionItem}>• Pinch to zoom in or out</Text>
            <Text style={styles.instructionItem}>• Drag to adjust position</Text>
            <Text style={styles.instructionItem}>• Toggle guidelines with the eye icon</Text>
          </View>
        </View>
      </ScrollView>
    </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.primary.navy,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary.navy,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.xl,
    fontWeight: '700',
    color: colors.text.light,
  },
  subtitle: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.sm,
    color: colors.text.light,
    opacity: 0.8,
    marginTop: spacing.xs,
  },
  backButton: {
    padding: spacing.sm,
  },
  guidelineToggle: {
    padding: spacing.sm,
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  photoContainer: {
    width: '100%',
    height: SCREEN_HEIGHT * 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: colors.background.light,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
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
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
    ...shadows.sm,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: colors.background.main,
    borderWidth: 2,
    borderColor: colors.primary.navy,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
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
  instructionsCard: {
    backgroundColor: colors.background.light,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginTop: spacing.lg,
    width: '100%',
    ...shadows.sm,
  },
  instructionsTitle: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.md,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  instructionsList: {
    gap: spacing.xs,
  },
  instructionItem: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
});
