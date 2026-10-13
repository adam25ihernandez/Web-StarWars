// Llista d'APIs de SWAPI per si una falla
const APIS = [
  "https://swapi.py4e.com/api/",
  "https://swapi.dev/api/",
  "https://swapi.info/api/"
];

// Configuració de les categories de cerca
const categories = {
  personajes: {
    api: "people",
    title: "Personatges",
    singular: "Personatge",
    name: "name",
    short: p => [
      p.birth_year && `Naixement: ${p.birth_year}`,
      p.gender && `Gènere: ${p.gender}`,
      p.height && `Alçada: ${p.height} cm`
    ]
  },
  peliculas: {
    api: "films",
    title: "Pel·lícules",
    singular: "Pel·lícula",
    name: "title",
    short: p => [
      p.episode_id && `Episodi ${p.episode_id}`,
      p.director && `Director: ${p.director}`,
      p.release_date && `Estrena: ${p.release_date}`
    ]
  },
  naves: {
    api: "starships",
    title: "Naus",
    singular: "Nau",
    name: "name",
    short: p => [
      p.model && `Model: ${p.model}`,
      p.manufacturer && `Fabricant: ${p.manufacturer}`,
      p.starship_class && `Classe: ${p.starship_class}`
    ]
  },
  vehiculos: {
    api: "vehicles",
    title: "Vehicles",
    singular: "Vehicle",
    name: "name",
    short: p => [
      p.model && `Model: ${p.model}`,
      p.manufacturer && `Fabricant: ${p.manufacturer}`,
      p.vehicle_class && `Classe: ${p.vehicle_class}`
    ]
  },
  especies: {
    api: "species",
    title: "Espècies",
    singular: "Espècie",
    name: "name",
    short: p => [
      p.classification && `Classificació: ${p.classification}`,
      p.designation && `Designació: ${p.designation}`,
      p.language && `Idioma: ${p.language}`
    ]
  },
  // Se ha cambiado los detalles de los planetas para que sean más concisos
  planetas: {
    api: "planets",
    title: "Planetes",
    singular: "Planeta",
    name: "name",
    short: p => [
      p.climate && `Clima: ${p.climate}`,
      p.population && `Població: ${p.population}`
    ]
  }
};

// Etiquetes per als detalls
const labels = {
  height: "Alçada (cm)",
  mass: "Massa (kg)",
  hair_color: "Color de cabell",
  skin_color: "Color de pell",
  eye_color: "Color d'ulls",
  birth_year: "Any de naixement",
  gender: "Gènere",
  rotation_period: "Període de rotació (h)",
  orbital_period: "Període orbital (dies)",
  diameter: "Diàmetre (km)",
  climate: "Clima",
  gravity: "Gravetat",
  terrain: "Terreny",
  surface_water: "Aigua en superfície (%)",
  population: "Població",
  model: "Model",
  manufacturer: "Fabricant",
  cost_in_credits: "Cost (crèdits)",
  length: "Longitud (m)",
  max_atmosphering_speed: "Velocitat màx. en atmosfera",
  crew: "Tripulació",
  passengers: "Passatgers",
  cargo_capacity: "Capacitat de càrrega (kg)",
  consumables: "Provisions",
  hyperdrive_rating: "Hiperimpulsor",
  MGLT: "MGLT",
  starship_class: "Classe de nau",
  vehicle_class: "Classe de vehicle",
  episode_id: "Episodi",
  director: "Director",
  producer: "Productor",
  release_date: "Estrena",
  classification: "Classificació",
  designation: "Designació",
  average_height: "Alçada mitjana (cm)",
  skin_colors: "Colors de pell",
  hair_colors: "Colors de cabell",
  eye_colors: "Colors d'ulls",
  average_lifespan: "Esperança de vida (anys)",
  language: "Idioma"
};

// Relacions entre objectes de SWAPI
const relations = {
  homeworld: "Planeta natal",
  films: "Pel·lícules",
  species: "Espècies",
  vehicles: "Vehicles",
  starships: "Naus",
  people: "Personatges",
  characters: "Personatges",
  residents: "Residents",
  pilots: "Pilots",
  planets: "Planetes"
};

// Camps ocults que no es mostren als detalls
const hidden = new Set(["url", "created", "edited", "opening_crawl"]);

// ==========================================
// ELEMENTS DEL DOM I MEMÒRIA CACHÉ
// ==========================================
const input = document.getElementById("searchInput");
const category = document.getElementById("category");
const results = document.getElementById("results");
const modal = document.getElementById("modal");
const modalBody = document.getElementById("modalBody");
const closeBtn = document.getElementById("closeBtn");

const cache = {};
const index = {};

// ==========================================
// FUNCIONS D'UTILITAT
// ==========================================

// Converteix text en HTML segur per evitar XSS
function escapeHTML(text) {
  const div = document.createElement("div");
  div.textContent = text ?? "";
  return div.innerHTML;
}

// Obté el tipus i ID a partir d'una URL de SWAPI
function getUrlInfo(url) {
  const match = String(url).match(/\/api\/([a-z]+)\/(\d+)/);
  return match ? { type: match[1], id: match[2] } : null;
}

// Retorna la categoria segons el tipus d'API
function categoryFromType(type) {
  return Object.keys(categories).find(cat => categories[cat].api === type);
}

// ==========================================
// CÀRREGA DE DADES DE LA API
// ==========================================

// Carrega tots els resultats d'un endpoint (paginat)
async function loadFromApi(api, endpoint) {
  let url = api + endpoint;
  const data = [];

  while (url) {
    const response = await fetch(url.replace("http://", "https://"));
    if (!response.ok) throw new Error(`Error ${response.status}`);

    const json = await response.json();
    if (Array.isArray(json)) return json;

    data.push(...json.results);
    url = json.next;
  }

  return data;
}

// Carrega una categoria provant les diferents APIs disponibles
async function loadCategory(cat) {
  if (cache[cat]) return cache[cat];

  let error;
  for (const api of APIS) {
    try {
      const data = await loadFromApi(api, categories[cat].api);
      cache[cat] = data;

      // Indexació ràpida per ID
      index[cat] = {};
      data.forEach(item => {
        const info = getUrlInfo(item.url);
        if (info) index[cat][info.id] = item;
      });

      return data;
    } catch (e) {
      error = e;
    }
  }

  throw error;
}

// ==========================================
// RENDERITZACIÓ I INTERFÍCIE
// ==========================================

// Mostra un missatge informatiu a la secció de resultats
function showMessage(cat, message) {
  results.classList.add("show");
  results.innerHTML = `<h2>${categories[cat].title}</h2>${message}`;
}

// Dibuixa els resultats segons el text filtrat
function renderResults(cat, data) {
  const config = categories[cat];
  const text = input.value.trim().toLowerCase();

  const found = data.filter(item =>
    String(item[config.name]).toLowerCase().includes(text)
  );

  const list = found.map(item => {
    const info = getUrlInfo(item.url);
    const extra = config.short(item).filter(Boolean).join(" · ");

    return `
      <div class="result" role="button" tabindex="0"
           data-cat="${cat}" data-id="${info ? info.id : ""}">
        <strong>${escapeHTML(item[config.name])}</strong>
        <span class="meta">${escapeHTML(extra)}</span>
      </div>`;
  }).join("");

  results.classList.add("show");
  results.innerHTML = `
    <h2>${config.title} <small>(${found.length})</small></h2>
    ${list || '<p class="empty">No s\'han trobat resultats.</p>'}
  `;
}

// Executa la cerca de la categoria seleccionada
async function search() {
  const cat = category.value;

  try {
    if (!cache[cat]) showMessage(cat, '<p class="empty">Carregant dades de la galàxia...</p>');
    const data = await loadCategory(cat);
    renderResults(cat, data);
  } catch (error) {
    showMessage(cat, `<p class="error">No s'ha pogut connectar amb l'API (${escapeHTML(error.message)}).</p>`);
  }
}

// Crea etiquetes relacionades
function makeChips(urls) {
  const html = urls.map(url => {
    const info = getUrlInfo(url);
    if (!info) return "";

    const cat = categoryFromType(info.type);
    const item = cat && index[cat]?.[info.id];
    if (!item) return "";

    return `<span class="chip" role="button" tabindex="0"
                  data-cat="${cat}" data-id="${info.id}">
              ${escapeHTML(item[categories[cat].name])}
            </span>`;
  }).filter(Boolean);

  return html.length
    ? `<div class="chips">${html.join("")}</div>`
    : `<p class="none">Cap</p>`;
}

// Renderitza la finestra modal de detall d'un element
function renderDetail(cat, item, relationsLoaded) {
  const config = categories[cat];

  const fields = Object.entries(item)
    .filter(([key, value]) =>
      key !== config.name &&
      !hidden.has(key) &&
      !relations[key] &&
      typeof value !== "object"
    )
    .map(([key, value]) => `
      <div>
        <dt>${escapeHTML(labels[key] || key.replace(/_/g, " "))}</dt>
        <dd>${escapeHTML(value)}</dd>
      </div>
    `).join("");

  let related = "";

  if (relationsLoaded === null) {
    related = '<p class="none">Carregant relacions...</p>';
  } else if (relationsLoaded === false) {
    related = '<p class="error">No s\'han pogut carregar les relacions.</p>';
  } else {
    related = Object.keys(item)
      .filter(key => relations[key])
      .map(key => {
        const urls = Array.isArray(item[key]) ? item[key] : [item[key]];
        return `<h3>${relations[key]}</h3>${makeChips(urls)}`;
      }).join("");
  }

  modalBody.innerHTML = `
    <h2 id="modalTitle">${escapeHTML(item[config.name])}</h2>
    <p class="kind">${config.singular}</p>
    <dl class="fields">${fields}</dl>
    ${item.opening_crawl ? `<div class="crawl">${escapeHTML(item.opening_crawl)}</div>` : ""}
    ${related}
  `;
}

// Obre el desplegable modal amb la informació detallada
async function openDetail(cat, id) {
  const item = index[cat]?.[id];
  if (!item) return;

  modal.hidden = false;
  document.body.style.overflow = "hidden";
  closeBtn.focus();

  renderDetail(cat, item, null);

  const needed = new Set();
  Object.keys(relations).forEach(key => {
    const value = item[key];
    if (!value) return;

    const urls = Array.isArray(value) ? value : [value];
    urls.forEach(url => {
      const info = getUrlInfo(url);
      const relatedCat = info && categoryFromType(info.type);
      if (relatedCat) needed.add(relatedCat);
    });
  });

  try {
    await Promise.all([...needed].map(loadCategory));
    renderDetail(cat, item, true);
  } catch {
    renderDetail(cat, item, false);
  }
}

// Tanca la modal de detalls
function closeModal() {
  modal.hidden = true;
  document.body.style.overflow = "";
}

// ==========================================
// ESDEVENIMENTS (EVENT LISTENERS)
// ==========================================

// Cercador i filtres
document.getElementById("searchBtn").addEventListener("click", search);
category.addEventListener("change", search);
input.addEventListener("input", search);
input.addEventListener("keydown", e => {
  if (e.key === "Enter") search();
});

// Clics a resultats
results.addEventListener("click", e => {
  const result = e.target.closest(".result");
  if (result) openDetail(result.dataset.cat, result.dataset.id);
});

// Clics a la modal i tancament
modal.addEventListener("click", e => {
  if (e.target === modal || e.target.closest(".close")) {
    closeModal();
    return;
  }

  const chip = e.target.closest(".chip");
  if (chip) openDetail(chip.dataset.cat, chip.dataset.id);
});

// Tecla Escape per tancar
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && !modal.hidden) closeModal();
});

// Cerca inicial en carregar la pàgina
search();