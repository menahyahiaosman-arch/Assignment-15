import type React from "react";
import { createContext, useContext, useEffect, useState, type Dispatch, type SetStateAction } from "react";
import type { userProfileType } from "../../Types/user.types";
import { getMyProfile } from "../../Services/Profile.sevices";
import { Tokencontext } from "./Tokencontext";

export type UserContextType ={
    userDetails : userProfileType | null
    setuserDetails : Dispatch<SetStateAction <userProfileType | null>>

}
export const UserContext = createContext<UserContextType | null>(null)
export default function UserContexProvider({children}:{children : React.ReactNode}) {
    const {token} = useContext(Tokencontext)
    
    const [userDetails, setuserDetails] = useState<userProfileType | null>(null)

    async function getUserProfile() {
        try {
            const {data} = await getMyProfile();
            console.log(data.data.user);
            setuserDetails(data.data.user)
            
        } catch (error) {
            console.log(error);
            
            
        }
        
    }
    useEffect(()=>{
        if(token){
            getUserProfile()
        }
    },[token])
  return (
    <>
    <UserContext.Provider value={{userDetails , setuserDetails}}>
        {children}
    </UserContext.Provider>
    </>
  )
}
