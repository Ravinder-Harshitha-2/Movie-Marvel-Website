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
   const auth = firebase.auth();

  const API_KEY = '8b127865f52e616a7772337e4ef916f6'; // Replace with your TMDB API key
    const movieId = new URLSearchParams(window.location.search).get("id");

    async function loadMovieDetails() {
      const container = document.getElementById("movieContainer");

      const res = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}&language=en-US`);
      const movie = await res.json();

      const trailerRes = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${API_KEY}`);
      const trailerData = await trailerRes.json();
      const trailer = trailerData.results.find(v => v.type === "Trailer" && v.site === "YouTube");

      // Optional: Fetch genres by name
      const genreNames = movie.genres.map(g => g.name).join(', ');

      container.innerHTML = `
        <div class="movie-card">
          <div class="poster">
            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title} Poster">
          </div>
          <div class="movie-info">
            <h2>Title: ${movie.title}</h2>
            <p><strong>Release Date:</strong> ${movie.release_date}</p>
            <p><strong>Language:</strong> ${movie.original_language.toUpperCase()}</p>
            <p><strong>Run time:</strong> ${movie.runtime} minutes</p>
            <p><strong>Popularity score:</strong> ${movie.popularity.toFixed(2)}</p>
            <p><strong>Genres:</strong> ${genreNames}</p>
          </div>
        </div>

        <div class="overview">
          <h3>Overview</h3>
          <p>${movie.overview}</p>
        </div>

        ${trailer ? `<iframe src="https://www.youtube.com/embed/${trailer.key}" frameborder="0" allowfullscreen></iframe>` : `<p style="margin-top:20px;">No trailer available</p>`}

        <button id="addToWatchlist" class="watch-button">Add to Watchlist</button>
      `;

      window.movie = movie;

      const addButton = document.getElementById("addToWatchlist");
      if (addButton) {
        addButton.addEventListener("click", async () => {
          try {
            await saveMovieToWatchlist(movie, db, "guest_user", "Default");
          } catch (error) {
            console.error("Error adding movie to watchlist:", error);
            alert("Failed to add movie to watchlist.");
          }
        });
      }
  }
    

    function addToWatchlist() {
      const userId = "guest_user"; // Replace with real user ID in production
      const selectedList = "Default";

      const movieData = {
        id: window.movie.id,
        title: window.movie.title,
        poster: window.movie.poster_path,
        release_date: window.movie.release_date,
        language: window.movie.original_language
      };

      const userDoc = db.collection("watchlists").doc(userId);
      userDoc.get().then(doc => {
        const currentData = doc.data() || {};
        const list = currentData[selectedList] || [];

        const alreadyExists = list.some(m => m.id === window.movie.id);
        if (!alreadyExists) {
          list.push(movieData);
          userDoc.set({ [selectedList]: list }, { merge: true }).then(() => {
            alert(`Added "${window.movie.title}" to "${selectedList}"`);
          });
        } else {
          alert("Movie already in watchlist!");
        }
      });
    }

    loadMovieDetails();



// Ensure the DOM is fully loaded before attaching event listener
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      auth.signOut().then(() => {
        alert("Logged out!");
        window.location.href = "landing_page.html";
      }).catch((error) => {
        console.error("Logout error:", error);
      });
    });
  } else {
    console.warn("Logout button not found!");
  }
});



 