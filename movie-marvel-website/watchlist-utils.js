// watchlist-utils.js

async function saveMovieToWatchlist(movie, db, userId = "guest_user") {
  const userDocRef = db.collection("watchlists").doc(userId);
  const doc = await userDocRef.get();
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
  const existingList = data[chosenList] || [];

  const alreadyAdded = existingList.some(m => m.id === movie.id);
  if (alreadyAdded) {
    alert("Movie already in watchlist.");
    return;
  }

  existingList.push({
    id: movie.id,
    title: movie.title,
    poster: movie.poster_path,
    release_date: movie.release_date,
    language: movie.original_language
  });

  await userDocRef.update({ [chosenList]: existingList });
  alert(`"${movie.title}" added to "${chosenList}"!`);
}

window.saveMovieToWatchlist = saveMovieToWatchlist;
