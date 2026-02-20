'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';

const navItems = [
    { href: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { href: '/predictions', icon: 'auto_awesome', label: 'AI Predictions' },
    { href: '/risk-map', icon: 'map', label: 'Supply Map' },
    { href: '/alerts', icon: 'notifications', label: 'Alerts' },
    { href: '/settings', icon: 'settings', label: 'Settings' },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { theme: t } = useTheme();

    return (
        <aside style={{ width: '240px', minWidth: '240px', height: '100vh', position: 'sticky', top: 0, background: t.bgCard, borderRight: `1px solid ${t.border}`, display: 'flex', flexDirection: 'column', padding: '24px 14px', overflow: 'hidden' }}>
            {/* Logo */}
            <div style={{ padding: '0 10px', marginBottom: '32px' }}>
                <h1 style={{ fontSize: '18px', fontWeight: 800, color: t.primary, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="material-icons-outlined" style={{ fontSize: '22px' }}>security</span>
                    SupplyChain AI
                </h1>
                <p style={{ fontSize: '11px', color: t.textMuted, marginTop: '4px' }}>Supply Chain Intelligence</p>
            </div>

            {/* Navigation */}
            <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {navItems.map(item => {
                    const active = pathname === item.href;
                    return (
                        <Link key={item.href} href={item.href} style={{
                            display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '10px',
                            fontSize: '14px', fontWeight: active ? 600 : 500, textDecoration: 'none',
                            color: active ? t.heading : t.textSecondary,
                            background: active ? t.primaryBg : 'transparent',
                            border: active ? `1px solid ${t.primaryBorder}` : '1px solid transparent',
                        }}>
                            <span className="material-icons-outlined" style={{ fontSize: '20px', color: active ? t.primary : t.textMuted }}>{item.icon}</span>
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div style={{ padding: '12px 10px', borderTop: `1px solid ${t.border}`, marginTop: '12px' }}>
                <p style={{ fontSize: '10px', color: t.textMuted, margin: 0 }}>© 2024 SupplyChain AI</p>
                <p style={{ fontSize: '10px', color: t.textMuted, margin: '2px 0 0' }}>India Operations</p>
            </div>
        </aside>
    );
}
