
import { Outlet } from 'react-router'
import Navbar from '../commponents/Navbar/Navbar'

export default function Mainlayout() {
  return (
    <>
    <Navbar/>
       <Outlet/>
    </>
  )
}
