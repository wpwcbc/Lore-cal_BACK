"use strict";
// geocodingController.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.reverseGeocoding = void 0;
const venueService_1 = require("../services/venueService");
const ROAD_KEYS = ['road', 'pedestrian', 'footway', 'path', 'residential', 'hamlet'];
const SUBURB_KEYS = ['suburb', 'neighbourhood'];
const DISTRICT_KEYS = [
    'city_district',
    'city',
    'town',
    'village',
    'district',
    'municipality',
    'state_district',
];
function pick(addr, keys) {
    for (const k of keys)
        if (addr[k])
            return addr[k];
    return null;
}
function normalizeAddress(address) {
    return {
        road: pick(address, ROAD_KEYS),
        suburb: pick(address, SUBURB_KEYS),
        district: pick(address, DISTRICT_KEYS),
    };
}
const reverseGeocoding = async (req, res) => {
    const { lat, lon } = req.query;
    const venue = await (0, venueService_1.coordToVenue)(Number(lat), Number(lon));
    console.log(venue);
    res.status(200).json({
        status: 'success',
        data: venue,
    });
};
exports.reverseGeocoding = reverseGeocoding;
