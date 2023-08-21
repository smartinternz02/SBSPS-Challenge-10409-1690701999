// // DetailedView.js
// import React from 'react';
// import L from 'leaflet';

// function DetailedView({ selectedStation, onClose }) {
//   if (!selectedStation) {
//     return null; // Return nothing if selectedStation is null
//   }

//   const { Title, AddressInfo } = selectedStation.AddressInfo;

//   return (
//     <div className="detailed-view">
//       <h2>{Title}</h2>
//       <p>{selectedStation.AddressInfo.AddressLine1}</p>
//       {/* Display more information about the charging station */}
//       <button onClick={() => console.log("Navigate to charging station")}>
//         Navigate to Charging Station
//       </button>
//       <button onClick={onClose}>Close</button>
//     </div>
//   );
// }

// export default DetailedView;

import React, { useRef, useEffect } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet-routing-machine';

function DetailedView({ selectedStation, onClose }) {
  const mapRef = useRef(); // Always initialize useRef outside the conditional block

  useEffect(() => {
    if (mapRef.current && selectedStation) {
      // Access the Leaflet map instance and implement navigation logic here
    }
  }, [selectedStation]);

  if (!selectedStation) {
    return null;
  }

  const { Title, AddressInfo } = selectedStation.AddressInfo;
  const stationPosition = [selectedStation.AddressInfo.Latitude, selectedStation.AddressInfo.Longitude];

  return (
    <div className="detailed-view">
      <h2>{Title}</h2>
      <p>{selectedStation.AddressInfo.AddressLine1}</p>
      {/* Display more information about the charging station */}
      <button onClick={onClose}>Close</button>

      {/* Display Leaflet map */}
      <MapContainer
        center={stationPosition}
        zoom={15}
        style={{ height: '300px', width: '100%' }}
        whenCreated={(map) => (mapRef.current = map)} // Assign the map instance to the ref
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      </MapContainer>
    </div>
  );
}

export default DetailedView;