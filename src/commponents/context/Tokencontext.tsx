import React, { useState } from 'react'
import { Tokencontext } from './Tokencontext';


export default function TokencontextProvider({children} : {children : React.ReactNode}) {


     const [token, setToken] = useState<string | null>(
    localStorage.getItem("userToken"),
  );
  return (
     <Tokencontext.Provider value={{token , setToken}}>
        {children}

     </Tokencontext.Provider>
  )
}
