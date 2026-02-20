// src/services/dataSeeder.js
import { db } from './firebase';
import { collection, doc, writeBatch, getDocs } from 'firebase/firestore';

// Import raw static data to seed
import { nodes, routes } from '@/data/supplyChain';
import { events } from '@/data/events';
import { alerts } from '@/data/alerts';

/**
 * Utility to forcefully overwrite/seed the predefined dummy JSON 
 * structures directly into the live Firebase Realtime Firestore for a specific user.
 */
export async function seedDummyDataToFirebase(userId) {
    if (!db) throw new Error("Firebase Firestore not initialized.");
    if (!userId) throw new Error("User ID is required to seed specific tenant data.");

    try {
        console.log(`Seeding started for user ${userId}. Preparing batch...`);
        // A batch allows us to commit all these writes atomically 
        // Note: batches have a 500 operation limit, but our datasets are small
        const batch = writeBatch(db);
        const basePath = `users/${userId}`;

        // 1. Seed Nodes
        nodes.forEach((node) => {
            const nodeRef = doc(collection(db, `${basePath}/nodes`), node.id);
            batch.set(nodeRef, node);
        });

        // 2. Seed Routes
        routes.forEach((route) => {
            const routeRef = doc(collection(db, `${basePath}/routes`), route.id);
            batch.set(routeRef, route);
        });

        // 3. Seed Events
        events.forEach((event) => {
            const eventRef = doc(collection(db, `${basePath}/events`), event.id);
            batch.set(eventRef, event);
        });

        // 4. Seed Alerts
        alerts.forEach((alert) => {
            const alertRef = doc(collection(db, `${basePath}/alerts`), alert.id);
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

/**
 * Utility to completely clear out all supply chain data in the live database for a specific user.
 */
export async function clearFirebaseDatabase(userId) {
    if (!db) throw new Error("Firebase Firestore not initialized.");
    if (!userId) throw new Error("User ID is required to clear specific tenant data.");

    try {
        console.log(`Clearing database started for user ${userId}...`);
        const batch = writeBatch(db);
        let deletedCount = 0;

        const collectionsToClear = [
            `users/${userId}/nodes`,
            `users/${userId}/routes`,
            `users/${userId}/events`,
            `users/${userId}/alerts`
        ];

        for (const colPath of collectionsToClear) {
            const querySnapshot = await getDocs(collection(db, colPath));
            querySnapshot.forEach((document) => {
                batch.delete(document.ref);
                deletedCount++;
            });
        }

        if (deletedCount > 0) {
            console.log(`Committing batch delete of ${deletedCount} documents...`);
            await batch.commit();
            console.log("Tenant database cleared successfully!");
        } else {
            console.log("Tenant database already empty.");
        }

        return true;
    } catch (err) {
        console.error("Error clearing Firebase Data: ", err);
        throw err;
    }
}
