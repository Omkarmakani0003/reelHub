import React from 'react'
import ReelView from '../components/ReelView'
import Data from '../assets/Data.js'
import { Link } from 'react-router-dom'

const Home = () => {
  
  return(
  <div className="bg-gray-900 text-white flex justify-center flex-col items-center h-screen overflow-hidden">
    <div className="w-full max-w-md h-screen md:h-[95vh] md:max-h-[800px] md:rounded-t-2xl md:border md:border-zinc-800 overflow-y-scroll snap-y snap-mandatory scrollbar-none bg-black shadow-2xl">
    
    {
      Data.map((item)=>(
        <ReelView key={item.id} item={item}/>
      ))
    }
    
 
  </div>
  
   <div className="flex justify-around items-center w-full max-w-md h-15 md:rounded-b-2xl bg-black/45">
      <Link>
        <svg xmlns="http://w3.org" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      </Link>


      <Link>
        <svg xmlns="http://w3.org" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </Link>

      <Link>
        <svg xmlns="http://w3.org" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </Link>

   </div>
</div>
  )
}

export default Home