/**
 * Resilient Reverse Geocoding, Geolocation & Campus Location Resolver for CampusCare
 * Solves ISP Gateway misdetection (e.g., Belagavi resolving to Bengaluru ISP nodes)
 * Provides GPS Triangulation, Live Place/Campus Autocomplete Search & Regional Campus Presets.
 */

export const CAMPUS_PRESETS = [
  {
    id: 'belagavi_main',
    name: 'Belagavi Main Campus',
    badge: 'Belagavi (HQ)',
    city: 'Belagavi',
    state: 'Karnataka',
    address: 'Belagavi Main Campus, College Road, Belagavi, Karnataka 590001',
    latitude: 15.8497,
    longitude: 74.4977,
    buildingName: 'Main Campus Building',
    zone: 'North Karnataka Region'
  },
  {
    id: 'vtu_belagavi',
    name: 'VTU Jnana Sangama Campus, Belagavi',
    badge: 'VTU Belagavi',
    city: 'Belagavi',
    state: 'Karnataka',
    address: 'Visvesvaraya Technological University, Jnana Sangama, Machhe, Belagavi, Karnataka 590018',
    latitude: 15.8037,
    longitude: 74.5298,
    buildingName: 'VTU Academic & Administrative Block',
    zone: 'Machhe Zone, Belagavi'
  },
  {
    id: 'kle_belagavi',
    name: 'KLE Tech / JNMC Campus, Belagavi',
    badge: 'KLE Tech Belagavi',
    city: 'Belagavi',
    state: 'Karnataka',
    address: 'KLE Academy of Higher Education, JNMC Campus, Nehru Nagar, Belagavi, Karnataka 590010',
    latitude: 15.8864,
    longitude: 74.5152,
    buildingName: 'KLE Tech Engineering Block',
    zone: 'Nehru Nagar, Belagavi'
  },
  {
    id: 'git_belagavi',
    name: 'KLS Gogte Institute of Technology (GIT), Belagavi',
    badge: 'GIT Belagavi',
    city: 'Belagavi',
    state: 'Karnataka',
    address: 'KLS Gogte Institute of Technology, Khanapur Road, Udyambag, Belagavi, Karnataka 590008',
    latitude: 15.8166,
    longitude: 74.4883,
    buildingName: 'GIT Main Administrative Block',
    zone: 'Udyambag, Belagavi'
  },
  {
    id: 'hubballi_campus',
    name: 'Hubballi-Dharwad Campus',
    badge: 'Hubballi Campus',
    city: 'Hubballi',
    state: 'Karnataka',
    address: 'Hubballi Vidyanagar Campus, PB Road, Hubballi, Karnataka 580031',
    latitude: 15.3647,
    longitude: 75.1240,
    buildingName: 'Vidyanagar Tech Complex',
    zone: 'Hubballi Zone'
  },
  {
    id: 'bengaluru_campus',
    name: 'Bengaluru Campus',
    badge: 'Bengaluru Campus',
    city: 'Bengaluru',
    state: 'Karnataka',
    address: 'Bengaluru Innovation Campus, Hosur Road, Electronic City, Bengaluru, Karnataka 560100',
    latitude: 12.8452,
    longitude: 77.6602,
    buildingName: 'Innovation Tower A',
    zone: 'South Zone, Bengaluru'
  }
];

const PREFERRED_CAMPUS_STORAGE_KEY = 'campuscare_preferred_campus_loc';

/**
 * Save user's preferred campus location for persistence across sessions
 */
export const savePreferredCampus = (campusObj) => {
  try {
    if (campusObj) {
      localStorage.setItem(PREFERRED_CAMPUS_STORAGE_KEY, JSON.stringify(campusObj));
    } else {
      localStorage.removeItem(PREFERRED_CAMPUS_STORAGE_KEY);
    }
  } catch (e) {}
};

/**
 * Retrieve user's preferred campus location
 */
export const getPreferredCampus = () => {
  try {
    const raw = localStorage.getItem(PREFERRED_CAMPUS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
};

/**
 * Reverse geocode latitude/longitude coordinates into human-friendly address & building components
 */
export const reverseGeocodeAddress = async (lat, lon) => {
  if (lat == null || lon == null) return null;

  // 1. Check if coordinates closely match any predefined Campus Preset (within ~500 meters)
  const matchedPreset = CAMPUS_PRESETS.find(p => {
    const dLat = Math.abs(p.latitude - lat);
    const dLon = Math.abs(p.longitude - lon);
    return dLat < 0.006 && dLon < 0.006;
  });

  if (matchedPreset) {
    return {
      address: matchedPreset.address,
      buildingName: matchedPreset.buildingName || matchedPreset.name,
      locality: matchedPreset.zone || matchedPreset.city,
      city: matchedPreset.city,
      state: matchedPreset.state,
      country: 'India',
      isPresetMatch: true
    };
  }

  // 2. Try OpenStreetMap Nominatim API with cache buster
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

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

  // 3. Fallback to BigDataCloud Client Reverse Geocode API
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

  // 4. Fallback Coordinate String
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
 * Search locations & campus areas by keyword with India and local prioritization
 */
export const searchLocations = async (query) => {
  if (!query || query.trim().length < 2) return [];
  const cleanQuery = query.trim().toLowerCase();

  // 1. Filter local predefined presets (instant response)
  const localMatches = CAMPUS_PRESETS.filter(p => 
    p.name.toLowerCase().includes(cleanQuery) ||
    p.city.toLowerCase().includes(cleanQuery) ||
    p.address.toLowerCase().includes(cleanQuery) ||
    p.badge.toLowerCase().includes(cleanQuery) ||
    (p.zone && p.zone.toLowerCase().includes(cleanQuery))
  ).map(p => ({
    displayName: p.name,
    address: p.address,
    buildingName: p.buildingName,
    city: p.city,
    state: p.state,
    latitude: p.latitude,
    longitude: p.longitude,
    source: 'preset',
    isPreset: true
  }));

  // 2. Query OpenStreetMap Nominatim for live place geocoding
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const encoded = encodeURIComponent(`${cleanQuery}, India`);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&addressdetails=1&limit=6&countrycodes=in`,
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
      const results = data.map(item => {
        const addr = item.address || {};
        const placeName = addr.amenity || addr.building || addr.office || addr.university || addr.college || addr.school || addr.hospital || item.name || '';
        const locality = addr.suburb || addr.neighbourhood || addr.residential || addr.subdistrict || addr.quarter || addr.village || '';
        const city = addr.city || addr.town || addr.municipality || addr.city_district || addr.state_district || addr.county || '';
        const state = addr.state || '';

        const parts = [placeName, locality, city, state].filter(Boolean);
        const address = parts.length > 0 ? parts.join(', ') : item.display_name;

        return {
          displayName: item.display_name,
          address,
          buildingName: placeName || locality || city || 'Campus Area',
          locality,
          city: city || locality || 'Belagavi Region',
          state: state || 'Karnataka',
          latitude: parseFloat(item.lat),
          longitude: parseFloat(item.lon),
          source: 'osm'
        };
      });

      // Combine matches without duplicates
      const combined = [...localMatches];
      results.forEach(r => {
        if (!combined.some(c => Math.abs(c.latitude - r.latitude) < 0.005 && Math.abs(c.longitude - r.longitude) < 0.005)) {
          combined.push(r);
        }
      });
      return combined;
    }
  } catch (err) {
    console.warn('Nominatim search query failed, returning local presets:', err);
  }

  return localMatches;
};

/**
 * IP-based geolocation fallback when browser GPS is blocked or unavailable
 * Clearly marks isApproximateIp: true so the user is informed of ISP routing
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
          city: data.city || 'Bengaluru (ISP Hub)',
          state: data.region || 'Karnataka',
          latitude: data.latitude,
          longitude: data.longitude,
          source: 'ip_network',
          isApproximateIp: true,
          ispInfo: `${data.connection?.isp || 'Broadband ISP'} (Gateway: ${data.city || 'Bengaluru'})`,
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
          city: data.cityName || 'Bengaluru (ISP Hub)',
          state: data.regionName || 'Karnataka',
          latitude: data.latitude,
          longitude: data.longitude,
          source: 'ip_network',
          isApproximateIp: true,
          ispInfo: `Broadband ISP (Gateway: ${data.cityName || 'Bengaluru'})`,
          timestamp: Date.now()
        };
      }
    }
  } catch (e) {}

  return null;
};

/**
 * High-accuracy Geolocation Resolver
 * Attempts high accuracy GPS with generous timeout (10s) -> Standard fresh GPS -> Network/IP location fallback
 * Returns full address, accuracy radius, city, and explicit approximate flags.
 */
export const detectCurrentLocation = async () => {
  // Check for saved user preference if GPS is unavailable
  const savedCampus = getPreferredCampus();

  // Attempt 1: Browser GPS (High Accuracy with generous 10s timeout for PC/Mobile sensor lock)
  if (typeof navigator !== 'undefined' && navigator.geolocation) {
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          { 
            enableHighAccuracy: true, 
            timeout: 10000, 
            maximumAge: 0 // Force fresh sensor coordinates
          }
        );
      });

      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      const accuracy = position.coords.accuracy || 15;
      const geoInfo = await reverseGeocodeAddress(lat, lon);

      return {
        address: geoInfo?.address || `Campus Location (${lat.toFixed(4)}° N, ${lon.toFixed(4)}° E)`,
        buildingName: geoInfo?.buildingName || 'Campus Zone',
        city: geoInfo?.city || 'Belagavi Region',
        state: geoInfo?.state || 'Karnataka',
        latitude: lat,
        longitude: lon,
        accuracy: Math.round(accuracy),
        source: 'gps',
        isHighAccuracy: accuracy < 200,
        isApproximateIp: false,
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
              timeout: 6000, 
              maximumAge: 5000
            }
          );
        });

        const lat = fallbackPos.coords.latitude;
        const lon = fallbackPos.coords.longitude;
        const accuracy = fallbackPos.coords.accuracy || 1000;
        const geoInfo = await reverseGeocodeAddress(lat, lon);

        return {
          address: geoInfo?.address || `Campus Location (${lat.toFixed(4)}° N, ${lon.toFixed(4)}° E)`,
          buildingName: geoInfo?.buildingName || 'Campus Zone',
          city: geoInfo?.city || 'Belagavi Region',
          state: geoInfo?.state || 'Karnataka',
          latitude: lat,
          longitude: lon,
          accuracy: Math.round(accuracy),
          source: 'network_gps',
          isHighAccuracy: false,
          isApproximateIp: accuracy > 20000, // Likely IP-based Wi-Fi triangulation if > 20km
          timestamp: Date.now()
        };
      } catch (e2) {
        console.warn('Standard GPS reading failed, proceeding to network IP resolution:', e2);
      }
    }
  }

  // If saved campus exists, prioritize it over generic Bengaluru IP hub
  if (savedCampus && savedCampus.address) {
    return {
      ...savedCampus,
      source: 'saved_preset',
      isHighAccuracy: true,
      isApproximateIp: false,
      timestamp: Date.now()
    };
  }

  // Attempt 2: IP-based Network Geolocation Fallback
  const ipLoc = await getIpBasedLocation();
  if (ipLoc && ipLoc.address) {
    return ipLoc;
  }

  // Default fallback: Belagavi Main Campus preset
  const defaultBelagavi = CAMPUS_PRESETS[0];
  return {
    address: defaultBelagavi.address,
    buildingName: defaultBelagavi.buildingName,
    city: defaultBelagavi.city,
    state: defaultBelagavi.state,
    latitude: defaultBelagavi.latitude,
    longitude: defaultBelagavi.longitude,
    accuracy: 100,
    source: 'preset_default',
    isHighAccuracy: true,
    isApproximateIp: false,
    timestamp: Date.now()
  };
};
