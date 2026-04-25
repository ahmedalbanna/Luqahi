export interface Vaccine {
  key: string;
  nameAr: string;
  nameEn: string;
  doses: VaccineDose[];
}

export interface VaccineDose {
  doseNumber: number;
  ageInDays: number;
  descriptionAr: string;
}

export const VACCINATION_SCHEDULE: Vaccine[] = [
  {
    key: 'BCG',
    nameAr: 'السل (BCG)',
    nameEn: 'Tuberculosis',
    doses: [{ doseNumber: 1, ageInDays: 0, descriptionAr: 'عند الولادة' }]
  },
  {
    key: 'POLIO',
    nameAr: 'شلل الأطفال',
    nameEn: 'Polio',
    doses: [
      { doseNumber: 0, ageInDays: 0, descriptionAr: 'عند الولادة' },
      { doseNumber: 1, ageInDays: 42, descriptionAr: '6 أسابيع' },
      { doseNumber: 2, ageInDays: 70, descriptionAr: '10 أسابيع' },
      { doseNumber: 3, ageInDays: 98, descriptionAr: '14 أسبوع' }
    ]
  },
  {
    key: 'PENTAVALENT',
    nameAr: 'الخماسي',
    nameEn: 'Pentavalent',
    doses: [
      { doseNumber: 1, ageInDays: 42, descriptionAr: '6 أسابيع' },
      { doseNumber: 2, ageInDays: 70, descriptionAr: '10 أسابيع' },
      { doseNumber: 3, ageInDays: 98, descriptionAr: '14 أسبوع' }
    ]
  },
  {
    key: 'MEASLES',
    nameAr: 'الحصبة',
    nameEn: 'Measles',
    doses: [
      { doseNumber: 1, ageInDays: 270, descriptionAr: '9 أشهر' },
      { doseNumber: 2, ageInDays: 540, descriptionAr: '18 شهر' }
    ]
  }
];

export const YEMEN_GOVERNORATES = [
  'صنعاء', 'عدن', 'تعز', 'حضرموت', 'الحديدة', 'إب', 'ذمار', 'مأرب', 'صعدة', 'حجة', 'البيضاء', 'لحج', 'أبين', 'الضالع', 'شبوة', 'الجوف', 'المهرة', 'أرخبيل سقطرى', 'ريمة', 'عمران', 'المحويت'
];
