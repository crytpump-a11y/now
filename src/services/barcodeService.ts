import { supabase } from '../lib/supabase';
import { Html5QrcodeScanner } from 'html5-qrcode';

export interface MedicineInfo {
  name: string;
  barcode: string;
  manufacturer?: string;
  activeIngredient?: string;
}

export class BarcodeService {
  private scanner: Html5QrcodeScanner | null = null;

  async startScanning(
    elementId: string,
    onSuccess: (decodedText: string, result: any) => void,
    onError?: (error: string) => void
  ): Promise<void> {
    this.scanner = new Html5QrcodeScanner(
      elementId,
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      },
      false
    );

    this.scanner.render(
      (decodedText, result) => {
        this.stopScanning();
        onSuccess(decodedText, result);
      },
      (errorMessage) => {
        if (onError) {
          onError(errorMessage);
        }
      }
    );
  }

  stopScanning(): void {
    if (this.scanner) {
      this.scanner.clear();
      this.scanner = null;
    }
  }

  async getMedicineInfo(barcode: string): Promise<MedicineInfo | null> {
    try {
      // Call the Edge Function to get medicine info securely
      const { data, error } = await supabase.functions.invoke('get-medicine-info', {
        body: { barcode }
      });
      
      if (!error && data?.success) {
        return data.data;
      } else if (data?.message === 'Medicine not found') {
        return null;
      } else {
        console.error('Medicine info error:', error);
        // Fallback to mock data if Edge Function fails
        return this.getMockMedicineInfo(barcode);
      }
    } catch (error) {
      console.error('Error getting medicine info:', error);
      // Fallback to mock data
      return this.getMockMedicineInfo(barcode);
    }
  }

  private extractManufacturer(text: string): string | undefined {
    const manufacturers = ['Bayer', 'Pfizer', 'Novartis', 'Roche', 'Sanofi', 'Atabay', 'Abdi İbrahim', 'Bilim İlaç'];
    for (const manufacturer of manufacturers) {
      if (text.toLowerCase().includes(manufacturer.toLowerCase())) {
        return manufacturer;
      }
    }
    return undefined;
  }

  private extractActiveIngredient(text: string): string | undefined {
    const ingredients = ['Parasetamol', 'Aspirin', 'İbuprofen', 'Diklofenak', 'Asetilsalisilik Asit'];
    for (const ingredient of ingredients) {
      if (text.toLowerCase().includes(ingredient.toLowerCase())) {
        return ingredient;
      }
    }
    return undefined;
  }

  private getMockMedicineInfo(barcode: string): MedicineInfo | null {
    const mockDatabase: Record<string, MedicineInfo> = {
      '8699546334455': {
        name: 'Aspirin 100mg',
        barcode: '8699546334455',
        manufacturer: 'Bayer',
        activeIngredient: 'Asetilsalisilik Asit'
      },
      '8699546334456': {
        name: 'Parol 500mg',
        barcode: '8699546334456',
        manufacturer: 'Atabay',
        activeIngredient: 'Parasetamol'
      },
      '8699546334457': {
        name: 'Voltaren Gel',
        barcode: '8699546334457',
        manufacturer: 'Novartis',
        activeIngredient: 'Diklofenak'
      },
      '8699546334458': {
        name: 'Nurofen 400mg',
        barcode: '8699546334458',
        manufacturer: 'Reckitt Benckiser',
        activeIngredient: 'İbuprofen'
      },
      '8699546334459': {
        name: 'Augmentin 1000mg',
        barcode: '8699546334459',
        manufacturer: 'GlaxoSmithKline',
        activeIngredient: 'Amoksisilin + Klavulanik Asit'
      },
      '8699546334460': {
        name: 'Cipro 500mg',
        barcode: '8699546334460',
        manufacturer: 'Bayer',
        activeIngredient: 'Siprofloksasin'
      },
      '8699546334461': {
        name: 'Concor 5mg',
        barcode: '8699546334461',
        manufacturer: 'Merck',
        activeIngredient: 'Bisoprolol'
      },
      '8699546334462': {
        name: 'Glucophage 850mg',
        barcode: '8699546334462',
        manufacturer: 'Merck',
        activeIngredient: 'Metformin'
      }
    };

    return mockDatabase[barcode] || null;
  }
}