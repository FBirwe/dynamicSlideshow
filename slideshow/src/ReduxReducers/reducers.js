import { createSlice } from "@reduxjs/toolkit";

export const configSlice = createSlice({
  name: "config",
  initialState: {
    imageDuration: 20,
    delay: 10,
    imageParallelCount: 6,
  },
  reducers: {
    setImageDuration: (state, action) => {
      state.imageDuration = action.payload;
    },
    setDelay: (state, action) => {
      state.delay = action.payload;
    },
    setImageParallelCount: (state, action) => {
      state.imageParallelCount = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setImageDuration, setDelay, setImageParallelCount } =
  configSlice.actions;

export default configSlice.reducer;
