import { DrugInteraction } from '../types';

// Comprehensive drug interaction database
const DRUG_INTERACTIONS: DrugInteraction[] = [
  {
    drug1: 'aspirin',
    drug2: 'warfarin',
    severity: 'major',
    description: 'Aspirin ve warfarin birlikte kullanıldığında kanama riski önemli ölçüde artar.',
    recommendation: 'Bu kombinasyonu kullanmadan önce doktorunuza danışın. Düzenli kan kontrolü gerekebilir.'
  },
  {
    drug1: 'aspirin',
    drug2: 'ibuprofen',
    severity: 'moderate',
    description: 'Her iki ilaç da NSAİİ grubu olduğu için mide irritasyonu ve kanama riski artabilir.',
    recommendation: 'Aynı anda kullanmaktan kaçının. Aralarında en az 2 saat bekleyin.'
  },
  {
    drug1: 'paracetamol',
    drug2: 'alkol',
    severity: 'major',
    description: 'Alkol ile birlikte kullanıldığında karaciğer hasarı riski artar.',
    recommendation: 'Alkol tüketimini sınırlayın veya tamamen bırakın.'
  },
  {
    drug1: 'metformin',
    drug2: 'alkol',
    severity: 'moderate',
    description: 'Alkol laktik asidoz riskini artırabilir.',
    recommendation: 'Alkol tüketimini sınırlayın ve doktorunuzu bilgilendirin.'
  },
  {
    drug1: 'simvastatin',
    drug2: 'grapefrut',
    severity: 'major',
    description: 'Greyfurt simvastatin seviyesini artırarak kas hasarı riskini yükseltir.',
    recommendation: 'Greyfurt ve greyfurt suyu tüketiminden kaçının.'
  },
  {
    drug1: 'digoxin',
    drug2: 'furosemid',
    severity: 'moderate',
    description: 'Furosemid potasyum kaybına neden olarak digoxin toksisitesi riskini artırır.',
    recommendation: 'Düzenli elektrolit kontrolü yapılmalı, potasyum takviyeleri gerekebilir.'
  },
  {
    drug1: 'ace inhibitör',
    drug2: 'potasyum',
    severity: 'moderate',
    description: 'ACE inhibitörleri potasyum seviyesini artırır, ek potasyum hiperkalemi yapabilir.',
    recommendation: 'Potasyum takviyesi kullanmadan önce doktorunuza danışın.'
  },
  {
    drug1: 'insulin',
    drug2: 'alkol',
    severity: 'major',
    description: 'Alkol hipoglisemi riskini artırır ve kan şekeri kontrolünü zorlaştırır.',
    recommendation: 'Alkol tüketimini sınırlayın ve kan şekerinizi sık kontrol edin.'
  }
];

export class DrugInteractionService {
  static checkInteractions(medicineNames: string[]): DrugInteraction[] {
    const interactions: DrugInteraction[] = [];
    const normalizedNames = medicineNames.map(name => this.normalizeDrugName(name));

    for (let i = 0; i < normalizedNames.length; i++) {
      for (let j = i + 1; j < normalizedNames.length; j++) {
        const drug1 = normalizedNames[i];
        const drug2 = normalizedNames[j];

        const interaction = DRUG_INTERACTIONS.find(inter => 
          (this.drugMatches(inter.drug1, drug1) && this.drugMatches(inter.drug2, drug2)) ||
          (this.drugMatches(inter.drug1, drug2) && this.drugMatches(inter.drug2, drug1))
        );

        if (interaction) {
          interactions.push({
            ...interaction,
            drug1: medicineNames[i],
            drug2: medicineNames[j]
          });
        }
      }
    }

    return interactions;
  }

  private static normalizeDrugName(name: string): string {
    return name.toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/\d+\s*(mg|ml|gr|mcg|iu)/gi, '')
      .trim();
  }

  private static drugMatches(interactionDrug: string, medicineName: string): boolean {
    const normalized = this.normalizeDrugName(medicineName);
    
    // Exact match
    if (normalized.includes(interactionDrug.toLowerCase())) {
      return true;
    }

    // Common drug name mappings
    const drugMappings: { [key: string]: string[] } = {
      'aspirin': ['aspirin', 'asetilsalisilik asit', 'asa'],
      'paracetamol': ['paracetamol', 'asetaminofen', 'parol'],
      'ibuprofen': ['ibuprofen', 'brufen', 'advil'],
      'metformin': ['metformin', 'glucophage'],
      'simvastatin': ['simvastatin', 'zocor'],
      'digoxin': ['digoxin', 'lanoxin'],
      'furosemid': ['furosemid', 'lasix'],
      'ace inhibitör': ['enalapril', 'lisinopril', 'ramipril', 'captopril'],
      'insulin': ['insulin', 'insülin', 'humulin', 'novolog']
    };

    const mappings = drugMappings[interactionDrug.toLowerCase()] || [];
    return mappings.some(mapping => normalized.includes(mapping));
  }

  static getSeverityColor(severity: 'minor' | 'moderate' | 'major'): string {
    switch (severity) {
      case 'minor': return 'text-yellow-600 bg-yellow-100';
      case 'moderate': return 'text-orange-600 bg-orange-100';
      case 'major': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }

  static getSeverityText(severity: 'minor' | 'moderate' | 'major'): string {
    switch (severity) {
      case 'minor': return 'Hafif';
      case 'moderate': return 'Orta';
      case 'major': return 'Ciddi';
      default: return 'Bilinmiyor';
    }
  }
}