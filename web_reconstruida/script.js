// ===============================
// SELECCIÓN DE ELEMENTOS DEL HTML
// ===============================
const formulario = document.getElementById('formBuscador');
const selectCategoria = document.getElementById('selectCategoria');
const inputNombre = document.getElementById('inputNombre');
const contenedorResultado = document.getElementById('resultado');
// ==================
// TRADUCCIÓN CLIMAS
// ==================
const traduccionesClima = {
  arid: "árido",
  temperate: "templado",
  frozen: "congelado",
  murky: "turbio",
  tropical: "tropical",
  hot: "caluroso",
  frigid: "gélido",
  polluted: "contaminado",
  superheated: "sobrecalentado",
  artificial_temperate: "templado artificial",
  unknown: "desconocido"
};
// Traducción dinámica de climas múltiples
function traducirClimas(climaTexto) {
  if (!climaTexto) return 'desconocido';
  const listaClimas = climaTexto.split(', ');
  const listaTraducida = listaClimas.map(clima => {
    return traduccionesClima[clima] || clima;
  });
  return listaTraducida.join(', ');
}
// ======================================
// FUNCIÓN PARA EL ALERT (FICHA TÉCNICA)
// ======================================
function construirTextoAlert(categoria, elemento) {
  if (categoria === 'people') {
    return (
      `Nombre: ${elemento.name}\n` +
      `Altura: ${elemento.height} cm\n` +
      `Peso: ${elemento.mass} kg\n` +
      `Género: ${elemento.gender}\n` +
      `Nacimiento: ${elemento.birth_year}`
    );
  }
  if (categoria === 'planets') {
    return (
      `Nombre: ${elemento.name}\n` +
      `Clima: ${traducirClimas(elemento.climate)}\n` +
      `Terreno: ${elemento.terrain}\n` +
      `Diámetro: ${elemento.diameter} km\n` +
      `Población: ${elemento.population}`
    );
  }
  if (categoria === 'starships') {
    return (
      `Nombre: ${elemento.name}\n` +
      `Modelo: ${elemento.model}\n` +
      `Fabricante: ${elemento.manufacturer}\n` +
      `Pasajeros: ${elemento.passengers}\n` +
      `Longitud: ${elemento.length} m`
    );
  }
  return `Nombre: ${elemento.name || elemento.title}`;
}
// =============================
// FUNCIÓN PRINCIPAL DE BÚSQUEDA
// =============================
async function buscarPorNombreYCategoria(event) {
  event.preventDefault();
  const categoria = selectCategoria.value;
  const textoBuscado = inputNombre.value.trim().toLowerCase();

  contenedorResultado.classList.add('show'); // CSS: Mostramos la caja de resultados agregando la clase '.show' (.results.show { display: block })
  contenedorResultado.innerHTML = `<p class="empty">Buscando </p>`; // CSS: Estilo para mensajes informativos usando la clase '.empty'

  const resultadosEncontrados = [];
  
  // Búsqueda secuencial en la SWAPI
  for (let id = 1; id <= 80; id++) {
    try {
      const response = await fetch(`https://swapi.dev/api/${categoria}/${id}/`);
      if (!response.ok) continue;

      const data = await response.json();
      const nombreElemento = (data.name || data.title || '').toLowerCase();

      if (nombreElemento.startsWith(textoBuscado)) {
        resultadosEncontrados.push(data);
      }
    } catch (error) {
      console.error(`Error procesando ID ${id}:`, error);
    }
  }

  contenedorResultado.innerHTML = ''; // Limpiar el texto provisional

  if (resultadosEncontrados.length > 0) {
    const tituloSeccion = document.createElement('h2');
    tituloSeccion.innerHTML = `Resultados <small>(${resultadosEncontrados.length} encontrados)</small>`;
    contenedorResultado.appendChild(tituloSeccion);
    // =================================
    // CREACIÓN DE TARJETAS PARA EL CSS
    // =================================
    resultadosEncontrados.forEach(elemento => {
      const tarjeta = document.createElement('div'); // CSS: Crear el <div> contenedor con la clase '.result' (efecto glassmorphism y hover)
      tarjeta.classList.add('result');

      const titulo = document.createElement('strong'); // CSS: Título principal en negrita e interactivo
      titulo.textContent = elemento.name || elemento.title;
      titulo.style.cursor = 'pointer'; 

      titulo.addEventListener('click', function () { //Muestra el alert con la ficha completa al hacer clic en el título
        alert(construirTextoAlert(categoria, elemento));
      });

      tarjeta.appendChild(titulo);

      const meta = document.createElement('span'); // CSS: Subtexto con la clase '.meta' (letra más pequeña y color azul claro)
      meta.classList.add('meta');

      // Personajes
      if (categoria === 'people') {
        meta.textContent = `Altura: ${elemento.height || 'Desconocida'} cm | Peso: ${elemento.mass || 'Desconocido'} kg`;
      }
      // Planetas
      if (categoria === 'planets') {
        const clima = traducirClimas(elemento.climate);
        let poblacion;
        if (!isNaN(elemento.population)) {
          poblacion = `${Number(elemento.population).toLocaleString('es-ES')} habitantes`;
        } else {
          poblacion = 'Desconocida';
        }
        meta.textContent = `Clima: ${clima} | Población: ${poblacion}`;
      }
      //Naves
      if (categoria === 'starships') {
        meta.textContent = `Modelo: ${elemento.model || 'Desconocido'} | Pasajeros: ${elemento.passengers || 'Desconocidos'}`;
      }
      tarjeta.appendChild(meta);
      contenedorResultado.appendChild(tarjeta);
    });
  } else {
    // CSS: Estilo para cuando no hay resultados usando la clase '.empty'
    contenedorResultado.innerHTML = `<p class="empty">No se encontró ningún elemento que coincida con "${inputNombre.value}".</p>`;
  }
}
formulario.addEventListener('submit', buscarPorNombreYCategoria);
