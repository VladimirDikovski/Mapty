
"use strict";

// prettier-ignore

const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputCadence = document.querySelector(".form__input--cadence");
const inputElevation = document.querySelector(".form__input--elevation");

class Workout {
  date = new Date();
  id = Date.now() + "".slice(-10);
  // click = 0;

  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance; //in km
    this.duration = duration; // in min
  }

  _clicks() {
    this.click++;
  }

  _SetDesciption() {
    // prettier-ignore

    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }
}

class Running extends Workout {
  type = "running";

  constructor(coords, distance, duration, cadance) {
    super(coords, distance, duration);
    this.cadance = cadance;
    this.calcPace();
    this._SetDesciption();
  }

  calcPace() {
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout {
  type = "cycling";

  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
    this._SetDesciption();
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
    this._getDataLocalStorage();
    form.addEventListener("submit", this._newWorkOut.bind(this));
    inputType.addEventListener("change", this._toggleElevationField);
    containerWorkouts.addEventListener("click", this._moveToWorkOut.bind(this));
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
    this.#workOuts.forEach((data) => this._renderMarker(data));
  }

  _showForm(e) {
    this.#mapEvent = e;
    form.classList.toggle("hidden");
  }

  _newWorkOut(e) {
    //get data from form
    e.preventDefault();
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

      workout = new Running([lat, lng], distance, duration, cadance);
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
      workout = new Cycling([lat, lng], distance, duration, elGain);
    }

    this.#workOuts.push(workout);
    this._renderMarker(workout);
    this._renderHtmlList(workout);
    this._SetDataToLocalStorage();
  }

  _renderMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type === "running" ? "🏃‍♂️" : "🚴‍♀️"} ${workout.description}`
      )
      .openPopup();
    this._clearFilesForm();
    this._showForm();
  }

  _renderHtmlList(workout) {
    let html = `<li class="workout workout--${workout.type}" data-id=${
      workout.id
    }>
          <h2 class="workout__title">${workout.description}</h2>
          <div class="workout__details">
            <span class="workout__icon">${
              workout.type === "running" ? "🏃‍♂️" : "🚴‍♀️"
            }
            </span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>`;

    if (workout.type === "running") {
      html += `<div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadance}</span>
            <span class="workout__unit">spm</span>
          </div>`;
    }

    if (workout.type === "cycling") {
      html += ` <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevationGain}</span>
            <span class="workout__unit">m</span>
          </div>`;
    }

    form.insertAdjacentHTML("afterend", html);
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

  _moveToWorkOut(e) {
    const workOutEl = e.target.closest(".workout");
    if (!workOutEl) return;
    const currentWorkOut = this.#workOuts.find(
      (work) => work.id === workOutEl.dataset.id
    );
    this.#map.setView(currentWorkOut.coords, 13);
    // currentWorkOut._clicks();
  }
  _SetDataToLocalStorage() {
    localStorage.setItem("workouts", JSON.stringify(this.#workOuts));
  }
  _getDataLocalStorage() {
    const data = JSON.parse(localStorage.getItem("workouts"));
    if (!data) return;
    this.#workOuts = data;
    this.#workOuts.forEach((data) => this._renderHtmlList(data));
  }
  _reset() {
    localStorage.removeItem("workouts");
    location.reload();
  }
}

const app = new Application();
