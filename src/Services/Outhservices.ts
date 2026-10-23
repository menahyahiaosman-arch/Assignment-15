import axios from "axios";
import type { loginSchemaType, RegisterSchemaType } from "../lib/Schemas/Auth.Schemas";

console.log(import.meta.env);
const baseurl = import.meta.env.VITE_BASE_URL

export async function registerUser (formData : RegisterSchemaType){
    const data = await axios.post(`${baseurl}/users/signup` , formData ,
        {
            headers:{
                "content-Type" : "application/json"
            },
        },
    );


    return data;
}

export async function loginUser (formData : loginSchemaType){
    const data = await axios.post(`${baseurl}/users/signin` , formData ,
        {
            headers:{
                "content-Type" : "application/json"
            },
        },
    );


    return data;
}

