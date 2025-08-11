import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../utils/styles';

interface StepProps {
  number: number;
  isActive: boolean;
}

const Step: React.FC<StepProps> = ({ number, isActive }) => (
  <View style={[styles.stepCircle, isActive && styles.activeStep]}>
    <Text style={[styles.stepText, isActive && styles.activeStepText]}>
      {number}
    </Text>
  </View>
);

interface StepIndicatorProps {
  currentStep: number;
  totalSteps?: number;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ 
  currentStep, 
  totalSteps = 5 
}) => {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <View style={styles.stepsContainer}>
      {steps.map((step, index) => (
        <React.Fragment key={step}>
          <Step number={step} isActive={step === currentStep} />
          {index < steps.length - 1 && <View style={styles.stepDivider} />}
        </React.Fragment>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background.light,
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.round,
    backgroundColor: colors.background.light,
    borderWidth: 2,
    borderColor: colors.primary.navy,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDivider: {
    width: 30,
    height: 2,
    backgroundColor: colors.primary.navy,
    marginHorizontal: spacing.sm,
  },
  activeStep: {
    backgroundColor: colors.primary.navy,
  },
  stepText: {
    color: colors.primary.navy,
    fontSize: typography.fontSize.md,
    fontWeight: '700',
  },
  activeStepText: {
    color: colors.text.light,
  },
});
