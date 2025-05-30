// 🔑 TMDb API Key
const API_KEY = '8b127865f52e616a7772337e4ef916f6';

// 🟦 Firebase Config
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const languageMap = {
  en: "English",
  hi: "Hindi",
  ja: "Japanese",
  ko: "Korean",
  fr: "French",
  es: "Spanish",
  zh: "Chinese",
  de: "German",
  ru: "Russian",
  it: "Italian",
  // Add more as needed
};

// 🟡 Get Genre List on Load
window.onload = async function () {
  const response = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}&language=en-US`);
  const data = await response.json();
  const select = document.getElementById("genreSelect");

  data.genres.forEach(genre => {
    const option = document.createElement("option");
    option.value = genre.id;
    option.textContent = genre.name;
    select.appendChild(option);
  });
};

// 🔍 Search Movies by Genre
async function searchMovies() {
  const genreId = document.getElementById("genreSelect").value;
  const container = document.getElementById("moviesContainer");
  container.innerHTML = '';

  if (!genreId) {
    alert("Please select a genre.");
    return;
  }

  const url = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=${genreId}`;
  const response = await fetch(url);
  const data = await response.json();

  data.results.forEach(movie => {
    const card = document.createElement("div");
    card.className = "movie-card";
    card.style.cursor = "pointer";

    const language = languageMap[movie.original_language] || movie.original_language;

    card.innerHTML = `
      <img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" alt="${movie.title}" />
      <h4>${movie.title}</h4>
      <p><strong>Release:</strong> ${movie.release_date}</p>
      <p><strong>Language:</strong> ${language}</p>
      <button class="watchlist-btn">Add to Watchlist</button>
    `;

    // ✅ Redirect to movie.html on card click
    card.addEventListener("click", (event) => {
      if (!event.target.classList.contains("watchlist-btn")) {
        console.log("Navigating to movie page:", movie.id);
        window.location.href = `movie.html?id=${movie.id}`;
      }
    });

    // ✅ Add to Watchlist button
    const watchlistBtn = card.querySelector(".watchlist-btn");
    watchlistBtn.addEventListener("click", (event) => {
      event.stopPropagation(); // ⛔ Prevent card click
      console.log("Clicked watchlist for:", movie.title);
      addToWatchlist(movie);
    });

    container.appendChild(card);
  });
}

// ➕ Add to Firebase Watchlist
function addToWatchlist(movie) {
  const userId = "guest_user"; // replace later with logged-in user
  const selectedList = document.getElementById("watchlistSelect")?.value || "Default";

  const movieData = {
    id: movie.id,
    title: movie.title,
    poster: movie.poster_path,
    release_date: movie.release_date,
    language: movie.original_language
  };

  const userDoc = db.collection("watchlists").doc(userId);
  userDoc.get().then(doc => {
    const currentData = doc.data() || {};
    const list = currentData[selectedList] || [];

    const alreadyExists = list.some(m => m.id === movie.id);
    if (!alreadyExists) {
      list.push(movieData);
      userDoc.update({ [selectedList]: list }).then(() => {
        alert(`Added "${movie.title}" to "${selectedList}"`);
      });
    } else {
      alert("Movie already in watchlist!");
    }
  });
}