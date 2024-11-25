import { setMessages } from "@/redux/chatSlice";
import { setPosts } from "@/redux/postSlice";
import store from "@/redux/store";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch,useSelector } from "react-redux";

const useGetAllMessage = ()=>{
    const dispatch = useDispatch();
    const {selectedUser} = useSelector(store=>store.auth);
    useEffect(() =>{
        const fetchMesssage = async()=>{
            try {
                const res = await axios.get(`http://localhost:8000/api/v1/message/all/${selectedUser?._id}`, { withCredentials: true });
                if(res.data.success){
                    dispatch(setMessages(res.data.messages))
                }   
            } catch (error) {
                console.log(error);
            }

        }
        fetchMesssage();
    },[selectedUser])
}
export default useGetAllMessage;