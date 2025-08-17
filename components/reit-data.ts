import type { REITProperty, InvestableNFT } from './types';

function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const propertyNames = ["Palm Grove Heights", "Azure Bay Residences", "Starlight Towers", "Willow Creek Estates", "Sapphire Skyscraper", "Golden Gate Lofts", "Emerald Valley Plaza", "Crimson Court", "Quantum Quarters", "Celestial Condos", "Vertex Villas", "Pioneer Place", "Summit House", "Liberty Lofts", "Heritage Homes", "Oasis Apartments", "Phoenix Plaza", "Meridian Mansions", "Titanium Terrace", "Silverstone Suites", "Evergreen Apartments", "Coral Point Commercial", "Solstice Square", "Dynasty Dwellings"];
const locations = [{ city: "Miami", state: "FL", country: "USA" }, { city: "Los Angeles", state: "CA", country: "USA" }, { city: "New York", state: "NY", country: "USA" }, { city: "London", state: "", country: "UK" }, { city: "Tokyo", state: "", country: "Japan" }, { city: "Dubai", state: "", country: "UAE" }, { city: "Austin", state: "TX", country: "USA" }, { city: "Paris", state: "", country: "France" }, { city: "Sydney", state: "", country: "Australia" }, { city: "Singapore", state: "", country: "Singapore" }, { city: "Toronto", state: "ON", country: "Canada" }, { city: "Berlin", state: "", country: "Germany" }, { city: "Chicago", state: "IL", country: "USA" }, { city: "San Francisco", state: "CA", country: "USA" }, { city: "Hong Kong", state: "", country: "China" }];

export const mockReitProperties: REITProperty[] = propertyNames.map((name, index) => {
    const totalShares = getRandomInt(100, 500);
    const sharesSold = getRandomInt(0, totalShares);
    const location = locations[index % locations.length];
    return {
        id: `reit-${index + 1}`,
        name: name,
        address: `${location.city}, ${location.state ? location.state + ', ' : ''}${location.country}`,
        imageUrl: `https://picsum.photos/seed/reit${index + 1}/600/400`,
        description: `A premier property in ${location.city}.`,
        investmentRange: { min: 2000, max: 250000 },
        monthlyROI: parseFloat((Math.random() * (2.5 - 0.8) + 0.8).toFixed(2)),
        totalShares: totalShares,
        sharesSold: sharesSold,
        status: sharesSold >= totalShares ? 'Fully Funded' : 'Open for Shares'
    };
});

const nftTitles = ["CryptoPunk #3100", "Bored Ape #8817", "Azuki #9605", "Meebit #17522", "CloneX #4594", "Moonbird #2642", "Doodle #6914", "Cool Cat #3330", "World of Women #5672", "Pudgy Penguin #6873", "Art Blocks: Fidenza #724", "Mutant Ape #1029", "VeeFriend #GratefulGoat", "Deadfellaz #1046", "CyberKongz #201", "Gutter Cat #2821", "Toadz #6146", "Nouns #87", "Chromie Squiggle #7583", "Autoglyph #484"];
const collections = ["CryptoPunks", "Bored Ape Yacht Club", "Azuki", "Meebits", "CloneX", "Moonbirds", "Doodles", "Cool Cats", "World of Women", "Pudgy Penguins", "Art Blocks", "Mutant Ape Yacht Club", "VeeFriends", "Deadfellaz", "CyberKongz", "Gutter Cat Gang", "CrypToadz", "Nouns", "Art Blocks", "Art Blocks"];

export const investableNFTs: InvestableNFT[] = nftTitles.map((title, index) => {
    const floorPrice = getRandomInt(50000, 1500000);
    const totalShares = Math.floor(floorPrice / 100);
    const sharesAvailable = getRandomInt(Math.floor(totalShares * 0.1), Math.floor(totalShares * 0.8));
    const apyAnnual = parseFloat((Math.random() * (35 - 10) + 10).toFixed(2));
    return {
        id: `inft-${index + 1}`,
        title: title,
        collection: collections[index % collections.length],
        imageUrl: `https://picsum.photos/seed/inft${index + 1}/400`,
        floorPrice: floorPrice,
        totalShares: totalShares,
        sharesAvailable: sharesAvailable,
        investors: getRandomInt(10, 500),
        apyAnnual: apyAnnual,
        apyMonthly: parseFloat((apyAnnual / 12).toFixed(2)),
        adminBtcAddress: `bc1q${(Math.random() + 1).toString(36).substring(2)}inft${index + 1}valifi`
    };
});