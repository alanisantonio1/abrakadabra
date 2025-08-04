
import { Package } from '../types';

export const packages: Package[] = [
  {
    id: '1',
    name: 'Abra',
    description: 'Paquete básico perfecto para celebraciones íntimas',
    weekdayPrice: 2500,
    weekendPrice: 3000,
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400',
    features: [
      'Decoración básica',
      'Mesa de dulces pequeña',
      'Animación 2 horas',
      'Hasta 15 niños'
    ]
  },
  {
    id: '2',
    name: 'Kadabra',
    description: 'Paquete intermedio con más diversión y actividades',
    weekdayPrice: 3500,
    weekendPrice: 4200,
    image: 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=400',
    features: [
      'Decoración temática',
      'Mesa de dulces mediana',
      'Animación 3 horas',
      'Juegos y actividades',
      'Hasta 25 niños'
    ]
  },
  {
    id: '3',
    name: 'Abrakadabra',
    description: 'Paquete premium con toda la magia incluida',
    weekdayPrice: 5000,
    weekendPrice: 6000,
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400',
    features: [
      'Decoración premium',
      'Mesa de dulces grande',
      'Animación 4 horas',
      'Show de magia',
      'Piñata incluida',
      'Hasta 40 niños'
    ]
  }
];
