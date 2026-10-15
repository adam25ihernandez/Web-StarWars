// 1. Acceso a los elementos del DOM mediante document.getElementById
const formulario = document.getElementById('formBuscador');
const selectCategoria = document.getElementById('selectCategoria');
const inputNombre = document.getElementById('inputNombre');
const contenedorResultado = document.getElementById('resultado');
//FORMATEO PLANETAS
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

// 2. Función asíncrona definida con async
async function buscarPorNombreYCategoria(event) {
  // Cancelamos la recarga automática del formulario mediante preventDefault
  event.preventDefault();

  const categoria = selectCategoria.value;
  const textoBuscado = inputNombre.value.trim().toLowerCase();

  // Actualizamos el estado visual mediante textContent
  contenedorResultado.textContent = `Buscando "${textoBuscado}" en la categoría ${categoria}...`;

  let encontrado = false;

  // 3. Bucle for para incrementar el ID en cada iteración
  for (let id = 1; id <= 80; id++) {
    try {
      // fetch inicia la petición HTTP devolviendo una promesa
      const response = await fetch(`https://swapi.dev/api/${categoria}/${id}/`);

      // Si la petición falla o el ID no existe, saltamos a la siguiente iteración
      if (!response.ok) {
        continue;
      }

      // Esperamos la conversión del cuerpo de la respuesta a JSON mediante await
      const data = await response.json();

      // Obtenemos el nombre del objeto recibido
      const nombreElemento = (data.name || data.title || '').toLowerCase();

      // 4. Verificamos si el nombre coincide con la búsqueda

      if (nombreElemento.startsWith(textoBuscado)) {
        encontrado = true;

        // Limpiamos el mensaje de carga en el DOM
        contenedorResultado.textContent = '';

        // Creamos elementos del DOM dinámicamente
        const titulo = document.createElement('h2');
        titulo.textContent = data.name || data.title;

        const detalle = document.createElement('p');
        detalle.textContent = `Categoría: ${categoria} | ID de recurso: ${id}`;

        if (categoria === 'planets') { //DATOS ADICIONALES PARA PLANETAS
          const clima = document.createElement('p');
          clima.textContent = `Clima: ${traduccionesClima[data.climate] || data.climate}`;

          let poblacionFormateada;
          if (!isNaN(data.population)) {
            poblacionFormateada = `${Number(data.population).toLocaleString('es-ES')} habitantes`;
          } else {
            poblacionFormateada = 'Desconocida';
          }
          const poblacion = document.createElement('p');
          poblacion.textContent = `Población: ${poblacionFormateada}`;
          
          contenedorResultado.appendChild(clima);
          contenedorResultado.appendChild(poblacion);
        }

        // Insertamos los nodos creados dentro del contenedor del DOM
        contenedorResultado.appendChild(titulo);
        contenedorResultado.appendChild(detalle);

        // Rompemos la ejecución del bucle al hallar la coincidencia
        //  si quitamos el break mostrara todos los resultados pero en un solo div necisatamos creagte una lista 
        break;
      }
    } catch (error) {
      console.error(`Error procesando la petición con ID ${id}:`, error);
    }
  }

  // Mensaje en caso de no encontrar ningún elemento tras finalizar el bucle
  if (!encontrado) {
    contenedorResultado.textContent = `No se encontró ningún elemento en la categoría "${categoria}" con el nombre "${inputNombre.value}".`;
  }
}

// 5. Asignamos el evento con addEventListener
formulario.addEventListener('submit', buscarPorNombreYCategoria);
