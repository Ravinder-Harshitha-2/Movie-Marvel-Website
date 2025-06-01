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
      loadMovies('upcoming', 'upcomingContainer', `https://api.themoviedb.org/3/movie/upcoming?api_key=${API_KEY}`);
    };

    async function loadMovies(type, containerId, apiUrl) {
      const container = document.getElementById(containerId);
      const res = await fetch(apiUrl);
      const data = await res.json();

      data.results.forEach(movie => {
        const card = document.createElement("div");
        const releaseDate = movie.release_date
        ? new Date(movie.release_date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
            })
        : 'N/A';
        const genres = movie.genre_ids.map(id => genreMap[id]).filter(Boolean).join(', ');

        card.className = "movie-card";
        card.innerHTML = `
          <img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" alt="${movie.title}" />
          <h4>${movie.title}</h4>
          <p>Release Date: ${releaseDate}</p>
          <p>Genre: ${genres}</p>
          <button class="watchlist-btn">Add to Watchlist</button>
        `;

        card.addEventListener("click", (event) => {
          if (!event.target.classList.contains("watchlist-btn")) {
            window.location.href = `movie.html?id=${movie.id}`;
          }
        });

         card.querySelector(".watchlist-btn").addEventListener("click", async (e) => {
          e.stopPropagation();
          const user = firebase.auth().currentUser;
            if (user) {
                await saveMovieToWatchlist(movie, db, user.uid);
            } else {
                alert("Please sign in to save movies to your watchlist.");
            }
            });

        container.appendChild(card);
      });
    }

    async function addToWatchlist(movie) {
      const user = auth.currentUser;
        const userId = user.uid; // Replace with dynamic user ID when auth is active
        const selectedList = "Default";

      const movieData = {
        id: movie.id,
        title: movie.title,
        poster: movie.poster_path,
        release_date: movie.release_date,
        language: movie.original_language
      };

      try {
    const movieRef = doc(db, "users", userId, "watchlists", selectedList, "movies", String(movie.id));
    const movieSnap = await getDoc(movieRef);

    if (!movieSnap.exists()) {
      await setDoc(movieRef, movieData);
      alert(`Added "${movie.title}" to "${selectedList}"`);
    } else {
      alert("Movie already in watchlist!");
    }
  } catch (error) {
    console.error("Error adding movie to watchlist:", error);
    alert("Failed to add movie. Please try again.");
  }

    //   const userDoc = db.collection("watchlists").doc(userId);
    //   userDoc.get().then(doc => {
    //     const currentData = doc.data() || {};
    //     const list = currentData[selectedList] || [];

    //     const alreadyExists = list.some(m => m.id === movie.id);
    //     if (!alreadyExists) {
    //       list.push(movieData);
    //       userDoc.set({ [selectedList]: list }, { merge: true }).then(() => {
    //         alert(`Added "${movie.title}" to "${selectedList}"`);
    //       });
    //     } else {
    //       alert("Movie already in watchlist!");
    //     }
    //   });
    }

const auth = firebase.auth();

// Ensure the DOM is fully loaded before attaching event listener
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      auth.signOut().then(() => {
        alert("Logged out!");
        window.location.href = "index.html";
      }).catch((error) => {
        console.error("Logout error:", error);
      });
    });
  } else {
    console.warn("Logout button not found!");
  }
});