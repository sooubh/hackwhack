'use client';
// src/components/TopBar.jsx
import { Bell, Search, User, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { signOut } from '@/services/firebase';

export default function TopBar({ user }) {
    const [showMenu, setShowMenu] = useState(false);

    const handleSignOut = async () => {
        await signOut();
        window.location.href = '/login';
    };

    return (
        <header style={{
            height: '64px',
            background: 'rgba(13,20,36,0.9)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(99,179,237,0.1)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 24px',
            gap: '16px',
            position: 'sticky',
            top: 0,
            zIndex: 40,
        }}>
            {/* Search */}
            <div style={{
                flex: 1,
                maxWidth: '400px',
                position: 'relative',
            }}>
                <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                <input
                    type="text"
                    placeholder="Search nodes, routes, alerts..."
                    style={{
                        width: '100%',
                        padding: '8px 12px 8px 34px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(99,179,237,0.15)',
                        borderRadius: '8px',
                        color: '#94a3b8',
                        fontSize: '13px',
                        outline: 'none',
                    }}
                />
            </div>

            <div style={{ flex: 1 }} />

            {/* Alert bell */}
            <button style={{
                position: 'relative',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(99,179,237,0.15)',
                borderRadius: '8px',
                padding: '8px',
                cursor: 'pointer',
                color: '#94a3b8',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                <Bell size={16} />
                <span style={{
                    position: 'absolute',
                    top: '-4px', right: '-4px',
                    background: '#ef4444',
                    color: '#fff',
                    fontSize: '9px',
                    fontWeight: 700,
                    width: '16px', height: '16px',
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '2px solid #070b14',
                }}>3</span>
            </button>

            {/* User avatar */}
            <div style={{ position: 'relative' }}>
                <button
                    onClick={() => setShowMenu(!showMenu)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(99,179,237,0.15)',
                        borderRadius: '8px',
                        padding: '6px 10px',
                        cursor: 'pointer',
                        color: '#f1f5f9',
                    }}>
                    <div style={{
                        width: '28px', height: '28px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #22d3ee, #8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        overflow: 'hidden',
                    }}>
                        {user?.photoURL ? (
                            <img src={user.photoURL} alt="avatar" style={{ width: '100%', height: '100%' }} />
                        ) : (
                            <User size={14} color="#fff" />
                        )}
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 500, maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {user?.displayName || user?.email?.split('@')[0] || 'Analyst'}
                    </span>
                    <ChevronDown size={12} color="#475569" />
                </button>

                {showMenu && (
                    <div style={{
                        position: 'absolute',
                        top: '120%',
                        right: 0,
                        background: '#111827',
                        border: '1px solid rgba(99,179,237,0.2)',
                        borderRadius: '10px',
                        padding: '8px',
                        minWidth: '160px',
                        zIndex: 100,
                        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                    }}>
                        <button
                            onClick={handleSignOut}
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                background: 'transparent',
                                border: 'none',
                                borderRadius: '6px',
                                color: '#ef4444',
                                fontSize: '13px',
                                textAlign: 'left',
                                cursor: 'pointer',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            Sign Out
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
}
