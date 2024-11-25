import { setUserProfile } from "@/redux/authSlice";
import { setMessages } from "@/redux/chatSlice";
import store from "@/redux/store";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch,useSelector } from "react-redux";

const useGetUserProfile = (userId)=>{
    const dispatch = useDispatch();
    
    useEffect(() =>{
        const fetchUserProfile = async()=>{
            try {
                const res = await  axios.get(`http://localhost:8000/api/v1/user/${userId}/profile`, { withCredentials: true });
                if(res.data.success){
                    dispatch(setMessages(res.data.user))
                }   
            } catch (error) {
                console.log(error);
            }

        }
        fetchUserProfile();
    },[userId])
}
export default useGetUserProfile;