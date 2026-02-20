// src/data/supplyChain.js
// Simulated supply chain network: nodes (suppliers, warehouses, factories, ports) + routes

export const nodes = [
    { id: 'S1', name: 'Shanghai Port', type: 'port', lat: 31.2304, lng: 121.4737, country: 'China', region: 'Asia', reliability: 88 },
    { id: 'S2', name: 'Shenzhen Factory', type: 'factory', lat: 22.5431, lng: 114.0579, country: 'China', region: 'Asia', reliability: 82 },
    { id: 'S3', name: 'Singapore Hub', type: 'port', lat: 1.3521, lng: 103.8198, country: 'Singapore', region: 'Asia', reliability: 95 },
    { id: 'S4', name: 'Mumbai Supplier', type: 'supplier', lat: 19.0760, lng: 72.8777, country: 'India', region: 'Asia', reliability: 74 },
    { id: 'S5', name: 'Dubai Logistics', type: 'warehouse', lat: 25.2048, lng: 55.2708, country: 'UAE', region: 'Middle East', reliability: 91 },
    { id: 'S6', name: 'Hamburg Port', type: 'port', lat: 53.5753, lng: 10.0153, country: 'Germany', region: 'Europe', reliability: 93 },
    { id: 'S7', name: 'Rotterdam Hub', type: 'port', lat: 51.9225, lng: 4.4792, country: 'Netherlands', region: 'Europe', reliability: 96 },
    { id: 'S8', name: 'Paris Warehouse', type: 'warehouse', lat: 48.8566, lng: 2.3522, country: 'France', region: 'Europe', reliability: 89 },
    { id: 'S9', name: 'New York Port', type: 'port', lat: 40.7128, lng: -74.0060, country: 'USA', region: 'Americas', reliability: 90 },
    { id: 'S10', name: 'Chicago Factory', type: 'factory', lat: 41.8781, lng: -87.6298, country: 'USA', region: 'Americas', reliability: 85 },
    { id: 'S11', name: 'São Paulo Dist.', type: 'warehouse', lat: -23.5505, lng: -46.6333, country: 'Brazil', region: 'Americas', reliability: 71 },
    { id: 'S12', name: 'Cape Town Port', type: 'port', lat: -33.9249, lng: 18.4241, country: 'South Africa', region: 'Africa', reliability: 78 },
    { id: 'S13', name: 'Lagos Supplier', type: 'supplier', lat: 6.5244, lng: 3.3792, country: 'Nigeria', region: 'Africa', reliability: 62 },
    { id: 'S14', name: 'Sydney Depot', type: 'warehouse', lat: -33.8688, lng: 151.2093, country: 'Australia', region: 'Oceania', reliability: 92 },
    { id: 'S15', name: 'Tokyo Supplier', type: 'supplier', lat: 35.6762, lng: 139.6503, country: 'Japan', region: 'Asia', reliability: 97 },
];

export const routes = [
    { id: 'R1', from: 'S1', to: 'S3', distance: 3300, time: 7, mode: 'sea' },
    { id: 'R2', from: 'S2', to: 'S1', distance: 130, time: 1, mode: 'land' },
    { id: 'R3', from: 'S3', to: 'S5', distance: 5800, time: 9, mode: 'sea' },
    { id: 'R4', from: 'S4', to: 'S5', distance: 1900, time: 3, mode: 'sea' },
    { id: 'R5', from: 'S5', to: 'S6', distance: 5200, time: 8, mode: 'sea' },
    { id: 'R6', from: 'S6', to: 'S7', distance: 350, time: 1, mode: 'land' },
    { id: 'R7', from: 'S7', to: 'S8', distance: 470, time: 1, mode: 'land' },
    { id: 'R8', from: 'S7', to: 'S9', distance: 5800, time: 9, mode: 'sea' },
    { id: 'R9', from: 'S9', to: 'S10', distance: 1200, time: 2, mode: 'land' },
    { id: 'R10', from: 'S10', to: 'S11', distance: 7700, time: 11, mode: 'air' },
    { id: 'R11', from: 'S1', to: 'S15', distance: 1700, time: 3, mode: 'sea' },
    { id: 'R12', from: 'S15', to: 'S9', distance: 11300, time: 15, mode: 'sea' },
    { id: 'R13', from: 'S12', to: 'S7', distance: 10200, time: 17, mode: 'sea' },
    { id: 'R14', from: 'S13', to: 'S12', distance: 5500, time: 8, mode: 'sea' },
    { id: 'R15', from: 'S3', to: 'S14', distance: 6300, time: 10, mode: 'sea' },
    { id: 'R16', from: 'S14', to: 'S9', distance: 12000, time: 18, mode: 'air' },
    { id: 'R17', from: 'S4', to: 'S3', distance: 2500, time: 5, mode: 'sea' },
    { id: 'R18', from: 'S6', to: 'S8', distance: 750, time: 1, mode: 'land' },
];

export const nodeTypes = {
    supplier: { color: '#8b5cf6', icon: '🏭' },
    factory: { color: '#3b82f6', icon: '⚙️' },
    warehouse: { color: '#f59e0b', icon: '🏬' },
    port: { color: '#22d3ee', icon: '⚓' },
};
