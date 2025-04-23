
"use strict";

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputCadence = document.querySelector(".form__input--cadence");
const inputElevation = document.querySelector(".form__input--elevation");

class Workout {
  date = new Date();
  id = Date.now() + " ".slice(-10);

  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance; //in km
    this.duration = duration; // in min
  }
}

class Running extends Workout {
  constructor(coords, distance, duration, cadance) {
    super(distance, duration, coords);
    this.cadance = cadance;
    this.calcPace();
  }

  calcPace() {
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout {
  constructor(coords, distance, duration, elevationGain) {
    super(distance, duration, coords);
    this.elevationGain = elevationGain;
    this.calcSpeed();
  }

  calcSpeed() {
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

class Application {
  #map;
  #mapEvent;
  #workOuts = [];

  constructor() {
    this._getPosition();
    form.addEventListener("submit", this._newWorkOut.bind(this));
    inputType.addEventListener("change", this._toggleElevationField);
  }

  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert("Could not get your possition");
        }
      );
    }
  }

  _loadMap(possition) {
    const latitude = possition.coords.latitude;
    const longitude = possition.coords.longitude;
    const cordinates = [latitude, longitude];
    this.#map = L.map("map").setView(cordinates, 13);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.fr/hot/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on("click", this._showForm.bind(this));
  }

  _showForm(e) {
    this.#mapEvent = e;
    form.classList.remove("hidden");
  }

  _newWorkOut(e) {
    //get data from form

    const isValidNumber = (...inputs) =>
      inputs.every((inp) => Number.isFinite(inp));

    const isPossitiveNumber = (...inputs) => inputs.every((inp) => inp > 0);

    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    let workout;
    const { lat, lng } = this.#mapEvent.latlng;

    //if workout is running create running object
    if (type === "running") {
      //check if data is valid
      const cadance = +inputCadence.value;
      if (!isValidNumber(distance, duration, cadance)) {
        return alert("Should be a number");
      }
      if (!isPossitiveNumber(distance, duration, cadance)) {
        return alert("Should be possitive number");
      }

      workout = new Running([lat, , lng], distance, duration, cadance);
    }

    //if workout is cycling create cycling object
    if (type === "cycling") {
      const elGain = +inputElevation.value;
      if (!isValidNumber(distance, duration, elGain)) {
        return alert("Should be a number");
      }
      if (!isPossitiveNumber(distance, duration)) {
        return alert("Should be possitive number");
      }
      workout = new Cycling([lat, , lng], distance, duration, elGain);
    }

    this.#workOuts.push(workout);
    console.log(this.#workOuts);

    //check if data is valid

    e.preventDefault();

    L.marker([lat, lng])
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: "running-popup",
        })
      )
      .setPopupContent("Workout")
      .openPopup();
    this._clearFilesForm();
  }

  _clearFilesForm() {
    inputDistance.value = "";
    inputDuration.value = "";
    inputCadence.value = "";
    inputElevation.value = "";
  }
  _toggleElevationField() {
    inputElevation.closest(".form__row").classList.toggle("form__row--hidden");
    inputCadence.closest(".form__row").classList.toggle("form__row--hidden");
  }
}

const app = new Application();
