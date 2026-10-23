import axios from "axios";
const baseurl = import.meta.env.VITE_BASE_URL


export async function getMyProfile (){
    const data = await axios.get(`${baseurl}/users/profile-data` ,
        {
            headers:{
                "content-Type" : "application/json",
                "Authorization" : `Bearer ${localStorage.getItem("userToken")}`
            
            },
        },
    );


    return data;
}

