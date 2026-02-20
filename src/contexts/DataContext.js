// src/contexts/DataContext.js
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, auth, onAuthStateChanged } from '@/services/firebase';
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

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userId, setUserId] = useState(null);

    // Track authenticated user for tenant isolation
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserId(user.uid);
            } else {
                setUserId(null);
                setNodes([]);
                setRoutes([]);
                setEvents([]);
                setAlerts([]);
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);

    // Fetch user-specific isolated data
    useEffect(() => {
        if (!db || !userId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        let isMounted = true;
        let unsubscribeNodes = null;
        let unsubscribeRoutes = null;
        let unsubscribeEvents = null;
        let unsubscribeAlerts = null;

        try {
            const basePath = `users/${userId}`;

            // Listen to Nodes
            const qNodes = query(collection(db, `${basePath}/nodes`));
            unsubscribeNodes = onSnapshot(qNodes, (snapshot) => {
                if (!isMounted) return;
                setNodes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            }, (err) => setError(err.message));

            // Listen to Routes
            const qRoutes = query(collection(db, `${basePath}/routes`));
            unsubscribeRoutes = onSnapshot(qRoutes, (snapshot) => {
                if (!isMounted) return;
                setRoutes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            }, (err) => setError(err.message));

            // Listen to Events
            const qEvents = query(collection(db, `${basePath}/events`));
            unsubscribeEvents = onSnapshot(qEvents, (snapshot) => {
                if (!isMounted) return;
                setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            }, (err) => setError(err.message));

            // Listen to Alerts
            const qAlerts = query(collection(db, `${basePath}/alerts`));
            unsubscribeAlerts = onSnapshot(qAlerts, (snapshot) => {
                if (!isMounted) return;
                setAlerts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            }, (err) => setError(err.message));

            setLoading(false);

        } catch (err) {
            console.error("Error setting up isolated Firestore listeners:", err);
            setError(err.message);
            setLoading(false);
        }

        return () => {
            isMounted = false;
            if (unsubscribeNodes) unsubscribeNodes();
            if (unsubscribeRoutes) unsubscribeRoutes();
            if (unsubscribeEvents) unsubscribeEvents();
            if (unsubscribeAlerts) unsubscribeAlerts();
        };
    }, [userId]);

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
