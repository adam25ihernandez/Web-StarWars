// 1. Acceso a los elementos del DOM mediante document.getElementById
const formulario = document.getElementById('formBuscador');
const selectCategoria = document.getElementById('selectCategoria');
const inputNombre = document.getElementById('inputNombre');
const contenedorResultado = document.getElementById('resultado');

// Diccionario de traducción de climas ☁️
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

async function buscarPorNombreYCategoria(event) {
  event.preventDefault();

  const categoria = selectCategoria.value;
  const textoBuscado = inputNombre.value.trim().toLowerCase();

  contenedorResultado.textContent = `Buscando "${textoBuscado}" en la categoría ${categoria}...`;

  // Array para guardar todos los resultados encontrados 📦
  const resultadosEncontrados = [];

  for (let id = 1; id <= 80; id++) {
    try {
      const response = await fetch(`https://swapi.dev/api/${categoria}/${id}/`);

      if (!response.ok) {
        continue;
      }

      const data = await response.json();
      const nombreElemento = (data.name || data.title || '').toLowerCase();

      // Si el nombre coincide con la búsqueda
      if (nombreElemento.startsWith(textoBuscado)) {
        // 1. Guardamos el objeto completo recibido de la API
        resultadosEncontrados.push(data);
      }

    } catch (error) {
      console.error(`Error procesando la petición con ID ${id}:`, error);
    }
  }

  // Limpiamos el mensaje de carga en el DOM
  contenedorResultado.textContent = '';

  if (resultadosEncontrados.length > 0) {
    // Creamos la lista principal <ul>
    const lista = document.createElement('ul');

    // 2. Recorremos cada elemento encontrado en el array
    resultadosEncontrados.forEach(elemento => {
      const elementoLista = document.createElement('li');

      // Título con el nombre del resultado
      const titulo = document.createElement('strong');
      titulo.textContent = elemento.name || elemento.title;
      elementoLista.appendChild(titulo);

      // DATOS ADICIONALES PARA PERSONAJES
      if (categoria === 'people') {
        const infoPersonaje = document.createElement('p');
        infoPersonaje.textContent = `Altura: ${elemento.height || 'Desconocida'} cm | Peso: ${elemento.mass || 'Desconocido'} kg`;
        elementoLista.appendChild(infoPersonaje);
      }

      // DATOS ADICIONALES PARA PLANETAS
      if (categoria === 'planets') {
        const clima = document.createElement('p');
        clima.textContent = `Clima: ${traduccionesClima[elemento.climate] || elemento.climate}`;

        let poblacionFormateada;
        if (!isNaN(elemento.population)) {
          poblacionFormateada = `${Number(elemento.population).toLocaleString('es-ES')} habitantes`;
        } else {
          poblacionFormateada = 'Desconocida';
        }

        const poblacion = document.createElement('p');
        poblacion.textContent = `Población: ${poblacionFormateada}`;

        // 3. Insertamos dentro del <li> de este planeta
        elementoLista.appendChild(clima);
        elementoLista.appendChild(poblacion);
      }

      // DATOS ADICIONALES PARA NAVES
      if (categoria === 'starships') {
        const modelo = document.createElement('p');
        modelo.textContent = `Modelo: ${elemento.model || 'Desconocido'}`;

        const capacidad = document.createElement('p');
        capacidad.textContent = `Capacidad de pasajeros: ${elemento.passengers || 'Desconocida'}`;

        // 3. Insertamos dentro del <li> de esta nave
        elementoLista.appendChild(modelo);
        elementoLista.appendChild(capacidad);
      }

      // Insertamos el <li> completo dentro de la lista <ul>
      lista.appendChild(elementoLista);
    });

    // Insertamos la lista <ul> dentro del contenedor de la página
    contenedorResultado.appendChild(lista);

  } else {
    contenedorResultado.textContent =
      `No se encontró ningún elemento en la categoría "${categoria}" con el nombre "${inputNombre.value}".`;
  }
}

formulario.addEventListener('submit', buscarPorNombreYCategoria);
