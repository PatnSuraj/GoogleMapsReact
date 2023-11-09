This is a React component named Map that provides an interactive map interface with the following features:

* When the component mounts, it loads the Google Maps JavaScript API and initializes a map centered at a specific location.

* The map allows users to click on a destination point, triggering the display of a modal pop-up with information about the clicked location, including its coordinates (latitude and longitude).

* The component calculates and displays the driving route and travel time from a fixed starting point to the clicked destination using Google Maps Directions Service.

* It fetches air quality data for the clicked location using the AirVisual API, displaying the city name, Air Quality Index (AQI), and a color-coded indicator of air quality.

* The component also retrieves time zone data for the clicked location from the Google Time Zone API, showing the time zone identifier.

* It defines color ranges for different AQI levels, displaying different colors based on the AQI value.

* Travel time is displayed in both hours and minutes format, and the modal pop-up is styled with a custom design.
