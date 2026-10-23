
import { Outlet } from 'react-router'
import AuthIntro from '../commponents/Authintro/Authintro'

export default function Authlayout() {
  return (
    <>
     <main className='bg-sec min-h-screen flex flex-col lg:flex-row justify-center items-center'>
        <div className="container mx-auto ">
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="order-2 lg:order-0">
              <AuthIntro/>
            </div>
            <div className="order-0">
              <Outlet/>
            </div>
            
          </div>
        </div>
     </main>
    </>
  )
}
