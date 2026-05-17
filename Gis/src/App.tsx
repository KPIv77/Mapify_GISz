import { useState } from 'react'
import Sidebar from './menu'
import type { MenuItem } from './menu'
import MapView from './map-view'
import './App.css'
import HeaderMenu, { type MenuHeader } from './header-menu.tsx'

interface MapInfo {
  lat: string
  lng: string
  zoom: number
}

function App() {

    // Store current map information
    const [mapInfo, setMapInfo] = useState<MapInfo>({ lat: '-', lng: '-', zoom: 13 })

    const menuHeader: MenuHeader[] = [
        { label: 'Measure', onClick: () => console.log('Measure') },
        { label: 'Pin location', onClick: () => console.log('Zoom Out') },
        { label: 'Polygon', onClick: () => console.log('Reset View') },
        { label: 'ClearAll', onClick: () => console.log('Full Screen') },
    ]

    // Setup menu items for bottom Sidebar
    const menuItems: MenuItem[] = [
        { id: 1, label: 'Search',  group: 'top',    onClick: () => console.log('Search') },
        { id: 2, label: 'File', group: 'middle', onClick: () => console.log('Filter') },
        { id: 3, label: 'OSM Standard',   group: 'bottom', onClick: () => console.log('map1') },
        { id: 4, label: 'Satelite',   group: 'bottom', onClick: () => console.log('map2') },
        { id: 5, label: 'Dark',   group: 'bottom', onClick: () => console.log('map3') },
    ]  

  return (
    <>
        <div className="layout">

            {/* Top header section */}
            <header className="header-menu"
            >
                Map GIS
                <div className="header-tools">
                    <HeaderMenu menuHeader={menuHeader} />
                </div>
            </header>

            {/* Main layout: sidebar + map section */}
            <div className="body">

                {/* Left sidebar menu */}
                <Sidebar menuItems={menuItems} />

                {/* Right section: map + coordinate toolbar */}
                <div className="right">

                    {/* Component map-view.tsx */}
                    <div className="map-container">
                        <MapView onInfoChange={setMapInfo} />
                    </div>
                    
                    {/* Bottom toolbar displaying map information */}
                    <div className="toolbar">
                        <span>Lat: <b>{mapInfo.lat}</b></span>
                        <span>Lng: <b>{mapInfo.lng}</b></span>
                        <span>Zoom: <b>{mapInfo.zoom}</b></span>
                    </div>

                </div>
            </div>

        </div>
    </>
  )
}

export default App