const formulario = document.getElementById('formBuscador');
const selectCategoria = document.getElementById('selectCategoria');
const inputNombre = document.getElementById('inputNombre');
const contenedorResultado = document.getElementById('resultado');

async function buscarPorNombreYCategoria(event) {
  event.preventDefault();

  const categoria = selectCategoria.value;
  const textoBuscado = inputNombre.value.trim().toLowerCase();

  contenedorResultado.textContent = `Buscando "${textoBuscado}" en la categoría ${categoria}...`;

  // Array para guardar todos los resultados encontrados
  const resultadosEncontrados = [];

  for (let id = 1; id <= 80; id++) {
    try {
      const response = await fetch(`https://swapi.dev/api/${categoria}/${id}/`);

      if (!response.ok) {
        continue;
      }

      const data = await response.json();

      const nombreElemento = data.name || '';

      const pesoPersonaje = (data.mass || '');

      const alturaPersonaje = (data.height || '')

      // Si el nombre empieza por el texto buscado
      if (nombreElemento.toLowerCase().startsWith(textoBuscado)) {

        // Guardamos el personaje u objeto en el array
        resultadosEncontrados.push({nombreElemento, alturaPersonaje, pesoPersonaje});

      }

    } catch (error) {
      console.error(`Error procesando la petición con ID ${id}:`, error);
    }
  }

  // Limpiamos el contenedor antes de mostrar los resultados
  contenedorResultado.textContent = '';

  if (resultadosEncontrados.length > 0) {

    // Creamos una lista HTML
    const lista = document.createElement('ul');

    // Recorremos el array para mostrar todos los resultados
    resultadosEncontrados.forEach(personaje => {
      const elementoLista = document.createElement('li');

      elementoLista.textContent =
        `${personaje.nombreElemento} | Altura: ${personaje.alturaPersonaje} | Peso: ${personaje.pesoPersonaje}`;

      lista.appendChild(elementoLista);
    });

    contenedorResultado.appendChild(lista);

    // Opcional: mostrar el array en la consola
    console.log(resultadosEncontrados);

  } else {
    contenedorResultado.textContent =
      `No se encontró ningún elemento en la categoría "${categoria}" con el nombre "${inputNombre.value}".`;
  }
}

formulario.addEventListener('submit', buscarPorNombreYCategoria);