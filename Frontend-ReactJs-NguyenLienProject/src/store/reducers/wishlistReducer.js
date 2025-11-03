import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    wishlist: [],
    count: 0,
    loading: false,
    error: null,
};

const wishlistSlice = createSlice({
    name: 'wishlist',
    initialState,
    reducers: {
        // Set wishlist data
        setWishlist(state, action) {
            state.wishlist = action.payload.wishlist || [];
            state.count = action.payload.count || action.payload.wishlist?.length || 0;
            state.loading = false;
            state.error = null;
        },
        // Set loading state
        setWishlistLoading(state, action) {
            state.loading = action.payload;
        },
        // Set error
        setWishlistError(state, action) {
            state.error = action.payload;
            state.loading = false;
        },
        // Add item to wishlist
        addWishlistItem(state, action) {
            const exists = state.wishlist.find(item => item.id === action.payload.id);
            if (!exists) {
                state.wishlist.push(action.payload);
                state.count = state.wishlist.length;
            }
        },
        // Remove item from wishlist
        removeWishlistItem(state, action) {
            state.wishlist = state.wishlist.filter(item => item.id !== action.payload);
            state.count = state.wishlist.length;
        },
        // Remove item by productId
        removeWishlistItemByProductId(state, action) {
            state.wishlist = state.wishlist.filter(item => item.productId !== action.payload);
            state.count = state.wishlist.length;
        },
        // Update count only
        setWishlistCount(state, action) {
            state.count = action.payload;
        },
        // Clear wishlist
        clearWishlist(state) {
            state.wishlist = [];
            state.count = 0;
            state.error = null;
        },
    },
});

export const {
    setWishlist,
    setWishlistLoading,
    setWishlistError,
    addWishlistItem,
    removeWishlistItem,
    removeWishlistItemByProductId,
    setWishlistCount,
    clearWishlist,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;

