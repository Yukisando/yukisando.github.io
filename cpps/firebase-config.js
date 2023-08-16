// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyArDLmALgw0rRz_qnW7Uzh3StVkd_Y9CQo",
  authDomain:
    "1004309297211-l75l27vpufsvheg8lsgsr70ipgeev1ej.apps.googleusercontent.com",
  databaseURL:
    "https://cpps-bf80d-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "cpps-bf80d",
  storageBucket: "cpps-bf80d.appspot.com",
  messagingSenderId: "portal",
  appId: "1:1004309297211:android:9ba201391fbd80fc7e441e",
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();
