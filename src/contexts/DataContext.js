// src/contexts/DataContext.js
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '@/services/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';

const DataContext = createContext();

export function useData() {
    return useContext(DataContext);
}

export function DataProvider({ children }) {
    const [nodes, setNodes] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [events, setEvents] = useState([]);
    const [alerts, setAlerts] = useState([]);

    // Derived state for the DataProvider
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!db) {
            setError('Firebase is not initialized.');
            setLoading(false);
            return;
        }

        let isMounted = true;
        let unsubscribeNodes = null;
        let unsubscribeRoutes = null;
        let unsubscribeEvents = null;
        let unsubscribeAlerts = null;

        try {
            // Listen to Nodes
            const qNodes = query(collection(db, 'nodes'));
            unsubscribeNodes = onSnapshot(qNodes, (snapshot) => {
                if (!isMounted) return;
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setNodes(data);
            }, (err) => {
                console.error("Error fetching nodes:", err);
                setError(err.message);
            });

            // Listen to Routes
            const qRoutes = query(collection(db, 'routes'));
            unsubscribeRoutes = onSnapshot(qRoutes, (snapshot) => {
                if (!isMounted) return;
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setRoutes(data);
            }, (err) => {
                console.error("Error fetching routes:", err);
                setError(err.message);
            });

            // Listen to Events
            const qEvents = query(collection(db, 'events'));
            unsubscribeEvents = onSnapshot(qEvents, (snapshot) => {
                if (!isMounted) return;
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setEvents(data);
            }, (err) => {
                console.error("Error fetching events:", err);
                setError(err.message);
            });

            // Listen to Alerts
            const qAlerts = query(collection(db, 'alerts'));
            unsubscribeAlerts = onSnapshot(qAlerts, (snapshot) => {
                if (!isMounted) return;
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setAlerts(data);
            }, (err) => {
                console.error("Error fetching alerts:", err);
                setError(err.message);
            });

            // In a real app, you might want to wait for at least initial data for all 4 
            // before setting loading to false, or keep it simple:
            setLoading(false);

        } catch (err) {
            console.error("Error setting up Firestore listeners:", err);
            setError(err.message);
            setLoading(false);
        }

        return () => {
            isMounted = false;
            // Clean up listeners
            if (unsubscribeNodes) unsubscribeNodes();
            if (unsubscribeRoutes) unsubscribeRoutes();
            if (unsubscribeEvents) unsubscribeEvents();
            if (unsubscribeAlerts) unsubscribeAlerts();
        };
    }, []);

    const value = {
        nodes,
        routes,
        events,
        alerts,
        loading,
        error
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
}
