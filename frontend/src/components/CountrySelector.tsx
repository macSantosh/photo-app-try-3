import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../utils/styles';
import { CountryCode, COUNTRY_GUIDELINES, getGuidelinesByCountry } from '../utils/photoGuidelines';

interface CountrySelectorProps {
  selectedCountry: CountryCode;
  onSelectCountry: (country: CountryCode) => void;
  visible?: boolean;
}

const COUNTRY_NAMES = {
  US: 'United States',
  UK: 'United Kingdom',
  CA: 'Canada',
  EU: 'European Union',
  IN: 'India',
  AU: 'Australia',
  CN: 'China',
} as const;

export const CountrySelector: React.FC<CountrySelectorProps> = ({
  selectedCountry,
  onSelectCountry,
  visible = true,
}) => {
  if (!visible) return null;

  const countries = Object.keys(COUNTRY_GUIDELINES) as CountryCode[];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Country/Region</Text>
      <Text style={styles.subtitle}>Choose your passport photo requirements</Text>
      
      <ScrollView style={styles.countryList} showsVerticalScrollIndicator={false}>
        {countries.map((countryCode) => {
          const guidelines = getGuidelinesByCountry(countryCode);
          const isSelected = countryCode === selectedCountry;
          
          return (
            <TouchableOpacity
              key={countryCode}
              style={[styles.countryItem, isSelected && styles.selectedCountryItem]}
              onPress={() => onSelectCountry(countryCode)}
            >
              <View style={styles.countryInfo}>
                <Text style={[styles.countryName, isSelected && styles.selectedCountryName]}>
                  {COUNTRY_NAMES[countryCode]}
                </Text>
                <Text style={[styles.countryDimensions, isSelected && styles.selectedCountryDimensions]}>
                  {guidelines.dimensions.width} × {guidelines.dimensions.height}
                </Text>
              </View>
              {isSelected && (
                <View style={styles.checkmark}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.light,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    margin: spacing.lg,
    ...shadows.md,
  },
  title: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.lg,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  countryList: {
    maxHeight: 200,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.background.main,
    backgroundColor: colors.background.main,
  },
  selectedCountryItem: {
    borderColor: colors.primary.navy,
    backgroundColor: colors.primary.navy + '10', // 10% opacity
  },
  countryInfo: {
    flex: 1,
  },
  countryName: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  selectedCountryName: {
    color: colors.primary.navy,
  },
  countryDimensions: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  selectedCountryDimensions: {
    color: colors.primary.navy,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: colors.text.light,
    fontSize: typography.fontSize.sm,
    fontWeight: '700',
  },
});
