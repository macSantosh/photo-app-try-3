import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors, typography, spacing, borderRadius, shadows } from '../utils/styles';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { StepIndicator } from '../components/StepIndicator';

export const UploadScreen: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setError('Permission to access camera roll is required!');
      return false;
    }
    return true;
  };

  const handleUpload = async () => {
    try {
      const hasPermission = await requestPermission();
      if (!hasPermission) return;

      setLoading(true);
      setError(null);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        navigation.navigate('PhotoCrop', { photoUri: result.assets[0].uri });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload photo');
      console.error('Upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCamera = () => {
    navigation.navigate('Camera');
  };



  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>US Passport Photo Editor</Text>
      </View>

      <StepIndicator currentStep={1} />

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>Upload or Take Photo</Text>

      <TouchableOpacity 
        style={[styles.uploadButton, loading && styles.buttonDisabled]}
        onPress={handleUpload}
        disabled={loading}
      >
        <Ionicons name="cloud-upload-outline" size={48} color={colors.primary.navy} />
        <Text style={styles.buttonTitle}>Upload Photo</Text>
        <Text style={styles.buttonSubtitle}>Choose an existing photo from your device</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.cameraButton, loading && styles.buttonDisabled]}
        onPress={handleCamera}
        disabled={loading}
      >
        <Ionicons name="camera-outline" size={48} color={colors.primary.navy} />
        <Text style={styles.buttonTitle}>Take Photo</Text>
        <Text style={styles.buttonSubtitle}>Use your camera with on-screen guidelines</Text>
      </TouchableOpacity>

      <View style={styles.requirementsCard}>
        <Text style={styles.requirementsTitle}>US Passport Photo Requirements:</Text>
        <View style={styles.requirements}>
          <View style={styles.requirementSection}>
            <Text style={styles.requirementSectionTitle}>Size & Format:</Text>
            <Text style={styles.requirementItem}>• 2 x 2 inches (51 x 51 mm)</Text>
            <Text style={styles.requirementItem}>• Head size: 1-1⅜ inches (25-35 mm)</Text>
            <Text style={styles.requirementItem}>• Color photo on white background</Text>
            <Text style={styles.requirementItem}>• High resolution (300 DPI minimum)</Text>
          </View>
          <View style={styles.requirementSection}>
            <Text style={styles.requirementSectionTitle}>Photo Quality:</Text>
            <Text style={styles.requirementItem}>• Front-facing, eyes open</Text>
            <Text style={styles.requirementItem}>• Neutral expression, natural smile OK</Text>
            <Text style={styles.requirementItem}>• Even lighting, no shadows</Text>
            <Text style={styles.requirementItem}>• Recent photo (within 6 months)</Text>
          </View>
        </View>
      </View>
    </ScrollView>
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
    backgroundColor: colors.primary.navy,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  title: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.xl,
    fontWeight: '700',
    color: colors.text.light,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.md,
    color: colors.text.light,
    textAlign: 'center',
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.lg,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  uploadButton: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.primary.navy,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.background.main,
    ...shadows.sm,
  },
  cameraButton: {
    borderWidth: 2,
    borderColor: colors.primary.navy,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: colors.background.main,
    ...shadows.sm,
  },
  buttonTitle: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.lg,
    fontWeight: '700',
    color: colors.text.primary,
    marginVertical: spacing.sm,
  },
  buttonSubtitle: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  requirementsCard: {
    backgroundColor: colors.background.light,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    ...shadows.sm,
  },
  requirementsTitle: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.md,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  requirements: {
    gap: spacing.md,
  },
  requirementSection: {
    gap: spacing.xs,
  },
  requirementSectionTitle: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  requirementItem: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  errorContainer: {
    backgroundColor: colors.secondary.red,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: borderRadius.md,
  },
  errorText: {
    color: colors.text.light,
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
