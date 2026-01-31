import { useState, useEffect, useCallback } from 'react';

interface VehicleOption {
  value: string;
  label: string;
}

interface UseVehicleLookupReturn {
  makes: VehicleOption[];
  models: VehicleOption[];
  loadingMakes: boolean;
  loadingModels: boolean;
  errorMakes: string | null;
  errorModels: string | null;
}

// Cache configuration
const CACHE_PREFIX = 'nhtsa_';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

// Fallback makes list if API fails
const FALLBACK_MAKES: VehicleOption[] = [
  'Acura', 'Audi', 'BMW', 'Buick', 'Cadillac', 'Chevrolet', 'Chrysler',
  'Dodge', 'Ford', 'GMC', 'Honda', 'Hyundai', 'Infiniti', 'Jeep', 'Kia',
  'Lexus', 'Lincoln', 'Mazda', 'Mercedes-Benz', 'Mitsubishi', 'Nissan',
  'Ram', 'Subaru', 'Tesla', 'Toyota', 'Volkswagen', 'Volvo'
].map(make => ({ value: make, label: make }));

// Cache helpers
function getCachedData<T>(key: string): T | null {
  try {
    const cached = sessionStorage.getItem(CACHE_PREFIX + key);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_EXPIRY) {
        return data as T;
      }
      // Cache expired, remove it
      sessionStorage.removeItem(CACHE_PREFIX + key);
    }
  } catch {
    // Ignore cache errors
  }
  return null;
}

function setCachedData<T>(key: string, data: T): void {
  try {
    sessionStorage.setItem(CACHE_PREFIX + key, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch {
    // Ignore cache errors (e.g., storage full)
  }
}

// NHTSA API response types
interface NHTSAMakeResult {
  MakeId: number;
  MakeName: string;
  VehicleTypeId?: number;
  VehicleTypeName?: string;
}

interface NHTSAModelResult {
  Make_ID: number;
  Make_Name: string;
  Model_ID: number;
  Model_Name: string;
}

interface NHTSAResponse<T> {
  Count: number;
  Message: string;
  SearchCriteria: string | null;
  Results: T[];
}

export function useVehicleLookup(year: string, make: string): UseVehicleLookupReturn {
  const [makes, setMakes] = useState<VehicleOption[]>([]);
  const [models, setModels] = useState<VehicleOption[]>([]);
  const [loadingMakes, setLoadingMakes] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [errorMakes, setErrorMakes] = useState<string | null>(null);
  const [errorModels, setErrorModels] = useState<string | null>(null);

  // Fetch makes (when year is selected or on mount)
  const fetchMakes = useCallback(async () => {
    const cacheKey = 'makes';

    // Check cache first
    const cached = getCachedData<VehicleOption[]>(cacheKey);
    if (cached) {
      setMakes(cached);
      return;
    }

    setLoadingMakes(true);
    setErrorMakes(null);

    try {
      // Fetch both car and truck makes in parallel
      const [carResponse, truckResponse] = await Promise.all([
        fetch('https://vpic.nhtsa.dot.gov/api/vehicles/GetMakesForVehicleType/car?format=json'),
        fetch('https://vpic.nhtsa.dot.gov/api/vehicles/GetMakesForVehicleType/truck?format=json')
      ]);

      if (!carResponse.ok && !truckResponse.ok) {
        throw new Error('Failed to fetch vehicle makes');
      }

      const carData: NHTSAResponse<NHTSAMakeResult> = carResponse.ok ? await carResponse.json() : { Results: [] };
      const truckData: NHTSAResponse<NHTSAMakeResult> = truckResponse.ok ? await truckResponse.json() : { Results: [] };

      // Combine and deduplicate makes
      const allMakes = [...(carData.Results || []), ...(truckData.Results || [])];
      const uniqueMakes = new Map<string, string>();

      allMakes.forEach(item => {
        if (item.MakeName) {
          // Normalize the make name (title case)
          const normalized = item.MakeName
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
          uniqueMakes.set(normalized.toLowerCase(), normalized);
        }
      });

      // Convert to sorted array of options
      const makeOptions: VehicleOption[] = Array.from(uniqueMakes.values())
        .sort((a, b) => a.localeCompare(b))
        .map(name => ({ value: name, label: name }));

      if (makeOptions.length === 0) {
        throw new Error('No makes found');
      }

      setMakes(makeOptions);
      setCachedData(cacheKey, makeOptions);
    } catch (error) {
      console.error('Error fetching makes:', error);
      setErrorMakes('Failed to load vehicle makes. Using default list.');
      // Use fallback list
      setMakes(FALLBACK_MAKES);
    } finally {
      setLoadingMakes(false);
    }
  }, []);

  // Fetch models when make and year are selected
  const fetchModels = useCallback(async (selectedMake: string, selectedYear: string) => {
    if (!selectedMake || !selectedYear) {
      setModels([]);
      return;
    }

    const cacheKey = `models_${selectedMake.toLowerCase()}_${selectedYear}`;

    // Check cache first
    const cached = getCachedData<VehicleOption[]>(cacheKey);
    if (cached) {
      setModels(cached);
      return;
    }

    setLoadingModels(true);
    setErrorModels(null);

    try {
      // URL encode the make name for the API
      const encodedMake = encodeURIComponent(selectedMake);
      const response = await fetch(
        `https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeYear/make/${encodedMake}/modelyear/${selectedYear}?format=json`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch vehicle models');
      }

      const data: NHTSAResponse<NHTSAModelResult> = await response.json();

      // Extract and sort model names
      const modelOptions: VehicleOption[] = (data.Results || [])
        .filter(item => item.Model_Name)
        .map(item => ({
          value: item.Model_Name,
          label: item.Model_Name
        }))
        .sort((a, b) => a.label.localeCompare(b.label));

      // Add "Other" option at the end for manual entry fallback
      modelOptions.push({ value: '_other', label: 'Other (not listed)' });

      setModels(modelOptions);
      setCachedData(cacheKey, modelOptions);
    } catch (error) {
      console.error('Error fetching models:', error);
      setErrorModels('Failed to load models. Please enter manually.');
      // Provide "Other" as fallback
      setModels([{ value: '_other', label: 'Other (enter manually)' }]);
    } finally {
      setLoadingModels(false);
    }
  }, []);

  // Fetch makes on mount
  useEffect(() => {
    fetchMakes();
  }, [fetchMakes]);

  // Fetch models when make or year changes
  useEffect(() => {
    if (make && year) {
      fetchModels(make, year);
    } else {
      setModels([]);
      setErrorModels(null);
    }
  }, [make, year, fetchModels]);

  return {
    makes,
    models,
    loadingMakes,
    loadingModels,
    errorMakes,
    errorModels
  };
}
