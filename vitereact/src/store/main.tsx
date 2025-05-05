import React from 'react';
import { configureStore, combineReducers, createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { io as socketIoClient } from 'socket.io-client';
import axios from 'axios';

// ------------------- Auth Slice -------------------
export interface AuthState {
  is_authenticated: boolean;
  user: { id: string; username: string; role: string } | null;
  jwt_token: string;
}

const auth_initial_state: AuthState = {
  is_authenticated: false,
  user: null,
  jwt_token: "",
};

const auth_slice = createSlice({
  name: 'auth_state',
  initialState: auth_initial_state,
  reducers: {
    set_auth: (state, action) => {
      state.is_authenticated = true;
      state.user = action.payload.user;
      state.jwt_token = action.payload.jwt_token;
    },
    clear_auth: (state) => {
      state.is_authenticated = false;
      state.user = null;
      state.jwt_token = "";
    },
  },
});

export const { set_auth, clear_auth } = auth_slice.actions;

// ------------------- Notifications Slice -------------------
export interface Notification {
  notification_id: string;
  message: string;
  type: string;
  timestamp: string;
}

export interface NotificationsState {
  notifications: Notification[];
}

const notifications_initial_state: NotificationsState = {
  notifications: [],
};

const notifications_slice = createSlice({
  name: 'notifications_state',
  initialState: notifications_initial_state,
  reducers: {
    add_notification: (state, action) => {
      state.notifications.push(action.payload);
    },
    remove_notification: (state, action) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.notification_id !== action.payload
      );
    },
    clear_notifications: (state) => {
      state.notifications = [];
    },
  },
});

export const {
  add_notification,
  remove_notification,
  clear_notifications,
} = notifications_slice.actions;

// ------------------- Global Loading Slice -------------------
export interface GlobalLoadingState {
  is_loading: boolean;
}

const loading_initial_state: GlobalLoadingState = {
  is_loading: false,
};

const global_loading_slice = createSlice({
  name: 'global_loading_state',
  initialState: loading_initial_state,
  reducers: {
    set_loading: (state, action) => {
      state.is_loading = action.payload;
    },
  },
});

export const { set_loading } = global_loading_slice.actions;

// ------------------- Socket Slice -------------------
export interface SocketState {
  socket: any; // non-serializable; handled by disabling serializable checks
}

const socket_initial_state: SocketState = {
  socket: null,
};

export const initialize_socket = createAsyncThunk(
  'socket_state/initialize_socket',
  async (_, { getState, dispatch }) => {
    const state: any = getState();
    const token = state.auth_state.jwt_token;
    if (!token) {
      throw new Error("No JWT token available for socket connection");
    }
    const base_url = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
    const socket = socketIoClient(base_url, {
      query: { token },
    });
    // Subscribe to realtime notifications
    socket.on(
      'notification',
      (data: { notification_id: string; message: string; type: string; timestamp: string }) => {
        dispatch(add_notification(data));
      }
    );
    return socket;
  }
);

const socket_slice = createSlice({
  name: 'socket_state',
  initialState: socket_initial_state,
  reducers: {
    set_socket: (state, action) => {
      state.socket = action.payload;
    },
    clear_socket: (state) => {
      if (state.socket) {
        state.socket.disconnect();
      }
      state.socket = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(initialize_socket.fulfilled, (state, action) => {
      state.socket = action.payload;
    });
  },
});

export const { set_socket, clear_socket } = socket_slice.actions;

// ------------------- Root Reducer and Persist Config -------------------
const root_reducer = combineReducers({
  auth_state: auth_slice.reducer,
  notifications_state: notifications_slice.reducer,
  global_loading_state: global_loading_slice.reducer,
  socket_state: socket_slice.reducer,
});

const persist_config = {
  key: 'root',
  storage,
  whitelist: ['auth_state', 'notifications_state', 'global_loading_state'], // do not persist socket_state
};

const persisted_reducer = persistReducer(persist_config, root_reducer);

// ------------------- Store Creation -------------------
const store = configureStore({
  reducer: persisted_reducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // disable check because socket instance isn't serializable
    }),
});

// Create persistor to be used with <PersistGate>
export const persistor = persistStore(store);

// ------------------- Export Types and Store -------------------
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;