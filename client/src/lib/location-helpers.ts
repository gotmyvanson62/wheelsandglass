import { SERVICE_LOCATIONS } from '@/data/locations';

/**
 * Resolves a location ID (e.g., "ca-san-diego") to a display name (e.g., "San Diego, CA")
 * @param locationId The location ID stored in the database
 * @returns Human-readable city, state format
 */
export function getLocationDisplayName(locationId: string): string {
  if (!locationId) return 'N/A';

  const location = SERVICE_LOCATIONS.find(loc => loc.id === locationId);
  if (location) {
    return `${location.city}, ${location.state}`;
  }

  // Fallback: format the ID nicely if not found in locations data
  // "ca-san-diego" -> "Ca San Diego"
  return locationId
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Gets the full location object by ID
 * @param locationId The location ID
 * @returns The full ServiceLocation object or null
 */
export function getLocationById(locationId: string) {
  return SERVICE_LOCATIONS.find(loc => loc.id === locationId) || null;
}
