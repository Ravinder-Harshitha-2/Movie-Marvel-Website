  // 🔑 TMDb API Key
const API_KEY = '8b127865f52e616a7772337e4ef916f6';

// 🟦 Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyCKAGAZLcFNTsfZ23yUIGKv7T1y6jaMWKA",
    authDomain: "moviewebsite-2ce81.firebaseapp.com",
    projectId: "moviewebsite-2ce81",
    storageBucket: "moviewebsite-2ce81.firebasestorage.app",
    messagingSenderId: "978355164474",
    appId: "1:978355164474:web:a038a7444020746ba76c03"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let genreMap = {};

// Load genres once on page load and store in a map
window.onload = async function () {
  const res = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}&language=en-US`);
  const data = await res.json();
  data.genres.forEach(g => genreMap[g.id] = g.name);
};

async function searchMovies() {
  const query = document.getElementById("searchInput").value.trim();
  const container = document.getElementById("moviesContainer");
  container.innerHTML = '';

  if (!query) {
    alert("Please enter a movie title.");
    return;
  }

  const url = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.results.length === 0) {
      container.innerHTML = '<p>No movies found.</p>';
      return;
    }

    data.results.forEach(movie => {
      const releaseYear = movie.release_date ? movie.release_date.split('-')[0] : 'N/A';
      const genres = movie.genre_ids.map(id => genreMap[id]).filter(Boolean).join(', ');

      const card = document.createElement("div");
      card.className = "movie-card";
      card.innerHTML = `
        <img src="https://image.tmdb.org/t/p/w200${movie.poster_path || ''}" alt="${movie.title}" onerror="this.onerror=null;this.src='placeholder.jpg';" />
        <h3>${movie.title}</h3>
        <p>Year: ${releaseYear}</p>
        <p>Genre: ${genres || 'N/A'}</p>
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
    } catch (err) {
    console.error("Search failed:", err);
    container.innerHTML = '<p>Error fetching data. Please try again.</p>';
  }
}

// ➕ Add to Firebase Watchlist
async function addToWatchlist(movie) {
  const user = auth.currentUser;
  const userId = user.uid; // fallback for testing
  const selectedList = document.getElementById("watchlistSelect")?.value || "Default";


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
}

//   const userDoc = db.collection("watchlists").doc(userId);
//   userDoc.get().then(doc => {
//     const currentData = doc.data() || {};
//     const list = currentData[selectedList] || [];

//     const alreadyExists = list.some(m => m.id === movie.id);
//     if (!alreadyExists) {
//       list.push(movieData);
//       userDoc.update({ [selectedList]: list }).then(() => {
//         alert(`Added "${movie.title}" to "${selectedList}"`);
//       });
//     } else {
//       alert("Movie already in watchlist!");
//     }
//   });
// }

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