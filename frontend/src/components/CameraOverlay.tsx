import React from 'react';
import { View, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import Svg, { Ellipse, Rect, Line, Circle } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

// US Passport photo requirements (2x2 inches, head 1-1⅜ inches)
const PHOTO_RATIO = 1; // Square format
const FRAME_SIZE = width * 0.8;
const OVAL_WIDTH = FRAME_SIZE * 0.75;
const OVAL_HEIGHT = OVAL_WIDTH;

// Head measurement guides
const HEAD_MIN_SIZE = FRAME_SIZE * 0.5; // 1 inch (50% of frame)
const HEAD_MAX_SIZE = FRAME_SIZE * 0.6875; // 1⅜ inch (68.75% of frame)

// Eye and chin positioning
const EYE_LEVEL_FROM_TOP = FRAME_SIZE * 0.35; // Eyes should be about 1.2-1.4 inches from top
const CHIN_LEVEL_FROM_TOP = FRAME_SIZE * 0.8; // Chin should be near bottom
const CENTER_X = width / 2;
const CENTER_Y = height / 2;

export const CameraOverlay: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Top Instructions */}
      <View style={styles.topInstructionsContainer}>
        <Text style={styles.headerText}>US Passport Photo Guidelines</Text>
        <Text style={styles.instructionText}>• Face camera directly with neutral expression</Text>
        <Text style={styles.instructionText}>• Eyes open and looking at camera</Text>
        <Text style={styles.instructionText}>• No smiling or frowning</Text>
      </View>

      {/* Camera Guide Overlay */}
      <View style={styles.guideContainer}>
        <Svg height={height} width={width}>
          {/* Photo frame boundary */}
          <Rect
            x={CENTER_X - FRAME_SIZE / 2}
            y={CENTER_Y - FRAME_SIZE / 2}
            width={FRAME_SIZE}
            height={FRAME_SIZE}
            fill="transparent"
            stroke="white"
            strokeWidth="3"
          />

          {/* Face oval guide */}
          <Ellipse
            cx={CENTER_X}
            cy={CENTER_Y}
            rx={OVAL_WIDTH / 2}
            ry={OVAL_HEIGHT / 2}
            fill="transparent"
            stroke="lightblue"
            strokeWidth="2"
            strokeDasharray="10,5"
          />

          {/* Eye level guide line */}
          <Line
            x1={CENTER_X - FRAME_SIZE / 2}
            y1={CENTER_Y - FRAME_SIZE / 2 + EYE_LEVEL_FROM_TOP}
            x2={CENTER_X + FRAME_SIZE / 2}
            y2={CENTER_Y - FRAME_SIZE / 2 + EYE_LEVEL_FROM_TOP}
            stroke="green"
            strokeWidth="2"
            strokeDasharray="8,4"
          />

          {/* Eye position dots */}
          <Circle
            cx={CENTER_X - OVAL_WIDTH / 4}
            cy={CENTER_Y - FRAME_SIZE / 2 + EYE_LEVEL_FROM_TOP}
            r="4"
            fill="green"
            opacity="0.8"
          />
          <Circle
            cx={CENTER_X + OVAL_WIDTH / 4}
            cy={CENTER_Y - FRAME_SIZE / 2 + EYE_LEVEL_FROM_TOP}
            r="4"
            fill="green"
            opacity="0.8"
          />

          {/* Chin level guide line */}
          <Line
            x1={CENTER_X - OVAL_WIDTH / 3}
            y1={CENTER_Y - FRAME_SIZE / 2 + CHIN_LEVEL_FROM_TOP}
            x2={CENTER_X + OVAL_WIDTH / 3}
            y2={CENTER_Y - FRAME_SIZE / 2 + CHIN_LEVEL_FROM_TOP}
            stroke="orange"
            strokeWidth="2"
            strokeDasharray="6,3"
          />

          {/* Head size measurement - minimum */}
          <Line
            x1={CENTER_X}
            y1={CENTER_Y - HEAD_MIN_SIZE / 2}
            x2={CENTER_X}
            y2={CENTER_Y + HEAD_MIN_SIZE / 2}
            stroke="yellow"
            strokeWidth="2"
          />
          <Line
            x1={CENTER_X - 10}
            y1={CENTER_Y - HEAD_MIN_SIZE / 2}
            x2={CENTER_X + 10}
            y2={CENTER_Y - HEAD_MIN_SIZE / 2}
            stroke="yellow"
            strokeWidth="2"
          />
          <Line
            x1={CENTER_X - 10}
            y1={CENTER_Y + HEAD_MIN_SIZE / 2}
            x2={CENTER_X + 10}
            y2={CENTER_Y + HEAD_MIN_SIZE / 2}
            stroke="yellow"
            strokeWidth="2"
          />

          {/* Head size measurement - maximum */}
          <Line
            x1={CENTER_X + 30}
            y1={CENTER_Y - HEAD_MAX_SIZE / 2}
            x2={CENTER_X + 30}
            y2={CENTER_Y + HEAD_MAX_SIZE / 2}
            stroke="red"
            strokeWidth="2"
          />
          <Line
            x1={CENTER_X + 20}
            y1={CENTER_Y - HEAD_MAX_SIZE / 2}
            x2={CENTER_X + 40}
            y2={CENTER_Y - HEAD_MAX_SIZE / 2}
            stroke="red"
            strokeWidth="2"
          />
          <Line
            x1={CENTER_X + 20}
            y1={CENTER_Y + HEAD_MAX_SIZE / 2}
            x2={CENTER_X + 40}
            y2={CENTER_Y + HEAD_MAX_SIZE / 2}
            stroke="red"
            strokeWidth="2"
          />

          {/* Center cross for alignment */}
          <Line
            x1={CENTER_X - 15}
            y1={CENTER_Y}
            x2={CENTER_X + 15}
            y2={CENTER_Y}
            stroke="white"
            strokeWidth="1"
            opacity="0.7"
          />
          <Line
            x1={CENTER_X}
            y1={CENTER_Y - 15}
            x2={CENTER_X}
            y2={CENTER_Y + 15}
            stroke="white"
            strokeWidth="1"
            opacity="0.7"
          />
        </Svg>
      </View>

      {/* Bottom Guidelines */}
      <View style={styles.bottomInstructionsContainer}>
        <View style={styles.guideRow}>
          <View style={styles.colorGuide}>
            <View style={[styles.colorDot, { backgroundColor: 'green' }]} />
            <Text style={styles.guideText}>Eyes on green line</Text>
          </View>
          <View style={styles.colorGuide}>
            <View style={[styles.colorDot, { backgroundColor: 'orange' }]} />
            <Text style={styles.guideText}>Chin on orange line</Text>
          </View>
        </View>
        <View style={styles.guideRow}>
          <View style={styles.colorGuide}>
            <View style={[styles.colorDot, { backgroundColor: 'yellow' }]} />
            <Text style={styles.guideText}>Min head size</Text>
          </View>
          <View style={styles.colorGuide}>
            <View style={[styles.colorDot, { backgroundColor: 'red' }]} />
            <Text style={styles.guideText}>Max head size</Text>
          </View>
        </View>
        <Text style={styles.footerText}>
          Head must be 50-69% of photo height (1-1⅜ inches)
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  topInstructionsContainer: {
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
    marginTop: Platform.OS === 'ios' ? 44 : 24,
  },
  headerText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  instructionText: {
    color: 'white',
    fontSize: 14,
    marginBottom: 4,
  },
  guideContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  bottomInstructionsContainer: {
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  guideRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  colorGuide: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  guideText: {
    color: 'white',
    fontSize: 13,
  },
  footerText: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 8,
  },
});
