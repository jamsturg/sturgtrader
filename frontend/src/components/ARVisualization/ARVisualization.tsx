import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { Box, Card, Typography, Button, IconButton, Slider, FormControl, Select, MenuItem, InputLabel, Switch, FormControlLabel } from '@mui/material';
import { Refresh, CameraAlt, ViewInAr, Compare, Timeline, ShowChart, Settings } from '@mui/icons-material';
import apiClient from '../../services/api/apiClient';
import './ARVisualization.css';

// Types for market data
interface CandlestickData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface MarketDepth {
  asks: [number, number][];
  bids: [number, number][];
}

interface ARVisualizationProps {
  symbol?: string;
  exchange?: string;
  timeframe?: string;
  mode?: 'candlestick' | 'depth' | 'volume' | 'combined';
  theme?: 'dark' | 'light';
  renderQuality?: 'low' | 'medium' | 'high';
}

interface CandlestickResponse {
  data: CandlestickData[];
}

interface DepthResponse {
  data: MarketDepth;
}

export const ARVisualization: React.FC<ARVisualizationProps> = ({
  symbol = 'BTC/USDT',
  exchange = 'binance',
  timeframe = '1h',
  mode = 'combined',
  theme = 'dark',
  renderQuality = 'medium',
}) => {
  // Refs for scene elements
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  
  // State for data and UI
  const [marketData, setMarketData] = useState<CandlestickData[]>([]);
  const [depthData, setDepthData] = useState<MarketDepth | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [arEnabled, setArEnabled] = useState<boolean>(false);
  const [vizSettings, setVizSettings] = useState({
    showGridLines: true,
    showAxes: true,
    rotationSpeed: 0.5,
    transparency: 0.8,
    glowIntensity: 0.6,
    animationSpeed: 1,
  });
  
  // Colors from theme
  const colors = {
    bullish: new THREE.Color(0x00e676), // bright green
    bearish: new THREE.Color(0xff3d00), // red
    neutral: new THREE.Color(0x8a8d91), // metallic grey
    grid: new THREE.Color(0x333333),
    background: new THREE.Color(0x121212),
    axisX: new THREE.Color(0x00e676),
    axisY: new THREE.Color(0x2196f3),
    axisZ: new THREE.Color(0xe040fb),
    bidGlow: new THREE.Color(0x00e676),
    askGlow: new THREE.Color(0xff3d00),
  };
  
  // Fetch market data
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch candlestick data
        const candlestickResponse: CandlestickResponse = await apiClient.get(
          `/api/market-data/${exchange}/${symbol.replace('/', '-')}/candles`, {
            params: { timeframe, limit: 100 }
          }
        );
        setMarketData(candlestickResponse.data);
        
        // Fetch depth data
        const depthResponse: DepthResponse = await apiClient.get(
          `/api/market-data/${exchange}/${symbol.replace('/', '-')}/depth`
        );
        setDepthData(depthResponse.data);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching market data:', err);
        setError('Failed to load market data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMarketData();
    
    // Setup refresh interval
    const intervalId = setInterval(fetchMarketData, 60000); // Refresh every minute
    
    return () => clearInterval(intervalId);
  }, [exchange, symbol, timeframe]);
  
  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Setup renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true, 
      alpha: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // Setup scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(colors.background);
    scene.fog = new THREE.Fog(colors.background, 10, 50);
    sceneRef.current = scene;
    
    // Setup camera
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(15, 15, 15);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;
    
    // Setup controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 50;
    controls.minDistance = 5;
    controlsRef.current = controls;
    
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7.5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);
    
    // Add grid helper
    const gridHelper = new THREE.GridHelper(20, 20, colors.grid, colors.grid);
    scene.add(gridHelper);
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      if (controlsRef.current) controlsRef.current.update();
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();
    
    // Handle resize
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      
      rendererRef.current.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      if (sceneRef.current) {
        // Dispose geometries and materials
        sceneRef.current.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.geometry.dispose();
            if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        });
      }
    };
  }, []);
  
  // Update visualization based on data
  useEffect(() => {
    if (!sceneRef.current || !marketData.length) return;
    
    // Clear previous visualizations
    sceneRef.current.children = sceneRef.current.children.filter(child => 
      child instanceof THREE.Light || child instanceof THREE.GridHelper
    );
    
    // Generate visualizations based on mode
    switch (mode) {
      case 'candlestick':
        generateCandlestickVisualization();
        break;
      case 'depth':
        generateDepthVisualization();
        break;
      case 'volume':
        generateVolumeVisualization();
        break;
      case 'combined':
        generateCombinedVisualization();
        break;
      default:
        generateCandlestickVisualization();
    }
  }, [marketData, depthData, mode, vizSettings]);
  
  // Generate candlestick visualization
  const generateCandlestickVisualization = () => {
    if (!sceneRef.current || !marketData.length) return;
    
    const scene = sceneRef.current;
    
    // Find min and max values for scaling
    const minPrice = Math.min(...marketData.map(candle => candle.low));
    const maxPrice = Math.max(...marketData.map(candle => candle.high));
    const priceRange = maxPrice - minPrice;
    
    // Scale and normalize
    const xScale = 20 / marketData.length;
    const yScale = 10 / priceRange;
    
    // Create candlesticks
    marketData.forEach((candle, index) => {
      const isBullish = candle.close >= candle.open;
      const color = isBullish ? colors.bullish : colors.bearish;
      
      // Position
      const x = (index - marketData.length / 2) * xScale;
      const y = ((candle.open + candle.close) / 2 - minPrice) * yScale;
      
      // Dimensions
      const width = xScale * 0.8;
      const height = Math.abs(candle.close - candle.open) * yScale || 0.01; // Ensure non-zero height
      const wickHeight = (candle.high - candle.low) * yScale;
      
      // Create body
      const bodyGeometry = new THREE.BoxGeometry(width, height, width);
      const bodyMaterial = new THREE.MeshPhongMaterial({
        color: color,
        transparent: true,
        opacity: vizSettings.transparency,
        emissive: color,
        emissiveIntensity: vizSettings.glowIntensity * (isBullish ? 0.3 : 0.1),
      });
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
      body.position.set(x, y, 0);
      body.castShadow = true;
      body.receiveShadow = true;
      scene.add(body);
      
      // Create wick
      const wickGeometry = new THREE.BoxGeometry(width * 0.2, wickHeight, width * 0.2);
      const wickMaterial = new THREE.MeshPhongMaterial({
        color: color,
        transparent: true,
        opacity: vizSettings.transparency * 0.8,
      });
      const wick = new THREE.Mesh(wickGeometry, wickMaterial);
      wick.position.set(x, (candle.high + candle.low) / 2 - minPrice, 0);
      wick.position.multiplyScalar(yScale);
      scene.add(wick);
    });
    
    // Add axes if enabled
    if (vizSettings.showAxes) {
      // X axis
      const xAxisGeometry = new THREE.BoxGeometry(22, 0.05, 0.05);
      const xAxisMaterial = new THREE.MeshBasicMaterial({ color: colors.axisX });
      const xAxis = new THREE.Mesh(xAxisGeometry, xAxisMaterial);
      xAxis.position.y = -0.1;
      scene.add(xAxis);
      
      // Y axis
      const yAxisGeometry = new THREE.BoxGeometry(0.05, 12, 0.05);
      const yAxisMaterial = new THREE.MeshBasicMaterial({ color: colors.axisY });
      const yAxis = new THREE.Mesh(yAxisGeometry, yAxisMaterial);
      yAxis.position.x = -marketData.length * xScale / 2 - 0.5;
      scene.add(yAxis);
    }
  };
  
  // Generate depth visualization
  const generateDepthVisualization = () => {
    if (!sceneRef.current || !depthData) return;
    
    const scene = sceneRef.current;
    
    // Find min and max values for scaling
    const allPrices = [
      ...depthData.asks.map(ask => ask[0]),
      ...depthData.bids.map(bid => bid[0])
    ];
    const allVolumes = [
      ...depthData.asks.map(ask => ask[1]),
      ...depthData.bids.map(bid => bid[1])
    ];
    
    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);
    const maxVolume = Math.max(...allVolumes);
    
    // Scale factors
    const xScale = 20 / (maxPrice - minPrice);
    const yScale = 10 / maxVolume;
    
    // Create bid side (buy orders)
    const bidPoints = [];
    let cumulativeVolume = 0;
    
    for (const [price, volume] of depthData.bids) {
      cumulativeVolume += volume;
      const x = (price - minPrice) * xScale - 10; // Center around origin
      const y = cumulativeVolume * yScale;
      bidPoints.push(new THREE.Vector3(x, y, 0));
    }
    
    if (bidPoints.length > 1) {
      // Add ground point
      bidPoints.push(new THREE.Vector3(bidPoints[bidPoints.length - 1].x, 0, 0));
      bidPoints.push(new THREE.Vector3(bidPoints[0].x, 0, 0));
      
      // Create surface
      const bidShape = new THREE.Shape();
      bidShape.moveTo(bidPoints[0].x, bidPoints[0].y);
      bidPoints.forEach(point => bidShape.lineTo(point.x, point.y));
      
      const extrudeSettings = {
        steps: 1,
        depth: 2,
        bevelEnabled: false,
      };
      
      const bidGeometry = new THREE.ExtrudeGeometry(bidShape, extrudeSettings);
      const bidMaterial = new THREE.MeshPhongMaterial({
        color: colors.bullish,
        transparent: true,
        opacity: vizSettings.transparency,
        emissive: colors.bidGlow,
        emissiveIntensity: vizSettings.glowIntensity,
        side: THREE.DoubleSide,
      });
      
      const bidMesh = new THREE.Mesh(bidGeometry, bidMaterial);
      bidMesh.position.z = -1;
      bidMesh.castShadow = true;
      bidMesh.receiveShadow = true;
      scene.add(bidMesh);
    }
    
    // Create ask side (sell orders)
    const askPoints = [];
    cumulativeVolume = 0;
    
    for (const [price, volume] of depthData.asks) {
      cumulativeVolume += volume;
      const x = (price - minPrice) * xScale - 10; // Center around origin
      const y = cumulativeVolume * yScale;
      askPoints.push(new THREE.Vector3(x, y, 0));
    }
    
    if (askPoints.length > 1) {
      // Add ground point
      askPoints.push(new THREE.Vector3(askPoints[askPoints.length - 1].x, 0, 0));
      askPoints.push(new THREE.Vector3(askPoints[0].x, 0, 0));
      
      // Create surface
      const askShape = new THREE.Shape();
      askShape.moveTo(askPoints[0].x, askPoints[0].y);
      askPoints.forEach(point => askShape.lineTo(point.x, point.y));
      
      const extrudeSettings = {
        steps: 1,
        depth: 2,
        bevelEnabled: false,
      };
      
      const askGeometry = new THREE.ExtrudeGeometry(askShape, extrudeSettings);
      const askMaterial = new THREE.MeshPhongMaterial({
        color: colors.bearish,
        transparent: true,
        opacity: vizSettings.transparency,
        emissive: colors.askGlow,
        emissiveIntensity: vizSettings.glowIntensity,
        side: THREE.DoubleSide,
      });
      
      const askMesh = new THREE.Mesh(askGeometry, askMaterial);
      askMesh.position.z = -1;
      askMesh.castShadow = true;
      askMesh.receiveShadow = true;
      scene.add(askMesh);
    }
    
    // Add price divider
    const midPrice = (depthData.asks[0][0] + depthData.bids[0][0]) / 2;
    const dividerGeometry = new THREE.BoxGeometry(0.1, 10, 0.1);
    const dividerMaterial = new THREE.MeshBasicMaterial({ color: colors.neutral });
    const divider = new THREE.Mesh(dividerGeometry, dividerMaterial);
    divider.position.x = (midPrice - minPrice) * xScale - 10;
    scene.add(divider);
    
    // Add axes if enabled
    if (vizSettings.showAxes) {
      // X axis (price)
      const xAxisGeometry = new THREE.BoxGeometry(22, 0.05, 0.05);
      const xAxisMaterial = new THREE.MeshBasicMaterial({ color: colors.axisX });
      const xAxis = new THREE.Mesh(xAxisGeometry, xAxisMaterial);
      xAxis.position.y = -0.1;
      scene.add(xAxis);
      
      // Y axis (volume)
      const yAxisGeometry = new THREE.BoxGeometry(0.05, 12, 0.05);
      const yAxisMaterial = new THREE.MeshBasicMaterial({ color: colors.axisY });
      const yAxis = new THREE.Mesh(yAxisGeometry, yAxisMaterial);
      yAxis.position.x = -11;
      scene.add(yAxis);
    }
  };
  
  // Generate volume visualization
  const generateVolumeVisualization = () => {
    if (!sceneRef.current || !marketData.length) return;
    
    const scene = sceneRef.current;
    
    // Find max volume for scaling
    const maxVolume = Math.max(...marketData.map(candle => candle.volume));
    
    // Scale factors
    const xScale = 20 / marketData.length;
    const yScale = 10 / maxVolume;
    
    // Create volume bars
    marketData.forEach((candle, index) => {
      const isBullish = candle.close >= candle.open;
      const color = isBullish ? colors.bullish : colors.bearish;
      
      // Position
      const x = (index - marketData.length / 2) * xScale;
      const y = candle.volume * yScale / 2;
      
      // Dimensions
      const width = xScale * 0.8;
      const height = candle.volume * yScale;
      const depth = width;
      
      // Create volume bar
      const geometry = new THREE.BoxGeometry(width, height, depth);
      const material = new THREE.MeshPhongMaterial({
        color: color,
        transparent: true,
        opacity: vizSettings.transparency,
        emissive: color,
        emissiveIntensity: vizSettings.glowIntensity * (isBullish ? 0.3 : 0.1),
      });
      
      const volumeBar = new THREE.Mesh(geometry, material);
      volumeBar.position.set(x, y, 0);
      volumeBar.castShadow = true;
      volumeBar.receiveShadow = true;
      scene.add(volumeBar);
    });
    
    // Add axes if enabled
    if (vizSettings.showAxes) {
      // X axis (time)
      const xAxisGeometry = new THREE.BoxGeometry(22, 0.05, 0.05);
      const xAxisMaterial = new THREE.MeshBasicMaterial({ color: colors.axisX });
      const xAxis = new THREE.Mesh(xAxisGeometry, xAxisMaterial);
      xAxis.position.y = -0.1;
      scene.add(xAxis);
      
      // Y axis (volume)
      const yAxisGeometry = new THREE.BoxGeometry(0.05, 12, 0.05);
      const yAxisMaterial = new THREE.MeshBasicMaterial({ color: colors.axisY });
      const yAxis = new THREE.Mesh(yAxisGeometry, yAxisMaterial);
      yAxis.position.x = -marketData.length * xScale / 2 - 0.5;
      scene.add(yAxis);
    }
  };
  
  // Generate combined visualization
  const generateCombinedVisualization = () => {
    if (!sceneRef.current || !marketData.length || !depthData) return;
    
    const scene = sceneRef.current;
    
    // Create a scene for each visualization type
    generateCandlestickVisualization();
    
    // Create volume visualization on a different z-position
    const zOffset = -10;
    
    // Find max volume for scaling
    const maxVolume = Math.max(...marketData.map(candle => candle.volume));
    
    // Scale factors
    const xScale = 20 / marketData.length;
    const yScale = 5 / maxVolume; // Smaller scale for better visibility
    
    // Create volume bars
    marketData.forEach((candle, index) => {
      const isBullish = candle.close >= candle.open;
      const color = isBullish ? colors.bullish : colors.bearish;
      
      // Position
      const x = (index - marketData.length / 2) * xScale;
      const y = candle.volume * yScale / 2;
      
      // Dimensions
      const width = xScale * 0.8;
      const height = candle.volume * yScale;
      const depth = width;
      
      // Create volume bar
      const geometry = new THREE.BoxGeometry(width, height, depth);
      const material = new THREE.MeshPhongMaterial({
        color: color,
        transparent: true,
        opacity: vizSettings.transparency * 0.7,
        emissive: color,
        emissiveIntensity: vizSettings.glowIntensity * 0.5,
      });
      
      const volumeBar = new THREE.Mesh(geometry, material);
      volumeBar.position.set(x, y, zOffset);
      volumeBar.castShadow = true;
      volumeBar.receiveShadow = true;
      scene.add(volumeBar);
    });
    
    // Add connecting lines between price and volume
    marketData.forEach((candle, index) => {
      const isBullish = candle.close >= candle.open;
      const color = isBullish ? colors.bullish : colors.bearish;
      
      // Find min and max values for scaling candlesticks
      const minPrice = Math.min(...marketData.map(c => c.low));
      const maxPrice = Math.max(...marketData.map(c => c.high));
      const priceRange = maxPrice - minPrice;
      const priceYScale = 10 / priceRange;
      
      // Positions
      const x = (index - marketData.length / 2) * xScale;
      const candleY = ((candle.open + candle.close) / 2 - minPrice) * priceYScale;
      const volumeY = candle.volume * yScale / 2;
      
      // Create line
      const points = [];
      points.push(new THREE.Vector3(x, candleY, 0));
      points.push(new THREE.Vector3(x, volumeY, zOffset));
      
      const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const lineMaterial = new THREE.LineBasicMaterial({
        color: colors.neutral,
        transparent: true,
        opacity: 0.3,
      });
      
      const line = new THREE.Line(lineGeometry, lineMaterial);
      scene.add(line);
    });
  };
  
  // Handle AR toggle
  const toggleAR = () => {
    // In a real implementation, this would initialize device AR capabilities
    // using WebXR or similar technology
    setArEnabled(!arEnabled);
    alert('AR functionality would be initialized here with WebXR');
  };
  
  return (
    <Box sx={{ padding: 3 }} className="ar-visualization">
      <Card className="glassmorphic-card">
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" component="h2" className="dashboard-title">
            <ViewInAr sx={{ mr: 1 }} /> Market AR Visualization
          </Typography>
          
          <Box>
            <IconButton 
              color={arEnabled ? "success" : "default"}
              onClick={toggleAR}
              sx={{ mr: 1 }}
            >
              <CameraAlt />
            </IconButton>
            
            <Button
              variant="outlined"
              startIcon={<Settings />}
              onClick={() => {}}
            >
              Settings
            </Button>
          </Box>
        </Box>
        
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <Typography>Loading visualization...</Typography>
          </Box>
        ) : error ? (
          <Box sx={{ p: 2, color: 'error.main' }}>
            <Typography>{error}</Typography>
            <Button startIcon={<Refresh />} onClick={() => window.location.reload()}>Retry</Button>
          </Box>
        ) : (
          <>
            <Box sx={{ p: 2, bgcolor: 'rgba(0, 0, 0, 0.05)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Exchange</InputLabel>
                    <Select
                      value={exchange}
                      label="Exchange"
                      onChange={() => {}}
                    >
                      <MenuItem value="binance">Binance</MenuItem>
                      <MenuItem value="coinbase">Coinbase</MenuItem>
                      <MenuItem value="ftx">FTX</MenuItem>
                      <MenuItem value="kraken">Kraken</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Symbol</InputLabel>
                    <Select
                      value={symbol}
                      label="Symbol"
                      onChange={() => {}}
                    >
                      <MenuItem value="BTC/USDT">BTC/USDT</MenuItem>
                      <MenuItem value="ETH/USDT">ETH/USDT</MenuItem>
                      <MenuItem value="SOL/USDT">SOL/USDT</MenuItem>
                      <MenuItem value="BNB/USDT">BNB/USDT</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Timeframe</InputLabel>
                    <Select
                      value={timeframe}
                      label="Timeframe"
                      onChange={() => {}}
                    >
                      <MenuItem value="1m">1 Minute</MenuItem>
                      <MenuItem value="5m">5 Minutes</MenuItem>
                      <MenuItem value="15m">15 Minutes</MenuItem>
                      <MenuItem value="1h">1 Hour</MenuItem>
                      <MenuItem value="4h">4 Hours</MenuItem>
                      <MenuItem value="1d">1 Day</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                
                <Box>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<ShowChart />}
                    sx={{ mr: 1 }}
                  >
                    Candlestick
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<Timeline />}
                    sx={{ mr: 1 }}
                  >
                    Depth
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<Compare />}
                  >
                    Combined
                  </Button>
                </Box>
              </Box>
            </Box>
            
            <Box 
              ref={containerRef} 
              sx={{ 
                height: 600, 
                width: '100%', 
                position: 'relative',
                backgroundColor: 'black',
                overflow: 'hidden',
                borderRadius: '0 0 12px 12px'
              }}
            />
            
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={vizSettings.showGridLines}
                    onChange={(e) => setVizSettings({
                      ...vizSettings,
                      showGridLines: e.target.checked
                    })}
                  />
                }
                label="Grid Lines"
              />
              
              <Box sx={{ width: 200 }}>
                <Typography variant="caption" gutterBottom>Rotation Speed</Typography>
                <Slider
                  value={vizSettings.rotationSpeed}
                  min={0}
                  max={1}
                  step={0.1}
                  onChange={(_, value) => setVizSettings({
                    ...vizSettings,
                    rotationSpeed: value as number
                  })}
                />
              </Box>
              
              <Box sx={{ width: 200 }}>
                <Typography variant="caption" gutterBottom>Glow Intensity</Typography>
                <Slider
                  value={vizSettings.glowIntensity}
                  min={0}
                  max={1}
                  step={0.1}
                  onChange={(_, value) => setVizSettings({
                    ...vizSettings,
                    glowIntensity: value as number
                  })}
                />
              </Box>
            </Box>
          </>
        )}
      </Card>
    </Box>
  );
};

export default ARVisualization;
