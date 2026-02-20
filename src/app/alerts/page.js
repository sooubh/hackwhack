'use client';

import React from 'react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import AuthGuard from '@/components/AuthGuard';
import AlertsFeed from '@/components/AlertsFeed';

export default function AlertsPage() {
    return (
        <AuthGuard>
            {(user) => (
                <div style={{ display: 'flex', minHeight: '100vh', background: '#070b14' }}>
                    <Sidebar />
                    <div style={{ marginLeft: '240px', flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
                        <TopBar user={user} />
                        <main style={{ flex: 1, padding: 0, position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#070b14' }}>
                            <AlertsFeed user={user} />
                        </main>
                    </div>
                </div>
            )}
        </AuthGuard>
    );
}
