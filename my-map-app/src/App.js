import React, { useEffect, useState } from 'react';
import { Map, Marker, Overlay } from 'pigeon-maps';
import axios from 'axios';

const App = () => {
  const [locations, setLocations] = useState({});
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [currentLocation, setCurrentLocation] = useState([0, 0]);
  const [path, setPath] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [items, setItems] = useState([]);
  const [distances, setDistances] = useState({});

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

  useEffect(() => {
    const generateRandomItems = () => {
      const randomItems = [];
      for (let i = 0; i < 5; i++) {
        const lat = currentLocation[0] + Math.random() * 0.05 - 0.025; // Random latitude within 0.025 degrees around current location
        const lng = currentLocation[1] + Math.random() * 0.05 - 0.025; // Random longitude within 0.025 degrees around current location
        randomItems.push({ id: i, location: [lat, lng] });
      }
      setItems(randomItems);
    };

    if (loggedIn) {
      generateRandomItems();
    }
  }, [loggedIn, currentLocation]);

  useEffect(() => {
    const calculateDistances = () => {
      const distancesMap = {};

      Object.entries(locations).forEach(([user1, loc1]) => {
        Object.entries(locations).forEach(([user2, loc2]) => {
          if (user1 !== user2) {
            const [lat1, lng1] = JSON.parse(loc1);
            const [lat2, lng2] = JSON.parse(loc2);
            const distance = haversineDistance([lat1, lng1], [lat2, lng2]);
            distancesMap[`${user1}-${user2}`] = distance;
          }
        });
      });

      setDistances(distancesMap);
    };

    if (loggedIn) {
      calculateDistances();
    }
  }, [loggedIn, locations]);

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
            const { latitude, longitude } = position.coords;
            const location = [latitude, longitude];
            handleUpdateLocation(location);
            setCurrentLocation(location);
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
      checkItemCollection(location);
    } catch (error) {
      console.error("Error updating location", error);
    }
  };

  const checkItemCollection = (currentLocation) => {
    const collectedItems = items.filter(item => {
      const distance = haversineDistance(item.location, currentLocation);
      return distance < 0.02; // 20 meters threshold for collecting items
    });

    if (collectedItems.length > 0) {
      alert(`You collected ${collectedItems.length} item(s)!`);
      setItems(prevItems => prevItems.filter(item => !collectedItems.includes(item)));
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

    return R * c * 1000; // Distance in meters
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
            {items.map(item => (
              <Marker
                key={item.id}
                width={50}
                anchor={item.location}
                color="blue"
                onClick={() => {
                  alert(`You found an item at ${item.location[0].toFixed(4)}, ${item.location[1].toFixed(4)}!`);
                  setItems(prevItems => prevItems.filter(i => i.id !== item.id));
                }}
              />
            ))}
            <Polyline positions={path} />

            {selectedLocation && selectedLocation.location && (
              <Overlay anchor={selectedLocation.location} offset={[120, 79]}>
                <div style={{ background: 'white', padding: '5px', border: '1px solid black' }}>
                  <strong>{selectedLocation.username}</strong><br />
                  Lat: {selectedLocation.location[0].toFixed(4)}, Lng: {selectedLocation.location[1].toFixed(4)}
                </div>
              </Overlay>
            )}

            <div>
              <h3>Distances:</h3>
              <ul>
                {Object.entries(distances).map(([key, distance]) => (
                  <li key={key}>{`${key}: ${distance.toFixed(2)} meters`}</li>
                ))}
              </ul>
            </div>

          </Map>
        </div>
      )}
    </div>
  );
};

export default App;
