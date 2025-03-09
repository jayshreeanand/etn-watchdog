import axios from 'axios';
import { mockApiService } from './mockData';

// API base URL - will be dynamically set based on data source
let API_BASE_URL = '/api';
let CURRENT_DATA_SOURCE = 'mock';

// API endpoints
const ENDPOINTS = {
  WALLET_DRAINERS: `${API_BASE_URL}/walletdrainer`,
  RECENT_WALLET_DRAINERS: `${API_BASE_URL}/walletdrainer/recent`,
  WALLET_DRAINER_BY_ADDRESS: (address) => `${API_BASE_URL}/walletdrainer/${address}`,
  ANALYZE_CONTRACT: `${API_BASE_URL}/walletdrainer/analyze`,
  STATS: `${API_BASE_URL}/stats`,
};

// Function to update the API base URL based on data source
export const setApiBaseUrl = (dataSource) => {
  console.log(`Switching data source to: ${dataSource}`);
  CURRENT_DATA_SOURCE = dataSource;
  
  switch (dataSource) {
    case 'mock':
      API_BASE_URL = process.env.REACT_APP_MOCK_API_URL || '/api';
      console.log(`Using Mock API URL: ${API_BASE_URL}`);
      break;
    case 'testnet':
      API_BASE_URL = process.env.REACT_APP_TESTNET_API_URL || '/api';
      console.log(`Using Testnet API URL: ${API_BASE_URL}`);
      break;
    case 'mainnet':
      API_BASE_URL = process.env.REACT_APP_MAINNET_API_URL || '/api';
      console.log(`Using Mainnet API URL: ${API_BASE_URL}`);
      break;
    default:
      API_BASE_URL = '/api';
      console.log(`Using default API URL: ${API_BASE_URL}`);
  }
  
  // Update all endpoints with the new base URL
  ENDPOINTS.WALLET_DRAINERS = `${API_BASE_URL}/walletdrainer`;
  ENDPOINTS.RECENT_WALLET_DRAINERS = `${API_BASE_URL}/walletdrainer/recent`;
  ENDPOINTS.ANALYZE_CONTRACT = `${API_BASE_URL}/walletdrainer/analyze`;
  ENDPOINTS.STATS = `${API_BASE_URL}/stats`;
  
  console.log('Updated endpoints:', ENDPOINTS);
};

// Get mock data based on current data source
const getMockData = (type) => {
  // Create distinct mock data for each data source to make it obvious which one is being used
  const mockPrefix = CURRENT_DATA_SOURCE === 'mock' ? '[MOCK]' : 
                    CURRENT_DATA_SOURCE === 'testnet' ? '[TESTNET]' : '[MAINNET]';
  
  switch (type) {
    case 'stats':
      return {
        totalDrainers: CURRENT_DATA_SOURCE === 'mock' ? 156 : 
                       CURRENT_DATA_SOURCE === 'testnet' ? 42 : 78,
        activeDrainers: CURRENT_DATA_SOURCE === 'mock' ? 42 : 
                        CURRENT_DATA_SOURCE === 'testnet' ? 12 : 23,
        totalVictims: CURRENT_DATA_SOURCE === 'mock' ? 328 : 
                      CURRENT_DATA_SOURCE === 'testnet' ? 89 : 156,
        totalLost: CURRENT_DATA_SOURCE === 'mock' ? 1250000 : 
                  CURRENT_DATA_SOURCE === 'testnet' ? 350000 : 750000,
        source: `${mockPrefix} DATA`
      };
    case 'drainers':
      return [
        {
          address: '0x1234567890abcdef1234567890abcdef12345678',
          name: `${mockPrefix} Fake ETN Airdrop`,
          riskLevel: 'high',
          victims: CURRENT_DATA_SOURCE === 'mock' ? 12 : 
                  CURRENT_DATA_SOURCE === 'testnet' ? 5 : 18,
          totalStolen: CURRENT_DATA_SOURCE === 'mock' ? 45000 : 
                      CURRENT_DATA_SOURCE === 'testnet' ? 15000 : 75000,
          lastActive: '2023-03-05T12:30:45Z',
          isVerified: true,
          description: `${mockPrefix} This contract pretends to be an official Electroneum airdrop but steals user funds when they approve token transfers.`,
          createdAt: '2023-02-28T10:15:30Z',
          verifiedBy: 'SecurityTeam',
          verificationNotes: 'Confirmed malicious behavior through code analysis and victim reports.',
        },
        {
          address: '0xabcdef1234567890abcdef1234567890abcdef12',
          name: `${mockPrefix} ETN Staking Scam`,
          riskLevel: 'critical',
          victims: CURRENT_DATA_SOURCE === 'mock' ? 28 : 
                  CURRENT_DATA_SOURCE === 'testnet' ? 8 : 35,
          totalStolen: CURRENT_DATA_SOURCE === 'mock' ? 120000 : 
                      CURRENT_DATA_SOURCE === 'testnet' ? 40000 : 180000,
          lastActive: '2023-03-04T18:15:22Z',
          isVerified: true,
          description: `${mockPrefix} Fake staking platform that promises high returns but steals deposited ETN tokens.`,
          createdAt: '2023-02-25T08:30:15Z',
          verifiedBy: 'SecurityTeam',
          verificationNotes: 'Multiple victim reports confirmed. Contract has backdoor functions.',
        },
        // Add more mock drainers as needed
      ];
    default:
      return null;
  }
};

// API service with fallback to mock data
const apiService = {
  // Flag to force using mock data
  forceMockData: false,
  
  // Set whether to force mock data
  setForceMockData: (force) => {
    console.log(`Setting forceMockData to ${force}`);
    apiService.forceMockData = force;
  },
  
  // Get all wallet drainers
  getAllWalletDrainers: async () => {
    // If forcing mock data, return mock data immediately
    if (apiService.forceMockData) {
      console.log('Forcing mock data for getAllWalletDrainers');
      return getMockData('drainers');
    }
    
    try {
      console.log(`Fetching wallet drainers from ${ENDPOINTS.WALLET_DRAINERS}`);
      const response = await axios.get(ENDPOINTS.WALLET_DRAINERS);
      // If the API returns an empty array, use mock data
      if (Array.isArray(response.data) && response.data.length === 0) {
        console.log('API returned empty array, using mock data');
        return getMockData('drainers');
      }
      return response.data;
    } catch (error) {
      console.error('Error fetching wallet drainers:', error);
      console.log('Falling back to mock data');
      return getMockData('drainers');
    }
  },
  
  // Get recent wallet drainers
  getRecentWalletDrainers: async (limit = 5) => {
    // If forcing mock data, return mock data immediately
    if (apiService.forceMockData) {
      console.log('Forcing mock data for getRecentWalletDrainers');
      return getMockData('drainers').slice(0, limit);
    }
    
    try {
      console.log(`Fetching recent wallet drainers from ${ENDPOINTS.RECENT_WALLET_DRAINERS}?limit=${limit}`);
      const response = await axios.get(`${ENDPOINTS.RECENT_WALLET_DRAINERS}?limit=${limit}`);
      // If the API returns an empty array, use mock data
      if (Array.isArray(response.data) && response.data.length === 0) {
        console.log('API returned empty array, using mock data');
        return getMockData('drainers').slice(0, limit);
      }
      return response.data;
    } catch (error) {
      console.error('Error fetching recent wallet drainers:', error);
      console.log('Falling back to mock data');
      return getMockData('drainers').slice(0, limit);
    }
  },
  
  // Get dashboard stats
  getDashboardStats: async () => {
    // If forcing mock data, return mock data immediately
    if (apiService.forceMockData) {
      console.log('Forcing mock data for getDashboardStats');
      return getMockData('stats');
    }
    
    try {
      console.log(`Fetching dashboard stats from ${ENDPOINTS.STATS}`);
      const response = await axios.get(ENDPOINTS.STATS);
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      console.log('Falling back to mock data');
      return getMockData('stats');
    }
  },
  
  // Get wallet drainer by address
  getWalletDrainerByAddress: async (address) => {
    // If forcing mock data, return mock data immediately
    if (apiService.forceMockData) {
      return mockApiService.getWalletDrainerByAddress(address);
    }
    
    try {
      const response = await axios.get(ENDPOINTS.WALLET_DRAINER_BY_ADDRESS(address));
      return response.data;
    } catch (error) {
      console.error(`Error fetching wallet drainer for ${address}:`, error);
      console.log('Falling back to mock data');
      return mockApiService.getWalletDrainerByAddress(address);
    }
  },
  
  // Analyze contract
  analyzeContract: async (contractAddress) => {
    try {
      const response = await axios.post(ENDPOINTS.ANALYZE_CONTRACT, { contractAddress });
      return response.data;
    } catch (error) {
      console.error('Error analyzing contract:', error);
      console.log('Falling back to mock data');
      return mockApiService.analyzeContract(contractAddress);
    }
  },
  
  // Save wallet drainer
  saveWalletDrainer: async (drainerData) => {
    try {
      const response = await axios.post(ENDPOINTS.WALLET_DRAINERS, drainerData);
      return response.data;
    } catch (error) {
      console.error('Error saving wallet drainer:', error);
      throw error;
    }
  },
  
  // Update wallet drainer
  updateWalletDrainer: async (address, drainerData) => {
    try {
      const response = await axios.put(ENDPOINTS.WALLET_DRAINER_BY_ADDRESS(address), drainerData);
      return response.data;
    } catch (error) {
      console.error(`Error updating wallet drainer for ${address}:`, error);
      throw error;
    }
  },
  
  // Verify wallet drainer
  verifyWalletDrainer: async (address, verifiedBy, isVerified = true, notes = '') => {
    try {
      const response = await axios.put(`${ENDPOINTS.WALLET_DRAINER_BY_ADDRESS(address)}/verify`, {
        verifiedBy,
        isVerified,
        notes,
      });
      return response.data;
    } catch (error) {
      console.error(`Error verifying wallet drainer for ${address}:`, error);
      throw error;
    }
  },
  
  // Delete wallet drainer
  deleteWalletDrainer: async (address) => {
    try {
      const response = await axios.delete(ENDPOINTS.WALLET_DRAINER_BY_ADDRESS(address));
      return response.data;
    } catch (error) {
      console.error(`Error deleting wallet drainer for ${address}:`, error);
      throw error;
    }
  },
  
  // Add victim to wallet drainer
  addVictimToWalletDrainer: async (address, victimAddress, amount) => {
    try {
      const response = await axios.post(`${ENDPOINTS.WALLET_DRAINER_BY_ADDRESS(address)}/victim`, {
        victimAddress,
        amount,
      });
      return response.data;
    } catch (error) {
      console.error(`Error adding victim to drainer ${address}:`, error);
      throw error;
    }
  },
};

export default apiService; 