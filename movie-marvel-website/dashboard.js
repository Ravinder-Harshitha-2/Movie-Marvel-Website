const API_KEY = '8b127865f52e616a7772337e4ef916f6';  // Replace with actual TMDB API key
    const genreMap = {};

    const firebaseConfig = {
    apiKey: "AIzaSyCKAGAZLcFNTsfZ23yUIGKv7T1y6jaMWKA",
    authDomain: "moviewebsite-2ce81.firebaseapp.com",
    projectId: "moviewebsite-2ce81",
    storageBucket: "moviewebsite-2ce81.firebasestorage.app",
    messagingSenderId: "978355164474",
    appId: "1:978355164474:web:a038a7444020746ba76c03"
};

    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();

    // Load genres
    async function loadGenres() {
      const res = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}`);
      const data = await res.json();
      data.genres.forEach(g => genreMap[g.id] = g.name);
    }

    window.onload = async () => {
      await loadGenres();
      loadMovies('trending', 'trendingContainer', `https://api.themoviedb.org/3/trending/movie/week?api_key=${API_KEY}`);
      loadMovies('popular', 'popularContainer', `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}`);
    };

    async function loadMovies(type, containerId, apiUrl) {
      const container = document.getElementById(containerId);
      const res = await fetch(apiUrl);
      const data = await res.json();

      data.results.forEach(movie => {
        const card = document.createElement("div");
        const releaseYear = movie.release_date?.split('-')[0] || 'N/A';
        const genres = movie.genre_ids.map(id => genreMap[id]).filter(Boolean).join(', ');
        const score = movie.vote_average?.toFixed(1) || 'N/A';

        card.className = "movie-card";
        card.innerHTML = `
          <img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" alt="${movie.title}" />
          <h4>${movie.title}</h4>
          <p><strong>Year:</strong> ${releaseYear}</p>
          <p><strong>Genre:</strong> ${genres}</p>
          <p><strong>Audience Score:</strong> ${score}</p>
          <button class="watchlist-btn">Add to Watchlist</button>
        `;

        card.addEventListener("click", (event) => {
          if (!event.target.classList.contains("watchlist-btn")) {
            window.location.href = `movie.html?id=${movie.id}`;
          }
        });

        card.querySelector(".watchlist-btn").addEventListener("click", (e) => {
          e.stopPropagation();
          addToWatchlist(movie);
        });

        container.appendChild(card);
      });
    }

    function addToWatchlist(movie) {
      const userId = "guest_user";
      const selectedList = "Default";

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
          userDoc.set({ [selectedList]: list }, { merge: true }).then(() => {
            alert(`Added "${movie.title}" to "${selectedList}"`);
          });
        } else {
          alert("Movie already in watchlist!");
        }
      });
    }


//Log out functionality
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";

// const firebaseConfig = {
//     apiKey: "AIzaSyCKAGAZLcFNTsfZ23yUIGKv7T1y6jaMWKA",
//     authDomain: "moviewebsite-2ce81.firebaseapp.com",
//     projectId: "moviewebsite-2ce81",
//     storageBucket: "moviewebsite-2ce81.firebasestorage.app",
//     messagingSenderId: "978355164474",
//     appId: "1:978355164474:web:a038a7444020746ba76c03"
// };
        
const app = initializeApp(firebaseConfig);
const auth = getAuth();

document.getElementById("logoutBtn").addEventListener("click", () => {
    signOut(auth).then(() => {
        alert("Logged out!");
        window.location.href = "log_in.html";
    }).catch((error) => {
        console.error("Logout error:", error);
    });
});