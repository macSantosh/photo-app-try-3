import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Platform, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../utils/styles';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../types';
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
    logger.info('Starting animated photo validation', { component: 'PhotoPreviewScreen' });
    
    // Reset states
    setValidationStates({
      dimensions: 'pending',
      headSize: 'pending',
      background: 'pending'
    });
    
    try {
      // Start validation in the background
      const results = await validatePhoto(route.params?.photoUri!);
      
      // Animate each validation step with delays
      animateValidationStep('dimensions', results.dimensions, 500);
      animateValidationStep('headSize', results.headSize, 1500);
      animateValidationStep('background', results.background, 2500);
      
      setValidationResults(results);
      logger.info('Animated photo validation completed', { component: 'PhotoPreviewScreen', results });
      
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
    logger.info('Navigating to photo crop screen', { component: 'PhotoPreviewScreen' });
    navigation.navigate('PhotoCrop', { photoUri: route.params?.photoUri });
  };

  const AnimatedRequirementItem: React.FC<{
    title: string;
    state: string;
    animatedStyle: any;
  }> = ({ title, state, animatedStyle }) => {
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

    return (
      <Animated.View style={[styles.requirementItem, animatedStyle]}>
        <View style={styles.requirementIcon}>
          {getIcon()}
        </View>
        <View style={styles.requirementTextContainer}>
          <Text style={getTextStyle()}>
            {title}
          </Text>
        </View>
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
        <Text style={styles.requirementsTitle}>Photo Requirements Check:</Text>
        
        <AnimatedRequirementItem
          title="Photo dimensions are correct"
          state={validationStates.dimensions}
          animatedStyle={dimensionsAnimatedStyle}
        />
        
        <AnimatedRequirementItem
          title="Head size and position acceptable"
          state={validationStates.headSize}
          animatedStyle={headSizeAnimatedStyle}
        />
        
        <AnimatedRequirementItem
          title="Background is suitable"
          state={validationStates.background}
          animatedStyle={backgroundAnimatedStyle}
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
          <Text style={styles.primaryButtonText}>
            {isProcessing ? 'Processing...' : 'Continue'}
          </Text>
          {!isProcessing && (
            <Ionicons name="arrow-forward" size={24} color={colors.text.light} />
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
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
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
    margin: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.background.light,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  requirementsTitle: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.md,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    minHeight: 32, // Ensure minimum height for proper spacing
  },
  requirementTextContainer: {
    flex: 1,
    marginLeft: spacing.sm,
    justifyContent: 'center',
  },
  requirementText: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
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
    padding: spacing.lg,
    gap: spacing.md,
  },
  primaryButton: {
    backgroundColor: colors.primary.navy,
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
  secondaryButton: {
    backgroundColor: colors.background.light,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.md,
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
