import React from 'react';
import { View, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import CameraOverlaySvg from '../assets/images/silhouette.svg';

const { width, height } = Dimensions.get('window');

// US Passport photo requirements (2x2 inches, head 1-1⅜ inches)
const PHOTO_RATIO = 1.2; // Reduced ratio to make the frame smaller relative to screen
const FRAME_SIZE = Math.min(width, height - (height*0.3)) * PHOTO_RATIO;
const HEAD_OUTLINE_WIDTH = FRAME_SIZE;
const HEAD_OUTLINE_HEIGHT = FRAME_SIZE * 1.5; // Increased height ratio for better proportion

const CENTER_X = width / 2;
const CENTER_Y = height / 2;

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
          width={HEAD_OUTLINE_WIDTH}
          height={HEAD_OUTLINE_HEIGHT}
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Semi-transparent background
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
    backgroundColor: 'rgba(0, 0, 0, 0.8)', // Darker semi-transparent background
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
    width: HEAD_OUTLINE_WIDTH,
    height: HEAD_OUTLINE_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    left: (width - HEAD_OUTLINE_WIDTH) / 2,
    top: (height - HEAD_OUTLINE_HEIGHT) / 2,
  },
  bottomControlsContainer: {
    padding: 16,
    backgroundColor: 'black',
    paddingBottom: Platform.OS === 'ios' ? 34 : 16, // Account for iOS home indicator
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  controlButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlIcon: {
    color: 'white',
    fontSize: 24,
    marginBottom: 4,
  },
  controlLabel: {
    color: 'white',
    fontSize: 12,
  },
  captureButtonContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'white',
    borderWidth: 5,
    borderColor: '#CCCCCC',
  }
});
