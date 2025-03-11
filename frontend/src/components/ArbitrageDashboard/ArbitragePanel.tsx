import React, { useState, useEffect, useCallback } from 'react';
import { Box, Card, Typography, Button, Grid, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, IconButton, Switch, FormControlLabel } from '@mui/material';
import { PlayArrow, Stop, Refresh, Launch, Settings, TrendingUp } from '@mui/icons-material';
import { io, Socket } from 'socket.io-client';
import apiClient from '../../services/api/apiClient';
import './ArbitragePanel.css';

// Types for the component
interface ArbitrageOpportunity {
  id: string;
  buyExchange: string;
  sellExchange: string;
  pair: string;
  spreadPct: number;
  potentialProfit: number;
  potentialProfitPct: number;
  timestamp: number;
  estimatedExecutionTimeMs: number;
  confidence: number;
  buyPrice: number;
  sellPrice: number;
  maxSize: number;
  status: string;
  executionDetails?: any;
}

interface ArbitrageStats {
  analysisCount: number;
  detectedOpportunities: number;
  executedOpportunities: number;
  totalProfit: number;
  activeOpportunities: number;
  executingOpportunities: number;
  averageProfitPerTrade: number;
}

interface ArbitrageConfig {
  minProfitPct: number;
  maxExecutionTimeMs: number;
  enabledPairs: string[];
  enabledExchanges: string[];
  autoExecute: boolean;
  maxConcurrentTrades: number;
  balanceReservePct: number;
  riskLevel: string;
  notificationThresholds: {
    profitPct: number;
    executionTimeMs: number;
  };
}

interface SystemStatus {
  active: boolean;
  status: string;
}

interface OpportunitiesResponse {
  opportunities: ArbitrageOpportunity[];
}

interface StatusResponse {
  data: SystemStatus;
}

interface StatsResponse {
  data: ArbitrageStats;
}

export const ArbitragePanel: React.FC = () => {
  // State variables
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([]);
  const [stats, setStats] = useState<ArbitrageStats | null>(null);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [selectedOpportunity, setSelectedOpportunity] = useState<ArbitrageOpportunity | null>(null);
  const [configOpen, setConfigOpen] = useState<boolean>(false);
  const [detailOpen, setDetailOpen] = useState<boolean>(false);
  const [config, setConfig] = useState<ArbitrageConfig | null>(null);
  
  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch opportunities
        const opportunitiesResponse: OpportunitiesResponse = await apiClient.get('/api/arbitrage/opportunities');
        setOpportunities(opportunitiesResponse.opportunities);
        
        // Fetch system status
        const statusResponse: StatusResponse = await apiClient.get('/api/arbitrage/status');
        setSystemStatus(statusResponse.data);
        
        // Fetch stats
        const statsResponse: StatsResponse = await apiClient.get('/api/arbitrage/stats');
        setStats(statsResponse.data);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching arbitrage data:', err);
        setError('Failed to load arbitrage data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInitialData();
    
    // Set up refresh interval
    const intervalId = setInterval(fetchInitialData, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Setup WebSocket connection
  useEffect(() => {
    // WebSocket would be implemented here for production
    // For this demo, we'll use the polling mechanism above
    
    return () => {
      // Cleanup function would disconnect the socket
    };
  }, []);
  
  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const response: StatsResponse = await apiClient.get('/api/arbitrage/stats');
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching arbitrage stats:', err);
    }
  }, []);
  
  // Handle system start/stop
  const handleSystemToggle = async () => {
    try {
      if (systemStatus?.active) {
        await apiClient.post('/api/arbitrage/stop');
      } else {
        await apiClient.post('/api/arbitrage/start');
      }
      
      // Update system status
      const statusResponse: StatusResponse = await apiClient.get('/api/arbitrage/status');
      setSystemStatus(statusResponse.data);
    } catch (err) {
      console.error('Error toggling arbitrage system:', err);
      setError('Failed to toggle arbitrage system. Please try again.');
    }
  };
  
  // Execute opportunity
  const executeOpportunity = async (opportunityId: string) => {
    try {
      const response: { status: number } = await apiClient.post(`/api/arbitrage/opportunities/${opportunityId}/execute`);
      
      if (response.status === 200) {
        // Update opportunities list
        const opportunitiesResponse: OpportunitiesResponse = await apiClient.get('/api/arbitrage/opportunities');
        setOpportunities(opportunitiesResponse.opportunities);
      }
    } catch (err) {
      console.error('Error executing arbitrage opportunity:', err);
      setError('Failed to execute opportunity. Please try again.');
    }
  };
  
  // Format percentage for display
  const formatPercentage = (value: number): string => {
    return `${value.toFixed(2)}%`;
  };
  
  // Calculate time age for display
  const getTimeAgo = (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };
  
  return (
    <Box sx={{ padding: 3 }} className="arbitrage-dashboard">
      <Card className="glassmorphic-card">
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" component="h2" className="dashboard-title">
            <TrendingUp sx={{ mr: 1 }} /> High-Speed Arbitrage System
          </Typography>
          
          <Box>
            <Button 
              variant="contained" 
              color={systemStatus?.active ? "error" : "success"}
              startIcon={systemStatus?.active ? <Stop /> : <PlayArrow />}
              onClick={handleSystemToggle}
              sx={{ mr: 1 }}
            >
              {systemStatus?.active ? "Stop" : "Start"}
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<Settings />}
              onClick={() => setConfigOpen(true)}
            >
              Configure
            </Button>
          </Box>
        </Box>
        
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ p: 2, color: 'error.main' }}>
            <Typography>{error}</Typography>
            <Button startIcon={<Refresh />} onClick={() => window.location.reload()}>Retry</Button>
          </Box>
        ) : (
          <>
            {/* Stats Section */}
            <Box sx={{ p: 2, bgcolor: 'rgba(0, 0, 0, 0.05)' }}>
              <Typography variant="h6" gutterBottom>System Statistics</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card className="stat-card">
                    <Typography variant="subtitle2">Detected Opportunities</Typography>
                    <Typography variant="h4">{stats?.detectedOpportunities || 0}</Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card className="stat-card">
                    <Typography variant="subtitle2">Executed Trades</Typography>
                    <Typography variant="h4">{stats?.executedOpportunities || 0}</Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card className="stat-card">
                    <Typography variant="subtitle2">Total Profit</Typography>
                    <Typography variant="h4" className="profit-text">${stats?.totalProfit?.toFixed(2) || "0.00"}</Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card className="stat-card">
                    <Typography variant="subtitle2">Avg. Profit per Trade</Typography>
                    <Typography variant="h4" className="profit-text">${stats?.averageProfitPerTrade?.toFixed(2) || "0.00"}</Typography>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          
            {/* Opportunities Table */}
            <TableContainer component={Paper} sx={{ mt: 3, bgcolor: 'transparent' }}>
              <Table className="opportunities-table">
                <TableHead>
                  <TableRow>
                    <TableCell>Pair</TableCell>
                    <TableCell>Exchanges</TableCell>
                    <TableCell align="right">Spread</TableCell>
                    <TableCell align="right">Profit</TableCell>
                    <TableCell align="right">Potential Profit</TableCell>
                    <TableCell align="right">Confidence</TableCell>
                    <TableCell align="right">Time</TableCell>
                    <TableCell align="right">Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {opportunities.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center">No arbitrage opportunities detected yet</TableCell>
                    </TableRow>
                  ) : (
                    opportunities.map((opportunity) => (
                      <TableRow key={opportunity.id} className="opportunity-row">
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">{opportunity.pair}</Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Chip label={`Buy: ${opportunity.buyExchange}`} size="small" sx={{ mb: 0.5 }} className="buy-exchange" />
                            <Chip label={`Sell: ${opportunity.sellExchange}`} size="small" className="sell-exchange" />
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">{formatPercentage(opportunity.spreadPct)}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">{formatPercentage(opportunity.potentialProfitPct)}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" className="profit-text">${opportunity.potentialProfit.toFixed(2)}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                            <Box sx={{ position: 'relative', display: 'inline-flex', mr: 1 }}>
                              <CircularProgress
                                variant="determinate"
                                value={opportunity.confidence * 100}
                                size={24}
                                thickness={5}
                                className="confidence-progress"
                              />
                            </Box>
                            <Typography variant="body2">{Math.round(opportunity.confidence * 100)}%</Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">{getTimeAgo(opportunity.timestamp)}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Chip 
                            label={opportunity.status} 
                            size="small" 
                            color={
                              opportunity.status === 'DETECTED' ? 'primary' :
                              opportunity.status === 'EXECUTING' ? 'warning' :
                              opportunity.status === 'EXECUTED' ? 'success' :
                              opportunity.status === 'FAILED' ? 'error' : 'default'
                            } 
                          />
                        </TableCell>
                        <TableCell align="center">
                          {opportunity.status === 'DETECTED' && (
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              onClick={() => executeOpportunity(opportunity.id)}
                              disabled={!systemStatus?.active}
                            >
                              Execute
                            </Button>
                          )}
                          <IconButton 
                            size="small" 
                            onClick={() => setSelectedOpportunity(opportunity)}
                          >
                            <Launch fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Auto-execution toggle */}
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={config?.autoExecute || false}
                    onChange={(e) => {
                      if (config) {
                        // Update config logic would go here
                        console.log('Auto-execute toggled:', e.target.checked);
                      }
                    }}
                    disabled={!systemStatus?.active}
                  />
                }
                label="Auto-Execute Profitable Opportunities"
              />
            </Box>
          </>
        )}
      </Card>
    </Box>
  );
};

export default ArbitragePanel;
