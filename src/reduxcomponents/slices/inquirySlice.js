import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getAllInquiries } from '../../api/inquiryAPI';

export const fetchInquiries = createAsyncThunk(
    'inquiries/fetchAll',
    async ({ page, limit }, { rejectWithValue }) => {
        try {
            const response = await getAllInquiries(page, limit);
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
    allInquiries: [],
    fetchSelectedInquiry: {},
    pagination: {
        page: 1,
        limit: 20,
        hasNextPage: true,
        totalDocs: 0
    },
    loading: false,
    error: null,
    lastFetched: null,
};

const inquirySlice = createSlice({
    name: 'inquiry',
    initialState,
    reducers: {
        setSelectedInquiry: (state, action) => {
            state.fetchSelectedInquiry = action.payload;
        },
        resetInquiries: (state) => {
            state.allInquiries = [];
            state.pagination = initialState.pagination;
        },
        removeInquiryFromStore: (state, action) => {
            state.allInquiries = state.allInquiries.filter(i => i._id !== action.payload);
        },
        // For optimistic updates or manual additions if needed
        addInquiryToStore: (state, action) => {
            state.allInquiries.unshift(action.payload);
        },
        updateInquiryInStore: (state, action) => {
            const index = state.allInquiries.findIndex(i => i._id === action.payload._id);
            if (index !== -1) {
                state.allInquiries[index] = { ...state.allInquiries[index], ...action.payload };
            }
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchInquiries.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchInquiries.fulfilled, (state, action) => {
                state.loading = false;
                const { data, pagination, page } = action.payload;

                if (page === 1) {
                    state.allInquiries = data;
                } else {
                    const existingIds = new Set(state.allInquiries.map(i => i._id));
                    const newItems = data.filter(i => !existingIds.has(i._id));
                    state.allInquiries = [...state.allInquiries, ...newItems];
                }

                state.pagination = {
                    ...state.pagination,
                    ...pagination,
                    page
                };
                state.lastFetched = Date.now();
            })
            .addCase(fetchInquiries.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const {
    setSelectedInquiry,
    resetInquiries,
    removeInquiryFromStore,
    addInquiryToStore,
    updateInquiryInStore
} = inquirySlice.actions;

export const selectAllInquiries = (state) => state.inquiries.allInquiries; // checks rootReducer key
export const selectInquiriesPagination = (state) => state.inquiries.pagination;
export const selectInquiriesLoading = (state) => state.inquiries.loading;

export default inquirySlice.reducer;