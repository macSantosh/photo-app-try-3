import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../utils/styles';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../types';
import logger from '../utils/logger';

export const PhotoPreviewScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'PhotoPreview'>>();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleNewPhoto = () => {
    navigation.navigate('Upload');
  };

  const handleContinue = () => {
    logger.info('Navigating to photo crop screen', { component: 'PhotoPreviewScreen' });
    navigation.navigate('PhotoCrop', { photoUri: route.params?.photoUri });
  };

  return (
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
        <View style={styles.requirementItem}>
          <Ionicons name="checkmark-circle" size={24} color={colors.secondary.green} />
          <Text style={styles.requirementText}>Photo dimensions are correct</Text>
        </View>
        <View style={styles.requirementItem}>
          <Ionicons name="checkmark-circle" size={24} color={colors.secondary.green} />
          <Text style={styles.requirementText}>Head size and position acceptable</Text>
        </View>
        <View style={styles.requirementItem}>
          <Ionicons name="checkmark-circle" size={24} color={colors.secondary.green} />
          <Text style={styles.requirementText}>Background is suitable</Text>
        </View>
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
  },
  requirementText: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    marginLeft: spacing.sm,
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
});
