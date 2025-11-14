// geocodingController.ts

// Dependencies / Types
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { reverseGeocodingFromLocIq } from '../utils/locationIqProvider';
import { coordToVenue } from '../services/venueService';

const ROAD_KEYS = ['road', 'pedestrian', 'footway', 'path', 'residential', 'hamlet'] as const;
const SUBURB_KEYS = ['suburb', 'neighbourhood'] as const;
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

// #region GET

type params_reverseGeocoding = {
    lat: number;
    lon: number;
};
const reverseGeocoding = async (req: Request, res: Response): Promise<void> => {
    const { lat, lon } = req.query;

    const venue = await coordToVenue(Number(lat), Number(lon));
    console.log(venue);
    res.status(200).json({
        status: 'success',
        data: venue,
    });
};

// #endregion

export { reverseGeocoding };
