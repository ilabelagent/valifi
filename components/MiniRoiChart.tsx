import React, { useState, useMemo } from 'react';

interface ChartDataPoint {
  day: number;
  value: number;
}

interface MiniRoiChartProps {
  data: ChartDataPoint[];
  className?: string;
}

const MiniRoiChart: React.FC<MiniRoiChartProps> = ({ data, className = '' }) => {
    const [tooltip, setTooltip] = useState<{ x: number; y: number; day: number; value: number } | null>(null);
    const width = 300;
    const height = 120;
    const padding = 10;

    const { points, areaPath, linePath, minVal, maxVal } = useMemo(() => {
        if (!data || data.length < 2) {
            return { points: [], areaPath: '', linePath: '', minVal: 0, maxVal: 0 };
        }

        const values = data.map(d => d.value);
        const minVal = Math.min(...values);
        const maxVal = Math.max(...values);
        const valueRange = maxVal - minVal === 0 ? 1 : maxVal - minVal;

        const points = data.map(d => ({
            x: padding + (d.day / (data.length - 1)) * (width - 2 * padding),
            y: height - padding - ((d.value - minVal) / valueRange) * (height - 2 * padding),
            day: d.day,
            value: d.value,
        }));
        
        const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ');
        
        const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(2)} ${height - padding} L ${points[0].x.toFixed(2)} ${height - padding} Z`;

        return { points, areaPath, linePath, minVal, maxVal };
    }, [data, width, height, padding]);

    const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
        const svgRect = e.currentTarget.getBoundingClientRect();
        const svgX = e.clientX - svgRect.left;
        
        const closestPoint = points.reduce((prev, curr) => 
            Math.abs(curr.x - svgX) < Math.abs(prev.x - svgX) ? curr : prev
        );

        setTooltip(closestPoint);
    };

    const handleMouseLeave = () => {
        setTooltip(null);
    };
    
    const startColor = "#0ea5e9"; // sky-500
    const endColor = "#38bdf8"; // sky-400

    return (
        <div className={`relative ${className}`}>
            <svg viewBox={`0 0 ${width} ${height}`} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} className="w-full h-full">
                <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={startColor} stopOpacity={0.4} />
                        <stop offset="100%" stopColor={startColor} stopOpacity={0.05} />
                    </linearGradient>
                </defs>
                
                {data.length > 1 && (
                  <>
                    <path d={areaPath} fill="url(#areaGradient)" />
                    <path d={linePath} fill="none" stroke={endColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </>
                )}

                {tooltip && (
                    <>
                        <line x1={tooltip.x} y1="0" x2={tooltip.x} y2={height} stroke="rgba(148, 163, 184, 0.3)" strokeWidth="1" strokeDasharray="3 3" />
                        <circle cx={tooltip.x} cy={tooltip.y} r="4" fill={endColor} stroke="#1e293b" strokeWidth="2" />
                    </>
                )}
            </svg>
            {tooltip && (
                <div
                    className="absolute bg-slate-900/80 backdrop-blur-sm text-white text-xs rounded-md p-2 border border-slate-700 pointer-events-none shadow-lg"
                    style={{
                        left: `${tooltip.x / width * 100}%`,
                        top: `8px`,
                        transform: 'translateX(-50%)',
                        whiteSpace: 'nowrap'
                    }}
                >
                    <p>Day {tooltip.day}</p>
                    <p className="font-bold">${tooltip.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                </div>
            )}
            <div className="absolute bottom-1 left-2 text-xs text-slate-500">
                ${minVal.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </div>
            <div className="absolute top-1 left-2 text-xs text-slate-500">
                ${maxVal.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </div>
        </div>
    );
};

export default MiniRoiChart;
