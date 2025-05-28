import React from 'react';
import { View, Text } from 'react-native';
import styled from 'styled-components/native';

const Container = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const Title = styled.Text`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
`;

export const HomeScreen = () => {
  return (
    <Container>
      <Title>Passport Photo App</Title>
      <Text>Take and process your passport photos</Text>
    </Container>
  );
};
