// APIs de SWAPI. Si una falla, se prueba la siguiente.
    const APIS = [
      "https://swapi.py4e.com/api/",
      "https://swapi.dev/api/",
      "https://swapi.info/api/"
    ];

    // Configuración de las categorías del buscador.
    const categories = {
      personajes: { api: "people", title: "Personajes", singular: "Personaje", name: "name",
        short: p => [p.birth_year && `Nacimiento: ${p.birth_year}`, p.gender && `Género: ${p.gender}`, p.height && `Altura: ${p.height} cm`] },
      peliculas: { api: "films", title: "Películas", singular: "Película", name: "title",
        short: p => [p.episode_id && `Episodio ${p.episode_id}`, p.director && `Director: ${p.director}`, p.release_date && `Estreno: ${p.release_date}`] },
      naves: { api: "starships", title: "Naves", singular: "Nave", name: "name",
        short: p => [p.model && `Modelo: ${p.model}`, p.manufacturer && `Fabricante: ${p.manufacturer}`, p.starship_class && `Clase: ${p.starship_class}`] },
      vehiculos: { api: "vehicles", title: "Vehículos", singular: "Vehículo", name: "name",
        short: p => [p.model && `Modelo: ${p.model}`, p.manufacturer && `Fabricante: ${p.manufacturer}`, p.vehicle_class && `Clase: ${p.vehicle_class}`] },
      especies: { api: "species", title: "Especies", singular: "Especie", name: "name",
        short: p => [p.classification && `Clasificación: ${p.classification}`, p.designation && `Designación: ${p.designation}`, p.language && `Idioma: ${p.language}`] },
      planetas: { api: "planets", title: "Planetas", singular: "Planeta", name: "name",
        short: p => [p.climate && `Clima: ${p.climate}`, p.terrain && `Terreno: ${p.terrain}`, p.population && `Población: ${p.population}`] }
    };

    // Traduce los nombres de los campos que aparecen en los detalles.
    const labels = {
      height: "Altura (cm)", mass: "Masa (kg)", hair_color: "Color de pelo",
      skin_color: "Color de piel", eye_color: "Color de ojos", birth_year: "Año de nacimiento",
      gender: "Género", rotation_period: "Periodo de rotación (h)", orbital_period: "Periodo orbital (días)",
      diameter: "Diámetro (km)", climate: "Clima", gravity: "Gravedad", terrain: "Terreno",
      surface_water: "Agua en superficie (%)", population: "Población", model: "Modelo",
      manufacturer: "Fabricante", cost_in_credits: "Coste (créditos)", length: "Longitud (m)",
      max_atmosphering_speed: "Velocidad máx. en atmósfera", crew: "Tripulación",
      passengers: "Pasajeros", cargo_capacity: "Capacidad de carga (kg)", consumables: "Provisiones",
      hyperdrive_rating: "Hiperimpulsor", MGLT: "MGLT", starship_class: "Clase de nave",
      vehicle_class: "Clase de vehículo", episode_id: "Episodio", director: "Director",
      producer: "Productor", release_date: "Estreno", classification: "Clasificación",
      designation: "Designación", average_height: "Altura media (cm)", skin_colors: "Colores de piel",
      hair_colors: "Colores de pelo", eye_colors: "Colores de ojos",
      average_lifespan: "Esperanza de vida (años)", language: "Idioma"
    };

    // Estos campos son enlaces a otros objetos de SWAPI.
    const relations = {
      homeworld: "Planeta natal", films: "Películas", species: "Especies",
      vehicles: "Vehículos", starships: "Naves", people: "Personajes",
      characters: "Personajes", residents: "Residentes", pilots: "Pilotos", planets: "Planetas"
    };

    // Campos que no necesitamos enseñar como información normal.
    const hidden = new Set(["url", "created", "edited", "opening_crawl"]);

    // Elementos de la página.
    const input = document.getElementById("searchInput");
    const category = document.getElementById("category");
    const results = document.getElementById("results");
    const modal = document.getElementById("modal");
    const modalBody = document.getElementById("modalBody");
    const closeBtn = document.getElementById("closeBtn");

    // Guardamos los datos descargados para no pedirlos otra vez.
    const cache = {};
    const index = {};

    // Convierte texto en HTML seguro.
    function escapeHTML(text) {
      const div = document.createElement("div");
      div.textContent = text ?? "";
      return div.innerHTML;
    }

    // Obtiene el tipo e ID de una URL de SWAPI.
    function getUrlInfo(url) {
      const match = String(url).match(/\/api\/([a-z]+)\/(\d+)/);
      return match ? { type: match[1], id: match[2] } : null;
    }

    // Descarga todos los resultados de una categoría, incluyendo las páginas.
    async function loadFromApi(api, endpoint) {
      let url = api + endpoint;
      const data = [];

      while (url) {
        const response = await fetch(url.replace("http://", "https://"));
        if (!response.ok) throw new Error(`Error ${response.status}`);

        const json = await response.json();

        // Algunas versiones de SWAPI devuelven directamente un array.
        if (Array.isArray(json)) return json;

        data.push(...json.results);
        url = json.next;
      }

      return data;
    }

    // Prueba las APIs hasta encontrar una que funcione.
    async function loadCategory(cat) {
      if (cache[cat]) return cache[cat];

      let error;
      for (const api of APIS) {
        try {
          const data = await loadFromApi(api, categories[cat].api);
          cache[cat] = data;

          // Índice rápido: ID -> objeto.
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

    // Muestra un mensaje dentro de la zona de resultados.
    function showMessage(cat, message) {
      results.classList.add("show");
      results.innerHTML = `<h2>${categories[cat].title}</h2>${message}`;
    }

    // Dibuja la lista de resultados según lo escrito en el buscador.
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
        ${list || '<p class="empty">No se encontraron resultados.</p>'}
      `;
    }

    // Realiza la búsqueda.
    async function search() {
      const cat = category.value;

      try {
        if (!cache[cat]) showMessage(cat, '<p class="empty">Cargando datos de la galaxia...</p>');
        const data = await loadCategory(cat);
        renderResults(cat, data);
      } catch (error) {
        showMessage(cat, `<p class="error">No se pudo conectar con la API (${escapeHTML(error.message)}).</p>`);
      }
    }

    // Devuelve la categoría correspondiente a un tipo de SWAPI.
    function categoryFromType(type) {
      return Object.keys(categories).find(cat => categories[cat].api === type);
    }

    // Crea los botones de las relaciones (personajes, películas, planetas, etc.).
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
        : `<p class="none">Ninguno</p>`;
    }

    // Muestra toda la información de un elemento.
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
        related = '<p class="none">Cargando relaciones...</p>';
      } else if (relationsLoaded === false) {
        related = '<p class="error">No se pudieron cargar las relaciones.</p>';
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

    // Abre la ventana con los detalles de un elemento.
    async function openDetail(cat, id) {
      const item = index[cat]?.[id];
      if (!item) return;

      modal.hidden = false;
      document.body.style.overflow = "hidden";
      closeBtn.focus();

      renderDetail(cat, item, null);

      // Averigua qué categorías necesitamos para mostrar los nombres relacionados.
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

    // Cierra la ventana de detalles.
    function closeModal() {
      modal.hidden = true;
      document.body.style.overflow = "";
    }

    // Eventos del buscador.
    document.getElementById("searchBtn").addEventListener("click", search);
    category.addEventListener("change", search);
    input.addEventListener("input", search);
    input.addEventListener("keydown", e => {
      if (e.key === "Enter") search();
    });

    // Abre el detalle al pulsar un resultado.
    results.addEventListener("click", e => {
      const result = e.target.closest(".result");
      if (result) openDetail(result.dataset.cat, result.dataset.id);
    });

    // Gestiona el botón de cerrar y los enlaces relacionados.
    modal.addEventListener("click", e => {
      if (e.target === modal || e.target.closest(".close")) {
        closeModal();
        return;
      }

      const chip = e.target.closest(".chip");
      if (chip) openDetail(chip.dataset.cat, chip.dataset.id);
    });

    // La tecla Escape también cierra los detalles.
    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && !modal.hidden) closeModal();
    });

    // Carga la primera categoría al abrir la página.
    search();
