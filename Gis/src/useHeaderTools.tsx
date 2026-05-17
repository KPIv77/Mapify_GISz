// UseHeaderTools.ts
import { useRef } from 'react'
import L from 'leaflet'

export function useMapTools() {
  const mapRef        = useRef<L.Map | null>(null)
  const polygonPoints = useRef<L.LatLng[]>([])
  const polygonLayer  = useRef<L.Polygon | null>(null)
  const polygonActive = useRef(false)

  // Measure tool state
  const measureActive  = useRef(false)
  const measurePoints  = useRef<L.LatLng[]>([])
  const measureLine    = useRef<L.Polyline | null>(null)
  const measureMarkers = useRef<L.CircleMarker[]>([])
  const measureTooltip = useRef<L.Tooltip | null>(null)

  const setMap = (map: L.Map) => {
    mapRef.current = map
  }

  // Calculate distance
  const calcDistance = (points: L.LatLng[]): string => {
    let total = 0
    for (let i = 1; i < points.length; i++) {
      total += points[i - 1].distanceTo(points[i])
    }
    return total >= 1000
      ? `${(total / 1000).toFixed(2)} km`
      : `${total.toFixed(0)} m`
  }

  // Clear measure state + layer
  const clearMeasure = (map: L.Map) => {
    measureLine.current?.remove()
    measureMarkers.current.forEach((m) => m.remove())
    measureTooltip.current?.remove()
    measureActive.current  = false
    measurePoints.current  = []
    measureLine.current    = null
    measureMarkers.current = []
    measureTooltip.current = null
    map.off('click', onMeasureClick)
    map.off('dblclick', onMeasureDone)
    map.getContainer().style.cursor = ''
    map.doubleClickZoom.enable()
  }

  // Clear polygon state only — ไม่ลบ layer (ใช้ตอน dblclick)
  const clearPolygonState = (map: L.Map) => {
    polygonActive.current = false
    polygonPoints.current = []
    map.off('click', onPolygonClick)
    map.off('dblclick', onPolygonDone)
    map.getContainer().style.cursor = ''
    map.doubleClickZoom.enable()
  }

  // Clear polygon state + layer (ใช้ตอน ClearAll)
  const clearPolygon = (map: L.Map) => {
    polygonLayer.current?.remove()
    polygonLayer.current = null
    clearPolygonState(map)
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
        .setContent(` ${calcDistance(measurePoints.current)}`)
        .addTo(map)
    }
  }

  // Click to add polygon point
  const onPolygonClick = (e: L.LeafletMouseEvent) => {
    const map = mapRef.current
    if (!map) return

    polygonPoints.current.push(e.latlng)

    // วาง circle marker ทุกจุด
    L.circleMarker(e.latlng, {
      radius: 5, color: '#16a34a', fillColor: '#fff', fillOpacity: 1, weight: 2,
    }).addTo(map)

    // วาด polygon ทุกครั้งที่คลิก
    polygonLayer.current?.remove()
    polygonLayer.current = L.polygon(polygonPoints.current, {
      color: '#16a34a', fillOpacity: 0.2
    }).addTo(map)
  }

  // Double-click to finish polygon — เก็บ layer ไว้ ล้างแค่ state
  const onPolygonDone = (e: L.LeafletMouseEvent) => {
    const map = mapRef.current
    if (!map) return
    L.DomEvent.stop(e) // ป้องกัน zoom

    // แสดง popup จำนวนจุดตรงกลาง polygon
    if (polygonPoints.current.length >= 3 && polygonLayer.current) {
      const center = polygonLayer.current.getBounds().getCenter()
      L.popup()
        .setLatLng(center)
        .setContent(`🟩 ${polygonPoints.current.length} จุด`)
        .addTo(map)
        .openOn(map)
    }

    // ✅ ล้างแค่ state — เส้นและพื้นที่ยังคงอยู่บนแผนที่
    clearPolygonState(map)
  }

  // Double-click to finish measuring
  const onMeasureDone = (e: L.LeafletMouseEvent) => {
    const map = mapRef.current
    if (!map) return
    L.DomEvent.stop(e) // ป้องกัน zoom เมื่อ double-click
    clearMeasure(map)
  }

  // Measure tool: toggle เปิด/ปิด
  const handleMeasure = () => {
    const map = mapRef.current
    if (!map) return

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

  // Polygon tool: toggle เปิด/ปิด
  const handlePolygon = () => {
    const map = mapRef.current
    if (!map) return

    if (polygonActive.current) {
      // กด polygon อีกรอบ → ยกเลิกโหมด แต่ไม่ลบ layer
      clearPolygonState(map)
      return
    }

    polygonActive.current = true
    polygonLayer.current  = null // reset ref เพื่อเริ่ม polygon ใหม่
    map.getContainer().style.cursor = 'crosshair'
    map.doubleClickZoom.disable()
    map.on('click', onPolygonClick)
    map.on('dblclick', onPolygonDone)
  }

  // ClearAll: ลบทุก layer และ reset ทุก state
  const handleClearAll = () => {
    const map = mapRef.current
    if (!map) return
    map.eachLayer((layer) => {
      if (!(layer instanceof L.TileLayer)) map.removeLayer(layer)
    })
    polygonPoints.current = []
    polygonLayer.current  = null
    clearMeasure(map)
    clearPolygon(map) // ← ใช้ clearPolygon (ลบ layer ด้วย)
  }

  // Search location using Nominatim API
  const handleSearch = async (query?: string) => {
    const map = mapRef.current
    if (!map || !query?.trim()) return

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
        { headers: { 'Accept-Language': 'th' } }
      )
      const data = await res.json()

      if (data.length === 0) {
        alert(`ไม่พบ "${query}"`)
        return
      }

      const { lat, lon, display_name } = data[0]
      const latlng = L.latLng(parseFloat(lat), parseFloat(lon))

      // Move map to the found location
      map.flyTo(latlng, 15)

      // Add marker with popup
      L.marker(latlng)
        .addTo(map)
        .bindPopup(`📍 ${display_name}`)
        .openPopup()

    } catch (err) {
      console.error('Search error:', err)
    }
  }

  return { setMap, handleMeasure, handlePin, handlePolygon, handleClearAll, handleSearch }
}