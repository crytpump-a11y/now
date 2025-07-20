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
      // Try Google Search API for medicine information
      const searchQuery = `${barcode} ilaç medicine drug`;
      const response = await fetch(`https://www.googleapis.com/customsearch/v1?key=YOUR_API_KEY&cx=YOUR_SEARCH_ENGINE_ID&q=${encodeURIComponent(searchQuery)}`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.items && data.items.length > 0) {
          const firstResult = data.items[0];
          const title = firstResult.title;
          const snippet = firstResult.snippet;
          
          // Extract medicine name from title/snippet
          const medicineNameMatch = title.match(/([A-Za-zÇĞıİÖŞÜçğıöşü\s]+)\s*\d+\s*(mg|ml|gr)/i);
          const medicineName = medicineNameMatch ? medicineNameMatch[1].trim() : title.split(' ').slice(0, 2).join(' ');
          
          return {
            name: medicineName,
            barcode: barcode,
            manufacturer: this.extractManufacturer(snippet),
            activeIngredient: this.extractActiveIngredient(snippet)
          };
        }
      }
    } catch (error) {
      console.error('Google Search API error:', error);
    }
    
    // Try alternative medicine database APIs
    try {
      const response = await fetch(`https://api.fda.gov/drug/label.json?search=openfda.upc:"${barcode}"`);
      if (response.ok) {
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          const result = data.results[0];
          return {
            name: result.openfda?.brand_name?.[0] || result.openfda?.generic_name?.[0] || 'Bilinmeyen İlaç',
            barcode: barcode,
            manufacturer: result.openfda?.manufacturer_name?.[0],
            activeIngredient: result.active_ingredient?.[0]
          };
        }
      }
    } catch (error) {
      console.error('FDA API error:', error);
    }

    // Fallback to mock database
    return this.getMockMedicineInfo(barcode);
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
      }
    };

    return mockDatabase[barcode] || null;
  }
}