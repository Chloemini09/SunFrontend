<template>
  <div class="clinic-view" v-keyboard-navigation>
     <div class="sidebar">
       <div class="search-container">
         <input
           ref="searchInput"
           v-model="searchQuery"
           @input="searchAddress"
           placeholder="Enter Melbourne address"
           class="search-input"
         />
         <ul v-if="suggestions.length" class="suggestions">
           <li
             v-for="(suggestion, index) in suggestions"
             :key="suggestion.id"
             :ref="el => { if (el) suggestionItems[index] = el }"
             @click="selectAddress(suggestion)"
             class="suggestion-item"
           >
             {{ suggestion.place_name }}
           </li>
         </ul>
       </div>
       <button ref="backBtn" class="back-btn" @click="goBack">← Back</button>
       <div v-if="nearbyClinics.length" class="clinic-list">
         <h3>Nearby Clinics</h3>
         <ul>
           <li
             v-for="(clinic, index) in nearbyClinics"
             :key="clinic.id"
             :ref="el => { if (el) clinicItems[index] = el }"
             @click="showRoute(clinic)"
             class="clinic-item"
           >
             {{ clinic.text }}
           </li>
         </ul>
       </div>
       <div v-if="selectedClinic" class="route-info">
         <h2 class="route-info-title">Route Information</h2>
         <div class="route-options">
           <button
             v-for="(mode, index) in ['Driving', 'Walking', 'Cycling']"
             :key="mode"
             :ref="el => { if (el) modeButtons[index] = el }"
             @click="getRoute(mode.toLowerCase())"
             :class="['route-button', { active: routeInfo && routeInfo.mode === mode }]"
           >
             <i :class="getIconClass(mode)"></i>
             {{ mode }}
           </button>
         </div>
         <div v-if="routeInfo" class="route-summary">
           <div class="summary-item">
             <i class="fas fa-road"></i>
             <span>{{ routeInfo.distance }} km</span>
           </div>
           <div class="summary-item">
             <i class="fas fa-clock"></i>
             <span>{{ routeInfo.duration }} min</span>
           </div>
         </div>
         <div v-if="routeSteps.length" class="route-steps">
           <h3>Directions:</h3>
           <ol>
             <li v-for="(step, index) in routeSteps" :key="index" class="route-step">
               <span class="step-number">{{ index + 1 }}</span>
               <span class="step-instruction">{{ step.maneuver.instruction }}</span>
             </li>
           </ol>
         </div>
       </div>
     </div>
     <div id="map" ref="mapContainer" class="map-container"></div>
   </div>
 </template>

<script>
import mapboxgl from 'mapbox-gl';
import axios from 'axios';

mapboxgl.accessToken = 'pk.eyJ1IjoiY2hsb2V5dWUiLCJhIjoiY20xejJpb3BhMDJndTJrcHpwaG9ocHE0NyJ9.jHaWplmk0Y_XWTLCtuAm4A';

import { useRouter } from 'vue-router'

export default {
  name: 'ClinicView',
  data() {
    return {
      map: null,
      searchQuery: '',
      suggestions: [],
      nearbyClinics: [],
      selectedClinic: null,
      routeSteps: [],
      userLocation: null,
      routeInfo: null,
      suggestionItems: [],
      clinicItems: [],
      modeButtons: []
    };
  },
  mounted() {
    this.initializeMap();
    this.$nextTick(() => {
      if (this.$refs.searchInput) {
        this.$refs.searchInput.focus()
      }
    })
  },
  methods: {
    initializeMap() {
      this.map = new mapboxgl.Map({
        container: this.$refs.mapContainer,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [144.9631, -37.8136],
        zoom: 12
      });

      this.map.addControl(new mapboxgl.NavigationControl());
    },
    goBack(){
      this.$router.push('/home');
    },
    async searchAddress() {
      if (this.searchQuery.length > 2) {
        try {
          const response = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(this.searchQuery)}.json`, {
            params: {
              access_token: mapboxgl.accessToken,
              country: 'AU',
              proximity: '144.9631,-37.8136'
            }
          });
          this.suggestions = response.data.features;
        } catch (error) {
          console.error('Error searching for address:', error);
        }
      } else {
        this.suggestions = [];
      }
    },
    selectAddress(address) {
      this.searchQuery = address.place_name;
      this.suggestions = [];
      this.userLocation = address.center;
      this.map.flyTo({
        center: address.center,
        zoom: 14
      });
      this.findNearbyClinics(address.center);
    },
    async findNearbyClinics(center) {
      try {
        const response = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/clinic.json`, {
          params: {
            proximity: `${center[0]},${center[1]}`,
            access_token: mapboxgl.accessToken,
            country: 'AU'
          }
        });
        this.nearbyClinics = response.data.features;
      } catch (error) {
        console.error('Error finding nearby clinics:', error);
      }
    },
    showRoute(clinic) {
      this.selectedClinic = clinic;
      this.getRoute('driving');
    },
    getIconClass(mode) {
      switch (mode) {
        case 'Driving':
          return 'fas fa-car';
        case 'Walking':
          return 'fas fa-walking';
        case 'Cycling':
          return 'fas fa-bicycle';
        default:
          return '';
      }
    },
    async getRoute(mode) {
      const start = this.userLocation.join(',');
      const end = this.selectedClinic.center.join(',');
      try {
        const response = await axios.get(`https://api.mapbox.com/directions/v5/mapbox/${mode}/${start};${end}`, {
          params: {
            steps: true,
            geometries: 'geojson',
            access_token: mapboxgl.accessToken
          }
        });
        const data = response.data;
        this.routeSteps = data.routes[0].legs[0].steps;
        this.routeInfo = {
          mode: mode.charAt(0).toUpperCase() + mode.slice(1),
          distance: (data.routes[0].distance / 1000).toFixed(2),
          duration: Math.round(data.routes[0].duration / 60)
        };

        if (this.map.getSource('route')) {
          this.map.removeLayer('route');
          this.map.removeSource('route');
        }

        this.map.addLayer({
          id: 'route',
          type: 'line',
          source: {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: data.routes[0].geometry
            }
          },
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#3887be',
            'line-width': 5,
            'line-opacity': 0.75
          }
        });
      } catch (error) {
        console.error('Error getting route:', error);
      }
    },
  }
};
</script>

<style scoped>
.clinic-view {
  display: flex;
  height: 100vh;
  font-family: Arial, sans-serif;
  color: #333;
}

.sidebar {
  width: 350px;
  padding: 20px;
  background-color: #f8f9fa;
  overflow-y: auto;
  box-shadow: 2px 0 10px rgba(0,0,0,0.1);
}
.back-btn {
  background-color: transparent;
  border: none;
  font-size: 1.2rem;
  color: #4caf50;
  cursor: pointer;
  margin-top: 20px;
  margin-bottom: 20px;
}
  
.back-btn:hover {
  text-decoration: underline;
}

.map-container {
  flex-grow: 1;
}

.search-input {
  width: 100%;
  padding: 12px;
  margin-bottom: 15px;
  border: 1px solid #ced4da;
  border-radius: 25px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
}

.suggestions {
  list-style-type: none;
  padding: 0;
  margin: 0;
  background: white;
  border: 1px solid #ced4da;
  border-radius: 4px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.suggestion-item {
  padding: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.suggestion-item:hover {
  background-color: #f1f3f5;
}

.clinic-item {
  padding: 12px;
  cursor: pointer;
  border-bottom: 1px solid #dee2e6;
  transition: all 0.2s;
}

.clinic-item:hover {
  background-color: #e9ecef;
  transform: translateX(5px);
}

.route-info {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-top: 20px;
}

.route-info-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
}

.route-options {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.route-button {
  flex: 1;
  padding: 10px;
  border: none;
  background-color: #f0f0f0;
  color: #333;
  font-size: 16px;
  font-weight: 500;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 0 5px;
}

.route-button:hover, .route-button.active {
  background-color: #007bff;
  color: white;
}

.route-button i {
  margin-right: 5px;
}

.route-summary {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
}

.summary-item {
  display: flex;
  align-items: center;
  font-size: 18px;
}

.summary-item i {
  margin-right: 10px;
  color: #007bff;
}

.route-steps {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
}

.route-steps h3 {
  font-size: 20px;
  margin-bottom: 15px;
  color: #333;
}

.route-step {
  display: flex;
  align-items: flex-start;
  margin-bottom: 15px;
}

.step-number {
  background-color: #007bff;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  margin-right: 10px;
  flex-shrink: 0;
}

.step-instruction {
  font-size: 16px;
  line-height: 1.4;
}
</style>