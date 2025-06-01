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

let userId = null;


firebase.auth().onAuthStateChanged(user => {
  if (user) {
    userId = user.uid;
    loadWatchlistNames(); // Load once user is authenticated
  } else {
    alert("You must be signed in to view your watchlists.");
    window.location.href = "log_in.html"; // Optional: redirect to login
  }
});

//const userId = "guest_user"; // Replace with actual user ID if you have auth
const watchlistSelect = document.getElementById("watchlistSelect");
const newListForm = document.getElementById("newListForm");
const container = document.getElementById("watchlistContainer");
const deleteBtn = document.getElementById("deleteWatchlistBtn");

// 1. Create new watchlist
newListForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const listName = document.getElementById("newListName").value.trim();
  if (!listName) return;

  const userDoc = db.collection("watchlists").doc(userId);
  await userDoc.set({ [listName]: [] }, { merge: true });

  document.getElementById("newListName").value = "";
  loadWatchlistNames();
});

// 2. Load watchlist names into dropdown
async function loadWatchlistNames() {
  watchlistSelect.innerHTML = `<option value="">-- Select Watchlist --</option>`;
  const doc = await db.collection("watchlists").doc(userId).get();
  const data = doc.data();

  if (!data) return;

  Object.keys(data).forEach(name => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    watchlistSelect.appendChild(option);
  });
}

// 3. Load movies when a watchlist is selected
watchlistSelect.addEventListener("change", () => {
  const selectedList = watchlistSelect.value;
  if (selectedList && selectedList !== "Default") {
    deleteBtn.style.display = "inline-block";
    deleteBtn.textContent = `Delete "${selectedList}" Watchlist`;
  } else {
    deleteBtn.style.display = "none";
  }

  if (selectedList) loadWatchlistMovies(selectedList);
});

// 4. Load and display movies in selected watchlist
async function loadWatchlistMovies(listName) {
  container.innerHTML = " ";

  const doc = await db.collection("watchlists").doc(userId).get();
  const movies = doc.data()[listName] || [];

  if (movies.length === 0) {
    container.innerHTML = `<p>No movies in "${listName}" yet.</p>`;
    return;
  }

  for (let movie of movies) {
    try {
      const genreRes = await fetch(`https://api.themoviedb.org/3/movie/${movie.id}?api_key=000`);
      const genreData = await genreRes.json();
      const genreNames = genreData.genres?.map(g => g.name).join(', ') || "Unknown";

      const card = document.createElement("div");
      card.className = "movie-card";
      card.innerHTML = `
        <img src="https://image.tmdb.org/t/p/w200${movie.poster}" alt="${movie.title}" />
        <div>
          <h3>${movie.title}</h3>
          <p><strong>Genres:</strong> ${genreNames}</p>
          <p><strong>Year:</strong> ${movie.release_date.split("-")[0]}</p>
          <p><strong>Language:</strong> ${movie.language.toUpperCase()}</p>
          <p style="padding-bottom: 20px;"><a href="movie.html?id=${movie.id}">View Movie Details</a></p>
          <button onclick="removeFromWatchlist('${listName}', ${movie.id})">Remove from Watchlist</button>
        </div>
      `;
      container.appendChild(card);
    } catch (err) {
      console.error("Error loading movie:", err);
    }
  }
}

// 5. Remove movie from watchlist
async function removeFromWatchlist(listName, movieId) {
  const confirmDelete = confirm("Are you sure you want to remove this movie from your watchlist?");
  if (!confirmDelete) return;

  const userDocRef = db.collection("watchlists").doc(userId);
  const doc = await userDocRef.get();
  const data = doc.data();

  if (!data || !data[listName]) return;

  const updatedList = data[listName].filter(movie => movie.id !== movieId);
  await userDocRef.update({ [listName]: updatedList });

  alert("Movie removed!");
  loadWatchlistMovies(listName);
}

// 6. Delete entire watchlist
deleteBtn.addEventListener("click", async () => {
  const selectedList = watchlistSelect.value;
  if (!selectedList || selectedList === "Default") return;

  const confirmed = confirm(`Are you sure you want to delete "${selectedList}"? This cannot be undone.`);
  if (!confirmed) return;

  const userDocRef = db.collection("watchlists").doc(userId);
  const doc = await userDocRef.get();
  const data = doc.data();
  if (!data || !data[selectedList]) return;

  const updatedData = { ...data };
  delete updatedData[selectedList];

  await userDocRef.set(updatedData);

  alert(`Watchlist "${selectedList}" deleted successfully!`);
  watchlistSelect.value = "";
  deleteBtn.style.display = "none";
  container.innerHTML = "";
  loadWatchlistNames();
});

// 7. Function to add movie to a selected watchlist (call from other pages)
async function addToUserWatchlist(movieObj) {
  const doc = await db.collection("watchlists").doc(userId).get();
  const data = doc.data();

  if (!data || Object.keys(data).length === 0) {
    alert("No watchlists found. Please create one first.");
    return;
  }

  const listNames = Object.keys(data);
  let promptMsg = "Choose a watchlist to save to:\n";
  listNames.forEach((name, i) => {
    promptMsg += `${i + 1}. ${name}\n`;
  });

  const choice = parseInt(prompt(promptMsg));
  if (isNaN(choice) || choice < 1 || choice > listNames.length) {
    alert("Invalid selection.");
    return;
  }

  const chosenList = listNames[choice - 1];
  const userDocRef = db.collection("watchlists").doc(userId);
  const existingList = data[chosenList] || [];

  const alreadyAdded = existingList.some(m => m.id === movieObj.id);
  if (alreadyAdded) {
    alert("Movie already in watchlist.");
    return;
  }

  existingList.push({
    id: movieObj.id,
    title: movieObj.title,
    poster: movieObj.poster_path,
    release_date: movieObj.release_date,
    language: movieObj.original_language
  });

  await userDocRef.update({ [chosenList]: existingList });
  alert(`"${movieObj.title}" added to "${chosenList}"!`);
}

// 8. Logout button handler
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      firebase.auth().signOut().then(() => {
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

// 9. Initial setup
//loadWatchlistNames();












