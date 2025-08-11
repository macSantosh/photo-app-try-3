import React from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../utils/styles';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Types for different country photo requirements
export type GuidelineConfig = {
  // Face positioning (percentages of crop frame)
  faceOval: {
    width: number; // percentage of crop frame width
    height: number; // percentage of crop frame height
    topOffset: number; // percentage from top
  };
  // Horizontal guidelines (percentages from bottom)
  chinLine: {
    position: number; // percentage from bottom
    label: string;
  };
  headTopLine: {
    position: number; // percentage from top
    label: string;
  };
  eyeLine: {
    position: number; // percentage from bottom
    label: string;
  };
  // Dimension indicators
  dimensions: {
    width: string; // e.g., "51 mm", "2 inches"
    height: string;
  };
  // Visual styling
  colors: {
    frame: string;
    guidelines: string;
    labels: string;
  };
};

interface CropOverlayProps {
  cropFrameSize: number;
  containerHeight: number;
  showGuidelines: boolean;
  guidelines: GuidelineConfig; // Made required since it should come from props
}

export const CropOverlay: React.FC<CropOverlayProps> = ({
  cropFrameSize,
  containerHeight,
  showGuidelines,
  guidelines,
}) => {
  return (
    <>
      {/* Crop Frame */}
      <View 
        style={[
          styles.cropFrame, 
          { 
            width: cropFrameSize, 
            height: cropFrameSize,
            borderColor: guidelines.colors.frame,
          }
        ]}
      >
        {/* Head positioning guidelines */}
        {showGuidelines && (
          <View style={[styles.guidelineContainer, { width: cropFrameSize, height: cropFrameSize }]}>
            {/* Vertical center guideline */}
            <View 
              style={[
                styles.verticalGuideline,
                { 
                  left: cropFrameSize * 0.5 - 1,
                  height: cropFrameSize * 0.8,
                  top: cropFrameSize * 0.1,
                  borderLeftColor: guidelines.colors.guidelines,
                }
              ]}
            />
            
            {/* Face oval outline */}
            <View 
              style={[
                styles.faceOval,
                { 
                  left: cropFrameSize * 0.5 - (cropFrameSize * (guidelines.faceOval.width / 100) / 2),
                  top: cropFrameSize * (guidelines.faceOval.topOffset / 100),
                  width: cropFrameSize * (guidelines.faceOval.width / 100),
                  height: cropFrameSize * (guidelines.faceOval.height / 100),
                  borderColor: guidelines.colors.guidelines,
                }
              ]}
            />
            
            {/* Chin guideline */}
            <View 
              style={[
                styles.horizontalGuideline,
                { 
                  bottom: cropFrameSize * (guidelines.chinLine.position / 100),
                  borderTopColor: guidelines.colors.guidelines,
                }
              ]}
            />
            <Text style={[
              styles.guidelineLabel, 
              { 
                bottom: cropFrameSize * (guidelines.chinLine.position / 100) - 25, 
                left: cropFrameSize * 0.5 - 15,
                color: guidelines.colors.labels,
              }
            ]}>
              {guidelines.chinLine.label}
            </Text>
            
            {/* Top of head guideline */}
            <View 
              style={[
                styles.horizontalGuideline,
                { 
                  top: cropFrameSize * (guidelines.headTopLine.position / 100),
                  borderTopColor: guidelines.colors.guidelines,
                }
              ]}
            />
            <Text style={[
              styles.guidelineLabel, 
              { 
                top: cropFrameSize * (guidelines.headTopLine.position / 100) - 25, 
                left: cropFrameSize * 0.5 - 25,
                color: guidelines.colors.labels,
              }
            ]}>
              {guidelines.headTopLine.label}
            </Text>
            
            {/* Eye level guideline */}
            <View 
              style={[
                styles.horizontalGuideline,
                styles.eyeGuideline,
                { 
                  bottom: cropFrameSize * (guidelines.eyeLine.position / 100),
                  borderTopColor: guidelines.colors.guidelines,
                }
              ]}
            />
            <Text style={[
              styles.guidelineLabel, 
              styles.eyeLabel, 
              { 
                bottom: cropFrameSize * (guidelines.eyeLine.position / 100) - 8, 
                right: 8,
                color: guidelines.colors.labels,
              }
            ]}>
              {guidelines.eyeLine.label}
            </Text>
          </View>
        )}
      </View>
      
      {/* Shadow curtain overlay to focus on crop area */}
      <View style={styles.shadowCurtainContainer} pointerEvents="none">
        {/* Four panels creating hole around crop frame without overlapping */}
        {/* Top panel */}
        <View style={[styles.shadowCurtain, {
          top: 0,
          left: 0,
          right: 0,
          height: (containerHeight - cropFrameSize) / 2,
        }]} />
        
        {/* Bottom panel */}
        <View style={[styles.shadowCurtain, {
          bottom: 0,
          left: 0,
          right: 0,
          height: (containerHeight - cropFrameSize) / 2,
        }]} />
        
        {/* Left panel - positioned to not overlap with crop frame */}
        <View style={[styles.shadowCurtain, {
          top: (containerHeight - cropFrameSize) / 2,
          left: 0,
          width: (SCREEN_WIDTH - cropFrameSize) / 2 - 14,
          height: cropFrameSize,
        }]} />
        
        {/* Right panel - positioned to not overlap with crop frame */}
        <View style={[styles.shadowCurtain, {
          top: (containerHeight - cropFrameSize) / 2,
          right: 0,
          width: (SCREEN_WIDTH - cropFrameSize) / 2 - 14,
          height: cropFrameSize,
        }]} />
      </View>

      {/* Dimensional indicators - positioned close to crop frame */}
      {/* Width dimension indicator - bottom */}
      <View style={[styles.dimensionIndicator, styles.widthDimension, { 
        bottom: cropFrameSize + spacing.sm - 10,
        left: (SCREEN_WIDTH - cropFrameSize) / 2,
        width: cropFrameSize,
      }]}>
        <View style={styles.dimensionLine} />
        <Text style={styles.dimensionText}>{guidelines.dimensions.width}</Text>
        <View style={[styles.dimensionTick, { left: 0 }]} />
        <View style={[styles.dimensionTick, { right: 0 }]} />
      </View>
      
      {/* Height dimension indicator - right */}
      <View style={[styles.dimensionIndicator, styles.heightDimension, { 
        right: spacing.lg + 10,
        top: (containerHeight - cropFrameSize) / 2,
        height: cropFrameSize,
      }]}>
        <View style={styles.dimensionLineVertical} />
        <Text style={[styles.dimensionText, styles.dimensionTextVertical]}>{guidelines.dimensions.height}</Text>
        <View style={[styles.dimensionTick, styles.dimensionTickVertical, { top: 0 }]} />
        <View style={[styles.dimensionTick, styles.dimensionTickVertical, { bottom: 0 }]} />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  cropFrame: {
    position: 'absolute',
    borderWidth: 2,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    zIndex: 10,
    pointerEvents: 'none',
  },
  guidelineContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  horizontalGuideline: {
    position: 'absolute',
    height: 2,
    backgroundColor: 'transparent',
    borderTopWidth: 2,
    borderStyle: 'dotted',
    opacity: 1,
    left: '20%',
    right: '20%',
  },
  verticalGuideline: {
    position: 'absolute',
    width: 2,
    backgroundColor: 'transparent',
    borderLeftWidth: 3,
    borderStyle: 'dotted',
    opacity: 1,
  },
  faceOval: {
    position: 'absolute',
    borderWidth: 2,
    borderStyle: 'dotted',
    borderRadius: 1000,
    backgroundColor: 'transparent',
    opacity: 1,
    pointerEvents: 'none',
  },
  eyeGuideline: {
    backgroundColor: 'transparent',
    borderTopWidth: 2,
    borderStyle: 'dotted',
    opacity: 1,
    height: 3,
  },
  guidelineLabel: {
    position: 'absolute',
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.primary,
    fontWeight: '700',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    opacity: 0.95,
  },
  eyeLabel: {
    fontWeight: '700',
  },
  // Dimensional indicator styles
  dimensionIndicator: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  widthDimension: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heightDimension: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  dimensionLine: {
    position: 'absolute',
    width: '100%',
    height: 1,
    backgroundColor: '#FFFFFF',
    opacity: 0.8,
  },
  dimensionLineVertical: {
    position: 'absolute',
    height: '100%',
    width: 1,
    backgroundColor: '#FFFFFF',
    opacity: 0.8,
  },
  dimensionText: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
    color: '#FFFFFF',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    zIndex: 1,
    opacity: 0.9,
  },
  dimensionTextVertical: {
    transform: [{ rotate: '90deg' }],
  },
  dimensionTick: {
    position: 'absolute',
    width: 1,
    height: 6,
    backgroundColor: '#FFFFFF',
    opacity: 0.8,
  },
  dimensionTickVertical: {
    width: 6,
    height: 1,
  },
  // Shadow curtain styles for focus effect
  shadowCurtainContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 5,
  },
  shadowCurtain: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});
