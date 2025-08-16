import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Platform, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../utils/styles';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../types';
import { StepIndicator } from '../components/StepIndicator';
import logger from '../utils/logger';
import { validatePhoto, PhotoValidationResults, ValidationResult } from '../utils/photoValidation';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';

export const PhotoPreviewScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'PhotoPreview'>>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationResults, setValidationResults] = useState<PhotoValidationResults | null>(null);
  
  // Animation states for each requirement
  const [validationStates, setValidationStates] = useState({
    dimensions: 'pending', // 'pending', 'checking', 'success', 'error'
    headSize: 'pending',
    background: 'pending'
  });
  
  // Animated values for each requirement
  const dimensionsOpacity = useSharedValue(1);
  const dimensionsScale = useSharedValue(1);
  const headSizeOpacity = useSharedValue(1);
  const headSizeScale = useSharedValue(1);
  const backgroundOpacity = useSharedValue(1);
  const backgroundScale = useSharedValue(1);
  
  const validationTimeouts = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    if (route.params?.photoUri) {
      startAnimatedValidation();
    }
    
    return () => {
      // Clean up timeouts
      validationTimeouts.current.forEach(timeout => clearTimeout(timeout));
    };
  }, [route.params?.photoUri]);

  const startAnimatedValidation = async () => {
    // Reset states
    setValidationStates({
      dimensions: 'pending',
      headSize: 'pending',
      background: 'pending'
    });
    
    try {
      // Start validation in the background
      // Define DPI requirements for passport photos
      const requiredDPI = 300; // US Passport standard
      const targetSizeInches = { width: 2, height: 2 }; // 2x2 inches for passport
      
      const results = await validatePhoto(
        route.params?.photoUri!, 
        route.params?.cropFrameSize, // Pass cropFrameSize if available
        requiredDPI, // Pass DPI requirement
        targetSizeInches // Pass target size
      );
      
      // Animate each validation step with delays
      animateValidationStep('dimensions', results.dimensions, 500);
      animateValidationStep('headSize', results.headSize, 1500);
      animateValidationStep('background', results.background, 2500);
      
      setValidationResults(results);
      
    } catch (error) {
      logger.error('Photo validation failed', error as Error, { component: 'PhotoPreviewScreen' });
      
      // Show error states with animation
      const errorResult = { isValid: false, message: 'Validation failed' };
      animateValidationStep('dimensions', errorResult, 500);
      animateValidationStep('headSize', errorResult, 1000);
      animateValidationStep('background', errorResult, 1500);
    }
  };

  const animateValidationStep = (
    step: 'dimensions' | 'headSize' | 'background',
    result: ValidationResult,
    delay: number
  ) => {
    const timeout = setTimeout(() => {
      // Update state to show checking
      setValidationStates(prev => ({ ...prev, [step]: 'checking' }));
      
      // Get the appropriate animated values
      const opacity = step === 'dimensions' ? dimensionsOpacity : 
                     step === 'headSize' ? headSizeOpacity : backgroundOpacity;
      const scale = step === 'dimensions' ? dimensionsScale : 
                   step === 'headSize' ? headSizeScale : backgroundScale;
      
      // Animate to checking state
      opacity.value = withTiming(1, { duration: 300 });
      scale.value = withSequence(
        withTiming(1.1, { duration: 200 }),
        withTiming(1, { duration: 200 })
      );
      
      // Show result after a brief checking period
      const resultTimeout = setTimeout(() => {
        setValidationStates(prev => ({ 
          ...prev, 
          [step]: result.isValid ? 'success' : 'error' 
        }));
        
        // Final animation based on result
        scale.value = withSequence(
          withTiming(result.isValid ? 1.05 : 0.95, { duration: 150 }),
          withTiming(1, { duration: 150 })
        );
      }, 800);
      
      validationTimeouts.current.push(resultTimeout);
    }, delay);
    
    validationTimeouts.current.push(timeout);
  };

  const handleNewPhoto = () => {
    navigation.navigate('Upload');
  };

  const handleContinue = () => {
    navigation.navigate('PhotoCrop', { photoUri: route.params?.photoUri });
  };

  const AnimatedRequirementItem: React.FC<{
    title: string;
    state: string;
    animatedStyle: any;
    message?: string; // Short message
    detailMessage?: string; // Detailed message
  }> = ({ title, state, animatedStyle, message, detailMessage }) => {
    const [showDetail, setShowDetail] = useState(false);
    
    const getIcon = () => {
      switch (state) {
        case 'pending':
          return <View style={styles.pendingDot} />;
        case 'checking':
          return <ActivityIndicator size="small" color={colors.primary.navy} />;
        case 'success':
          return <Ionicons name="checkmark-circle" size={24} color={colors.secondary.green} />;
        case 'error':
          return <Ionicons name="close-circle" size={24} color={colors.secondary.red} />;
        default:
          return <View style={styles.pendingDot} />;
      }
    };

    const getTextStyle = () => {
      const baseStyle = styles.requirementText;
      if (state === 'error') {
        return [baseStyle, styles.requirementTextError];
      }
      if (state === 'pending') {
        return [baseStyle, styles.requirementTextPending];
      }
      return baseStyle;
    };

    const hasDetail = detailMessage && (state === 'success' || state === 'error');

    return (
      <Animated.View style={[styles.requirementItem, animatedStyle]}>
        <View style={styles.requirementIcon}>
          {getIcon()}
        </View>
        <TouchableOpacity 
          style={styles.requirementTextContainer}
          onPress={() => hasDetail && setShowDetail(!showDetail)}
          activeOpacity={hasDetail ? 0.7 : 1}
        >
          <View style={styles.requirementMainContent}>
            <View style={styles.requirementTextContent}>
              <Text style={getTextStyle()}>
                {title}
              </Text>
              {/* Show short validation message */}
              {message && (state === 'success' || state === 'error') && (
                <Text style={[
                  styles.requirementMessage,
                  state === 'error' ? { color: colors.secondary.red } : { color: colors.secondary.green }
                ]}>
                  {message}
                </Text>
              )}
            </View>
            {/* Show expand indicator if there's detail */}
            {hasDetail && (
              <Ionicons 
                name={showDetail ? "chevron-up" : "chevron-down"} 
                size={16} 
                color={colors.text.secondary}
                style={styles.expandIcon}
              />
            )}
          </View>
          {/* Show detailed message when expanded */}
          {hasDetail && showDetail && (
            <Text style={styles.requirementDetail}>
              {detailMessage}
            </Text>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Animated styles for each requirement
  const dimensionsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: dimensionsOpacity.value,
    transform: [{ scale: dimensionsScale.value }],
  }));

  const headSizeAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headSizeOpacity.value,
    transform: [{ scale: headSizeScale.value }],
  }));

  const backgroundAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backgroundOpacity.value,
    transform: [{ scale: backgroundScale.value }],
  }));

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleNewPhoto}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.light} />
        </TouchableOpacity>
        <Text style={styles.title}>Preview Photo</Text>
        <View style={styles.rightPlaceholder} />
      </View>

      <StepIndicator currentStep={3} />

      {/* Photo Preview */}
      <View style={styles.previewContainer}>
        <Image 
          source={{ uri: route.params?.photoUri }} 
          style={styles.preview}
          resizeMode="contain"
        />
      </View>

      {/* Requirements Check */}
      <View style={styles.requirementsContainer}>
        <Text style={styles.requirementsTitle}>Passport Requirements:</Text>
        
        <AnimatedRequirementItem
          title="Photo Quality"
          state={validationStates.dimensions}
          animatedStyle={dimensionsAnimatedStyle}
          message={validationResults?.dimensions?.message}
          detailMessage={validationResults?.dimensions?.details?.detailedMessage}
        />
        
        <AnimatedRequirementItem
          title="Head Position"
          state={validationStates.headSize}
          animatedStyle={headSizeAnimatedStyle}
          message={validationResults?.headSize?.message}
          detailMessage={validationResults?.headSize?.details?.detailedMessage}
        />
        
        <AnimatedRequirementItem
          title="Background"
          state={validationStates.background}
          animatedStyle={backgroundAnimatedStyle}
          message={validationResults?.background?.message}
          detailMessage={validationResults?.background?.details?.detailedMessage}
        />
      </View> 

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={handleNewPhoto}
        >
          <Ionicons name="camera-outline" size={24} color={colors.primary.navy} />
          <Text style={styles.secondaryButtonText}>Take New Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.primaryButton, isProcessing && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color={colors.text.light} />
          ) : (
            <>
              <Text style={styles.primaryButtonText}>Continue</Text>
              <Ionicons name="arrow-forward" size={24} color={colors.text.light} />
            </>
          )}
        </TouchableOpacity>
      </View>
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
    paddingTop: spacing.md, // Reduced from spacing.lg
    paddingBottom: spacing.md, // Reduced from spacing.lg
    paddingHorizontal: spacing.lg,
  },
  backButton: {
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
  previewContainer: {
    margin: spacing.lg,
    aspectRatio: 1,
    maxWidth: 350, // Limit the maximum width
    maxHeight: 350, // Limit the maximum height  
    alignSelf: 'center', // Center the container
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: colors.background.light,
    ...shadows.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  preview: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  requirementsContainer: {
    margin: spacing.md, // Reduced from spacing.lg
    padding: spacing.md, // Reduced from spacing.lg
    backgroundColor: colors.background.light,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  requirementsTitle: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.md,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.sm, // Reduced from spacing.md
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Changed from 'center' to accommodate multi-line text
    marginBottom: spacing.sm, // Increased from spacing.xs for better spacing with details
    minHeight: 28, // Keep minimum height
  },
  requirementTextContainer: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  requirementMainContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  requirementTextContent: {
    flex: 1,
  },
  requirementText: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
  },
  requirementMessage: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  expandIcon: {
    marginLeft: spacing.xs,
  },
  requirementTextError: {
    color: colors.secondary.red,
  },
  requirementDetail: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  loadingText: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    marginLeft: spacing.sm,
  },
  errorText: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.md,
    color: colors.secondary.red,
    textAlign: 'center',
    padding: spacing.lg,
  },
  actionButtons: {
    flexDirection: 'row', // Changed to row layout
    width: '100%',
    justifyContent: 'space-between',
    padding: spacing.md,
    paddingBottom: spacing.lg, // Keep bottom padding for safe area
    gap: spacing.md, // Space between buttons
  },
  primaryButton: {
    flex: 1, // Take equal space
    backgroundColor: colors.primary.navy,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg, // Match PhotoCropScreen
    borderRadius: borderRadius.lg, // Match PhotoCropScreen
    gap: spacing.sm,
    ...shadows.sm,
  },
  primaryButtonText: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.text.light,
  },
  secondaryButton: {
    flex: 1, // Take equal space
    backgroundColor: colors.background.light,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg, // Match PhotoCropScreen
    borderRadius: borderRadius.lg, // Match PhotoCropScreen
    borderWidth: 2,
    borderColor: colors.primary.navy,
    gap: spacing.sm,
    ...shadows.sm,
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
  // Animated validation styles
  requirementIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2, // Add slight top margin to align with first line of text
  },
  pendingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.text.secondary,
  },
  requirementTextPending: {
    color: colors.text.secondary,
  },
});
