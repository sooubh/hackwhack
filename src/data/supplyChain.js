// src/data/supplyChain.js
// Simulated supply chain network: nodes (suppliers, warehouses, factories, ports) + routes

export const nodes = [
    // Asia
    { id: 'S1', name: 'Shanghai Port', type: 'port', lat: 31.2304, lng: 121.4737, country: 'China', region: 'Asia', reliability: 88 },
    { id: 'S2', name: 'Shenzhen Factory', type: 'factory', lat: 22.5431, lng: 114.0579, country: 'China', region: 'Asia', reliability: 82 },
    { id: 'S3', name: 'Singapore Hub', type: 'port', lat: 1.3521, lng: 103.8198, country: 'Singapore', region: 'Asia', reliability: 95 },
    { id: 'S4', name: 'Mumbai Supplier', type: 'supplier', lat: 19.0760, lng: 72.8777, country: 'India', region: 'Asia', reliability: 74 },
    { id: 'S15', name: 'Tokyo Supplier', type: 'supplier', lat: 35.6762, lng: 139.6503, country: 'Japan', region: 'Asia', reliability: 97 },
    { id: 'S21', name: 'Seoul Tech', type: 'supplier', lat: 37.5665, lng: 126.9780, country: 'South Korea', region: 'Asia', reliability: 98 },
    { id: 'S23', name: 'Ho Chi Minh Fab', type: 'factory', lat: 10.8231, lng: 106.6297, country: 'Vietnam', region: 'Asia', reliability: 76 },
    { id: 'S24', name: 'Jakarta Port', type: 'port', lat: -6.2088, lng: 106.8456, country: 'Indonesia', region: 'Asia', reliability: 70 },
    { id: 'S25', name: 'Manila Hub', type: 'warehouse', lat: 14.5995, lng: 120.9842, country: 'Philippines', region: 'Asia', reliability: 68 },
    { id: 'S26', name: 'Bangkok Dist.', type: 'warehouse', lat: 13.7563, lng: 100.5018, country: 'Thailand', region: 'Asia', reliability: 85 },
    { id: 'S27', name: 'Chennai Port', type: 'port', lat: 13.0827, lng: 80.2707, country: 'India', region: 'Asia', reliability: 79 },

    // Middle East
    { id: 'S5', name: 'Dubai Logistics', type: 'warehouse', lat: 25.2048, lng: 55.2708, country: 'UAE', region: 'Middle East', reliability: 91 },
    { id: 'S28', name: 'Jeddah Port', type: 'port', lat: 21.4858, lng: 39.1925, country: 'Saudi Arabia', region: 'Middle East', reliability: 86 },
    { id: 'S29', name: 'Doha Hub', type: 'warehouse', lat: 25.2854, lng: 51.5310, country: 'Qatar', region: 'Middle East', reliability: 94 },

    // Europe
    { id: 'S6', name: 'Hamburg Port', type: 'port', lat: 53.5753, lng: 10.0153, country: 'Germany', region: 'Europe', reliability: 93 },
    { id: 'S7', name: 'Rotterdam Hub', type: 'port', lat: 51.9225, lng: 4.4792, country: 'Netherlands', region: 'Europe', reliability: 96 },
    { id: 'S8', name: 'Paris Warehouse', type: 'warehouse', lat: 48.8566, lng: 2.3522, country: 'France', region: 'Europe', reliability: 89 },
    { id: 'S19', name: 'London Dist.', type: 'warehouse', lat: 51.5074, lng: -0.1278, country: 'UK', region: 'Europe', reliability: 91 },
    { id: 'S20', name: 'Istanbul Gateway', type: 'port', lat: 41.0082, lng: 28.9784, country: 'Turkey', region: 'Europe', reliability: 81 },
    { id: 'S30', name: 'Milan Factory', type: 'factory', lat: 45.4642, lng: 9.1900, country: 'Italy', region: 'Europe', reliability: 87 },
    { id: 'S31', name: 'Madrid Supplier', type: 'supplier', lat: 40.4168, lng: -3.7038, country: 'Spain', region: 'Europe', reliability: 88 },
    { id: 'S32', name: 'Antwerp Port', type: 'port', lat: 51.2194, lng: 4.4025, country: 'Belgium', region: 'Europe', reliability: 94 },

    // Americas
    { id: 'S9', name: 'New York Port', type: 'port', lat: 40.7128, lng: -74.0060, country: 'USA', region: 'Americas', reliability: 90 },
    { id: 'S10', name: 'Chicago Factory', type: 'factory', lat: 41.8781, lng: -87.6298, country: 'USA', region: 'Americas', reliability: 85 },
    { id: 'S11', name: 'São Paulo Dist.', type: 'warehouse', lat: -23.5505, lng: -46.6333, country: 'Brazil', region: 'Americas', reliability: 71 },
    { id: 'S16', name: 'Los Angeles Port', type: 'port', lat: 34.0522, lng: -118.2437, country: 'USA', region: 'Americas', reliability: 86 },
    { id: 'S17', name: 'Vancouver Hub', type: 'port', lat: 49.2827, lng: -123.1207, country: 'Canada', region: 'Americas', reliability: 94 },
    { id: 'S18', name: 'Mexico City Fab', type: 'factory', lat: 19.4326, lng: -99.1332, country: 'Mexico', region: 'Americas', reliability: 73 },
    { id: 'S33', name: 'Houston Port', type: 'port', lat: 29.7604, lng: -95.3698, country: 'USA', region: 'Americas', reliability: 88 },
    { id: 'S34', name: 'Miami Gateway', type: 'port', lat: 25.7617, lng: -80.1918, country: 'USA', region: 'Americas', reliability: 84 },
    { id: 'S35', name: 'Bogotá Supplier', type: 'supplier', lat: 4.7110, lng: -74.0721, country: 'Colombia', region: 'Americas', reliability: 69 },
    { id: 'S36', name: 'Buenos Aires Port', type: 'port', lat: -34.6037, lng: -58.3816, country: 'Argentina', region: 'Americas', reliability: 75 },

    // Africa
    { id: 'S12', name: 'Cape Town Port', type: 'port', lat: -33.9249, lng: 18.4241, country: 'South Africa', region: 'Africa', reliability: 78 },
    { id: 'S13', name: 'Lagos Supplier', type: 'supplier', lat: 6.5244, lng: 3.3792, country: 'Nigeria', region: 'Africa', reliability: 62 },
    { id: 'S37', name: 'Cairo Hub', type: 'warehouse', lat: 30.0444, lng: 31.2357, country: 'Egypt', region: 'Africa', reliability: 70 },
    { id: 'S38', name: 'Mombasa Port', type: 'port', lat: -4.0435, lng: 39.6682, country: 'Kenya', region: 'Africa', reliability: 65 },

    // Oceania
    { id: 'S14', name: 'Sydney Depot', type: 'warehouse', lat: -33.8688, lng: 151.2093, country: 'Australia', region: 'Oceania', reliability: 92 },
    { id: 'S22', name: 'Auckland Depot', type: 'warehouse', lat: -36.8485, lng: 174.7633, country: 'New Zealand', region: 'Oceania', reliability: 95 },
    { id: 'S39', name: 'Melbourne Port', type: 'port', lat: -37.8136, lng: 144.9631, country: 'Australia', region: 'Oceania', reliability: 91 }
];

export const routes = [
    // Asia to Europe (Sea)
    { id: 'R1', from: 'S1', to: 'S3', distance: 3300, time: 7, mode: 'sea', vulnerabilityScore: 30 },
    { id: 'R3', from: 'S3', to: 'S5', distance: 5800, time: 9, mode: 'sea', vulnerabilityScore: 45 },
    { id: 'R5', from: 'S5', to: 'S6', distance: 5200, time: 8, mode: 'sea', vulnerabilityScore: 65 }, // Suez Canal route
    { id: 'R29', from: 'S21', to: 'S1', distance: 900, time: 2, mode: 'sea', vulnerabilityScore: 15 },
    { id: 'R40', from: 'S23', to: 'S3', distance: 1100, time: 3, mode: 'sea', vulnerabilityScore: 25 },
    { id: 'R41', from: 'S24', to: 'S3', distance: 900, time: 2, mode: 'sea', vulnerabilityScore: 30 },
    { id: 'R42', from: 'S27', to: 'S5', distance: 2900, time: 5, mode: 'sea', vulnerabilityScore: 35 },

    // Intra-Asia (Land/Air)
    { id: 'R2', from: 'S2', to: 'S1', distance: 130, time: 1, mode: 'land', vulnerabilityScore: 20 },
    { id: 'R30', from: 'S21', to: 'S15', distance: 1100, time: 2, mode: 'sea', vulnerabilityScore: 20 },
    { id: 'R43', from: 'S26', to: 'S23', distance: 750, time: 2, mode: 'land', vulnerabilityScore: 50 },
    { id: 'R44', from: 'S15', to: 'S25', distance: 3000, time: 5, mode: 'sea', vulnerabilityScore: 40 },

    // Asia to Americas (Sea/Air)
    { id: 'R11', from: 'S1', to: 'S15', distance: 1700, time: 3, mode: 'sea', vulnerabilityScore: 25 },
    { id: 'R12', from: 'S15', to: 'S9', distance: 11300, time: 15, mode: 'sea', vulnerabilityScore: 75 }, // Panama Canal route
    { id: 'R19', from: 'S1', to: 'S16', distance: 10400, time: 14, mode: 'sea', vulnerabilityScore: 60 }, // Trans-Pacific
    { id: 'R20', from: 'S15', to: 'S16', distance: 8800, time: 11, mode: 'sea', vulnerabilityScore: 55 },

    // Europe Network (Land/Air/Sea)
    { id: 'R6', from: 'S6', to: 'S7', distance: 350, time: 1, mode: 'land', vulnerabilityScore: 10 },
    { id: 'R7', from: 'S7', to: 'S8', distance: 470, time: 1, mode: 'land', vulnerabilityScore: 15 },
    { id: 'R18', from: 'S6', to: 'S8', distance: 750, time: 1, mode: 'land', vulnerabilityScore: 15 },
    { id: 'R24', from: 'S7', to: 'S19', distance: 360, time: 1, mode: 'sea', vulnerabilityScore: 35 },
    { id: 'R45', from: 'S32', to: 'S30', distance: 900, time: 2, mode: 'land', vulnerabilityScore: 25 },
    { id: 'R46', from: 'S8', to: 'S31', distance: 1050, time: 2, mode: 'land', vulnerabilityScore: 20 },
    { id: 'R47', from: 'S20', to: 'S30', distance: 1600, time: 3, mode: 'land', vulnerabilityScore: 40 },

    // Americas Network (Land/Sea/Air)
    { id: 'R9', from: 'S9', to: 'S10', distance: 1200, time: 2, mode: 'land', vulnerabilityScore: 30 },
    { id: 'R21', from: 'S16', to: 'S10', distance: 3200, time: 4, mode: 'land', vulnerabilityScore: 45 },
    { id: 'R22', from: 'S16', to: 'S18', distance: 2900, time: 4, mode: 'land', vulnerabilityScore: 55 },
    { id: 'R23', from: 'S17', to: 'S16', distance: 2100, time: 3, mode: 'sea', vulnerabilityScore: 25 },
    { id: 'R28', from: 'S18', to: 'S33', distance: 1200, time: 2, mode: 'land', vulnerabilityScore: 40 },
    { id: 'R48', from: 'S33', to: 'S34', distance: 1550, time: 3, mode: 'sea', vulnerabilityScore: 45 }, // Gulf Coast
    { id: 'R49', from: 'S34', to: 'S35', distance: 2400, time: 4, mode: 'air', vulnerabilityScore: 35 },
    { id: 'R50', from: 'S11', to: 'S36', distance: 1700, time: 3, mode: 'land', vulnerabilityScore: 60 },

    // Trans-Atlantic (Sea/Air)
    { id: 'R8', from: 'S7', to: 'S9', distance: 5800, time: 9, mode: 'sea', vulnerabilityScore: 50 },
    { id: 'R25', from: 'S9', to: 'S19', distance: 5500, time: 8, mode: 'sea', vulnerabilityScore: 45 },
    { id: 'R51', from: 'S34', to: 'S31', distance: 7100, time: 10, mode: 'sea', vulnerabilityScore: 40 },

    // Africa Network (Sea/Air)
    { id: 'R13', from: 'S12', to: 'S7', distance: 10200, time: 17, mode: 'sea', vulnerabilityScore: 60 },
    { id: 'R14', from: 'S13', to: 'S12', distance: 5500, time: 8, mode: 'sea', vulnerabilityScore: 70 },
    { id: 'R52', from: 'S37', to: 'S20', distance: 1200, time: 2, mode: 'sea', vulnerabilityScore: 45 },
    { id: 'R53', from: 'S5', to: 'S38', distance: 3900, time: 6, mode: 'sea', vulnerabilityScore: 65 },

    // Oceania Network
    { id: 'R15', from: 'S3', to: 'S14', distance: 6300, time: 10, mode: 'sea', vulnerabilityScore: 40 },
    { id: 'R16', from: 'S14', to: 'S16', distance: 12000, time: 18, mode: 'sea', vulnerabilityScore: 50 },
    { id: 'R31', from: 'S14', to: 'S22', distance: 2100, time: 3, mode: 'sea', vulnerabilityScore: 25 },
    { id: 'R54', from: 'S39', to: 'S14', distance: 870, time: 1, mode: 'land', vulnerabilityScore: 10 },
    { id: 'R55', from: 'S39', to: 'S24', distance: 5200, time: 8, mode: 'sea', vulnerabilityScore: 45 }
];

export const nodeTypes = {
    supplier: { color: '#8b5cf6', icon: '🏭' },
    factory: { color: '#3b82f6', icon: '⚙️' },
    warehouse: { color: '#f59e0b', icon: '🏬' },
    port: { color: '#22d3ee', icon: '⚓' },
};
