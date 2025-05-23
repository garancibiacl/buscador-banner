
let bannersJSON = [];
let cantidadMaxima = 1;
let bannersSeleccionados = [];

async function cargarBannersJson() {
  try {
    const response = await fetch('assets/banners.json');
    if (!response.ok) throw new Error('No se pudo cargar banners.json');
    return await response.json();
  } catch (err) {
    console.error('❌ Error cargando JSON:', err);
    alert("⚠️ No se pudo cargar el archivo banners.json. Revisa la consola.");
    return [];
  }
}

window.addEventListener("DOMContentLoaded", async () => {
  bannersJSON = await cargarBannersJson();
  console.log("✅ bannersJSON cargado:", bannersJSON);
});

function actualizarCantidad(select) {
  cantidadMaxima = parseInt(select.value);
  bannersSeleccionados = [];
  document.getElementById("previewHTML").innerHTML = "";
  document.getElementById("codigoGenerado").value = "";
}



function sugerenciasBannerSimple(valor) {
  const box = document.getElementById("sugerencias-banner");
  if (!valor) return box.classList.add("d-none");

  const filtrados = bannersJSON.filter(b =>
    b.nombre.toLowerCase().includes(valor.toLowerCase())
  );

  if (!filtrados.length) return box.classList.add("d-none");

  box.innerHTML = '';
  box.classList.remove("d-none");

  filtrados.forEach(b => {
    const item = document.createElement("div");
    item.className = "suggestion-item";
    item.textContent = b.nombre;
    item.onclick = () => {
      document.getElementById("buscarBanner").value = b.nombre;
      generarBannerDesdeJson(b);
      box.classList.add("d-none");
    };
    box.appendChild(item);
  });
}

function generarBannerDesdeJson(banner) {
  bannersSeleccionados.push(banner);

  const contenedor = document.getElementById("previewHTML");

  // Si no existe la tabla aún, la creamos
  if (!contenedor.querySelector("table")) {
    contenedor.innerHTML = '<table width="600" cellspacing="0" cellpadding="0" align="center"></table>';
  }

  // Crear una nueva fila <tr> para el banner
  const fila = `
  <tr>
    <td colspan="2" align="center">
      <a href="${banner.href}" target="_blank">
        <img src="${banner.img_src}" alt="${banner.alt}" style="display:block;" border="0">
      </a>
    </td>
  </tr>`;

  // Insertar el <tr> dentro de la tabla visual (preview)
  contenedor.querySelector("table").insertAdjacentHTML("beforeend", fila);

  // ✅ Generar código HTML manual (sin usar .innerHTML para evitar <tbody>)
  const tablaHTML = bannersSeleccionados.map(b => `
<tr>
  <td colspan="2" align="center">
    <a href="${b.href}" target="_blank">
      <img src="${b.img_src}" alt="${b.alt}" style="display:block;" border="0">
    </a>
  </td>
</tr>`).join("");

  const tablaFinal = `
<table width="600" cellspacing="0" cellpadding="0" align="center">
${tablaHTML}
</table>`.trim();

  // Actualizar el textarea con tabla limpia sin <tbody>
  document.getElementById("codigoGenerado").value = tablaFinal;

  // Actualizar contador si existe
  if (typeof actualizarContador === "function") actualizarContador();

  // Mensaje al usuario
  if (bannersSeleccionados.length === cantidadMaxima) {
    mostrarToast("✅ Ya seleccionaste todos los banners", "success");
  } else {
    const restantes = cantidadMaxima - bannersSeleccionados.length;
    mostrarToast(`⚠️ Banner agregado. Faltan ${restantes}`, 'warning');
  }
}


function agregarBanner(index) {
  if (bannersSeleccionados.length >= cantidadMaxima) {
    alert("⚠️ Ya seleccionaste la cantidad máxima de banners.");
    return;
  }

  bannersSeleccionados.push(bannersJSON[index]);

  const banner = bannersJSON[index];
  const fila = `
<tr>
  <td colspan="2" align="center">
    <a href="${banner.href}" target="_blank">
      <img src="${banner.img_src}" alt="${banner.alt}" style="display:block;" border="0">
    </a>
  </td>
</tr>`;

  const contenedor = document.getElementById("previewHTML");

  if (!contenedor.querySelector("table")) {
    contenedor.innerHTML = '<table width="600" cellspacing="0" cellpadding="0" align="center"></table>';
  }

  contenedor.querySelector("table").insertAdjacentHTML("beforeend", fila);

  if (bannersSeleccionados.length === cantidadMaxima) {
    document.getElementById("codigoGenerado").value = contenedor.innerHTML.trim();
    alert("✅ Banners completos. Código listo.");
  } else {
    alert(`✅ Banner ${bannersSeleccionados.length} agregado. Selecciona el siguiente...`);
  }
}


function generarHTMLTabla() {
  const tablaHTML = bannersSeleccionados.map(banner => `
<tr>
  <td colspan="2" align="center">
    <a href="${banner.href}" target="_blank">
      <img src="${banner.img_src}" alt="${banner.alt}" style="display:block;" border="0">
    </a>
  </td>
</tr>`).join("");

  const tablaCompleta = `
<table width="600" cellspacing="0" cellpadding="0" align="center">
${tablaHTML}
</table>`.trim();

  document.getElementById("previewHTML").innerHTML = tablaCompleta;
  document.getElementById("codigoGenerado").value = tablaCompleta;
}

function copiarCodigo() {
  const area = document.getElementById("codigoGenerado");
  area.select();
  document.execCommand("copy");
  mostrarToast("📋 HTML copiado correctamente", "success");
}

function actualizarContador() {
  const contador = document.getElementById("contadorBanners");
  if (contador) {
    contador.textContent = `${bannersSeleccionados.length} de ${cantidadMaxima} banners agregados`;
  }
}



document.getElementById("contadorBanners").textContent =
  `${bannersSeleccionados.length} de ${cantidadMaxima} banners agregados`;


  function mostrarToast(mensaje, tipo = 'success') {
    const toastContainer = document.getElementById("toastContainer");
  
    // Crear el toast dinámico
    const toast = document.createElement("div");
    toast.className = `toast align-items-center text-white bg-${tipo} border-0 show mb-2`;
    toast.setAttribute("role", "alert");
    toast.setAttribute("aria-live", "assertive");
    toast.setAttribute("aria-atomic", "true");
  
    toast.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">${mensaje}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto"
                data-bs-dismiss="toast" aria-label="Cerrar"></button>
      </div>
    `;
  
    toastContainer.appendChild(toast);
  
    // Auto-destruir el toast después de 3.5s
    setTimeout(() => toast.remove(), 3500);
  }
  