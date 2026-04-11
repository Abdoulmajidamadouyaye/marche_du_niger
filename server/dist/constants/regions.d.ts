export declare const COUNTRIES: {
    readonly NIGER: "niger";
    readonly BENIN: "benin";
};
export type Country = (typeof COUNTRIES)[keyof typeof COUNTRIES];
export declare const NIGER_REGIONS: readonly [{
    readonly name: "Agadez";
    readonly code: "AZ";
}, {
    readonly name: "Diffa";
    readonly code: "DA";
}, {
    readonly name: "Dosso";
    readonly code: "DO";
}, {
    readonly name: "Maradi";
    readonly code: "MI";
}, {
    readonly name: "Tahoua";
    readonly code: "TA";
}, {
    readonly name: "Tillabéri";
    readonly code: "TI";
}, {
    readonly name: "Zinder";
    readonly code: "ZR";
}, {
    readonly name: "Niamey";
    readonly code: "NY";
}];
export type NigerRegion = (typeof NIGER_REGIONS)[number];
export declare const BENIN_LOCATIONS: readonly [{
    readonly name: "Cotonou";
    readonly code: "CT";
    readonly hasShippingDelay: true;
}];
export type BeninLocation = (typeof BENIN_LOCATIONS)[number];
export declare const getRegionsByCountry: (country: Country) => never[] | readonly [{
    readonly name: "Agadez";
    readonly code: "AZ";
}, {
    readonly name: "Diffa";
    readonly code: "DA";
}, {
    readonly name: "Dosso";
    readonly code: "DO";
}, {
    readonly name: "Maradi";
    readonly code: "MI";
}, {
    readonly name: "Tahoua";
    readonly code: "TA";
}, {
    readonly name: "Tillabéri";
    readonly code: "TI";
}, {
    readonly name: "Zinder";
    readonly code: "ZR";
}, {
    readonly name: "Niamey";
    readonly code: "NY";
}] | readonly [{
    readonly name: "Cotonou";
    readonly code: "CT";
    readonly hasShippingDelay: true;
}];
export declare const getCountryLabel: (country: Country) => string;
