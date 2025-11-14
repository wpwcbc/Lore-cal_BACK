// locationIqProvider.ts

type LiqRes = {
    address?: Record<string, string>;
};

const reverseGeocodingFromLocIq = async (
    lat: number,
    lon: number,
    language: string = 'native',
): Promise<LiqRes> => {
    const BASE: string = process.env.LOCATIONIQ_API_BASE!;
    const KEY: string = process.env.LOCATIONIQ_API_KEY!;
    console.log('.env.BASE: ' + process.env.LOCATIONIQ_API_BASE);
    console.log('BASE: ' + BASE);
    const url = new URL(BASE);

    url.searchParams.set('key', KEY);
    url.searchParams.set('lat', String(lat));
    url.searchParams.set('lon', String(lon));
    url.searchParams.set('format', 'json');
    url.searchParams.set('accept-language', language);

    const result = await fetch(url);

    return (await result.json()).address as LiqRes;
};

export { reverseGeocodingFromLocIq };
