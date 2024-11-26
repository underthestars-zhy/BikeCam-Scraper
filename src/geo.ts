export interface GeoPoint {
    lat: number;
    lng: number;
}

/**
 * Checks if two geographical points are within 1 kilometer of each other
 * @param point1 First geographical point with latitude and longitude
 * @param point2 Second geographical point with latitude and longitude
 * @returns boolean indicating if the points are within 1km of each other
 */
export function isNearBy(point1: GeoPoint, point2: GeoPoint): boolean {
    // Earth's radius in kilometers
    const EARTH_RADIUS = 6371;
    // Maximum distance in kilometers
    const MAX_DISTANCE = 0.3;

    // Convert latitude and longitude from degrees to radians
    const lat1 = toRadians(point1.lat);
    const lng1 = toRadians(point1.lng);
    const lat2 = toRadians(point2.lat);
    const lng2 = toRadians(point2.lng);

    // Differences in coordinates
    const dLat = lat2 - lat1;
    const dLng = lng2 - lng1;

    // Haversine formula
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = EARTH_RADIUS * c;

    return distance <= MAX_DISTANCE;
}

/**
 * Converts degrees to radians
 * @param degrees Angle in degrees
 * @returns Angle in radians
 */
function toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
}
