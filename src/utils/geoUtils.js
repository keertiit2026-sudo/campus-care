/**
 * Resilient Reverse Geocoding and Geolocation Utility for CampusCare
 * Converts GPS coordinates or device network into clean human-readable addresses and building names.
 * Zero-cache, high-accuracy, multi-service fallbacks (Nominatim, BigDataCloud, Photon, ipwho, freeipapi).
 */

export const reverseGeocodeAddress = async (lat, lon) => {
  if (lat == null || lon == null) return null;

  // 1. Try OpenStreetMap Nominatim API with cache buster
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1&_cb=${Date.now()}`,
      {
        headers: { 
          'Accept-Language': 'en',
          'User-Agent': 'CampusCare-ComplaintApp/2.0'
        },
        signal: controller.signal
      }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};

      const placeName = addr.amenity || addr.building || addr.office || addr.university || addr.college || addr.school || addr.hospital || addr.leisure || addr.road || addr.suburb || '';
      const locality = addr.suburb || addr.neighbourhood || addr.residential || addr.subdistrict || addr.quarter || addr.village || addr.hamlet || '';
      const city = addr.city || addr.town || addr.municipality || addr.city_district || addr.county || addr.state_district || '';
      const state = addr.state || '';
      const country = addr.country || '';

      const parts = [placeName, locality, city, state, country].filter(p => p && p.trim().length > 0);
      const uniqueParts = [];
      parts.forEach(p => {
        const trimmed = p.trim();
        if (!uniqueParts.includes(trimmed)) uniqueParts.push(trimmed);
      });

      if (uniqueParts.length > 0) {
        return {
          address: uniqueParts.join(', '),
          buildingName: placeName || locality || city || 'Campus Zone',
          locality,
          city,
          state,
          country
        };
      }

      if (data.display_name) {
        const dParts = data.display_name.split(',').map(s => s.trim()).filter(Boolean);
        return {
          address: dParts.slice(0, 4).join(', '),
          buildingName: dParts[0] || 'Campus Zone',
          locality: dParts[1] || '',
          city: dParts[2] || '',
          state: dParts[3] || '',
          country: ''
        };
      }
    }
  } catch (err) {
    console.warn('Nominatim reverse geocode attempt failed, trying BigDataCloud:', err);
  }

  // 2. Fallback to BigDataCloud Client Reverse Geocode API
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const locality = data.locality || data.localityInfo?.administrative?.[3]?.name || data.localityInfo?.administrative?.[2]?.name || '';
      const city = data.city || data.principalSubdivision || '';
      const state = data.principalSubdivision || '';
      const country = data.countryName || '';

      const uniqueParts = [];
      [locality, city, state, country].forEach(p => {
        if (p && p.trim() && !uniqueParts.includes(p.trim())) {
          uniqueParts.push(p.trim());
        }
      });

      if (uniqueParts.length > 0) {
        return {
          address: uniqueParts.join(', '),
          buildingName: locality || city || 'Campus Location',
          locality,
          city,
          state,
          country
        };
      }
    }
  } catch (err) {
    console.warn('BigDataCloud reverse geocode attempt failed:', err);
  }

  // 3. Fallback Coordinate String
  return {
    address: `Campus Location (${Number(lat).toFixed(4)}° N, ${Number(lon).toFixed(4)}° E)`,
    buildingName: 'Campus Detected Area',
    locality: '',
    city: '',
    state: '',
    country: ''
  };
};

/**
 * IP-based geolocation fallback when browser GPS is blocked or unavailable
 */
export const getIpBasedLocation = async () => {
  // Service 1: ipwho.is
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch('https://ipwho.is/', { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.latitude && data.longitude) {
        const geoInfo = await reverseGeocodeAddress(data.latitude, data.longitude);
        return {
          address: geoInfo?.address || [data.city, data.region, data.country].filter(Boolean).join(', '),
          buildingName: geoInfo?.buildingName || data.city || 'Campus Zone',
          latitude: data.latitude,
          longitude: data.longitude,
          source: 'ip_network',
          timestamp: Date.now()
        };
      }
    }
  } catch (e) {}

  // Service 2: freeipapi.com
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch('https://freeipapi.com/api/json', { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      if (data.latitude && data.longitude) {
        const geoInfo = await reverseGeocodeAddress(data.latitude, data.longitude);
        return {
          address: geoInfo?.address || [data.cityName, data.regionName, data.countryName].filter(Boolean).join(', '),
          buildingName: geoInfo?.buildingName || data.cityName || 'Campus Zone',
          latitude: data.latitude,
          longitude: data.longitude,
          source: 'ip_network',
          timestamp: Date.now()
        };
      }
    }
  } catch (e) {}

  // Service 3: ipapi.co
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch('https://ipapi.co/json/', { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      if (data.latitude && data.longitude) {
        const geoInfo = await reverseGeocodeAddress(data.latitude, data.longitude);
        return {
          address: geoInfo?.address || [data.city, data.region, data.country_name].filter(Boolean).join(', '),
          buildingName: geoInfo?.buildingName || data.city || 'Campus Zone',
          latitude: data.latitude,
          longitude: data.longitude,
          source: 'ip_network',
          timestamp: Date.now()
        };
      }
    }
  } catch (e) {}

  return null;
};

/**
 * High-accuracy Geolocation Resolver
 * Attempts high accuracy GPS -> Standard fresh GPS -> Network/IP location fallback
 * Returns full address and auto-detected building zone name
 */
export const detectCurrentLocation = async () => {
  // Attempt 1: Browser GPS (Fast High Accuracy, zero cache)
  if (typeof navigator !== 'undefined' && navigator.geolocation) {
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          { 
            enableHighAccuracy: true, 
            timeout: 5000, 
            maximumAge: 0 // Force fresh coordinates
          }
        );
      });

      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      const accuracy = position.coords.accuracy;
      const geoInfo = await reverseGeocodeAddress(lat, lon);

      return {
        address: geoInfo?.address || `Campus Location (${lat.toFixed(4)}° N, ${lon.toFixed(4)}° E)`,
        buildingName: geoInfo?.buildingName || 'Campus Zone',
        latitude: lat,
        longitude: lon,
        accuracy: accuracy,
        source: 'gps',
        isHighAccuracy: true,
        timestamp: Date.now()
      };
    } catch (gpsError) {
      console.warn('High-accuracy GPS sensor timed out or unavailable, trying standard accuracy:', gpsError);
      
      // Attempt 1b: Standard accuracy fresh reading
      try {
        const fallbackPos = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            resolve,
            reject,
            { 
              enableHighAccuracy: false, 
              timeout: 4000, 
              maximumAge: 0
            }
          );
        });

        const lat = fallbackPos.coords.latitude;
        const lon = fallbackPos.coords.longitude;
        const geoInfo = await reverseGeocodeAddress(lat, lon);

        return {
          address: geoInfo?.address || `Campus Location (${lat.toFixed(4)}° N, ${lon.toFixed(4)}° E)`,
          buildingName: geoInfo?.buildingName || 'Campus Zone',
          latitude: lat,
          longitude: lon,
          accuracy: fallbackPos.coords.accuracy,
          source: 'network_gps',
          isHighAccuracy: false,
          timestamp: Date.now()
        };
      } catch (e2) {
        console.warn('Standard GPS reading failed, proceeding to network IP resolution:', e2);
      }
    }
  }

  // Attempt 2: IP-based Network Geolocation Fallback
  const ipLoc = await getIpBasedLocation();
  if (ipLoc && ipLoc.address) {
    return ipLoc;
  }

  return null;
};
