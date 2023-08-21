import React,{ useEffect, useState} from 'react';
import axios from 'axios';
import {MapContainer, TileLayer, Marker, Popup} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
// import DetailedView from './components/DetailedView';
import L from 'leaflet'

const FLASK_BACKEND_URL = 'http://localhost:5000';
const customIcon = L.icon({
    iconUrl: '../../icons/ev_charging_station_icon.png', // Replace with the actual URL of your marker icon
    iconSize: [40, 40], // Adjust the size as needed
  });

function HomePage() {
    const [chargingStations, setChargingStations] = useState([]);
    const [selectedStation, setSelectedStation] = useState({});

    useEffect(() => {
        async function fetchChargingStation() {
            try{
                const response = await axios.get(`${FLASK_BACKEND_URL}/charging-stations`);
                // console.log('response', response)
                setChargingStations(response.data);
            } catch(error){
                console.error('Error fetching charging stations:',error);
                // alert("Error fetching charging stations");
            }
        }
        fetchChargingStation();
    },[]);

  return (
    <div>
        <MapContainer center={[12.971599, 77.594566]} zoom={10} style={{ height: '100vh', width: '100vw' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {chargingStations.map((station) =>(
                <Marker
                key={station.ID}
                position={[station.AddressInfo.Latitude, station.AddressInfo.Longitude]}
                icon={customIcon}
                eventHandlers={{
                    click: () => {
                    setSelectedStation(station);
                    // console.log("Marker clicked!");
                    console.log(selectedStation); // Check if this message appears in the console
                      // Change the background color or apply other styling
                    },
                }}
                />
                
            ))}
            {selectedStation.AddressInfo && (
                <Popup
                position={[selectedStation.AddressInfo.Latitude, selectedStation.AddressInfo.Longitude]}
                onClose={()=> setSelectedStation({})}
                >
                    <div>
                    <h2>{selectedStation.AddressInfo.Title}</h2>
                    <p>{selectedStation.AddressInfo.AddressLine1}</p>
                    </div>
                </Popup>
                // <DetailedView selectedStation={selectedStation} onClose={() => setSelectedStation(null)} />
                
            )}
        </MapContainer>
        
    </div>
  );
}

export default HomePage