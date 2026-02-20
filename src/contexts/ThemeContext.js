// src/contexts/ThemeContext.js
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function useTheme() {
    return useContext(ThemeContext);
}

// Dark and light theme color tokens
const themes = {
    dark: {
        name: 'dark',
        bg: '#0f111a',
        bgCard: '#1a1c29',
        bgHover: '#22243a',
        border: '#2d3042',
        text: '#e2e8f0',
        textSecondary: '#9ca3af',
        textMuted: '#6b7280',
        heading: '#ffffff',
        primary: '#6366f1',
        primaryBg: 'rgba(99,102,241,0.1)',
        primaryBorder: 'rgba(99,102,241,0.2)',
        danger: '#ef4444',
        dangerBg: 'rgba(239,68,68,0.1)',
        dangerBorder: 'rgba(239,68,68,0.2)',
        warning: '#f59e0b',
        warningBg: 'rgba(245,158,11,0.1)',
        warningBorder: 'rgba(245,158,11,0.2)',
        success: '#10b981',
        successBg: 'rgba(16,185,129,0.1)',
        successBorder: 'rgba(16,185,129,0.2)',
        info: '#3b82f6',
        infoBg: 'rgba(59,130,246,0.1)',
        infoBorder: 'rgba(59,130,246,0.2)',
        shadow: 'rgba(0,0,0,0.3)',
    },
    light: {
        name: 'light',
        bg: '#f5f7fa',
        bgCard: '#ffffff',
        bgHover: '#f0f2f5',
        border: '#e2e5ea',
        text: '#1f2937',
        textSecondary: '#4b5563',
        textMuted: '#9ca3af',
        heading: '#111827',
        primary: '#4f46e5',
        primaryBg: 'rgba(79,70,229,0.08)',
        primaryBorder: 'rgba(79,70,229,0.2)',
        danger: '#dc2626',
        dangerBg: 'rgba(220,38,38,0.08)',
        dangerBorder: 'rgba(220,38,38,0.15)',
        warning: '#d97706',
        warningBg: 'rgba(217,119,6,0.08)',
        warningBorder: 'rgba(217,119,6,0.15)',
        success: '#059669',
        successBg: 'rgba(5,150,105,0.08)',
        successBorder: 'rgba(5,150,105,0.15)',
        info: '#2563eb',
        infoBg: 'rgba(37,99,235,0.08)',
        infoBorder: 'rgba(37,99,235,0.15)',
        shadow: 'rgba(0,0,0,0.08)',
    },
};

export function ThemeProvider({ children }) {
    const [mode, setMode] = useState('dark');

    useEffect(() => {
        const saved = localStorage.getItem('vigilance-theme');
        if (saved === 'light' || saved === 'dark') setMode(saved);
    }, []);

    const toggleTheme = () => {
        const next = mode === 'dark' ? 'light' : 'dark';
        setMode(next);
        localStorage.setItem('vigilance-theme', next);
    };

    const t = themes[mode];

    return (
        <ThemeContext.Provider value={{ theme: t, mode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}
