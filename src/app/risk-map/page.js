'use client';

import React from 'react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import AuthGuard from '@/components/AuthGuard';
import NetworkMap from '@/components/NetworkMap';
import { useData } from '@/contexts/DataContext';

export default function RiskMapPage() {
    return (
        <AuthGuard>
            {(user) => (
                <div style={{ display: 'flex', minHeight: '100vh', background: '#070b14' }}>
                    <Sidebar />
                    <div style={{ marginLeft: '240px', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <TopBar user={user} />
                        <main style={{ padding: '0', flex: 1, position: 'relative', display: 'flex', flexDirection: 'column' }}>
                            <div style={{
                                padding: '24px 32px',
                                borderBottom: '1px solid rgba(255,255,255,0.05)',
                                background: '#0d1424',
                                zIndex: 10
                            }}>
                                <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: '#f1f5f9' }}>Global Risk Map</h1>
                                <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#94a3b8' }}>
                                    Interactive geographical visualization of your supply chain network and live disruptions.
                                </p>
                            </div>
                            <div style={{ flex: 1, position: 'relative', background: '#070b14' }}>
                                <NetworkMap />
                            </div>
                        </main>
                    </div>
                </div>
            )}
        </AuthGuard>
    );
}
