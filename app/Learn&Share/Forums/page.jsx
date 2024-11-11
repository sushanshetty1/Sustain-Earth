import React from 'react'
import Sidebar from './sidebar'
import Feed from './feed'

const Forums = () => {
  return (
    <div className="flex justify-center bg-white mt-[40px] h-full">
      <Sidebar />
      <Feed />
    </div>
  )
}

export default Forums