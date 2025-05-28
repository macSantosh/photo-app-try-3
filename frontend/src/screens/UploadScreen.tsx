import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styled from 'styled-components/native';
import { COLORS, SCREEN, TYPOGRAPHY } from '../utils/styles';

const Container = styled.View`
  flex: 1;
  background-color: ${COLORS.primary.white};
  padding: ${SCREEN.padding}px;
`;

const Header = styled.Text`
  ${TYPOGRAPHY.header};
  text-align: center;
  margin-bottom: 10px;
`;

const SubHeader = styled.Text`
  ${TYPOGRAPHY.subHeader};
  text-align: center;
  margin-bottom: 30px;
`;

const ProgressContainer = styled.View`
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin-bottom: 40px;
`;

const StepCircle = styled.View<{ active?: boolean }>`
  width: 30px;
  height: 30px;
  border-radius: 15px;
  background-color: ${props => props.active ? COLORS.primary.navy : COLORS.primary.lightGray};
  justify-content: center;
  align-items: center;
  margin: 0 5px;
`;

const StepText = styled.Text<{ active?: boolean }>`
  color: ${props => props.active ? COLORS.primary.white : COLORS.primary.navy};
  font-weight: bold;
`;

const StepDivider = styled.View`
  width: 20px;
  height: 2px;
  background-color: ${COLORS.primary.lightGray};
  margin: 0 5px;
`;

const UploadContainer = styled.TouchableOpacity`
  border: 2px dashed ${COLORS.primary.navy};
  border-radius: 10px;
  padding: 40px;
  align-items: center;
  margin-bottom: 20px;
  background-color: ${COLORS.primary.lightGray};
`;

const CameraContainer = styled.TouchableOpacity`
  border: 2px solid ${COLORS.primary.navy};
  border-radius: 10px;
  padding: 40px;
  align-items: center;
  background-color: ${COLORS.primary.white};
`;

const RequirementsContainer = styled.View`
  margin-top: 30px;
  padding: 20px;
  background-color: ${COLORS.primary.lightGray};
  border-radius: 10px;
`;

const RequirementText = styled.Text`
  ${TYPOGRAPHY.requirements};
  margin-bottom: 8px;
`;

export const UploadScreen: React.FC = () => {
  const steps = [1, 2, 3, 4, 5];

  return (
    <Container>
      <Header>US Passport Photo Editor</Header>
      <SubHeader>Professional passport photos in minutes – compliant with US State Department guidelines</SubHeader>

      <ProgressContainer>
        {steps.map((step, index) => (
          <React.Fragment key={step}>
            <StepCircle active={step === 1}>
              <StepText active={step === 1}>{step}</StepText>
            </StepCircle>
            {index < steps.length - 1 && <StepDivider />}
          </React.Fragment>
        ))}
      </ProgressContainer>

      <Header>Step 1: Upload or Take Photo</Header>

      <UploadContainer>
        <Ionicons name="cloud-upload-outline" size={40} color={COLORS.primary.navy} />
        <Text style={styles.buttonText}>Upload Photo</Text>
        <Text style={styles.buttonSubText}>Choose an existing photo from your device</Text>
      </UploadContainer>

      <CameraContainer>
        <Ionicons name="camera-outline" size={40} color={COLORS.primary.navy} />
        <Text style={styles.buttonText}>Take Photo</Text>
        <Text style={styles.buttonSubText}>Use your camera with on-screen guidelines</Text>
      </CameraContainer>

      <RequirementsContainer>
        <Text style={styles.requirementsTitle}>US Passport Photo Requirements:</Text>
        <RequirementText>• 2 x 2 inches (51 x 51 mm)</RequirementText>
        <RequirementText>• Head size: 1-1⅜ inches (25-35 mm)</RequirementText>
        <RequirementText>• Color photo on white background</RequirementText>
        <RequirementText>• High resolution (300 DPI minimum)</RequirementText>
      </RequirementsContainer>
    </Container>
  );
};

const styles = StyleSheet.create({
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primary.navy,
    marginTop: 10,
  },
  buttonSubText: {
    fontSize: 14,
    color: COLORS.primary.navy,
    opacity: 0.7,
    marginTop: 5,
  },
  requirementsTitle: {
    ...TYPOGRAPHY.subHeader,
    marginBottom: 10,
    fontWeight: '600',
  },
});
