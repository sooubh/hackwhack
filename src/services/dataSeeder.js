// src/services/dataSeeder.js
import { db } from './firebase';
import { collection, doc, writeBatch } from 'firebase/firestore';

// Import raw static data to seed
import { nodes, routes } from '@/data/supplyChain';
import { events } from '@/data/events';
import { alerts } from '@/data/alerts';

/**
 * Utility to forcefully overwrite/seed the predefined dummy JSON 
 * structures directly into the live Firebase Realtime Firestore.
 */
export async function seedDummyDataToFirebase() {
    if (!db) throw new Error("Firebase Firestore not initialized.");

    try {
        console.log("Seeding started. Preparing batch...");
        // A batch allows us to commit all these writes atomically 
        // Note: batches have a 500 operation limit, but our datasets are small
        const batch = writeBatch(db);

        // 1. Seed Nodes (Collection: 'nodes')
        nodes.forEach((node) => {
            const nodeRef = doc(collection(db, 'nodes'), node.id);
            batch.set(nodeRef, node); // Using their existing IDs as document keys for predictable references
        });

        // 2. Seed Routes (Collection: 'routes')
        routes.forEach((route) => {
            const routeRef = doc(collection(db, 'routes'), route.id);
            batch.set(routeRef, route);
        });

        // 3. Seed Events (Collection: 'events')
        events.forEach((event) => {
            const eventRef = doc(collection(db, 'events'), event.id);
            batch.set(eventRef, event);
        });

        // 4. Seed Alerts (Collection: 'alerts')
        alerts.forEach((alert) => {
            const alertRef = doc(collection(db, 'alerts'), alert.id);
            batch.set(alertRef, alert);
        });

        console.log("Committing batch write...");
        await batch.commit();
        console.log("Successfully seeded database with static JSON data!");

        return true;
    } catch (err) {
        console.error("Error seeding to Firebase Data: ", err);
        throw err;
    }
}

import { getDocs } from 'firebase/firestore';

/**
 * Utility to completely clear out all supply chain data in the live database.
 */
export async function clearFirebaseDatabase() {
    if (!db) throw new Error("Firebase Firestore not initialized.");

    try {
        console.log("Clearing database started...");
        const batch = writeBatch(db);
        let deletedCount = 0;

        const collectionsToClear = ['nodes', 'routes', 'events', 'alerts'];

        for (const colName of collectionsToClear) {
            const querySnapshot = await getDocs(collection(db, colName));
            querySnapshot.forEach((document) => {
                batch.delete(document.ref);
                deletedCount++;
            });
        }

        if (deletedCount > 0) {
            console.log(`Committing batch delete of ${deletedCount} documents...`);
            await batch.commit();
            console.log("Database cleared successfully!");
        } else {
            console.log("Database already empty.");
        }

        return true;
    } catch (err) {
        console.error("Error clearing Firebase Data: ", err);
        throw err;
    }
}
