"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCountryLabel = exports.getRegionsByCountry = exports.BENIN_LOCATIONS = exports.NIGER_REGIONS = exports.COUNTRIES = void 0;
exports.COUNTRIES = {
    NIGER: 'niger',
    BENIN: 'benin',
};
exports.NIGER_REGIONS = [
    { name: 'Agadez', code: 'AZ' },
    { name: 'Diffa', code: 'DA' },
    { name: 'Dosso', code: 'DO' },
    { name: 'Maradi', code: 'MI' },
    { name: 'Tahoua', code: 'TA' },
    { name: 'Tillabéri', code: 'TI' },
    { name: 'Zinder', code: 'ZR' },
    { name: 'Niamey', code: 'NY' },
];
exports.BENIN_LOCATIONS = [
    { name: 'Cotonou', code: 'CT', hasShippingDelay: true },
];
const getRegionsByCountry = (country) => {
    if (country === exports.COUNTRIES.NIGER)
        return exports.NIGER_REGIONS;
    if (country === exports.COUNTRIES.BENIN)
        return exports.BENIN_LOCATIONS;
    return [];
};
exports.getRegionsByCountry = getRegionsByCountry;
const getCountryLabel = (country) => {
    if (country === exports.COUNTRIES.NIGER)
        return 'Niger';
    if (country === exports.COUNTRIES.BENIN)
        return 'Benin';
    return '';
};
exports.getCountryLabel = getCountryLabel;
//# sourceMappingURL=regions.js.map