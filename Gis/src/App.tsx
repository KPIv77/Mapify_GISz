// App.jsx
import { useState } from 'react'
import './App.css'

function App() {
  return (
    // fragment ครอบ component หลัก
    <>
      <div className="layout">

        {/* Header แถบบนสุด */}
        <header className="header">Map GIS</header>

        {/* Body: sidebar + ฝั่งขวา */}
        <div className="body">

          {/* Sidebar เมนูซ้าย */}
          <aside className="sidebar">Menu</aside>

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