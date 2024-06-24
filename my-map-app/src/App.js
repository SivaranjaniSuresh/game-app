import React, { useEffect, useState } from 'react';
import { Map, Marker, Overlay } from 'pigeon-maps';
import axios from 'axios';

const App = () => {
  const [locations, setLocations] = useState({});
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [currentLocation, setCurrentLocation] = useState([0, 0]);
  const [speed, setSpeed] = useState(0);
  const [path, setPath] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await axios.get('http://localhost:5000/get_locations');
        setLocations(response.data);

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

        const watchId = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude, speed } = position.coords;
            const location = [latitude, longitude];
            handleUpdateLocation(location);
            setCurrentLocation(location);
            setSpeed(speed);
            setPath(prevPath => [...prevPath, location]);
          },
          (error) => {
            console.error("Error getting current position", error);
          }
        );

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

  const haversineDistance = ([lat1, lon1], [lat2, lon2]) => {
    const toRad = (x) => (x * Math.PI) / 180;
    const R = 6371;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const calculateDisplacements = () => {
    const users = Object.entries(locations);
    const distances = [];

    for (let i = 0; i < users.length; i++) {
      for (let j = i + 1; j < users.length; j++) {
        const user1 = users[i];
        const user2 = users[j];
        const loc1 = JSON.parse(user1[1]);
        const loc2 = JSON.parse(user2[1]);
        const distance = haversineDistance(loc1, loc2);
        distances.push({
          users: [user1[0], user2[0]],
          distance
        });
      }
    }

    return distances;
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
              try {
                const [lat, lng] = JSON.parse(loc);
                return (
                  <Marker
                    key={user}
                    width={50}
                    anchor={[lat, lng]}
                    onClick={() => setSelectedLocation({ username: user, location: [lat, lng] })}
                  />
                );
              } catch (e) {
                console.error(`Error parsing location for user ${user}:`, loc, e);
                return null;
              }
            })}
            <Marker width={50} anchor={currentLocation} onClick={() => setSelectedLocation({ username, location: currentLocation })} />
            <Polyline positions={path} />
            {selectedLocation && (
              <Overlay anchor={selectedLocation.location} offset={[120, 79]}>
                <div style={{ background: 'white', padding: '5px', border: '1px solid black' }}>
                  <strong>{selectedLocation.username}</strong><br />
                  Lat: {selectedLocation.location[0].toFixed(4)}, Lng: {selectedLocation.location[1].toFixed(4)}
                </div>
              </Overlay>
            )}
          </Map>
          <div>
            <strong>Current Speed:</strong> {speed} m/s
          </div>
          <div>
            <h3>Displacements</h3>
            <ul>
              {calculateDisplacements().map((dist, index) => (
                <li key={index}>
                  {dist.users[0]} to {dist.users[1]}: {dist.distance.toFixed(2)} km
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
