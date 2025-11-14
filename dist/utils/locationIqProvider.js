"use strict";
// locationIqProvider.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.reverseGeocodingFromLocIq = void 0;
const reverseGeocodingFromLocIq = async (lat, lon, language = 'native') => {
    const BASE = process.env.LOCATIONIQ_API_BASE;
    const KEY = process.env.LOCATIONIQ_API_KEY;
    console.log('.env.BASE: ' + process.env.LOCATIONIQ_API_BASE);
    console.log('BASE: ' + BASE);
    const url = new URL(BASE);
    url.searchParams.set('key', KEY);
    url.searchParams.set('lat', String(lat));
    url.searchParams.set('lon', String(lon));
    url.searchParams.set('format', 'json');
    url.searchParams.set('accept-language', language);
    const result = await fetch(url);
    return (await result.json()).address;
};
exports.reverseGeocodingFromLocIq = reverseGeocodingFromLocIq;
