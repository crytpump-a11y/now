import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MedicineInfo {
  name: string;
  barcode: string;
  manufacturer?: string;
  activeIngredient?: string;
}

// Mock medicine database - in production, this would connect to a real API
const MEDICINE_DATABASE: Record<string, MedicineInfo> = {
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
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { barcode } = await req.json()

    if (!barcode) {
      return new Response(
        JSON.stringify({ error: 'Barcode is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Look up medicine in database
    const medicineInfo = MEDICINE_DATABASE[barcode]

    if (medicineInfo) {
      return new Response(
        JSON.stringify({ success: true, data: medicineInfo }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    } else {
      return new Response(
        JSON.stringify({ success: false, message: 'Medicine not found' }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})