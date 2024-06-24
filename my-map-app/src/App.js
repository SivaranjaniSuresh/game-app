import React, { useEffect, useState } from 'react';
import { Map, Marker, Overlay } from 'pigeon-maps';
import axios from 'axios';

const App = () => {
  const [locations, setLocations] = useState({});
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [currentLocation, setCurrentLocation] = useState([0, 0]);
  const [speed, setSpeed] = useState(0); // State to hold current speed
  const [path, setPath] = useState([]); // State to hold path (list of locations)

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await axios.get('http://localhost:5000/get_locations');
        setLocations(response.data);

        // Update current location if logged in
        if (loggedIn) {
          const userLocation = response.data[username];
          if (userLocation) {
            setCurrentLocation(JSON.parse(userLocation));
          }
        }
      } catch (error) {
        console.error("Error fetching locations", error);
      }
    };

    if (loggedIn) {
      fetchLocations();
      const interval = setInterval(fetchLocations, 3000);
      return () => clearInterval(interval);
    }
  }, [loggedIn, username]);

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

        // Watch position changes after login
        const watchId = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude, speed } = position.coords;
            const location = [latitude, longitude];
            handleUpdateLocation(location); // Update backend with current location
            setCurrentLocation(location);   // Update frontend state with current location
            setSpeed(speed);                // Update frontend state with current speed
            setPath(prevPath => [...prevPath, location]); // Append current location to path
          },
          (error) => {
            console.error("Error getting current position", error);
          }
        );

        // Cleanup function to clear watchPosition when component unmounts or on logout
        return () => navigator.geolocation.clearWatch(watchId);
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
    } catch (error) {
      console.error("Error updating location", error);
    }
  };

  const Polyline = ({ positions }) => {
    if (positions.length < 2) return null;

    const lines = positions.slice(1).map((position, index) => {
      const [lat1, lng1] = positions[index];
      const [lat2, lng2] = position;

      return (
        <Overlay key={index} anchor={[lat1, lng1]} offset={[0, 0]}>
          <svg width={500} height={500} viewBox="0 0 500 500" style={{ position: 'absolute', top: 0, left: 0 }}>
            <line
              x1="50%"
              y1="50%"
              x2={`${50 + (lng2 - lng1) * 100}%`}
              y2={`${50 + (lat2 - lat1) * 100}%`}
              stroke="red"
              strokeWidth="2"
            />
          </svg>
        </Overlay>
      );
    });

    return <>{lines}</>;
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
            defaultCenter={currentLocation}
            defaultZoom={11}
          >
            {Object.entries(locations).map(([user, loc]) => {
              const [lat, lng] = JSON.parse(loc);
              return (
                <Marker key={user} width={50} anchor={[lat, lng]} />
              );
            })}
            <Marker width={50} anchor={currentLocation} />
            <Polyline positions={path} />
          </Map>
          <div>
            <strong>Current Speed:</strong> {speed} m/s
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
