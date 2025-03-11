import React, { useState, useEffect, useRef } from 'react';
import { useThree, Canvas } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

interface PriceChartProps {
  pair: string;
  timeframe: string;
  arMode?: boolean;
}

// Mock data generator for demo purposes
const generateMockData = (pair: string, timeframe: string, count: number) => {
  const basePrice = pair.includes('BTC') ? 40000 : pair.includes('ETH') ? 2500 : 100;
  const volatility = pair.includes('BTC') ? 0.02 : pair.includes('ETH') ? 0.03 : 0.05;
  
  const now = new Date();
  let currentPrice = basePrice;
  
  return Array.from({ length: count }).map((_, i) => {
    const timestamp = new Date(now.getTime() - (count - i) * getTimeframeMinutes(timeframe) * 60 * 1000);
    
    // Random price movement
    const change = (Math.random() - 0.5) * volatility * currentPrice;
    currentPrice += change;
    
    return {
      timestamp,
      open: currentPrice - Math.random() * Math.abs(change),
      high: currentPrice + Math.random() * Math.abs(change) * 0.5,
      low: currentPrice - Math.random() * Math.abs(change) * 0.5,
      close: currentPrice,
      volume: Math.random() * 100 * basePrice
    };
  });
};

const getTimeframeMinutes = (timeframe: string): number => {
  switch (timeframe) {
    case '1m': return 1;
    case '5m': return 5;
    case '15m': return 15;
    case '1h': return 60;
    case '4h': return 240;
    case '1d': return 1440;
    case '1w': return 10080;
    default: return 60;
  }
};

// Standard 2D Chart Component
const StandardChart: React.FC<PriceChartProps> = ({ pair, timeframe }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  
  useEffect(() => {
    // In a real app, this would fetch actual market data
    setChartData(generateMockData(pair, timeframe, 100));
  }, [pair, timeframe]);
  
  useEffect(() => {
    if (!canvasRef.current || chartData.length === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set dimensions
    const width = canvas.width;
    const height = canvas.height;
    
    // Calculate min/max values for scaling
    const prices = chartData.flatMap(d => [d.high, d.low]);
    const minPrice = Math.min(...prices) * 0.99;
    const maxPrice = Math.max(...prices) * 1.01;
    const priceRange = maxPrice - minPrice;
    
    // Draw price scale
    ctx.fillStyle = '#8A8D91';
    ctx.font = '10px Inter, sans-serif';
    for (let i = 0; i <= 5; i++) {
      const price = maxPrice - (i / 5) * priceRange;
      const y = (i / 5) * height;
      ctx.fillText(price.toFixed(2), width - 60, y + 10);
      
      // Draw horizontal grid line
      ctx.strokeStyle = 'rgba(138, 141, 145, 0.2)';
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width - 70, y);
      ctx.stroke();
    }
    
    // Draw candlesticks
    const candleWidth = (width - 80) / chartData.length;
    
    chartData.forEach((candle, i) => {
      const x = i * candleWidth;
      
      // Calculate y coordinates (inverted y-axis in canvas)
      const openY = height - ((candle.open - minPrice) / priceRange) * height;
      const closeY = height - ((candle.close - minPrice) / priceRange) * height;
      const highY = height - ((candle.high - minPrice) / priceRange) * height;
      const lowY = height - ((candle.low - minPrice) / priceRange) * height;
      
      // Draw the wick
      ctx.strokeStyle = candle.open > candle.close ? '#FF4444' : '#0099FF';
      ctx.beginPath();
      ctx.moveTo(x + candleWidth / 2, highY);
      ctx.lineTo(x + candleWidth / 2, lowY);
      ctx.stroke();
      
      // Draw the candle body
      ctx.fillStyle = candle.open > candle.close ? '#FF4444' : '#0099FF';
      ctx.fillRect(
        x + 1,
        Math.min(openY, closeY),
        candleWidth - 2,
        Math.abs(closeY - openY) || 1
      );
    });
    
    // Draw time scale for selected points
    const stepSize = Math.max(1, Math.floor(chartData.length / 5));
    for (let i = 0; i < chartData.length; i += stepSize) {
      const candle = chartData[i];
      const x = i * candleWidth;
      
      ctx.fillStyle = '#8A8D91';
      const date = candle.timestamp.toLocaleDateString();
      const time = candle.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const displayTime = timeframe === '1d' || timeframe === '1w' ? date : time;
      
      ctx.fillText(displayTime, x, height - 5);
    }
    
  }, [chartData, canvasRef]);
  
  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div>
          <span className="text-xl font-bold">{pair.split('/')[0]}</span>
          <span className="text-gray-400 mx-1">/</span>
          <span className="text-gray-300">{pair.split('/')[1]}</span>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold bright-green-text">
            {chartData.length > 0 ? chartData[chartData.length - 1].close.toFixed(2) : '0.00'}
          </div>
          <div className="text-sm bright-green-text">
            +2.45% <span className="text-gray-400">24h</span>
          </div>
        </div>
      </div>
      
      <div className="flex-1 relative min-h-[300px]">
        <canvas 
          ref={canvasRef} 
          className="w-full h-full absolute inset-0"
          width={800}
          height={400}
        />
      </div>
    </div>
  );
};

// 3D AR Visualization
const ARChart: React.FC<PriceChartProps> = ({ pair, timeframe }) => {
  const [chartData, setChartData] = useState<any[]>([]);
  
  useEffect(() => {
    // In a real app, this would fetch actual market data
    setChartData(generateMockData(pair, timeframe, 30));
  }, [pair, timeframe]);
  
  return (
    <div className="w-full h-full min-h-[400px]">
      <Canvas>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <PriceVisualization data={chartData} pair={pair} />
        <OrbitControls />
      </Canvas>
    </div>
  );
};

// 3D Price Visualization Component
const PriceVisualization = ({ data, pair }: { data: any[], pair: string }) => {
  const { scene } = useThree();
  
  useEffect(() => {
    scene.background = new THREE.Color('#222222');
  }, [scene]);
  
  // Calculate min/max for scaling
  const prices = data.flatMap(d => [d.high, d.low]);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice;
  
  // Create materials
  const greenMaterial = new THREE.MeshStandardMaterial({ 
    color: '#0099FF',
    metalness: 0.7,
    roughness: 0.2,
    emissive: '#0099FF',
    emissiveIntensity: 0.2
  });
  
  const redMaterial = new THREE.MeshStandardMaterial({ 
    color: '#FF4444',
    metalness: 0.7,
    roughness: 0.2,
    emissive: '#FF4444',
    emissiveIntensity: 0.2
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Price surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[15, 10]} />
        <meshBasicMaterial color="#333333" />
      </mesh>
      
      {/* Data points */}
      {data.map((candle, i) => {
        const x = (i / data.length) * 12 - 6;
        const height = ((candle.close - minPrice) / priceRange) * 4;
        const material = candle.open > candle.close ? redMaterial : greenMaterial;
        
        return (
          <group key={i} position={[x, 0, 0]}>
            {/* Candle body */}
            <mesh position={[0, height / 2, 0]} material={material}>
              <boxGeometry args={[0.2, height, 0.2]} />
            </mesh>
            
            {/* Wick */}
            <mesh position={[0, ((candle.high + candle.low) / 2 - minPrice) / priceRange * 4, 0]} material={material}>
              <boxGeometry args={[0.05, ((candle.high - candle.low) / priceRange) * 4, 0.05]} />
            </mesh>
          </group>
        );
      })}
      
      {/* Pair label */}
      <group position={[0, 3, 0]}>
        <Text 
          fontSize={0.5}
          anchorX="center"
          anchorY="middle"
          color="#0099FF"
        >
          {pair}
        </Text>
      </group>
    </group>
  );
};

// Main component that conditionally renders based on mode
const PriceChart: React.FC<PriceChartProps> = ({ pair, timeframe, arMode = false }) => {
  return arMode ? (
    <ARChart pair={pair} timeframe={timeframe} />
  ) : (
    <StandardChart pair={pair} timeframe={timeframe} />
  );
};

export default PriceChart;
