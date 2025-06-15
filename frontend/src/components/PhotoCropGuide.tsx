import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../utils/styles';

interface PhotoCropGuideProps {
  visible: boolean;
  onClose: () => void;
}

export const PhotoCropGuide: React.FC<PhotoCropGuideProps> = ({ visible, onClose }) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.guideContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Photo Guidelines</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={styles.sectionTitle}>US Passport Photo Requirements</Text>
            
            <View style={styles.guideline}>
              <Ionicons name="checkmark-circle" size={20} color={colors.secondary.green} />
              <Text style={styles.guidelineText}>
                <Text style={styles.boldText}>Photo Size:</Text> 2x2 inches (51x51 mm)
              </Text>
            </View>

            <View style={styles.guideline}>
              <Ionicons name="checkmark-circle" size={20} color={colors.secondary.green} />
              <Text style={styles.guidelineText}>
                <Text style={styles.boldText}>Head Height:</Text> Between 1 inch to 1 3/8 inches (25-35 mm)
              </Text>
            </View>

            <View style={styles.guideline}>
              <Ionicons name="checkmark-circle" size={20} color={colors.secondary.green} />
              <Text style={styles.guidelineText}>
                <Text style={styles.boldText}>Eye Position:</Text> Between 1 1/8 inches to 1 3/8 inches (28-35 mm) from bottom
              </Text>
            </View>

            <Text style={styles.sectionTitle}>How to Position Your Photo</Text>
            
            <View style={styles.cropInstructions}>
              <View style={styles.instruction}>
                <View style={styles.instructionIcon}>
                  <Ionicons name="resize" size={24} color={colors.primary.navy} />
                </View>
                <Text style={styles.instructionText}>
                  <Text style={styles.boldText}>Pinch</Text> to zoom your photo
                </Text>
              </View>
              
              <View style={styles.instruction}>
                <View style={styles.instructionIcon}>
                  <Ionicons name="hand-left" size={24} color={colors.primary.navy} />
                </View>
                <Text style={styles.instructionText}>
                  <Text style={styles.boldText}>Drag</Text> to position the photo
                </Text>
              </View>
              
              <View style={styles.instruction}>
                <View style={styles.instructionIcon}>
                  <Ionicons name="eye" size={24} color={colors.primary.navy} />
                </View>
                <Text style={styles.instructionText}>
                  Align your <Text style={styles.boldText}>eyes</Text> with the blue line
                </Text>
              </View>
              
              <View style={styles.instruction}>
                <View style={styles.instructionIcon}>
                  <Ionicons name="body" size={24} color={colors.primary.navy} />
                </View>
                <Text style={styles.instructionText}>
                  Fit your <Text style={styles.boldText}>head</Text> within the orange guide
                </Text>
              </View>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.gotItButton}>
              <Text style={styles.gotItText}>Got It</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  guideContainer: {
    backgroundColor: colors.background.main,
    borderRadius: borderRadius.lg,
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    backgroundColor: colors.background.light,
  },
  title: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.lg,
    fontWeight: '700',
    color: colors.text.primary,
  },
  closeButton: {
    padding: spacing.sm,
  },
  content: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.md,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.md,
    marginTop: spacing.md,
  },
  guideline: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  guidelineText: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginLeft: spacing.sm,
    flex: 1,
  },
  boldText: {
    fontWeight: '700',
    color: colors.text.primary,
  },
  cropInstructions: {
    backgroundColor: colors.background.light,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  instruction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  instructionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  instructionText: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  gotItButton: {
    backgroundColor: colors.primary.navy,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gotItText: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.text.light,
  },
});
