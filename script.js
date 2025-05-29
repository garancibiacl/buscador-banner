
let bannersJSON = [];
let cantidadMaxima = 1;
let bannersSeleccionados = [];

/*async function cargarBannersJson() {
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
});*/

async function cargarBannersJson() {
  const urls = ['assets/banners.json', 'assets/banners-cyber.json']; // <- ambas fuentes
  let resultado = [];

  for (const url of urls) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`No se pudo cargar ${url}`);
      const data = await response.json();
      resultado = resultado.concat(data);
      console.log(`✅ Cargado: ${url}`, data);
    } catch (err) {
      console.error(`❌ Error cargando ${url}:`, err);
    }
  }

  return resultado;
}

window.addEventListener("DOMContentLoaded", async () => {
  bannersJSON = await cargarBannersJson();
  console.log("📦 bannersJSON combinado:", bannersJSON);
});



function actualizarCantidad(select) {
  cantidadMaxima = parseInt(select.value);
  bannersSeleccionados = [];
  document.getElementById("previewHTML").innerHTML = "";
  document.getElementById("codigoGenerado").value = "";
}

function sugerenciasBannerSimple(valor) {
  const box = document.getElementById("sugerencias-banner");
  const input = document.getElementById("buscarBanner");

  // Si el input está vacío, cerramos sugerencias
  if (!valor.trim()) {
    box.innerHTML = '';
    box.classList.add("d-none");
    return;
  }

  // Filtrar banners que coincidan
  const filtrados = bannersJSON.filter(b =>
    b.nombre.toLowerCase().includes(valor.toLowerCase())
  );

  // Si no hay sugerencias, cerramos
  if (filtrados.length === 0) {
    box.innerHTML = '';
    box.classList.add("d-none");
    return;
  }

  // Mostrar sugerencias
  box.innerHTML = '';
  box.classList.remove("d-none");

  filtrados.forEach((b, i) => {
    const item = document.createElement("div");
    item.className = "suggestion-item";
    item.textContent = b.nombre;

    item.onclick = () => {
      // Limpiar input + setear nombre (sin delay)
      input.value = b.nombre;

      // Cierra las sugerencias
      box.innerHTML = '';
      box.classList.add("d-none");

      // Agrega banner
      generarBannerDesdeJson(b);

      // Estilo visual
      input.classList.add("border-success");
      setTimeout(() => input.classList.remove("border-success"), 1000);

      // Toast
      if (typeof mostrarToast === "function") {
        mostrarToast(`✅ Banner "${b.nombre}" agregado`, "success");
      }
    };

    box.appendChild(item);
  });
}


function generarBannerDesdeJson(banner) {
  bannersSeleccionados.push({ ...banner });
  const contenedor = document.getElementById("previewHTML");
  if (!contenedor.querySelector("table")) {
    contenedor.innerHTML = '<table width="600" cellspacing="0" cellpadding="0" align="center"></table>';
  }
  const index = bannersSeleccionados.length - 1;
// 🧠 Vista previa con botón "Editar"
const filaPreview = `
<tr>
  <td colspan="2" align="center">
    <a href="${banner.href}" target="_blank">
      <img src="${banner.img_src}" alt="${banner.alt}" style="display:block;" border="0">
    </a>
 <div class="mt-2 d-flex justify-content-end">
  <button class="btn btn-dark btn-sm mb-2 d-flex align-items-center gap-2 shadow-none border-0 px-2 py-1"
          onclick="abrirModalEditar(${index})"
          style="font-size: 0.85rem;">
    <i class="bx bx-edit-alt bx-xs"></i> Editar
  </button>
</div>
  </td>
</tr>`;
contenedor.querySelector("table").insertAdjacentHTML("beforeend", filaPreview);

  generarHTMLTabla();
}

function abrirModalEditar(index) {
  const banner = bannersSeleccionados[index];
  document.getElementById("bannerIndex").value = index;
  document.getElementById("editHref").value = banner.href;
  document.getElementById("editImg").value = banner.img_src;
  document.getElementById("editAlt").value = banner.alt;
  const modal = new bootstrap.Modal(document.getElementById("modalEditarBanner"));
  modal.show();
}

function guardarCambiosBanner() {
  const index = parseInt(document.getElementById("bannerIndex").value);
  const nuevoHref = document.getElementById("editHref").value;
  const nuevaImg = document.getElementById("editImg").value;
  const nuevoAlt = document.getElementById("editAlt").value;

  // Actualizar el objeto en la lista
  bannersSeleccionados[index].href = nuevoHref;
  bannersSeleccionados[index].img_src = nuevaImg;
  bannersSeleccionados[index].alt = nuevoAlt;

  // Mostrar toast con detalles del banner actualizado
  const mensaje = `
    ✅ Banner actualizado:
    <br><small>
      <strong>Nueva Url:</strong> ${nuevoHref}<br>
      <strong>Nueva Imagen:</strong> ${nuevaImg}<br>
      <strong>Nuevo alt:</strong> ${nuevoAlt}
    </small>
  `.trim();

  mostrarToast(mensaje, "success");

  // Actualizar tabla y cerrar modal
  generarHTMLTabla();
  bootstrap.Modal.getInstance(document.getElementById("modalEditarBanner")).hide();
}



function generarHTMLTabla() {
// ✅ Generar tabla limpia sin botones
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
  
  document.getElementById("codigoGenerado").value = tablaFinal;
  

  document.getElementById("previewHTML").innerHTML = tablaCompleta;

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



function limpiarCamposBanner() {
  bannersSeleccionados = [];
  document.getElementById("buscarBanner").value = "";
  document.getElementById("previewHTML").innerHTML = "";
  document.getElementById("codigoGenerado").value = "";

  const contador = document.getElementById("contadorBanners");
  if (contador) contador.textContent = `0 de ${cantidadMaxima} banners agregados`;

  const barra = document.getElementById("barraProgreso");
  if (barra) {
    barra.style.width = `0%`;
    barra.setAttribute("aria-valuenow", "0");
  }

  mostrarToast("🧹 Campos limpiados", "success");
}


function activarBotonLimpiar() {
  const input = document.getElementById("buscarBanner");
  const btn = document.getElementById("btnClearInput");

  if (input.value.length > 0) {
    btn.classList.remove("d-none");
  }

  input.addEventListener("input", () => {
    if (input.value.length > 0) {
      btn.classList.remove("d-none");
    } else {
      btn.classList.add("d-none");
    }
  });
}

function limpiarInputBuscar() {
  const input = document.getElementById("buscarBanner");
  const btn = document.getElementById("btnClearInput");

  input.value = "";
  btn.classList.add("d-none");

  // Cerrar sugerencias también
  const box = document.getElementById("sugerencias-banner");
  if (box) box.classList.add("d-none");
}



function mostrarToast(mensaje, tipo = 'success') {
  const toastContainer = document.getElementById("toastContainer");
  if (!toastContainer) return console.warn("⚠️ toastContainer no existe");

  const toast = document.createElement("div");
  toast.className = `toast align-items-center text-white bg-${tipo} border-0 show mb-2`;
  toast.setAttribute("role", "alert");
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${mensaje}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Cerrar"></button>
    </div>
  `;

  toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}
