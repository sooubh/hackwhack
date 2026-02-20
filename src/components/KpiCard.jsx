'use client';
import { useTheme } from '@/contexts/ThemeContext';

export default function KpiCard({ title, value, icon, colorClass, subtitle, trendValue, trend }) {
    const { theme: t } = useTheme();

    const colorMap = {
        primary: { main: t.primary, bg: t.primaryBg, border: t.primaryBorder },
        danger: { main: t.danger, bg: t.dangerBg, border: t.dangerBorder },
        warning: { main: t.warning, bg: t.warningBg, border: t.warningBorder },
        success: { main: t.success, bg: t.successBg, border: t.successBorder },
        info: { main: t.info, bg: t.infoBg, border: t.infoBorder },
    };

    const colors = colorMap[colorClass] || colorMap.primary;

    return (
        <div style={{
            background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: '14px', padding: '20px',
            display: 'flex', gap: '16px', alignItems: 'flex-start',
        }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: colors.bg, border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span className="material-icons-outlined" style={{ fontSize: '22px', color: colors.main }}>{icon}</span>
            </div>
            <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', color: t.textMuted, fontWeight: 500, marginBottom: '4px' }}>{title}</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: t.heading, lineHeight: 1 }}>{value}</div>
                {(subtitle || trendValue) && (
                    <div style={{ fontSize: '12px', color: trend === 'up' ? t.danger : t.success, marginTop: '6px', fontWeight: 600 }}>
                        {trendValue || subtitle}
                    </div>
                )}
            </div>
        </div>
    );
}
