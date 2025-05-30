const firebaseConfig = {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "SENDER_ID",
    appId: "APP_ID"
  };
  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();

const API_KEY = '8b127865f52e616a7772337e4ef916f6'; // Replace with yours


async function loadMovieDetails() {
  const container = document.getElementById("movieContainer");
  const movieId = new URLSearchParams(window.location.search).get("id");

  try{

    // Fetch movie details
    const res = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}&language=en-US`);
    const movie = await res.json();

    // Fetch trailer
    const trailerRes = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${API_KEY}`);
    const trailerData = await trailerRes.json();
    const trailer = trailerData.results.find(v => v.type === "Trailer" && v.site === "YouTube");

    container.innerHTML = `
        <h2>${movie.title}</h2>
        <img src="https://image.tmdb.org/t/p/w300${movie.poster_path}" alt="${movie.title}" />
        <p><strong>Release Date:</strong> ${movie.release_date}</p>
        <p><strong>Language:</strong> ${movie.original_language.toUpperCase()}</p>
        <p>${movie.overview}</p>
        ${trailer ? `<iframe src="https://www.youtube.com/embed/${trailer.key}" frameborder="0" allowfullscreen></iframe>` : `<p>No trailer available</p>`}
        <button id="watchlistBtn">Add to Watchlist</button>
    `;
    
    window.movieData = movie; // Save for later use

    document.getElementById("watchlistBtn").addEventListener("click", addToWatchlist);
      } catch (error) {
    console.error("Error loading movie details:", error);
    container.innerHTML = `<p>Error loading movie details. Please try again later.</p>`;
  }
}

function addToWatchlist() {
  const userId = "guest_user"; // replace later with logged-in user
  const selectedList = document.getElementById("watchlistSelect")?.value || "Default";

  const movie = window.movieData;
  if (!movie) return alert("Movie data is not available.");
  
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

loadMovieDetails();