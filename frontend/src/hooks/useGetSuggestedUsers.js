import { setSuggestedUsers } from "@/redux/authSlice";
import axios  from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
const useGetSuggetedUsers = ()=>{
    const dispatch = useDispatch();
    useEffect(()=>{
        const fetchSuggestedUsers = async ()=>{
            try {
                const res = axios.get('http://localhost:8000/api/v1/user/other', { withCredentials: true });
                if(res.data.success){
                    dispatch(setSuggestedUsers(res.data.users));
                }
            } catch (error) {
                console.log(error)
            }
        }
        fetchSuggestedUsers();
    },[dispatch])
}
export default useGetSuggetedUsers;