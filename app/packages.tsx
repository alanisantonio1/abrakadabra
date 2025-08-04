
import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { commonStyles, buttonStyles } from '../styles/commonStyles';
import { packages } from '../data/packages';
import PackageCard from '../components/PackageCard';
import Button from '../components/Button';

export default function PackagesScreen() {
  const [isWeekend, setIsWeekend] = useState(false);

  return (
    <ScrollView style={commonStyles.container}>
      <Text style={commonStyles.title}>📦 Paquetes Abrakadabra</Text>

      <View style={commonStyles.content}>
        <View style={commonStyles.section}>
          <Text style={commonStyles.subtitle}>Información de Precios</Text>
          <Text style={commonStyles.text}>
            Nuestros paquetes tienen precios diferenciados según el día de la semana:
          </Text>
          <Text style={commonStyles.textLight}>
            • Entre semana (Lunes a Viernes): Precio regular
          </Text>
          <Text style={commonStyles.textLight}>
            • Fin de semana (Sábado y Domingo): Precio premium
          </Text>
        </View>

        <View style={{ flexDirection: 'row', marginHorizontal: 16, marginBottom: 16, gap: 8 }}>
          <Button
            text="Entre Semana"
            onPress={() => setIsWeekend(false)}
            style={[
              buttonStyles.primary,
              !isWeekend ? {} : { backgroundColor: '#E1E8ED' }
            ]}
            textStyle={!isWeekend ? {} : { color: '#2C3E50' }}
          />
          <Button
            text="Fin de Semana"
            onPress={() => setIsWeekend(true)}
            style={[
              buttonStyles.primary,
              isWeekend ? {} : { backgroundColor: '#E1E8ED' }
            ]}
            textStyle={isWeekend ? {} : { color: '#2C3E50' }}
          />
        </View>

        {packages.map(pkg => (
          <PackageCard
            key={pkg.id}
            package={pkg}
            isWeekend={isWeekend}
            onSelect={() => router.push(`/schedule?package=${pkg.name}`)}
          />
        ))}

        <View style={commonStyles.section}>
          <Text style={commonStyles.subtitle}>Servicios Incluidos en Todos los Paquetes</Text>
          <Text style={commonStyles.textLight}>✨ Decoración temática personalizada</Text>
          <Text style={commonStyles.textLight}>🎈 Globos y adornos</Text>
          <Text style={commonStyles.textLight}>🎵 Música y sonido</Text>
          <Text style={commonStyles.textLight}>📸 Área de fotos</Text>
          <Text style={commonStyles.textLight}>🧹 Limpieza del salón</Text>
          <Text style={commonStyles.textLight}>👥 Personal de apoyo</Text>
        </View>

        <View style={commonStyles.buttonContainer}>
          <Button
            text="Agendar Evento"
            onPress={() => router.push('/schedule')}
            style={buttonStyles.primary}
          />
        </View>

        <View style={commonStyles.buttonContainer}>
          <Button
            text="← Volver"
            onPress={() => router.back()}
            style={buttonStyles.backButton}
          />
        </View>
      </View>
    </ScrollView>
  );
}
