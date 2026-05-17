import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface MapInfo {
  lat: string
  lng: string
  zoom: number
}

interface MapViewProps {
  onInfoChange?: (info: MapInfo) => void
}

export default function MapView({ onInfoChange }: MapViewProps) {

    // Reference to the HTML div that will contain the map
    const mapRef = useRef<HTMLDivElement>(null)

    // Store Leaflet map instance to prevent re-creating the map
    const mapInstance = useRef<L.Map | null>(null)

    useEffect(() => {

        // Initialize map only once
        if (mapRef.current && !mapInstance.current) {

            // Create map and set default position to Bangkok
            const map = L.map(mapRef.current).setView([13.7563, 100.5018], 13)

            // Add OpenStreetMap tile layer
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
        }).addTo(map)

        // Update latitude, longitude, and zoom while moving mouse on map
        map.on('mousemove', (e) => {
            onInfoChange?.({
            lat: e.latlng.lat.toFixed(6),
            lng: e.latlng.lng.toFixed(6),
            zoom: map.getZoom(),
            })
        })

        // Update zoom level when zoom changes
        map.on('zoomend', () => {
            onInfoChange?.({
            lat: '-', lng: '-',
            zoom: map.getZoom(),
            })
        })

        // Reset coordinates when mouse leaves the map
        map.on('mouseout', () => {
            onInfoChange?.({ lat: '-', lng: '-', zoom: map.getZoom() })
        })

        // Save map instance
        mapInstance.current = map
        }

        // Cleanup map instance when component unmounts
        return () => {
        mapInstance.current?.remove()
        mapInstance.current = null
        }
    }, [])

    // Map container
    return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
}