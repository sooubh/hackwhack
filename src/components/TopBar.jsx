'use client';
import { useTheme } from '@/contexts/ThemeContext';

export default function TopBar({ user, title, subtitle }) {
    const { theme: t, mode, toggleTheme } = useTheme();

    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', gap: '16px' }}>
            <div>
                <h1 style={{ fontSize: '24px', fontWeight: 800, color: t.heading, margin: 0 }}>{title || 'Dashboard'}</h1>
                {subtitle && <p style={{ fontSize: '14px', color: t.textMuted, marginTop: '4px' }}>{subtitle}</p>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {/* Theme Toggle */}
                <button onClick={toggleTheme} style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '8px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
                    background: t.bgCard, border: `1px solid ${t.border}`, color: t.textSecondary,
                    cursor: 'pointer',
                }}>
                    <span className="material-icons-outlined" style={{ fontSize: '18px' }}>
                        {mode === 'dark' ? 'light_mode' : 'dark_mode'}
                    </span>
                    {mode === 'dark' ? 'Light' : 'Dark'}
                </button>

                {/* User */}
                {user && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 14px', background: t.bgCard, borderRadius: '10px', border: `1px solid ${t.border}` }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: t.primaryBg, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${t.primaryBorder}` }}>
                            <span className="material-icons-outlined" style={{ fontSize: '18px', color: t.primary }}>person</span>
                        </div>
                        <div>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: t.heading }}>{user.displayName || 'User'}</div>
                            <div style={{ fontSize: '11px', color: t.textMuted }}>{user.email}</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
