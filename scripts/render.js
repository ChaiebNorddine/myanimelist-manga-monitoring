const container = htmlNode.querySelector('#manga-container'); // ✅ THIS IS THE FIX
container.innerHTML = "";


// Helper
const getLast = (f) => f.values.get(f.values.length - 1);

// Get series
const scoreRankFields = data.series[0]?.fields ?? [];
const coverTitleFields = data.series[1]?.fields ?? [];

const mangaMap = {};

// Extract score + rank
for (let i = 1; i < scoreRankFields.length; i++) {
  const field = scoreRankFields[i];
  const match = field.name.match(/Manga "(.*?)" (Mean Score|Rank)/);
  if (!match) continue;

  const [ , title, type ] = match;
  mangaMap[title] = mangaMap[title] || {};
  mangaMap[title][type === "Mean Score" ? "score" : "rank"] = getLast(field);
}

// Extract cover + title
for (let i = 1; i < coverTitleFields.length; i++) {
  const field = coverTitleFields[i];
  const match = field.name.match(/Manga "(.*?)" (Cover Image \(Medium\)|Title)/);
  if (!match) continue;

  const [ , title, type ] = match;
  mangaMap[title] = mangaMap[title] || {};
  if (type.includes("Cover")) {
    mangaMap[title].cover = getLast(field);
  } else {
    mangaMap[title].title = getLast(field);
  }
}

// Build cards
const cards = Object.entries(mangaMap)
  .filter(([_, d]) => d.score && d.rank && d.cover)
  .map(([title, d]) => {
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.rank = d.rank;

    const rankNum = parseInt(d.rank);
    if (rankNum === 1) card.classList.add("rank-1");
    else if (rankNum === 2) card.classList.add("rank-2");
    else if (rankNum === 3) card.classList.add("rank-3");

    card.innerHTML = `
      <h3 title="${title}">${title}</h3>
      <img src="${d.cover}" alt="cover" />
      <p>⭐ Score: ${d.score}</p>
      <p>🏆 Rank: ${d.rank}</p>
    `;

    card.classList.add("updated");
    setTimeout(() => card.classList.remove("updated"), 600);

    return card;
  })
  .sort((a, b) => parseFloat(a.dataset.rank) - parseFloat(b.dataset.rank));

// Append to DOM
cards.forEach(card => container.appendChild(card));
