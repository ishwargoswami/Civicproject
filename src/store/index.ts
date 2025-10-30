import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import authSlice from './slices/authSlice';
import issuesSlice from './slices/issuesSlice';
import forumSlice from './slices/forumSlice';
import eventsSlice from './slices/eventsSlice';
import notificationsSlice from './slices/notificationsSlice';
import mapsSlice from './slices/mapsSlice';
import transparencySlice from './slices/transparencySlice';
import officialsSlice from './slices/officialsSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    issues: issuesSlice,
    forum: forumSlice,
    events: eventsSlice,
    notifications: notificationsSlice,
    maps: mapsSlice,
    transparency: transparencySlice,
    officials: officialsSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
