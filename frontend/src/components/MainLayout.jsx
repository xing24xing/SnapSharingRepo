
import React from 'react'

import { Outlet } from 'react-router-dom'
import LeftSidebar from './LeftSidebar.jsx'
import Feed from './Feed.jsx'
import RightSideBar from './RightSideBar.jsx'

function MainLayout() {
  return (
    <div>
    <LeftSidebar/>
   <div>
       <Outlet/>
   </div>
</div>
  )
}

export default MainLayout