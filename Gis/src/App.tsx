import { useState } from 'react'
import Sidebar from './menu'
import type { MenuItem } from './menu'
import './App.css'
import './App.css'



function App() {
      // Setup menu items for bottom Sidebar
    const menuItems: MenuItem[] = [
        { id: 1, label: 'Search',  group: 'top',    onClick: () => console.log('Search') },
        { id: 2, label: 'File', group: 'middle', onClick: () => console.log('Filter') },
        { id: 3, label: 'map1',   group: 'bottom', onClick: () => console.log('map1') },
        { id: 4, label: 'map2',   group: 'bottom', onClick: () => console.log('map2') },
        { id: 5, label: 'map3',   group: 'bottom', onClick: () => console.log('map3') },
    ]  

  return (
    <>
      <div className="layout">
        <header className="header"
        >
            Map GIS
            <div className="header-tools">
                <button>Measure</button>
                <button>Pin location</button>
                <button>Polygon</button>
                <button>ClearAll</button>
            </div>
        </header>

        {/* Body: sidebar + ฝั่งขวา */}
        <div className="body">
            {/* Sidebar เมนูซ้าย */}
            <Sidebar menuItems={menuItems} />

            {/* ฝั่งขวา: map + toolbar */}
            <div className="right">
                <div className="map-container">Map</div>
                <div className="toolbar">Toolbar</div>
            </div>

        </div>
      </div>
    </>
  )
}

export default App