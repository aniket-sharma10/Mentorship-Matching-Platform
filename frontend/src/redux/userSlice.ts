import { createSlice } from "@reduxjs/toolkit";

interface UserState {
  currentUser: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string; 
    role?: "MENTOR" | "MENTEE"; 
  } | null;
}

const initialState: UserState = {
  currentUser: null,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    signIn: (state, action) => {
      state.currentUser = action.payload;
    },
    updateUser: (state, action) => {
      state.currentUser = action.payload;
    },
    deleteUser: (state) => {
      state.currentUser = null;
    },
    signOut: (state) => {
      state.currentUser = null;
    },
  },
});

export const { signIn, updateUser, deleteUser, signOut } = userSlice.actions;

export default userSlice.reducer;