import React from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import Svg, { Line, Ellipse, Text as SvgText } from 'react-native-svg';
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
            {/* SVG for dashed guidelines */}
            <Svg 
              width={cropFrameSize} 
              height={cropFrameSize} 
              style={styles.svgGuidelines}
            >
              {/* Vertical center guideline */}
              <Line
                x1={cropFrameSize * 0.5}
                y1={cropFrameSize * 0.12}
                x2={cropFrameSize * 0.5}
                y2={cropFrameSize * 0.82}
                stroke={guidelines.colors.guidelines}
                strokeWidth="1.2"
                strokeDasharray="8,4"
                opacity={0.8}
              />
              
              {/* Face oval outline */}
              <Ellipse
                cx={cropFrameSize * 0.5}
                cy={cropFrameSize * (guidelines.faceOval.topOffset / 100) + (cropFrameSize * (guidelines.faceOval.height / 100) / 2)}
                rx={cropFrameSize * (guidelines.faceOval.width / 100) / 2}
                ry={cropFrameSize * (guidelines.faceOval.height / 100) / 2}
                fill="none"
                stroke={guidelines.colors.guidelines}
                strokeWidth="1.2"
                strokeDasharray="6,3"
                opacity={0.8}
              />
              
              {/* Chin guideline */}
              <Line
                x1={cropFrameSize * 0.2}
                y1={cropFrameSize - (cropFrameSize * (guidelines.chinLine.position / 100))+1}
                x2={cropFrameSize * 0.8}
                y2={cropFrameSize - (cropFrameSize * (guidelines.chinLine.position / 100))+1}
                stroke={guidelines.colors.guidelines}
                strokeWidth="1.2"
                strokeDasharray="8,4"
                opacity={0.8}
              />
              
              {/* Top of head guideline */}
              <Line
                x1={cropFrameSize * 0.2}
                y1={cropFrameSize * (guidelines.headTopLine.position / 100)-1}
                x2={cropFrameSize * 0.8}
                y2={cropFrameSize * (guidelines.headTopLine.position / 100)-1}
                stroke={guidelines.colors.guidelines}
                strokeWidth="1.2"
                strokeDasharray="8,4"
                opacity={0.8}
              />
              
              {/* Eye level guideline */}
              <Line
                x1={cropFrameSize * 0.2}
                y1={cropFrameSize - (cropFrameSize * (guidelines.eyeLine.position / 100))}
                x2={cropFrameSize * 0.8}
                y2={cropFrameSize - (cropFrameSize * (guidelines.eyeLine.position / 100))}
                stroke={guidelines.colors.guidelines}
                strokeWidth="1.2"
                strokeDasharray="8,4"
                opacity={0.8}
              />
            </Svg>
            
            {/* Labels remain as Text elements */}
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
            
            <Text style={[
              styles.guidelineLabel, 
              styles.eyeLabel, 
              { 
                bottom: cropFrameSize * (guidelines.eyeLine.position / 100) - 20, 
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
        bottom: spacing.xl,
        left: (SCREEN_WIDTH - cropFrameSize - (spacing.lg*2)) / 2,
        width: cropFrameSize,
      }]}>
        <View style={styles.dimensionLine} />
        {/* SVG Text for width dimension */}
        <Svg 
          width={cropFrameSize} 
          height={30} 
          style={styles.svgDimensionText}
        >
          {/* Background stroke for better readability */}
          <SvgText
            x={cropFrameSize / 2}
            y={15}
            fontSize={typography.fontSize.xs}
            fontFamily={typography.fontFamily.primary}
            fontWeight="600"
            fill="rgba(0, 0, 0, 0.8)"
            textAnchor="middle"
            alignmentBaseline="middle"
            stroke="rgba(0, 0, 0, 0.8)"
            strokeWidth="3"
          >
            {guidelines.dimensions.width}
          </SvgText>
          {/* Main text */}
          <SvgText
            x={cropFrameSize / 2}
            y={15}
            fontSize={typography.fontSize.xs}
            fontFamily={typography.fontFamily.primary}
            fontWeight="600"
            fill="#FFFFFF"
            textAnchor="middle"
            alignmentBaseline="middle"
          >
            {guidelines.dimensions.width}
          </SvgText>
        </Svg>
        <View style={[styles.dimensionTick, { left: 0 }]} />
        <View style={[styles.dimensionTick, { right: 0 }]} />
      </View>
      
      {/* Height dimension indicator - right */}
      <View style={[styles.dimensionIndicator, styles.heightDimension, { 
        right: spacing.lg*2,
        top: (containerHeight - cropFrameSize) / 2,
        height: cropFrameSize,
      }]}>
        <View style={styles.dimensionLineVertical} />
        {/* SVG Text for height dimension with rotation */}
        <Svg 
          width={60} 
          height={cropFrameSize} 
          style={styles.svgDimensionText}
        >
          {/* Background stroke for better readability */}
          <SvgText
            x={30}
            y={cropFrameSize / 2}
            fontSize={typography.fontSize.xs}
            fontFamily={typography.fontFamily.primary}
            fontWeight="600"
            fill="rgba(0, 0, 0, 0.8)"
            textAnchor="middle"
            alignmentBaseline="middle"
            transform={`rotate(90, 30, ${cropFrameSize / 2})`}
            stroke="rgba(0, 0, 0, 0.8)"
            strokeWidth="3"
          >
            {guidelines.dimensions.height}
          </SvgText>
          {/* Main text */}
          <SvgText
            x={30}
            y={cropFrameSize / 2}
            fontSize={typography.fontSize.xs}
            fontFamily={typography.fontFamily.primary}
            fontWeight="600"
            fill="#FFFFFF"
            textAnchor="middle"
            alignmentBaseline="middle"
            transform={`rotate(90, 30, ${cropFrameSize / 2})`}
          >
            {guidelines.dimensions.height}
          </SvgText>
        </Svg>
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
    zIndex: 15,
    pointerEvents: 'none',
  },
  guidelineContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
    zIndex: 16,
  },
  svgGuidelines: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 16,
    pointerEvents: 'none',
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
    zIndex: 12,
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
    paddingVertical: 0,
    borderRadius: borderRadius.sm,
    zIndex: 13,
    opacity: 0.9,
  },
  svgDimensionText: {
    position: 'absolute',
    zIndex: 13,
    pointerEvents: 'none',
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
