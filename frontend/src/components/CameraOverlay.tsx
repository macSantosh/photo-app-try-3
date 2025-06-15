import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import CameraOverlaySvg from '../../assets/silhouette.svg';
import { getFrameDimensions } from '../utils/cameraUtils';

const { frameSize, frameLeft, frameTop } = getFrameDimensions();

export const CameraOverlay: React.FC = () => {
  return (  
    <View style={styles.container}>
      {/* Top Banner */}
      <View style={styles.topBannerContainer}>
        <View style={styles.bulletPointContainer}>
          <Text style={styles.bulletPoint}>• Center face within the outline</Text>
          <Text style={styles.bulletPoint}>• Eyes level with top third of frame</Text>
          <Text style={styles.bulletPoint}>• Keep neutral expression, eyes open</Text>
        </View>
      </View>

      {/* Camera Guide Overlay */}
      <View style={styles.guideContainer}>
        <CameraOverlaySvg
          width={frameSize}
          height={frameSize}
          fill="none"
          stroke="white"
          strokeWidth={2}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  topBannerContainer: {
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
    zIndex: 10,
  },
  bulletPointContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  bulletPoint: {
    color: 'white',
    fontSize: Platform.OS === 'ios' ? 16 : 14,
    fontWeight: '500',
    textAlign: 'left',
    width: '100%',
    paddingVertical: 3,
    lineHeight: 22,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  guideContainer: {
    position: 'absolute',
    width: frameSize,
    height: frameSize,
    justifyContent: 'center',
    alignItems: 'center',
    left: frameLeft,
    top: frameTop,
  },
});
