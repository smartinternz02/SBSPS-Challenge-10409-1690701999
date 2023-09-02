import React,{ useEffect, useState} from 'react';
import axios from 'axios';
import {MapContainer, TileLayer, Marker, Popup} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import DetailedView from './components/DetailedView';
import ResponsiveAppBar from './components/ResponsiveAppBar';
import 'leaflet-routing-machine';
import L from 'leaflet'
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { Backdrop, Button, CircularProgress, Typography } from '@mui/material';

const FLASK_BACKEND_URL = 'http://localhost:5000';
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25,41], 
  iconAnchor: [12,41]
});

L.Marker.prototype.options.icon = DefaultIcon;

function HomePage() {
    const [chargingStations, setChargingStations] = useState([]);
    const [selectedStation, setSelectedStation] = useState({});
    const [userLocation, setUserLocation] = useState(null);
    const [map, setMap] = useState(null);
    const [open, setOpen] = React.useState(false);
    const [showDetails, setShowDetails] = useState(false);

    
    useEffect(() => {
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setUserLocation({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              });
              console.log(userLocation)
            },
            (error) => {
              if (error.code === error.PERMISSION_DENIED) {
                console.error('User denied geolocation permission.');
                // Display a message to the user guiding them to enable geolocation.
              } else {
                console.error('Error getting user location:', error);
              }
            }
          );
        } else {
          console.error('Geolocation is not supported in this browser.');
        }
      }, []);
      
      
    useEffect(() => {
        setOpen(true)
        setUserLocation({
            lat: 12.9141,
            lng: 74.8560,
          })
        async function fetchChargingStation() {
            try{
                const response = await axios.get(`${FLASK_BACKEND_URL}/charging-stations`);
                // console.log('response', response)
                if(response.status === 200)
                {setOpen(false);}
                setChargingStations(response.data);
            } catch(error){
                console.error('Error fetching charging stations:',error);
                // alert("Error fetching charging stations");
            }
        }
        fetchChargingStation();
    },[]);

    const handleMapClick = () => {
      setShowDetails(false); // Hide the interface when clicking on the map
    };
  
    const handleMarkerClick = (station) => {
      setSelectedStation(station);
      setShowDetails(true); // Show the interface when clicking on a marker
    };

      const handleMapReady = (map) => {
        setMap(map);
      };

      const calculateRoute = (destination) => {
        if (!userLocation) {
          console.error('User location not available.');
          return;
        }
        if (map) {
          map.addControl(
            L.Routing.control({
              waypoints: [
                L.latLng(userLocation.lat, userLocation.lng),
                L.latLng(destination.lat, destination.lng),
              ],
            })
          );
        }
      };

  return (
    
    <div style={{ position: 'relative' }}>
      <ResponsiveAppBar isLoggedIn={true} />
      <div style={{ position: 'relative', zIndex: 0 }}>
        
        <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={open}
      >
    
        <CircularProgress color="inherit" />
      </Backdrop>
      
        <MapContainer center={[12.971599, 77.594566]} 
        zoom={10} 
        style={{ height: '100vh', width: '100vw' , zIndex: 0}} 
        onClick={handleMapClick}
        >
            <TileLayer  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {chargingStations.map((station) =>(
                <Marker
                key={station.ID}
                position={[station.AddressInfo.Latitude, station.AddressInfo.Longitude]}
                eventHandlers={{
                    click: () => {
                      handleMarkerClick(station);
                    },
                }}
                />
                
            ))}
            {/* {showDetails && selectedStation.AddressInfo && (
  <DetailedView
    station={selectedStation}
    onClose={() => setShowDetails(false)}
    calculateRoute={calculateRoute}
  />
)} */}

        </MapContainer>
        {selectedStation.AddressInfo && showDetails && (
          
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: showDetails ? '0' : '-400px', // Slide in/out effect
            width: '400px',
            height: '100%',
            backgroundColor: 'white',
            boxShadow: '-2px 0px 4px rgba(0, 0, 0, 0.1)',
            overflowY: 'auto',
            transition: 'right 0.3s',
            zIndex: 1, // Place it above the map and navbar
          }}
        >
          <div style={{ padding: '20px' }}>
            <Typography variant='h4'margin={1}>{selectedStation.AddressInfo.Title}</Typography>
            <Typography margin={1}>{selectedStation.AddressInfo.AddressLine1}</Typography>
            <Typography margin={1}>{selectedStation.AddressInfo.AddressLine2}</Typography>
            <Typography margin={1}>{selectedStation.AddressInfo.Distance.toFixed(0)} {selectedStation.AddressInfo.DistanceUnit}  </Typography>
            {console.log({selectedStation})}
            {/* <h2>{selectedStation.AddressInfo.Title}</h2> */}
            {/* <p>{selectedStation.AddressInfo.AddressLine1}</p> */}
            <Button
              onClick={() => {
                calculateRoute({
                  lat: selectedStation.AddressInfo.Latitude,
                  lng: selectedStation.AddressInfo.Longitude,
                });
              }}
              variant='outlined'
            >
              Get Direction
            </Button>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}

export default HomePage