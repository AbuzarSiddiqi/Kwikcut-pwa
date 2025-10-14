// Calculate distance between two coordinates using Haversine formula
// Returns distance in kilometers
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
};

const toRad = (value: number): number => {
  return (value * Math.PI) / 180;
};

// Format distance for display
export const formatDistance = (km: number): string => {
  if (km < 1) {
    return `${Math.round(km * 1000)}m away`;
  }
  return `${km}km away`;
};

// Sort barbers by distance
export const sortByDistance = <T extends { latitude: number; longitude: number }>(
  items: T[],
  userLat: number,
  userLon: number
): (T & { distance: number })[] => {
  return items
    .map((item) => ({
      ...item,
      distance: calculateDistance(userLat, userLon, item.latitude, item.longitude),
    }))
    .sort((a, b) => a.distance - b.distance);
};
