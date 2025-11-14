// venueService.ts

import { reverseGeocodingFromLocIq } from '../utils/locationIqProvider';

interface VenueType {
    road: {
        en: string | null;
        main: string | null;
    };
    suburb: {
        en: string | null;
        main: string | null;
    };
    district: {
        en: string | null;
        main: string | null;
    };
}

const ROAD_KEYS = ['road', 'pedestrian', 'footway', 'path', 'residential', 'hamlet'] as const;
const SUBURB_KEYS = ['suburb', 'neighbourhood', 'city'] as const;
const DISTRICT_KEYS = [
    'city_district',
    'city',
    'town',
    'village',
    'district',
    'municipality',
    'state_district',
] as const;

function pick(addr: Record<string, string>, keys: readonly string[]) {
    for (const k of keys) if (addr[k]) return addr[k];
    return null;
}

function normalizeAddress(address: any) {
    return {
        road: pick(address, ROAD_KEYS),
        suburb: pick(address, SUBURB_KEYS),
        district: pick(address, DISTRICT_KEYS),
    };
}

// Han-aware splitter: "中文/外語名稱 English name" -> { main:"中文/外語名稱", en:"English name" }
// English-only -> { main:"Permanente Creek Trail", en:"Permanente Creek Trail" }
function splitZhEn(input?: string): { main: string | null; en: string | null } {
    const s = (input ?? '').trim();
    if (!s) return { main: null, en: null }; // keep your sentinel; replace with null if you later change schema

    const firstSpace = s.indexOf(' ');
    if (firstSpace === -1) {
        // No space at all: treat as English-only
        return { main: s, en: s };
    }

    const head = s.slice(0, firstSpace);
    // Unicode script test for any Han char in the first token
    const hasHan = /\p{Script=Han}/u.test(head);

    if (hasHan) {
        const tail = s.slice(firstSpace + 1).trim();
        return { main: head, en: tail || null };
    }

    // English-only string that happens to contain spaces
    return { main: s, en: s };
}

const coordToVenue = async (lat: number, lon: number): Promise<VenueType> => {
    const raw = await reverseGeocodingFromLocIq(Number(lat), Number(lon));
    const dto = normalizeAddress(raw);

    return {
        road: splitZhEn(dto.road ?? undefined),
        suburb: splitZhEn(dto.suburb ?? undefined),
        district: splitZhEn(dto.district ?? undefined),
    };
};

export { coordToVenue };
