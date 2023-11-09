// importing necessary libraries
import React, { Component } from 'react';
import Modal from 'react-modal';
import './Map.css';

// Defining Map components
class Map extends Component {
  constructor() {
    super();
    // initial components state
    this.state = {
      showModal: false,
      clickedLat: null,
      clickedLng: null,
      airQuality: null,
      directionsService: null,
      directionsRenderer: null,
      travelTime: null,
      timeZone: null,
    };
  }

  componentDidMount() {
    const googleScript = document.createElement('script');
    // Maps API key
    googleScript.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyC1l7im1P6pXs6KDMeYKj8nTZux3OJAnjw`;
    window.document.body.appendChild(googleScript);

    // default map location
    googleScript.addEventListener('load', () => {
      const mapOptions = {
        center: { lat: 44.64059687284279, lng: -63.578466657511996 },
        zoom: 8,
      };
      const map = new window.google.maps.Map(document.getElementById('map'), mapOptions);

      // getting the directions
      const directionsService = new window.google.maps.DirectionsService();
      const directionsRenderer = new window.google.maps.DirectionsRenderer();

      directionsRenderer.setMap(map);

      map.addListener('click', (e) => {
        const clickedLat = e.latLng.lat().toFixed(4);
        const clickedLng = e.latLng.lng().toFixed(4);

        this.setState({
          showModal: true,
          clickedLat: clickedLat,
          clickedLng: clickedLng,
          directionsService: directionsService,
          directionsRenderer: directionsRenderer,
          travelTime: null, // Resets travel time when a new destination is clicked
        });

        this.calculateAndDisplayRoute(map, directionsService, directionsRenderer, clickedLat, clickedLng);

        // Fetching air quality data from AirVisual web application. Available at: https://dashboard.iqair.com/personal/map
        this.fetchAirQualityData(clickedLat, clickedLng);

        // Fetching the time zone data (Another API for time zones from GCP)
        this.fetchTimeZoneData(clickedLat, clickedLng);
      });
    });
  }

  closePopup = () => {
    this.setState({ showModal: false });
  };

  // calculating and dsiplaying the directions
  calculateAndDisplayRoute = (map, directionsService, directionsRenderer, clickedLat, clickedLng) => {
    const origin = new window.google.maps.LatLng(44.64059687284279, -63.578466657511996);
    const destination = new window.google.maps.LatLng(clickedLat, clickedLng);

    directionsService.route(
      {
        origin: origin,
        destination: destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (response, status) => {
        if (status === 'OK') {
          directionsRenderer.setDirections(response);

          // Calculating travel time from source to destination
          const route = response.routes[0];
          let totalDuration = 0;
          route.legs.forEach((leg) => {
            totalDuration += leg.duration.value;
          });
          const travelTime = Math.round(totalDuration / 60);

          this.setState({ travelTime });
        // error message when the data fails to display the directions
        } else {
          window.alert('Directions request failed due to ' + status);
        }
      }
    );
  };

  // air quality data history for destination
  fetchAirQualityData = (lat, lng) => {
    // Using the AirVisual API to fetch air quality data
    const API_KEY = '21e07485-9098-4cf6-99e0-7c6e2e582e08';
    const url = `https://api.airvisual.com/v2/nearest_city?lat=${lat}&lon=${lng}&key=${API_KEY}`;

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        if (data.status === 'success') {
          // gets the air quality state
          this.setState({ airQuality: data.data });
        } else {
          console.error('Failed to fetch air quality data');
        }
      })
      .catch((error) => {
        console.error('Error fetching air quality data', error);
      });
  };


  // time zone of the destination
  fetchTimeZoneData = (lat, lng) => {
    // Use the Google Time Zone API to fetch time zone data
    const API_KEY = 'AIzaSyAKHAYJQoySdQ1IGLijdkey4t0wKG0AJSY';
    const timestamp = Math.floor(Date.now() / 1000);
    const url = `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lng}&timestamp=${timestamp}&key=${API_KEY}`;

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        if (data.status === 'OK') {
          // fetching the data from the local time using Time zone API
          this.setState({ timeZone: data.timeZoneId });
        } else {
          console.error('Failed to fetch time zone data');
        }
      })
      .catch((error) => {
        console.error('Error fetching time zone data', error);
      });
  };

  // Defining color ranges for different AQI levels
  // https://www.airnow.gov/aqi/aqi-basics/
  getAirQualityColor = (aqi) => {
    if (aqi <= 50) {
      return 'green';
    } else if (aqi <= 100) {
      return 'yellow';
    } else if (aqi <= 150) {
      return 'orange';
    } else if (aqi <= 200) {
      return 'red';
    } else {
      return 'purple';
    }
  };

  render() {
    const airQualityColor = this.state.airQuality ? this.getAirQualityColor(this.state.airQuality.current.pollution.aqius) : 'gray';

    const travelTime = this.state.travelTime;
    let travelTimeText = '';

    // displaying an hour and minute time for destination
    if (travelTime !== null) {
      if (travelTime >= 60) {
        const hours = Math.floor(travelTime / 60);
        const minutes = travelTime % 60;
        travelTimeText = `${hours} hr ${minutes} min`;
      } else {
        travelTimeText = `${travelTime} min`;
      }
    }

    return (
      // web visualization
      <div id="map" style={{ width: '100%', height: '100vh' }}>
        <Modal
          isOpen={this.state.showModal}
          onRequestClose={this.closePopup}
          className="custom-modal"
        >
          {/* Displaying information about the 
            geographical coordinates, 
            air quality, 
            location, 
            scale, 
            travel time and time zones*/}
          <div>
            <h4>Destination Map Coordinates</h4>
            <p>Latitude: {this.state.clickedLat}</p>
            <p>Longitude: {this.state.clickedLng}</p>
            <h4>Air Quality</h4>
            {this.state.airQuality && (
              <div>
                <p>Location: {this.state.airQuality.city}</p>
                <p>AQI: {this.state.airQuality.current.pollution.aqius}</p>
                <div
                  style={{
                    backgroundColor: airQualityColor,
                    width: '50px',
                    height: '20px',
                    borderRadius: '5px',
                  }}
                />
              </div>
            )}
            <h4>Time</h4>
            {travelTimeText && (
              <p>Travel Time: {travelTimeText} (In car)</p>
            )}
            {this.state.timeZone && (
              <p>Time Zone: {this.state.timeZone}</p>
            )}
          </div>
        </Modal>
      </div>
    );
  }
}

export default Map;
