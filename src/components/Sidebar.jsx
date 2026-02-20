'use client';
// src/components/Sidebar.jsx
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Map, Brain, Bell, Settings, Shield, Zap } from 'lucide-react';

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/risk-map', label: 'Risk Map', icon: Map },
    { href: '/predictions', label: 'AI Predictions', icon: Brain },
    { href: '/alerts', label: 'Alerts', icon: Bell },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside style={{
            width: '240px',
            minHeight: '100vh',
            background: 'rgba(13,20,36,0.95)',
            backdropFilter: 'blur(20px)',
            borderRight: '1px solid rgba(99,179,237,0.1)',
            display: 'flex',
            flexDirection: 'column',
            padding: '0',
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            zIndex: 50,
        }}>
            {/* Logo */}
            <div style={{
                padding: '24px 20px',
                borderBottom: '1px solid rgba(99,179,237,0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
            }}>
                <div style={{
                    width: '36px', height: '36px',
                    background: 'linear-gradient(135deg, #22d3ee, #8b5cf6)',
                    borderRadius: '10px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 0 20px rgba(34,211,238,0.4)',
                }}>
                    <Zap size={18} color="#fff" />
                </div>
                <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.3px' }}>
                        SupplyChain                    </div>
                    <div style={{ fontSize: '10px', color: '#22d3ee', letterSpacing: '1px', textTransform: 'uppercase' }}>
                        AI Platform
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav style={{ padding: '16px 12px', flex: 1 }}>
                <div style={{ fontSize: '10px', color: '#475569', textTransform: 'uppercase', letterSpacing: '1.5px', padding: '0 8px', marginBottom: '8px' }}>
                    Navigation
                </div>
                {navItems.map(({ href, label, icon: Icon }) => {
                    const active = pathname === href || pathname.startsWith(href + '/');
                    return (
                        <Link key={href} href={href} style={{ textDecoration: 'none' }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '10px 12px',
                                borderRadius: '10px',
                                marginBottom: '2px',
                                color: active ? '#22d3ee' : '#94a3b8',
                                background: active ? 'rgba(34,211,238,0.1)' : 'transparent',
                                border: active ? '1px solid rgba(34,211,238,0.2)' : '1px solid transparent',
                                transition: 'all 0.2s ease',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: active ? 600 : 400,
                            }}
                                onMouseEnter={e => {
                                    if (!active) {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                        e.currentTarget.style.color = '#e2e8f0';
                                    }
                                }}
                                onMouseLeave={e => {
                                    if (!active) {
                                        e.currentTarget.style.background = 'transparent';
                                        e.currentTarget.style.color = '#94a3b8';
                                    }
                                }}>
                                <Icon size={16} />
                                {label}
                                {label === 'Alerts' && (
                                    <span style={{
                                        marginLeft: 'auto',
                                        background: '#ef4444',
                                        color: '#fff',
                                        fontSize: '10px',
                                        fontWeight: 700,
                                        padding: '2px 6px',
                                        borderRadius: '10px',
                                        minWidth: '20px',
                                        textAlign: 'center',
                                    }}>3</span>
                                )}
                            </div>
                        </Link>
                    );
                })}
            </nav>

            {/* Status indicator */}
            <div style={{
                padding: '16px',
                margin: '0 12px 12px',
                borderRadius: '12px',
                background: 'rgba(34,211,238,0.05)',
                border: '1px solid rgba(34,211,238,0.15)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }} />
                    <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>AI Engine Active</span>
                </div>
                <div style={{ fontSize: '11px', color: '#475569' }}>
                    Monitoring 15 nodes &bull; 18 routes
                </div>
                <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>
                    Last updated: just now
                </div>
            </div>
        </aside>
    );
}
