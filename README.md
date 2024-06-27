# Treasure Hunt App

This project is a full-stack location tracking application built using React for the frontend and Flask for the backend. The app allows users to register, login, update their location, collect treasures, and view a leaderboard of collected treasures.

## App Links

- Video: 
- PPT: https://northeastern-my.sharepoint.com/:p:/g/personal/patel_hinal_northeastern_edu/EcBRpXYYVpdOhVmJMsbP9WQBnzhUise8Bi1mNMVv0eoMJg?e=XHh7hO

## Features

- **User Registration and Login:** Users can create an account and log in to the app.
- **Location Tracking:** The app updates the user's location in real-time.
- **Item Collection:** Users can collect items randomly generated around their location.
- **Distance Calculation:** The app calculates and displays distances between users.
- **Leaderboard:** Displays the ranking of users based on the number of items collected.

## Technologies Used

### Frontend
- React
- Pigeon Maps
- Axios

### Backend
- Flask
- Flask-CORS
- Flask-Bcrypt
- Redis

## Setup Instructions

### Prerequisites

- Node.js
- Python 3.x
- Redis

### Frontend Setup

1. Navigate to the frontend directory:
    ```bash
    cd frontend
    ```

2. Install the dependencies:
    ```bash
    npm install
    ```

3. Start the React app:
    ```bash
    npm start
    ```

### Backend Setup

1. Navigate to the backend directory:
    ```bash
    cd backend
    ```

2. Create a virtual environment and activate it:
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows use `venv\Scripts\activate`
    ```

3. Install the dependencies:
    ```bash
    pip install -r requirements.txt
    ```

4. Start the Flask server:
    ```bash
    python backend.py
    ```

## License

This project is licensed under the MIT License.

