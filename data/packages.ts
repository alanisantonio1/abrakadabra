
import { Package } from '../types';

export const packages: Package[] = [
  {
    id: '1',
    name: 'Abra',
    description: 'Paquete básico perfecto para celebraciones íntimas',
    weekdayPrice: 4000,    // Monday to Friday: 4,000
    weekendPrice: 6000,    // Saturday: 6,000 (Sunday will be handled separately: 5,000)
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
    weekdayPrice: 12000,   // Monday to Friday: 12,000
    weekendPrice: 14000,   // Saturday: 14,000 (Sunday will be handled separately: 13,000)
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
    weekdayPrice: 35000,   // Monday to Friday: 35,000
    weekendPrice: 40000,   // Saturday: 40,000 (Sunday will be handled separately: 37,500)
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
