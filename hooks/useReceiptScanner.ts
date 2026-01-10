
import { useCallback, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { PantryItem } from '@/types/pantry';
import { predictExpirationDate } from '@/utils/expirationHelper';
import { categorizeFoodItem } from '@/utils/categoryHelper';

export type ScannedItem = {
  name: string;
  quantity: number;
  unit: string;
  price?: number;
  category?: string;
  expirationDate?: string;
};

type State =
  | { status: 'idle'; data: null; error: null }
  | { status: 'scanning'; data: null; error: null }
  | { status: 'success'; data: ScannedItem[]; error: null }
  | { status: 'error'; data: null; error: string };

export function useReceiptScanner() {
  const [state, setState] = useState<State>({ status: 'idle', data: null, error: null });

  const scanReceipt = useCallback(async (imageUri: string): Promise<ScannedItem[] | null> => {
    setState({ status: 'scanning', data: null, error: null });

    try {
      // TODO: Backend Integration - Call the receipt scanning endpoint
      // This will use GPT-4o vision to extract items from receipt photos
      const prompt = `Analyze this receipt image and extract all food items. For each item, identify: name, quantity (estimate if not shown), unit (pieces, kg, lbs, etc), and price if visible. Return as JSON array: [{"name": "Item Name", "quantity": 1, "unit": "pieces", "price": 5.99}]. Only include food items, skip non-food products.`;

      // Convert image URI to base64 for sending
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const reader = new FileReader();
      
      const base64Image = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      const { data, error } = await supabase.functions.invoke('generate-text', {
        body: {
          prompt,
          images: [base64Image],
          system: 'You are an expert at reading receipts and extracting structured data. Always return valid JSON with accurate item information.',
          temperature: 0.3, // Lower temperature for more accurate extraction
          max_tokens: 1500,
          format: 'json',
          model: 'gpt-4o-mini'
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to scan receipt');
      }

      // Fetch the generated text from the URL
      const textResponse = await fetch(data.url);
      const textContent = await textResponse.text();
      
      // Parse the JSON response
      let scannedItems: ScannedItem[];
      try {
        scannedItems = JSON.parse(textContent);
      } catch (parseError) {
        console.error('Failed to parse receipt JSON:', textContent);
        throw new Error('Could not read receipt. Please try again with a clearer photo.');
      }

      // Enhance items with category and expiration predictions
      const enhancedItems = scannedItems.map(item => ({
        ...item,
        category: categorizeFoodItem(item.name),
        expirationDate: predictExpirationDate(item.name, true) // Assume refrigerated
      }));

      setState({ status: 'success', data: enhancedItems, error: null });
      return enhancedItems;
    } catch (e: any) {
      console.error('Receipt scanning error:', e);
      setState({ 
        status: 'error', 
        data: null, 
        error: e?.message ?? 'Failed to scan receipt. Please ensure the photo is clear and well-lit.' 
      });
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ status: 'idle', data: null, error: null });
  }, []);

  return {
    scanReceipt,
    isLoading: state.status === 'scanning',
    error: state.status === 'error' ? state.error : null,
    scannedItems: state.status === 'success' ? state.data : null,
    reset
  };
}
