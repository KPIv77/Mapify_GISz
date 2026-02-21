// Handle file uploads (drag-and-drop and file input).
const uploadArea = document.getElementById("upload-area");
const fileInput = document.getElementById("fileInput");
const errorDiv = document.getElementById("error");

// Add event listeners for click, dragover, and drop on the upload area.
uploadArea.addEventListener("click", () => fileInput.click());
uploadArea.addEventListener("dragover", (e) => e.preventDefault());
uploadArea.addEventListener("drop", (e) => {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  if (file) handleFile(file);
});

fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) handleFile(file);
});

// Prepare to read the uploaded file. 
function handleFile(file) {
  errorDiv.textContent = "";
  const reader = new FileReader();

  // console.log("Reading file:", file.name);
  // console.log("File type:", reader);
  
  // Start reading file.
  reader.onload = (e) => {
    const data = new Uint8Array(e.target.result);
    try {

      // Read the Excel file and select sheet target
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      // console.log("Processing sheet:", sheetName);

      // Convert sheet to JSON and process rows
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: null });
      processRows(rows);

      // console.log(rows);

    } catch (err) {
      errorDiv.textContent = "Error reading file: " + err.message;
    }
  };
  reader.readAsArrayBuffer(file);
}

//
function processRows(rows) {
  if (!rows.length) {
    errorDiv.textContent = "No data found in file";
    return;
  }

  //
  const headers = Object.keys(rows[0]).map((h) => h.toLowerCase());
  const latKeys = ["lat", "latitude", "y", "ycoord"];
  const lngKeys = ["lng", "lon", "long", "longitude", "x", "xcoord"];

  //
  let latCol =
    headers.find((h) => latKeys.includes(h)) ||
    headers.find((h) => latKeys.some((c) => h.includes(c)));
  let lngCol =
    headers.find((h) => lngKeys.includes(h)) ||
    headers.find((h) => lngKeys.some((c) => h.includes(c)));

  if (!latCol || !lngCol) {
    errorDiv.textContent = "No lat/long columns detected!";
    return;
  }

  //
  let points = [];
  rows.forEach((r) => {
    const lower = {};

    //
    Object.keys(r).forEach((k) => (lower[k.toLowerCase()] = r[k]));
    const lat = parseFloat(lower[latCol]);
    const lng = parseFloat(lower[lngCol]);
    if (!isNaN(lat) && !isNaN(lng)) {
      points.push({ lat, lng, raw: r });
    }
  });

  if (!points.length) {
    errorDiv.textContent = "No valid coordinates found!";
    return;
  }

  // Clear existing markers
  map.eachLayer((layer) => {
    if (layer instanceof L.Marker) map.removeLayer(layer);
  });


  const first = points[0];
  map.setView([first.lat, first.lng], 10);

  console.log("Adding points:", points);

  points.forEach((p, i) => {
    
    // Plot marker 
    const marker = L.marker([p.lat, p.lng]).addTo(map);
    const siteName = p.raw.SiteName || `Point ${i + 1}`;
    console.log(`Added marker #${i + 1} at (${p.lat}, ${p.lng})`);
    
    // Show lable site name.
    L.marker([p.lat, p.lng], {
      icon: L.divIcon({
      className: "text-marker",
      html: `<b>${siteName}</b>`

      }),
    }).addTo(map);

  });

}

