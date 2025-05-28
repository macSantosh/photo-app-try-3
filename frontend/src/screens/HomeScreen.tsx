import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../utils/styles';

const { width, height } = Dimensions.get('window');

export const HomeScreen: React.FC = () => {
  const handleUploadPhoto = () => {
    // TODO: Implement photo upload
    console.log('Upload photo');
  };

  const handleTakePhoto = () => {
    // TODO: Implement camera
    console.log('Take photo');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>US Passport Photo Editor</Text>
        <Text style={styles.subtitle}>
          Professional passport photos in minutes – compliant with US State Department guidelines
        </Text>
      </View>

      <View style={styles.stepsContainer}>
        {[1, 2, 3, 4, 5].map((step, index) => (
          <React.Fragment key={step}>
            <View style={[styles.stepItem]}>
              <View style={[styles.stepCircle, step === 1 && styles.activeStep]}>
                <Text style={[styles.stepText, step === 1 && styles.activeStepText]}>
                  {step}
                </Text>
              </View>
            </View>
            {index < 4 && (
              <View style={styles.stepLine} />
            )}
          </React.Fragment>
        ))}
      </View>

      <View style={styles.mainContent}>
        <Text style={styles.stepTitle}>Step 1: Upload or Take Photo</Text>
        
        <TouchableOpacity 
          style={styles.uploadButton}
          onPress={handleUploadPhoto}
        >
          <MaterialIcons name="file-upload" size={48} color={colors.primary} />
          <Text style={styles.buttonTitle}>Upload Photo</Text>
          <Text style={styles.buttonSubtitle}>Choose an existing photo from your device</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.cameraButton}
          onPress={handleTakePhoto}
        >
          <MaterialIcons name="camera-alt" size={48} color={colors.primary} />
          <Text style={styles.buttonTitle}>Take Photo</Text>
          <Text style={styles.buttonSubtitle}>Use your camera with on-screen guidelines</Text>
        </TouchableOpacity>

        <View style={styles.requirementsCard}>
          <Text style={styles.requirementsTitle}>US Passport Photo Requirements</Text>
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
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    backgroundColor: colors.primary,
    paddingTop: height * 0.05,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: width * 0.06,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: width * 0.04,
    color: colors.white,
    textAlign: 'center',
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.lightGray,
  },
  stepItem: {
    alignItems: 'center',
  },
  stepCircle: {
    width: width * 0.1,
    height: width * 0.1,
    borderRadius: width * 0.05,
    backgroundColor: colors.lightGray,
    borderWidth: 2,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepLine: {
    width: width * 0.08,
    height: 2,
    backgroundColor: colors.primary,
  },
  activeStep: {
    backgroundColor: colors.primary,
  },
  stepText: {
    color: colors.primary,
    fontSize: width * 0.04,
    fontWeight: 'bold',
  },
  activeStepText: {
    color: colors.white,
  },
  mainContent: {
    flex: 1,
    padding: 20,
  },
  stepTitle: {
    fontSize: width * 0.05,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 20,
  },
  uploadButton: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    borderRadius: 12,
    padding: height * 0.03,
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: colors.white,
  },
  cameraButton: {
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 12,
    padding: height * 0.03,
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: colors.white,
  },
  buttonTitle: {
    fontSize: width * 0.045,
    fontWeight: 'bold',
    color: colors.primary,
    marginVertical: 8,
  },
  buttonSubtitle: {
    fontSize: width * 0.035,
    color: '#666',
    textAlign: 'center',
  },
  requirementsCard: {
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    padding: 16,
  },
  requirementsTitle: {
    fontSize: width * 0.04,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 12,
  },
  requirements: {
    gap: 16,
  },
  requirementSection: {
    gap: 4,
  },
  requirementSectionTitle: {
    fontSize: width * 0.035,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 4,
  },
  requirementItem: {
    fontSize: width * 0.035,
    color: '#333',
  },
});
