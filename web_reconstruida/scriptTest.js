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

  for (let id = 1; id <= 83; id++) {
    try {
      const response = await fetch(`https://swapi.dev/api/${categoria}/${id}/`);

      if (!response.ok) {
        continue;
      }

      const data = await response.json();

      // Si el nombre empieza por el texto buscado
      if ((data.name || '').toLowerCase().startsWith(textoBuscado)) {

        // Guardamos el personaje u objeto en el array
        resultadosEncontrados.push(data);

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

  // Creamos el nombre como enlace
  const enlace = document.createElement('a');
  enlace.href = '#';
  enlace.textContent = personaje.name;

  // Al hacer clic, mostramos un alert
  enlace.addEventListener('click', function(event) {
    event.preventDefault();

    alert(
      `Nombre: ${personaje.name}\n` +
      `Altura: ${personaje.height} cm\n` +
      `Peso: ${personaje.mass} kg\n` +
      `Género: ${personaje.gender}\n` +
      `Nacimiento: ${personaje.birth_year}`
    );
  });

  // Añadimos el nombre clicable
  elementoLista.appendChild(enlace);

  // Añadimos altura y peso como texto normal
  elementoLista.appendChild(
    document.createTextNode(
      ` | Altura: ${personaje.height} cm | Peso: ${personaje.mass} kg`
    )
  );

  lista.appendChild(elementoLista);
});

    contenedorResultado.appendChild(lista);

  } else {
    contenedorResultado.textContent =
      `No se encontró ningún elemento en la categoría "${categoria}" con el nombre "${inputNombre.value}".`;
  }
}

formulario.addEventListener('submit', buscarPorNombreYCategoria);