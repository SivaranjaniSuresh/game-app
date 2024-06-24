import React, { useEffect, useState } from 'react';
import { Map, Marker } from 'pigeon-maps';
import axios from 'axios';

const App = () => {
  const [locations, setLocations] = useState({});
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [currentLocation, setCurrentLocation] = useState([0, 0]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await axios.get('http://localhost:5000/get_locations');
        setLocations(response.data);
      } catch (error) {
        console.error("Error fetching locations", error);
      }
    };

    if (loggedIn) {
      fetchLocations();
      const interval = setInterval(fetchLocations, 3000);
      return () => clearInterval(interval);
    }
  }, [loggedIn]);

  const handleRegister = async () => {
    try {
      await axios.post('http://localhost:5000/register', { username, password });
      alert('Registration successful!');
    } catch (error) {
      console.error("Error during registration", error);
    }
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:5000/login', { username, password });
      if (response.data.status === 'success') {
        setLoggedIn(true);
      } else {
        alert('Login failed!');
      }
    } catch (error) {
      console.error("Error during login", error);
    }
  };

  const handleUpdateLocation = async (location) => {
    try {
      await axios.post('http://localhost:5000/update_location', { username, location });
      setCurrentLocation(location);
    } catch (error) {
      console.error("Error updating location", error);
    }
  };

  return (
    <div>
      {!loggedIn ? (
        <div>
          <input type="text" placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
          <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
          <button onClick={handleRegister}>Register</button>
          <button onClick={handleLogin}>Login</button>
        </div>
      ) : (
        <div>
          <h2>Map</h2>
          <Map
            height={600}
            defaultCenter={[50.879, 4.6997]}
            defaultZoom={11}
            onClick={({ latLng }) => handleUpdateLocation(latLng)}
          >
            {Object.entries(locations).map(([user, loc]) => {
              const [lat, lng] = JSON.parse(loc);
              return <Marker key={user} width={50} anchor={[lat, lng]} />;
            })}
            <Marker width={50} anchor={currentLocation} />
          </Map>
        </div>
      )}
    </div>
  );
};

export default App;
