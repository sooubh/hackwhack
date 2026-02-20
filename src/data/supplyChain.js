// src/data/supplyChain.js
// India-specific supply chain network for B2B operations

export const nodes = [
    // Major Ports
    { id: 'N1', name: 'Mumbai Port (JNPT)', type: 'port', lat: 18.9500, lng: 72.9500, country: 'India', region: 'West India', reliability: 85 },
    { id: 'N2', name: 'Chennai Port', type: 'port', lat: 13.0827, lng: 80.2707, country: 'India', region: 'South India', reliability: 82 },
    { id: 'N3', name: 'Mundra Port', type: 'port', lat: 22.8394, lng: 69.7250, country: 'India', region: 'West India', reliability: 90 },

    // Factories
    { id: 'N4', name: 'Pune Manufacturing', type: 'factory', lat: 18.5204, lng: 73.8567, country: 'India', region: 'West India', reliability: 88 },
    { id: 'N5', name: 'Coimbatore Textiles', type: 'factory', lat: 11.0168, lng: 76.9558, country: 'India', region: 'South India', reliability: 80 },
    { id: 'N6', name: 'Noida Electronics', type: 'factory', lat: 28.5355, lng: 77.3910, country: 'India', region: 'North India', reliability: 78 },

    // Warehouses
    { id: 'N7', name: 'Delhi NCR Hub', type: 'warehouse', lat: 28.7041, lng: 77.1025, country: 'India', region: 'North India', reliability: 86 },
    { id: 'N8', name: 'Bangalore Dist. Center', type: 'warehouse', lat: 12.9716, lng: 77.5946, country: 'India', region: 'South India', reliability: 92 },
    { id: 'N9', name: 'Hyderabad Warehouse', type: 'warehouse', lat: 17.3850, lng: 78.4867, country: 'India', region: 'South India', reliability: 84 },

    // Suppliers
    { id: 'N10', name: 'Ahmedabad Supplier', type: 'supplier', lat: 23.0225, lng: 72.5714, country: 'India', region: 'West India', reliability: 76 },
    { id: 'N11', name: 'Kolkata Supplier', type: 'supplier', lat: 22.5726, lng: 88.3639, country: 'India', region: 'East India', reliability: 72 },
    { id: 'N12', name: 'Jaipur Raw Materials', type: 'supplier', lat: 26.9124, lng: 75.7873, country: 'India', region: 'North India', reliability: 74 },
];

export const routes = [
    // Port to Warehouse routes
    { id: 'R1', from: 'N1', to: 'N7', mode: 'road', distance: 1400, transitDays: 3, cost: 45000 },
    { id: 'R2', from: 'N1', to: 'N4', mode: 'road', distance: 150, transitDays: 1, cost: 8000 },
    { id: 'R3', from: 'N2', to: 'N8', mode: 'road', distance: 350, transitDays: 1, cost: 15000 },
    { id: 'R4', from: 'N2', to: 'N5', mode: 'road', distance: 500, transitDays: 2, cost: 20000 },
    { id: 'R5', from: 'N3', to: 'N10', mode: 'road', distance: 400, transitDays: 1, cost: 12000 },

    // Factory to Warehouse routes
    { id: 'R6', from: 'N4', to: 'N8', mode: 'road', distance: 840, transitDays: 2, cost: 32000 },
    { id: 'R7', from: 'N5', to: 'N9', mode: 'road', distance: 700, transitDays: 2, cost: 28000 },
    { id: 'R8', from: 'N6', to: 'N7', mode: 'road', distance: 25, transitDays: 1, cost: 5000 },

    // Supplier to Factory routes
    { id: 'R9', from: 'N10', to: 'N4', mode: 'road', distance: 650, transitDays: 2, cost: 22000 },
    { id: 'R10', from: 'N11', to: 'N6', mode: 'rail', distance: 1500, transitDays: 3, cost: 35000 },
    { id: 'R11', from: 'N12', to: 'N7', mode: 'road', distance: 280, transitDays: 1, cost: 10000 },
    { id: 'R12', from: 'N12', to: 'N6', mode: 'road', distance: 300, transitDays: 1, cost: 11000 },

    // Cross-region
    { id: 'R13', from: 'N7', to: 'N9', mode: 'rail', distance: 1600, transitDays: 3, cost: 38000 },
    { id: 'R14', from: 'N8', to: 'N9', mode: 'road', distance: 570, transitDays: 1, cost: 18000 },
    { id: 'R15', from: 'N3', to: 'N1', mode: 'sea', distance: 900, transitDays: 2, cost: 25000 },
];
