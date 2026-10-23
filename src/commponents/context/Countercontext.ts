import { createContext, use, useContext, type Dispatch, type SetStateAction } from "react"

type CountercontextType = {
    token : string | null
    setToken : Dispatch<SetStateAction<string | null>>
}


export const Countercontext = createContext<CountercontextType | null >(null)

