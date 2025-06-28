import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Download, Maximize2 } from 'lucide-react';
import Button from './Button';

const AnalyticsChart = ({ 
  title, 
  data = [], 
  type = 'line', 
  color = '#8B5CF6',
  loading = false,
  className = '',
  onExport,
  onFullscreen
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const periods = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: '1y', label: '1 Year' }
  ];

  // Simple chart implementation using SVG
  const renderLineChart = () => {
    if (!data.length) return null;

    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const range = maxValue - minValue || 1;
    
    const width = 400;
    const height = 200;
    const padding = 40;
    
    const points = data.map((point, index) => {
      const x = padding + (index / (data.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((point.value - minValue) / range) * (height - 2 * padding);
      return { x, y, ...point };
    });

    const pathData = points.map((point, index) => 
      `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
    ).join(' ');

    return (
      <div className="relative">
        <svg width="100%" height="200" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Area under curve */}
          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
              <stop offset="100%" stopColor={color} stopOpacity="0.05"/>
            </linearGradient>
          </defs>
          <path
            d={`${pathData} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`}
            fill="url(#areaGradient)"
          />
          
          {/* Line */}
          <path
            d={pathData}
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Data points */}
          {points.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="4"
              fill={color}
              stroke="white"
              strokeWidth="2"
              className="cursor-pointer hover:r-6 transition-all duration-200"
              onMouseEnter={() => setHoveredPoint(point)}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          ))}
        </svg>
        
        {/* Tooltip */}
        {hoveredPoint && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute bg-gray-900 text-white px-3 py-2 rounded-lg text-sm pointer-events-none z-10"
            style={{
              left: hoveredPoint.x,
              top: hoveredPoint.y - 40,
              transform: 'translateX(-50%)'
            }}
          >
            <div className="font-medium">{hoveredPoint.value.toLocaleString()}</div>
            <div className="text-gray-300 text-xs">{hoveredPoint.label}</div>
          </motion.div>
        )}
      </div>
    );
  };

  const renderBarChart = () => {
    if (!data.length) return null;

    const maxValue = Math.max(...data.map(d => d.value));
    const width = 400;
    const height = 200;
    const padding = 40;
    const barWidth = (width - 2 * padding) / data.length * 0.8;
    const barSpacing = (width - 2 * padding) / data.length * 0.2;

    return (
      <div className="relative">
        <svg width="100%" height="200" viewBox={`0 0 ${width} ${height}`}>
          {data.map((point, index) => {
            const barHeight = (point.value / maxValue) * (height - 2 * padding);
            const x = padding + index * (barWidth + barSpacing);
            const y = height - padding - barHeight;
            
            return (
              <rect
                key={index}
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={color}
                rx="4"
                className="cursor-pointer hover:opacity-80 transition-opacity duration-200"
                onMouseEnter={() => setHoveredPoint({ ...point, x: x + barWidth/2, y })}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            );
          })}
        </svg>
        
        {/* Tooltip */}
        {hoveredPoint && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute bg-gray-900 text-white px-3 py-2 rounded-lg text-sm pointer-events-none z-10"
            style={{
              left: hoveredPoint.x,
              top: hoveredPoint.y - 40,
              transform: 'translateX(-50%)'
            }}
          >
            <div className="font-medium">{hoveredPoint.value.toLocaleString()}</div>
            <div className="text-gray-300 text-xs">{hoveredPoint.label}</div>
          </motion.div>
        )}
      </div>
    );
  };

  const renderPieChart = () => {
    if (!data.length) return null;

    const total = data.reduce((sum, d) => sum + d.value, 0);
    const centerX = 100;
    const centerY = 100;
    const radius = 80;
    
    let currentAngle = 0;
    const slices = data.map((point, index) => {
      const percentage = point.value / total;
      const angle = percentage * 2 * Math.PI;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      
      const x1 = centerX + radius * Math.cos(startAngle);
      const y1 = centerY + radius * Math.sin(startAngle);
      const x2 = centerX + radius * Math.cos(endAngle);
      const y2 = centerY + radius * Math.sin(endAngle);
      
      const largeArcFlag = angle > Math.PI ? 1 : 0;
      
      const pathData = [
        `M ${centerX} ${centerY}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        'Z'
      ].join(' ');
      
      currentAngle += angle;
      
      return {
        ...point,
        pathData,
        percentage: percentage * 100,
        color: `hsl(${(index * 360) / data.length}, 70%, 60%)`
      };
    });

    return (
      <div className="flex items-center space-x-6">
        <svg width="200" height="200" viewBox="0 0 200 200">
          {slices.map((slice, index) => (
            <path
              key={index}
              d={slice.pathData}
              fill={slice.color}
              className="cursor-pointer hover:opacity-80 transition-opacity duration-200"
              onMouseEnter={() => setHoveredPoint(slice)}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          ))}
        </svg>
        
        <div className="space-y-2">
          {slices.map((slice, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: slice.color }}
              ></div>
              <span className="text-sm text-gray-700">{slice.label}</span>
              <span className="text-sm font-medium text-gray-900">
                {slice.percentage.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-card-white p-6 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">Analytics overview</p>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Period Selector */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {periods.map((period) => (
              <button
                key={period.value}
                onClick={() => setSelectedPeriod(period.value)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  selectedPeriod === period.value
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
          
          {/* Action Buttons */}
          <Button
            variant="ghost"
            size="sm"
            icon={Download}
            onClick={onExport}
            className="p-2"
          />
          <Button
            variant="ghost"
            size="sm"
            icon={Maximize2}
            onClick={onFullscreen}
            className="p-2"
          />
        </div>
      </div>

      {/* Chart Content */}
      <div className="relative">
        {loading ? (
          <div className="h-48 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
            <div className="text-gray-500">Loading chart...</div>
          </div>
        ) : data.length === 0 ? (
          <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No data available</p>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden">
            {type === 'line' && renderLineChart()}
            {type === 'bar' && renderBarChart()}
            {type === 'pie' && renderPieChart()}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AnalyticsChart;