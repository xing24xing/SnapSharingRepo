import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
    name:"chat",
    initialState:{
        onlineUsers:[],
        messages:[]
    },
    reducers:{
        setOnlineUser:(state,action)=>{
            state.onlineUsers= action.payload;
        },
        setMessages:(state,action)=>{
            state.messages= action.payload;
        }
    }
})
export const {setOnlineUser,setMessages} = chatSlice.actions;
export default chatSlice.reducer;