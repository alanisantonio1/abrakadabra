
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../styles/commonStyles';
import { Package } from '../types';

interface PackageCardProps {
  package: Package;
  isWeekend: boolean;
  onSelect: () => void;
  isSelected?: boolean;
}

const PackageCard: React.FC<PackageCardProps> = ({ package: pkg, isWeekend, onSelect, isSelected }) => {
  const price = isWeekend ? pkg.weekendPrice : pkg.weekdayPrice;

  return (
    <TouchableOpacity 
      style={[styles.card, isSelected && styles.selectedCard]} 
      onPress={onSelect}
    >
      <Image source={{ uri: pkg.image }} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.name}>{pkg.name}</Text>
        <Text style={styles.description}>{pkg.description}</Text>
        
        <View style={styles.priceContainer}>
          <Text style={styles.price}>${price}</Text>
          <Text style={styles.priceLabel}>
            {isWeekend ? 'Fin de semana' : 'Entre semana'}
          </Text>
        </View>

        <View style={styles.features}>
          {pkg.features.map((feature, index) => (
            <Text key={index} style={styles.feature}>• {feature}</Text>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    marginVertical: 8,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
    overflow: 'hidden',
  },
  selectedCard: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  image: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  content: {
    padding: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 12,
    lineHeight: 20,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
  },
  priceLabel: {
    fontSize: 12,
    color: colors.textLight,
    fontStyle: 'italic',
  },
  features: {
    gap: 4,
  },
  feature: {
    fontSize: 12,
    color: colors.text,
    lineHeight: 16,
  },
});

export default PackageCard;
