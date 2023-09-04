import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// import DetailedView from './components/DetailedView';
import ResponsiveAppBar from './components/ResponsiveAppBar';
import 'leaflet-routing-machine';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { Backdrop, Button, CircularProgress, FormControl, FormLabel, Grid, InputLabel, MenuItem, Paper, Select, Typography } from '@mui/material';

const FLASK_BACKEND_URL = 'http://localhost:5000';
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

function HomePage() {
  const [chargingStations, setChargingStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState({});
  const [userLocation, setUserLocation] = useState(null);
  const [map, setMap] = useState(null);
  const [open, setOpen] = React.useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [countries, setCountries] = useState([]);
  const [usage, setUsage] = useState([]);
  const [ConnectionType,setConnectionType] = useState([]);
  const [filterCriteria, setFilterCriteria] = useState({
    Country: 'All',
    Usage: 'All',
    Status: 'All',
    ConnectionType: 'All',
    MaxResults: 10,
  });

  // const dummyFilterOptions = {
  //   Countries: ['USA', 'Canada', 'UK', 'Germany', 'France'],
  //   Usage: ['Public', 'Private'],
  //   Status: ['Operational', 'Under Construction', 'Unavailable'],
  //   ConnectionType: ['Type 2', 'CHAdeMO', 'CCS'],
  // };
  // const [filterOptions, setFilterOptions] = useState(dummyFilterOptions);
  const [filterOptions, setFilterOptions] = useState({
    Countries: [],
    Usage: [],
    // Status: [],
    ConnectionType: [],
  });


  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            console.error('User denied geolocation permission.');
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
    setOpen(true);
    async function fetchChargingStation() {
      try {
        const response = await axios.get(`${FLASK_BACKEND_URL}/charging-stations`);
        if (response.status === 200) {
          setOpen(false);
        }
        setChargingStations(response.data);
      } catch (error) {
        console.error('Error fetching charging stations:', error);
      }
    }
    fetchChargingStation();
  }, []);

  useEffect(() => {
    async function fetchCountries() {
      try {
        const response = await axios.get(`${FLASK_BACKEND_URL}/countries`);
        if (response.status === 200) {
          const options = response.data;
          setCountries(options);
        }
      } catch (error) {
        console.error('Error fetching filter options:', error);
      }
    }
    fetchCountries();
  }, []);

  useEffect(() => {
    async function fetchUsage() {
      try {
        const response = await axios.get(`${FLASK_BACKEND_URL}/usage-types`);
        if (response.status === 200) {
          const options = response.data;
          setUsage(options);
        }
      } catch (error) {
        console.error('Error fetching filter options:', error);
      }
    }
    fetchUsage();
  }, []);

  useEffect(() => {
    async function fetchConnectionType() {
      try {
        const response = await axios.get(`${FLASK_BACKEND_URL}/connection-types`);
        if (response.status === 200) {
          const options = response.data;
          setConnectionType(options);
        }
      } catch (error) {
        console.error('Error fetching filter options:', error);
      }
    }
    fetchConnectionType();
  }, []);

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

  const handleNavigationClick = (destination) => {
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

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilterCriteria((prevCriteria) => ({
      ...prevCriteria,
      [name]: value,
    }));
  };

  // Function to filter charging stations based on criteria
  const filterChargingStations = () => {
    let filteredStations = chargingStations;

    if (filterCriteria.Country !== 'All') {
      filteredStations = filteredStations.filter(
        (station) => station.AddressInfo.CountryID === filterCriteria.Country
      );
    }

    if (filterCriteria.Usage !== 'All') {
      filteredStations = filteredStations.filter(
        (station) => station.Usage === filterCriteria.Usage
      );
    }

    if (filterCriteria.Status !== 'All') {
      filteredStations = filteredStations.filter(
        (station) => station.Status === filterCriteria.Status
      );
    }

    if (filterCriteria.ConnectionType !== 'All') {
      filteredStations = filteredStations.filter(
        (station) => station.ConnectionType === filterCriteria.ConnectionType
      );
    }

    // Apply MaxResults filter
    // filteredStations = filteredStations.slice(0, filterCriteria.MaxResults);

    return filteredStations;
  };

  return (
    <div style={{ position: 'relative', height: '100vh' }}>
      <ResponsiveAppBar isLoggedIn={true} />

      <Grid container spacing={2} padding={'16px'} >
        <Grid item xs={12} sm={6} md={3} >
          <FormControl fullWidth size='small'>
          <InputLabel>Country</InputLabel>
            {/* <FormLabel shrink>Country</FormLabel> */}
            <Select
              name="Country"
              value={filterCriteria.Country}
              label="Country"
              onChange={handleFilterChange}
              
            >
              <MenuItem value="All">All</MenuItem>
              {countries.map((country) => (
                
                <MenuItem key={country.ID} value={country.ID}>
                  {country.TITLE}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size='small'>
            <InputLabel shrink>Usage</InputLabel>
            <Select
              name="Usage"
              label="Usage"
              value={filterCriteria.Usage}
              onChange={handleFilterChange}
            >
              <MenuItem value="All">All</MenuItem>
              {usage.map((usage) => (
                <MenuItem key={usage.ID} value={usage.TITLE}>
                  {usage.TITLE}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size='small'>
            <InputLabel shrink>Status</InputLabel>
            <Select
              name="Status"
              label="Status"
              value={filterCriteria.Status}
              onChange={handleFilterChange}
            >
              <MenuItem value="All">All</MenuItem>
              {/* {filterOptions.Status.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))} */}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size='small'>
            <InputLabel shrink>Connection Type</InputLabel>
            <Select
              name="ConnectionType"
              label="Connection Type"
              value={filterCriteria.ConnectionType}
              onChange={handleFilterChange}
            >
              <MenuItem value="All">All</MenuItem>
              {ConnectionType.map((type) => (
                <MenuItem key={type.ID} value={type.TITLE}>
                  {type.TITLE}
                  {/* {console.log(type.Title)} */}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>


      {/* <div style={{width:'auto'}}>
        <FormControl>
          <FormLabel>Filter Criteria</FormLabel>
          <Select
            value={filterCriteria}
            onChange={handleFilterChange}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="fast">Fast Charging</MenuItem>
            <MenuItem value="medium">Medium Charging</MenuItem>
          </Select>
        </FormControl>
      </div> */}
      <div style={{ position: 'relative', zIndex: 0, 
      height: 'calc(100vh - 145px)', 
      overflow: 'hidden' }}>
        <Backdrop
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={open}
        >
          <CircularProgress color="inherit" />
        </Backdrop>

        <MapContainer
          center={[12.971599, 77.594566]}
          zoom={10}
          style={{ height: '100%', width: '100%' }}
          onClick={handleMapClick}
          
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {/* Render charging stations based on filterChargingStations() */}
        {filterChargingStations().map((station) => (
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
          {/* {chargingStations.map((station) => (
            <Marker
              key={station.ID}
              position={[station.AddressInfo.Latitude, station.AddressInfo.Longitude]}
              eventHandlers={{
                click: () => {
                  handleMarkerClick(station);
                },
              }}
            />
          ))} */}
        </MapContainer>
      </div>
      {selectedStation.AddressInfo && showDetails && (
          <div
            style={{
              position: 'absolute',
              top: 141,
              right: '0',
              width: '400px',
              height: 'calc(100vh - 145px)', // Adjusted to fit within screen
              backgroundColor: 'white',
              boxShadow: '-2px 0px 4px rgba(0, 0, 0, 0.1)',
              overflowY: 'auto',
              transition: 'right 0.3s',
              zIndex: 1,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                onClick={() => {
                  setShowDetails(false); // Close the card
                }}
                variant='text'
              >
                Close
              </Button>
            </div>
             {/* Location Details Card */}
             <Typography margin={'16px'} variant='h4'>{selectedStation.AddressInfo.Title}</Typography>
             <Paper elevation={3} style={{ margin: '16px', padding: '10px' }}>
    <Typography variant="h6" margin={1}>
      Location Details
    </Typography>
    <Typography variant='body1' margin={1}>Nearest Address :</Typography>
    <Typography marginLeft={2} variant='body2'>{selectedStation.AddressInfo.AddressLine1}, {selectedStation.AddressInfo.AddressLine2}</Typography>
    <Typography marginLeft={2} variant='body2'>{selectedStation.AddressInfo.StateOrProvince}</Typography>
    
    {filterOptions.Countries.map((country) => (

      country.ID === selectedStation.AddressInfo.CountryID ? (
        <Typography marginLeft={2} variant='body2' key={country.ID}>
          {country.TITLE}
        </Typography>
      ) : null

    ))}
    <Typography margin={2} variant='body2'>Distance : 
      {selectedStation.AddressInfo.Distance.toFixed(0)} km
    </Typography>
    <Button
              onClick={() => {
                handleNavigationClick({
                  lat: selectedStation.AddressInfo.Latitude,
                  lng: selectedStation.AddressInfo.Longitude,
                });
              }}
              variant="outlined"
            >
              Navigate
            </Button>
  </Paper>

  {/* Equipment Details Card */}
  <Paper elevation={3} style={{ margin: '16px', padding: '20px' }}>
    <Typography variant="h6" margin={1}>
      Equipment Details
    </Typography>
    {/* Include equipment details here */}
    {/* {console.log(selectedStation)} */}
  </Paper>

  {/* Usage Restrictions Card */}
  <Paper elevation={3} style={{ margin: '16px', padding: '20px' }}>
    <Typography variant="h6" margin={1}>
      Usage Restrictions
    </Typography>
    {filterOptions.Usage.map((usage) => (
usage.ID === selectedStation.UsageTypeID ? (
<>
  <Typography marginLeft={2} variant='body2' key={usage.ID}>
    Usage Type: 
    {/* {console.log(usage.TITLE)} */}
    {usage.TITLE}
    <Typography variant='body2'>Pay At Location :
    {usage.ISPAYATLOCATION===true ? (
    "Yes"
  ):" No"}
  </Typography>
  <Typography variant='body2'>Membership Required :
    {usage.ISMEMBERSHIPREQUIRED===true ? (
    "Yes"
  ):" No"}
  </Typography>
  <Typography variant='body2'>Access Key Required :
    {usage.ISACCESSKEYREQUIRED===true ? (
    "Yes"
  ):" No"}
  </Typography>
  </Typography>
  
  </>
) : null

))}
  </Paper>
          </div>
        )}
    </div>
    
  );
}

export default HomePage;