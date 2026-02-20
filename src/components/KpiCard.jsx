'use client';
// src/components/KpiCard.jsx
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function KpiCard({ title, value, subtitle, icon: Icon, color = '#22d3ee', trend, trendValue }) {
    const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
    const trendColor = trend === 'up' ? '#ef4444' : trend === 'down' ? '#22c55e' : '#94a3b8';

    return (
        <div style={{
            background: '#111827',
            border: '1px solid rgba(99,179,237,0.12)',
            borderRadius: '16px',
            padding: '20px',
            position: 'relative',
            overflow: 'hidden',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            cursor: 'default',
        }}
            onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 8px 30px rgba(${hexToRgb(color)},0.15)`;
            }}
            onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
            }}>
            {/* Background glow */}
            <div style={{
                position: 'absolute',
                top: '-20px', right: '-20px',
                width: '80px', height: '80px',
                borderRadius: '50%',
                background: color,
                opacity: 0.08,
                filter: 'blur(20px)',
            }} />

            {/* Icon */}
            <div style={{
                width: '40px', height: '40px',
                borderRadius: '10px',
                background: `rgba(${hexToRgb(color)},0.15)`,
                border: `1px solid rgba(${hexToRgb(color)},0.25)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '16px',
            }}>
                <Icon size={18} color={color} />
            </div>

            {/* Value */}
            <div style={{ fontSize: '30px', fontWeight: 800, color: '#f1f5f9', lineHeight: 1, marginBottom: '6px' }}>
                {value}
            </div>

            {/* Title */}
            <div style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 500, marginBottom: '4px' }}>
                {title}
            </div>

            {/* Subtitle / trend */}
            {(subtitle || trendValue) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px' }}>
                    {trend && <TrendIcon size={12} color={trendColor} />}
                    <span style={{ fontSize: '11px', color: trendColor || '#94a3b8' }}>
                        {trendValue || subtitle}
                    </span>
                </div>
            )}
        </div>
    );
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}` : '99,179,237';
}
