/**
 * RiskGauge Component - Visual Trust/Safety Score Display
 * 
 * Displays trust score 0-100 with color-coded severity levels.
 * Higher score = safer (inverted from risk score)
 * Uses animated circular gauge for premium aesthetics.
 */

import React from 'react';
import { AlertTriangle, Shield, AlertCircle } from 'lucide-react';

interface RiskGaugeProps {
    score: number;  // 0-100 risk score (will be inverted to trust score)
    classification: 'safe' | 'suspicious' | 'malicious';
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({ score, classification }) => {

    // INVERT the score: High risk (85) becomes Low trust (15), Low risk (10) becomes High trust (90)
    const trustScore = 100 - Math.min(Math.max(score, 0), 100);

    // Calculate gauge rotation (0-180 degrees for half-circle)
    const rotation = (trustScore / 100) * 180;

    // Color mapping (colors stay the same based on classification)
    const getColors = () => {
        if (classification === 'malicious') {
            return {
                primary: 'from-red-500 to-red-700',
                glow: 'shadow-red-500/50',
                text: 'text-red-400',
                border: 'border-red-500/30',
                icon: <AlertTriangle className="w-8 h-8" />
            };
        } else if (classification === 'suspicious') {
            return {
                primary: 'from-yellow-500 to-orange-600',
                glow: 'shadow-yellow-500/50',
                text: 'text-yellow-400',
                border: 'border-yellow-500/30',
                icon: <AlertCircle className="w-8 h-8" />
            };
        } else {
            return {
                primary: 'from-green-500 to-green-700',
                glow: 'shadow-green-500/50',
                text: 'text-green-400',
                border: 'border-green-500/30',
                icon: <Shield className="w-8 h-8" />
            };
        }
    };

    const colors = getColors();

    return (
        <div className="flex flex-col items-center justify-center p-8">

            {/* Circular Gauge Container */}
            <div className="relative w-64 h-32 mb-6">

                {/* Background Arc */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 100">
                    <path
                        d="M 20 90 A 80 80 0 0 1 180 90"
                        fill="none"
                        stroke="rgba(255, 255, 255, 0.1)"
                        strokeWidth="12"
                        strokeLinecap="round"
                    />

                    {/* Active Arc (Colored) */}
                    <path
                        d="M 20 90 A 80 80 0 0 1 180 90"
                        fill="none"
                        stroke="url(#gradient)"
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={`${(trustScore / 100) * 251} 251`}
                        className="transition-all duration-1000 ease-out"
                    />

                    {/* Gradient Definition */}
                    <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            {classification === 'malicious' && (
                                <>
                                    <stop offset="0%" stopColor="#ef4444" />
                                    <stop offset="100%" stopColor="#b91c1c" />
                                </>
                            )}
                            {classification === 'suspicious' && (
                                <>
                                    <stop offset="0%" stopColor="#eab308" />
                                    <stop offset="100%" stopColor="#ea580c" />
                                </>
                            )}
                            {classification === 'safe' && (
                                <>
                                    <stop offset="0%" stopColor="#22c55e" />
                                    <stop offset="100%" stopColor="#15803d" />
                                </>
                            )}
                        </linearGradient>
                    </defs>
                </svg>

                {/* Needle Indicator */}
                <div className="absolute inset-0 flex items-end justify-center">
                    <div
                        className={`w-1 h-20 bg-gradient-to-t ${colors.primary} rounded-full origin-bottom transition-transform duration-1000 ease-out ${colors.glow} shadow-lg`}
                        style={{
                            transform: `rotate(${rotation - 90}deg)`,
                            transformOrigin: 'bottom center'
                        }}
                    />
                </div>

                {/* Center Pivot */}
                <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-gradient-to-br ${colors.primary} ${colors.glow} shadow-lg z-10`} />
            </div>

            {/* Score Display */}
            <div className="flex flex-col items-center gap-2">
                <div className={`flex items-center gap-3 ${colors.text}`}>
                    {colors.icon}
                    <div className="text-5xl font-bold tracking-tight">
                        {trustScore}
                    </div>
                </div>

                <div className="text-sm text-gray-400 uppercase tracking-wider">
                    Trust Score
                </div>
            </div>

            {/* Classification Badge */}
            <div className={`mt-4 px-4 py-2 rounded-full border-2 ${colors.border} bg-gray-900/50 backdrop-blur-sm`}>
                <span className={`text-sm font-semibold ${colors.text} uppercase tracking-wide`}>
                    {classification}
                </span>
            </div>

            {/* Scale Legend */}
            <div className="mt-6 flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span>70-100 Safe</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span>40-69 Suspicious</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span>0-39 Malicious</span>
                </div>
            </div>
        </div>
    );
};
