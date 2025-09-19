import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { mapsAPI, MapData, MapFilters, MapStatistics, MapBounds } from '../../services/mapsApi';

interface MapsState {
  mapData: MapData | null;
  statistics: MapStatistics | null;
  bounds: MapBounds | null;
  isLoading: boolean;
  error: string | null;
  filters: MapFilters;
  selectedLayers: string[];
  clusteringEnabled: boolean;
  mapCenter: [number, number];
  mapZoom: number;
}

const initialState: MapsState = {
  mapData: null,
  statistics: null,
  bounds: null,
  isLoading: false,
  error: null,
  filters: {
    layers: ['issues', 'events', 'facilities', 'districts'],
    enable_clustering: true,
    cluster_distance: 50,
  },
  selectedLayers: ['issues', 'events', 'facilities', 'districts'],
  clusteringEnabled: true,
  mapCenter: [20.5937, 78.9629], // Default to India center
  mapZoom: 5,
};

// Async thunks
export const fetchMapData = createAsyncThunk(
  'maps/fetchMapData',
  async (filters?: MapFilters, { rejectWithValue }) => {
    try {
      console.log('fetchMapData called with filters:', filters);
      const response = await mapsAPI.getMapData(filters);
      console.log('fetchMapData response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('fetchMapData error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch map data');
    }
  }
);

export const fetchMapStatistics = createAsyncThunk(
  'maps/fetchMapStatistics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await mapsAPI.getStatistics();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch map statistics');
    }
  }
);

export const fetchMapBounds = createAsyncThunk(
  'maps/fetchMapBounds',
  async (_, { rejectWithValue }) => {
    try {
      const response = await mapsAPI.getBounds();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch map bounds');
    }
  }
);

const mapsSlice = createSlice({
  name: 'maps',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<MapFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    setSelectedLayers: (state, action: PayloadAction<string[]>) => {
      state.selectedLayers = action.payload;
      state.filters.layers = action.payload;
    },
    
    toggleLayer: (state, action: PayloadAction<string>) => {
      const layer = action.payload;
      if (state.selectedLayers.includes(layer)) {
        state.selectedLayers = state.selectedLayers.filter(l => l !== layer);
      } else {
        state.selectedLayers.push(layer);
      }
      state.filters.layers = state.selectedLayers;
    },
    
    setClustering: (state, action: PayloadAction<boolean>) => {
      state.clusteringEnabled = action.payload;
      state.filters.enable_clustering = action.payload;
    },
    
    setClusterDistance: (state, action: PayloadAction<number>) => {
      state.filters.cluster_distance = action.payload;
    },
    
    setMapCenter: (state, action: PayloadAction<[number, number]>) => {
      state.mapCenter = action.payload;
    },
    
    setMapZoom: (state, action: PayloadAction<number>) => {
      state.mapZoom = action.payload;
    },
    
    setMapBounds: (state, action: PayloadAction<MapBounds>) => {
      state.filters = {
        ...state.filters,
        north: action.payload.north,
        south: action.payload.south,
        east: action.payload.east,
        west: action.payload.west,
      };
    },
    
    clearFilters: (state) => {
      state.filters = {
        layers: ['issues', 'events', 'facilities'],
        enable_clustering: true,
        cluster_distance: 50,
      };
      state.selectedLayers = ['issues', 'events', 'facilities'];
    },
    
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch map data
      .addCase(fetchMapData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMapData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.mapData = action.payload;
        state.error = null;
      })
      .addCase(fetchMapData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch statistics
      .addCase(fetchMapStatistics.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchMapStatistics.fulfilled, (state, action) => {
        state.statistics = action.payload;
        state.error = null;
      })
      .addCase(fetchMapStatistics.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      
      // Fetch bounds
      .addCase(fetchMapBounds.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchMapBounds.fulfilled, (state, action) => {
        state.bounds = action.payload;
        state.error = null;
      })
      .addCase(fetchMapBounds.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const {
  setFilters,
  setSelectedLayers,
  toggleLayer,
  setClustering,
  setClusterDistance,
  setMapCenter,
  setMapZoom,
  setMapBounds,
  clearFilters,
  clearError,
} = mapsSlice.actions;

export default mapsSlice.reducer;
