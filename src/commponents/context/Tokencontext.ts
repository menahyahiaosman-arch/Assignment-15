import { createContext, type Dispatch, type SetStateAction } from "react"

type TokencontextType = {
    token : string | null ,
    setToken : Dispatch<SetStateAction<string | null>>
}


export const Tokencontext = createContext<TokencontextType | null>(null)

