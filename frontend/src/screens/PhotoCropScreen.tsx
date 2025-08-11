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
      // Get the original image dimensions first
      Image.getSize(route.params?.photoUri, 
        (originalWidth, originalHeight) => {
          // Then measure the displayed image container
          imageRef.current?.measure((x, y, width, height, pageX, pageY) => {
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
