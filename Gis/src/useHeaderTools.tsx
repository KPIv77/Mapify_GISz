// useHeaderTools.ts
import { useRef } from 'react'
import L from 'leaflet'

export function useMapTools() {
  const mapRef        = useRef<L.Map | null>(null)
  const polygonPoints = useRef<L.LatLng[]>([])
  const polygonLayer  = useRef<L.Polygon | null>(null)

  // Measure tool state
  const measureActive  = useRef(false)
  const measurePoints  = useRef<L.LatLng[]>([])
  const measureLine    = useRef<L.Polyline | null>(null)
  const measureMarkers = useRef<L.CircleMarker[]>([])
  const measureTooltip = useRef<L.Tooltip | null>(null)

  const setMap = (map: L.Map) => {
    mapRef.current = map
  }

  // calculate distance
  const calcDistance = (points: L.LatLng[]): string => {
    let total = 0
    for (let i = 1; i < points.length; i++) {
      total += points[i - 1].distanceTo(points[i])
    }
    return total >= 1000
      ? `${(total / 1000).toFixed(2)} km`
      : `${total.toFixed(0)} m`
  }

  // Clear measure state
  const clearMeasure = (map: L.Map) => {
    measureLine.current?.remove()
    measureMarkers.current.forEach((m) => m.remove())
    measureTooltip.current?.remove()
    measureActive.current    = false
    measurePoints.current    = []
    measureLine.current      = null
    measureMarkers.current   = []
    measureTooltip.current   = null
    map.off('click', onMeasureClick)
    map.off('dblclick', onMeasureDone)
    map.getContainer().style.cursor = ''
    map.doubleClickZoom.enable()
  }

  // Click to add measure point
  const onMeasureClick = (e: L.LeafletMouseEvent) => {
    const map = mapRef.current
    if (!map) return

    measurePoints.current.push(e.latlng)

    // Add marker for the new point
    const marker = L.circleMarker(e.latlng, {
      radius: 5, color: '#2563eb', fillColor: '#fff', fillOpacity: 1, weight: 2,
    }).addTo(map)
    measureMarkers.current.push(marker)

    // Update polyline
    if (measureLine.current) {
      measureLine.current.setLatLngs(measurePoints.current)
    } else {
      measureLine.current = L.polyline(measurePoints.current, {
        color: '#2563eb', weight: 2, dashArray: '6,4'
      }).addTo(map)
    }

    // Show tooltip with distance if we have at least 2 points
    if (measurePoints.current.length >= 2) {
      measureTooltip.current?.remove()
      measureTooltip.current = L.tooltip({ permanent: true, className: 'measure-tooltip' })
        .setLatLng(e.latlng)
        .setContent(`📏 ${calcDistance(measurePoints.current)}`)
        .addTo(map)
    }
  }

  // double-click to finish measuring
  const onMeasureDone = (e: L.LeafletMouseEvent) => {
    const map = mapRef.current
    if (!map) return
    L.DomEvent.stop(e) // ป้องกัน zoom เมื่อ double-click
    clearMeasure(map)
  }

  // Measure tool: click to add points, double-click to finish
  const handleMeasure = () => {
    const map = mapRef.current
    if (!map) return

    // If already active, clear measure
    if (measureActive.current) {
      clearMeasure(map)
      return
    }

    measureActive.current = true
    map.getContainer().style.cursor = 'crosshair'
    map.doubleClickZoom.disable()
    map.on('click', onMeasureClick)
    map.on('dblclick', onMeasureDone)
  }

  const handlePin = () => {
    const map = mapRef.current
    if (!map) return
    map.once('click', (e) => {
      L.marker(e.latlng)
        .addTo(map)
        .bindPopup(`📍 ${e.latlng.lat.toFixed(5)}, ${e.latlng.lng.toFixed(5)}`)
        .openPopup()
    })
  }

  const handlePolygon = () => {
    const map = mapRef.current
    if (!map) return
    map.on('click', (e) => {
      polygonPoints.current.push(e.latlng)
      polygonLayer.current?.remove()
      polygonLayer.current = L.polygon(polygonPoints.current, {
        color: 'blue', fillOpacity: 0.2
      }).addTo(map)
    })
  }

  // ClearAll
  const handleClearAll = () => {
    const map = mapRef.current
    if (!map) return
    map.eachLayer((layer) => {
      if (!(layer instanceof L.TileLayer)) map.removeLayer(layer)
    })
    polygonPoints.current = []
    polygonLayer.current  = null
    clearMeasure(map) // ← Clear measure
  }

  return { setMap, handleMeasure, handlePin, handlePolygon, handleClearAll }
}