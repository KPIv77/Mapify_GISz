import { useRef, useCallback, useState } from 'react'
import L from 'leaflet'


// Set basemap definitions
const BASEMAP_TILES: Record<string, L.TileLayer> = {
  osm: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap', maxZoom: 19
  }),
  satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: '© Esri', maxZoom: 19
  }),
  dark: L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '© CARTO', maxZoom: 19
  }),
}

export function useMapTools() {

  // Reference to the Leaflet map instance
  const mapRef = useRef<L.Map | null>(null)

  // Store active basemap key for button highlighting
  const [activeBasemap, setActiveBasemap] = useState<string>('osm')

  // Get map instance from MapView and load initial basemap
  const setMap = (map: L.Map) => {
    mapRef.current = map
    // Load default basemap initially
    BASEMAP_TILES['osm'].addTo(map)
  }

  // Switch basemap and update active state for button styling
  const switchBasemap = (name: string) => {
    const map = mapRef.current
    if (!map || name === activeBasemap) return

    // Remove current basemap layer and add the new one
    map.removeLayer(BASEMAP_TILES[activeBasemap])
    BASEMAP_TILES[name].addTo(map)
    BASEMAP_TILES[name].bringToBack() // Ensure basemap stays behind other layers

    // Update active basemap state for UI feedback

    setActiveBasemap(name)
  }

  // ─── Measure state ──────────────────────────────────────────────
  const measureActive  = useRef(false)
  const measurePoints  = useRef<L.LatLng[]>([])
  const measureLine    = useRef<L.Polyline | null>(null)
  const measureMarkers = useRef<L.CircleMarker[]>([])
  const measureTooltip = useRef<L.Tooltip | null>(null)

  // Calculate cumulative distance between points
  const calcDistance = (points: L.LatLng[]): string => {
    let total = 0
    for (let i = 1; i < points.length; i++) {
      total += points[i - 1].distanceTo(points[i])
    }
    return total >= 1000
      ? `${(total / 1000).toFixed(2)} km`
      : `${total.toFixed(0)} m`
  }

  // Add a point and update the polyline + tooltip on each click
  const onMeasureClick = useCallback((e: L.LeafletMouseEvent) => {
    const map = mapRef.current
    if (!map) return

    measurePoints.current.push(e.latlng)

    // Place a circle marker at the clicked point
    const marker = L.circleMarker(e.latlng, {
      radius: 5, color: '#2563eb', fillColor: '#fff', fillOpacity: 1, weight: 2,
    }).addTo(map)
    measureMarkers.current.push(marker)

    // Create or update the dashed polyline
    if (measureLine.current) {
      measureLine.current.setLatLngs(measurePoints.current)
    } else {
      measureLine.current = L.polyline(measurePoints.current, {
        color: '#2563eb', weight: 2, dashArray: '6,4'
      }).addTo(map)
    }

    // Show distance tooltip once there are at least 2 points
    if (measurePoints.current.length >= 2) {
      measureTooltip.current?.remove()
      measureTooltip.current = L.tooltip({ permanent: true, className: 'measure-tooltip' })
        .setLatLng(e.latlng)
        .setContent(` ${calcDistance(measurePoints.current)}`)
        .addTo(map)
    }
  }, [])

  // Finish measuring on double-click
  const onMeasureDone = useCallback((e: L.LeafletMouseEvent) => {
    const map = mapRef.current
    if (!map) return
    L.DomEvent.stop(e) // prevent map zoom on double-click
    clearMeasure(map)
  }, [])

  // Remove all measure layers and reset state
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

  // Toggle measure mode on/off
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

  // ─── Polygon state ──────────────────────────────────────────────
  const polygonActive = useRef(false)
  const polygonPoints = useRef<L.LatLng[]>([])
  const polygonLayer  = useRef<L.Polygon | null>(null)

  // Add a vertex and redraw the polygon on each click
  const onPolygonClick = useCallback((e: L.LeafletMouseEvent) => {
    const map = mapRef.current
    if (!map) return

    polygonPoints.current.push(e.latlng)

    // Place a circle marker at each vertex
    L.circleMarker(e.latlng, {
      radius: 5, color: '#16a34a', fillColor: '#fff', fillOpacity: 1, weight: 2,
    }).addTo(map)

    // Redraw polygon with updated points
    polygonLayer.current?.remove()
    polygonLayer.current = L.polygon(polygonPoints.current, {
      color: '#16a34a', fillOpacity: 0.2
    }).addTo(map)
  }, [])

  // Finish polygon on double-click — keep layer, clear state only
  const onPolygonDone = useCallback((e: L.LeafletMouseEvent) => {
    const map = mapRef.current
    if (!map) return
    L.DomEvent.stop(e) // prevent map zoom on double-click

    // Show a popup at the polygon center with vertex count
    if (polygonPoints.current.length >= 3 && polygonLayer.current) {
      const center = polygonLayer.current.getBounds().getCenter()
      L.popup()
        .setLatLng(center)
        .setContent(`🟩 ${polygonPoints.current.length} points`)
        .addTo(map)
        .openOn(map)
    }

    clearPolygonState(map)
  }, [])

  // Reset polygon interaction state without removing the drawn layer
  const clearPolygonState = (map: L.Map) => {
    polygonActive.current = false
    polygonPoints.current = []
    map.off('click', onPolygonClick)
    map.off('dblclick', onPolygonDone)
    map.getContainer().style.cursor = ''
    map.doubleClickZoom.enable()
  }

  // Remove polygon layer and reset all state
  const clearPolygon = (map: L.Map) => {
    polygonLayer.current?.remove()
    polygonLayer.current = null
    clearPolygonState(map)
  }

  // Toggle polygon mode on/off
  const handlePolygon = () => {
    const map = mapRef.current
    if (!map) return
    if (polygonActive.current) {
      clearPolygonState(map) // cancel mode without removing drawn layer
      return
    }
    polygonActive.current = true
    polygonLayer.current  = null // reset ref to start a fresh polygon
    map.getContainer().style.cursor = 'crosshair'
    map.doubleClickZoom.disable()
    map.on('click', onPolygonClick)
    map.on('dblclick', onPolygonDone)
  }

  // ─── Pin ────────────────────────────────────────────────────────

  // Drop a marker with a coordinate popup on the next click
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

  // ─── Clear all ──────────────────────────────────────────────────

  // Remove every non-tile layer and reset all tool states
  const handleClearAll = () => {
    const map = mapRef.current
    if (!map) return
    map.eachLayer((layer) => {
      if (!(layer instanceof L.TileLayer)) map.removeLayer(layer)
    })
    clearMeasure(map)
    clearPolygon(map)
  }

  // ─── Search ─────────────────────────────────────────────────────

  // Geocode a query with Nominatim, fly to result, and drop a marker
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
        alert(`Location not found: "${query}"`)
        return
      }
      const { lat, lon, display_name } = data[0]
      const latlng = L.latLng(parseFloat(lat), parseFloat(lon))
      map.flyTo(latlng, 15)
      L.marker(latlng)
        .addTo(map)
        .bindPopup(`${display_name}`)
        .openPopup()
    } catch (err) {
      console.error('Search error:', err)
    }
  }

  // ─── KML / KMZ Loader ───────────────────────────────────────────

const kmlLayersRef = useRef<L.GeoJSON[]>([])  // Keep track of KML layers to manage them later if needed

// parseAndRenderKML transforms a KML string into a Leaflet layer and adds it to the map
const parseAndRenderKML = async (kmlString: string, fileName: string) => {
  const map = mapRef.current
  if (!map) return

  // Parse KML string into an XML DOM
  const parser = new DOMParser()
  const xml = parser.parseFromString(kmlString, 'text/xml')

  // Check for parsing errors
  if (xml.querySelector('parsererror')) {
    alert(`File ${fileName} has an invalid format`)
    return
  }

  // toGeoJSON library: แปลง XML DOM → GeoJSON (ต้อง install @tmcw/togeojson)
  // npm install @tmcw/togeojson
  const { kml: toKml } = await import('@tmcw/togeojson')
  const geojson = toKml(xml)

  if (!geojson.features?.length) {
    alert(`No features found in ${fileName}`)
    return
  }

  // Create GeoJSON layer on Leaflet
  const layer = L.geoJSON(geojson, {
    style: { color: '#2563eb', weight: 2, fillOpacity: 0.15 },
    pointToLayer: (_, latlng) =>
      L.circleMarker(latlng, {
        radius: 6, color: '#2563eb', fillColor: '#fff',
        fillOpacity: 1, weight: 2,
      }),
    onEachFeature: (feature, lyr) => {
      const name = feature.properties?.name ?? fileName
      const desc = feature.properties?.description ?? ''
      lyr.bindPopup(`<strong>${name}</strong>${desc ? `<br/>${desc}` : ''}`)
    },
  }).addTo(map)

  // Zoom bounding box of layer
  map.fitBounds(layer.getBounds())
  kmlLayersRef.current.push(layer)
}

// handleFileLoad processes a dropped file, determines if it's KML or KMZ, and loads it onto the map
const handleFileLoad = async (file: File) => {
  const name = file.name.toLowerCase()

  if (name.endsWith('.kml')) {
    // Read KML file as text and parse it
    const text = await file.text()
    parseAndRenderKML(text, file.name)

  } else if (name.endsWith('.kmz')) {
    // KMZ: ZIP archive → extract KML → parse KML
    // npm install jszip @types/jszip
    const JSZip = (await import('jszip')).default
    const zip = await JSZip.loadAsync(await file.arrayBuffer())

    // file .kml first archive
    const kmlEntry = Object.values(zip.files).find(
      (f) => f.name.toLowerCase().endsWith('.kml') && !f.name.startsWith('__MACOSX')
    )
    if (!kmlEntry) { alert('No .kml file found inside KMZ'); return }

    const kmlString = await kmlEntry.async('string')
    parseAndRenderKML(kmlString, file.name)

  } else {
    alert('Support .kml and .kmz files only')
  }
}

  return { 
  setMap, 
  handleMeasure, 
  handlePin, 
  handlePolygon, 
  handleClearAll, 
  handleSearch, 
  switchBasemap, 
  activeBasemap,
  handleFileLoad
  }
}