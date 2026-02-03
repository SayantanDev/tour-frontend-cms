import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getAllQueries } from '../../api/queriesAPI';

export const fetchQueries = createAsyncThunk(
    'queries/fetchAll',
    async ({ page, limit }, { rejectWithValue }) => {
        try {
            const response = await getAllQueries(page, limit);
            return {
                data: response.data,
                pagination: response.pagination,
                page
            };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const initialState = {
    allQueries: [],
    fetchSelectedquerie: {},
    pagination: {
        page: 1,
        limit: 30,
        hasNextPage: true,
        totalDocs: 0
    },
    loading: false,
    error: null,
    lastFetched: null,
};


const queriesSlice = createSlice({
    name: 'queries',
    initialState,
    reducers: {
        setSelectedquerie: (state, action) => {
            state.fetchSelectedquerie = action.payload;
        },
        resetQueries: (state) => {
            state.allQueries = [];
            state.pagination = initialState.pagination;
        },
        // Optimistic updates
        updateQueryInStore: (state, action) => {
            const index = state.allQueries.findIndex(q => q._id === action.payload._id);
            if (index !== -1) {
                state.allQueries[index] = { ...state.allQueries[index], ...action.payload };
            }
        },
        removeQueryFromStore: (state, action) => {
            state.allQueries = state.allQueries.filter(q => q._id !== action.payload);
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchQueries.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchQueries.fulfilled, (state, action) => {
                state.loading = false;
                const { data, pagination, page } = action.payload;

                // If page 1, reset list. Else append.
                if (page === 1) {
                    state.allQueries = data;
                } else {
                    // Filter duplicates
                    const existingIds = new Set(state.allQueries.map(q => q._id));
                    const newQueries = data.filter(q => !existingIds.has(q._id));
                    state.allQueries = [...state.allQueries, ...newQueries];
                }

                state.pagination = {
                    ...state.pagination,
                    ...pagination,
                    page
                };
                state.lastFetched = Date.now();
            })
            .addCase(fetchQueries.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { setSelectedquerie, resetQueries, updateQueryInStore, removeQueryFromStore } = queriesSlice.actions;

export const selectAllQueries = (state) => state.queries.allQueries;
export const selectQueriesPagination = (state) => state.queries.pagination;
export const selectQueriesLoading = (state) => state.queries.loading;

export default queriesSlice.reducer;