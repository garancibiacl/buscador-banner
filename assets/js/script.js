// Inicializar todos los tooltips
document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => {
  new bootstrap.Tooltip(el, {
    customClass: 'tooltip-dark'
  });
});


// Mostrar/ocultar dropdown al hacer clic en el botón
document.getElementById("btnToggleRecientes").addEventListener("click", () => {
  const dropdown = document.getElementById("dropdownRecientes");
  dropdown.classList.toggle("d-none");
});


// START Evento para cada opción del menú
document.querySelectorAll(".dropdown-option").forEach(item => {
  item.addEventListener("click", () => {
    const orden = item.dataset.order;
    const cont = document.getElementById("dropdownRecientes");
    const btn  = document.getElementById("btnToggleRecientes");

    // Limpia estado anterior
    cont.querySelectorAll(".dropdown-option").forEach(opt => {
      opt.classList.remove("active");
      const ic = opt.querySelector("i.bx-check");
      if (ic) ic.remove();
    });

    // Marca el nuevo
    item.classList.add("active");
    const check = document.createElement("i");
    check.className = "bx bx-check bx-sm";
    item.appendChild(check);

    // **ACTUALIZA EL BOTÓN** con el texto de la opción
    const nuevoTexto = item.textContent.trim();
    btn.innerHTML = `<i class="bx bx-menu-select bx-sm"></i> ${nuevoTexto}`;

    // Lógica de orden y render
    switch (orden) {
      case "agregado":
        bannersRecientes.sort((a,b)=> (b.timestamp||0)-(a.timestamp||0));
        break;
      case "mas-usados":
        bannersRecientes.sort((a,b)=> (b.clicks||0)-(a.clicks||0));
        break;
      case "alfabetico":
        bannersRecientes.sort((a,b)=> (a.nombre||"").localeCompare(b.nombre||""));
        break;
    }
    renderizarRecientes();

    // Cierra el dropdown
    cont.classList.add("d-none");
  });
});

// FIN Evento para cada opción del menú



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
const urls = ['backend/data/banners.json', 'backend/data/cyber-banner.json']; // <- ambas fuentes
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
  // ✅ 1. Cargar recientes al instante, sin esperar JSON
  const dataRecientes = localStorage.getItem("bannersRecientes");
  bannersRecientes = dataRecientes ? JSON.parse(dataRecientes) : [];

// ✅ Si algún banner no tiene timestamp, asígnaselo ahora
bannersRecientes = bannersRecientes.map(b => ({
  ...b,
  timestamp: b.timestamp || Date.now(),
  clicks: b.clicks || 0
}));

  renderizarRecientes(); // 🕘 Mostrar de inmediato



  // ✅ 2. Luego carga banners principales
  bannersJSON = await cargarBannersJson("banners.json");
  cyberBannersJSON = await cargarBannersJson("cyber-banner.json");

  

  renderizarBanners(bannersJSON, '#listaBanners');
  renderizarBanners(cyberBannersJSON, '#listaCyberBanners');

  console.log("📦 banners cargados:", bannersJSON);
  console.log("📦 cyber cargados:", cyberBannersJSON);
  console.log("🕘 banners recientes:", bannersRecientes);
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

  // 💡 Limpia recientes cuando se empieza una nueva búsqueda
  /*if (valor.length === 1) {
    bannersRecientes = [];
    localStorage.removeItem("bannersRecientes");
    renderizarRecientes();
  }*/

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
  // 👇 ❌ Antes: setear valor (esto ya no es necesario)
  // input.value = b.nombre;

  // ✅ Ahora: limpiar input
  input.value = "";

  // Cierra las sugerencias
  box.innerHTML = '';
  box.classList.add("d-none");

 

  // Agrega y actualiza
  generarBannerDesdeJson(b);
  agregarARecientes(b);
  actualizarVistaBanner(b);
  renderizarRecientes(); // 👈 Esto mostrará los banners recientes al instante


  // Estilo visual (con validación opcional)
  input.classList.add("border-success");
  setTimeout(() => input.classList.remove("border-success"), 1000);

    // Toast
  /*if (typeof mostrarToast === "function") {
      mostrarToast(`✅ Banner "${b.nombre}" agregado`, "success");
    }*/
  };

  box.appendChild(item);
});
}


function generarBannerDesdeJson(banner) {
bannersSeleccionados.push({ ...banner });

const contenedor = document.getElementById("previewHTML");
if (!contenedor.querySelector("table")) {
  contenedor.innerHTML = '<table width="600" cellspacing="0" cellpadding="0" align="center" id="tablaPreview"></table>';
}

const index = bannersSeleccionados.length - 1;
const esHuincha = !banner.href?.trim();

const contenido = esHuincha
  ? `<img src="${banner.img_src}" alt="${banner.alt}" style="display:block;" border="0">`
  : `<a href="${banner.href}" target="_blank">
       <img src="${banner.img_src}" alt="${banner.alt}" style="display:block;" border="0">
     </a>`;

const botonEditar = `
  <div class="mt-2 d-flex justify-content-end gap-2">

    <button class="tooltip-btn btn btn-dark btn-sm mb-2 d-flex align-items-center gap-2 shadow-none border-0 px-2 py-1"
            onclick="abrirModalEditar(${index})"
            style="font-size: 0.85rem;">
      <i class="bx bx-edit-alt bx-xs"></i> Editar
      <span class="tooltip-text">Editar banner</span>
    </button>

    <button class="tooltip-btn btn btn-danger btn-sm mb-2 d-flex align-items-center gap-2 shadow-none border-0 px-2 py-1"
            onclick="eliminarBanner(${index}, this)"
            style="font-size: 0.85rem;">
      <i class="bx bx-trash bx-xs"></i> Eliminar
      <span class="tooltip-text">Eliminar banner</span>
    </button>

  </div>`;

const filaPreview = `
<tr id="fila-banner-${index}">
<td colspan="2" align="center">
  ${contenido}
  ${botonEditar}
</td>
</tr>`;

contenedor.querySelector("table").insertAdjacentHTML("beforeend", filaPreview);

document.getElementById("previewHTML").innerHTML = generarHTMLDesdeSeleccionados();
document.getElementById("codigoGenerado").value = generarHTMLDesdeSeleccionados();


mostrarToast(`🎯 Seleccionaste: <strong>${banner.nombre}</strong>`, "purple-toast");
actualizarContador();
generarHTMLTabla();


}


function eliminarBanner(index, boton) {
  // 1. Eliminar la fila del DOM
  const fila = document.getElementById(`fila-banner-${index}`);
  if (fila) fila.remove();

  // 2. Quitar del array
  bannersSeleccionados.splice(index, 1);

  // 3. Limpiar el cache de código y el input de búsqueda
  const codigoTextarea = document.getElementById("codigoGenerado");
  if (codigoTextarea) codigoTextarea.value = "";

  const buscarInput = document.getElementById("buscarBanner");
  if (buscarInput) buscarInput.value = "";

  // 4. Si no quedan banners, restaurar la vista inicial
  if (bannersSeleccionados.length === 0) {
    document.getElementById("previewHTML").innerHTML = `
      <div class="d-flex flex-column align-items-center justify-content-center" style="min-height: 250px;">
        <i class='bx bx-image-alt' style="font-size: 4rem; opacity: 0.3;"></i>
        <p class="mt-2 mb-0 text-white-50">Esperando selección...</p>
      </div>`;
    
    // Volver a renderizar todo el histórico de recientes
    renderizarRecientes();

    // Ocultar botón “Limpiar input” si existe
    const btnClear = document.getElementById("btnClearInput");
    if (btnClear) btnClear.classList.add("d-none");
  } else {
    // 5. Si aún quedan banners, regenerar sólo la tabla de HTML
    generarHTMLTabla();
  }

  // 6. Feedback al usuario y actualización del contador
  mostrarToast("🗑️ Banner eliminado", "danger");
  actualizarContador();
}


function generarHTMLDesdeSeleccionados() {
  if (bannersSeleccionados.length === 0) {
    renderizarRecientes();

    return `
      <div class="d-flex flex-column align-items-center justify-content-center" style="min-height: 250px;">
        <i class='bx bx-image-alt' style="font-size: 4rem; opacity: 0.3;"></i>
        <p class="mt-2 mb-0 text-white-50">Esperando selección...</p>
      </div>
    `;
  }

  return bannersSeleccionados.map((b, index) => {
    const tabla = `
      <table width="600" cellspacing="0" cellpadding="0" align="center">
        <tr>
          <td colspan="2" align="center">
            <a href="${b.href}" target="_blank">
              <img src="${b.img_src}" alt="${b.alt}" style="display:block;" border="0">
            </a>
          </td>
        </tr>
      </table>
    `;

    const pieBanner = `
      <div class="d-flex justify-content-between align-items-center mt-2 flex-wrap">
        <div class="nombre-banner-inferior text-truncate">${b.nombre || '📛 Sin nombre'}</div>
        <div class="d-flex gap-2 mt-2 mt-sm-0">
          <button class="tooltip-btn btn btn-dark btn-sm d-flex align-items-center gap-2 shadow-none border-0 px-2 py-1"
                  onclick="abrirModalEditar(${index})"
                  style="font-size: 0.85rem;">
            <i class="bx bx-edit-alt bx-xs"></i> Editar
            <span class="tooltip-text">Editar banner</span>
          </button>

          <button class="tooltip-btn btn btn-danger btn-sm d-flex align-items-center gap-2 shadow-none border-0 px-2 py-1"
                  onclick="eliminarBanner(${index}, this)"
                  style="font-size: 0.85rem;">
            <i class="bx bx-trash bx-xs"></i> Eliminar
            <span class="tooltip-text">Eliminar banner</span>
          </button>
        </div>
      </div>
    `;

    return `<div id="fila-banner-${index}" class="mb-4">${tabla}${pieBanner}</div>`;
  }).join("\n");
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
const tablaHTML = bannersSeleccionados.map(b => {
  const esHuincha = !b.href?.trim();
  const contenido = esHuincha
    ? `<img src="${b.img_src}" alt="${b.alt}" style="display:block;" border="0">`
    : `<a href="${b.href}" target="_blank">
         <img src="${b.img_src}" alt="${b.alt}" style="display:block;" border="0">
       </a>`;
  return `
  <tr>
    <td colspan="2" align="center">
      ${contenido}
    </td>
  </tr>`;
}).join("");

const tablaFinal = `
<table width="600" cellspacing="0" cellpadding="0" align="center">
${tablaHTML}
</table>`.trim();

document.getElementById("codigoGenerado").value = tablaFinal;

// ❌ No reemplazar vista previa visual aquí
// document.getElementById("previewHTML").innerHTML = tablaFinal;
}


function copiarCodigo() {
const area = document.getElementById("codigoGenerado");
area.select();
document.execCommand("copy");
mostrarToast("📋 HTML copiado correctamente", "success");
}

function actualizarContador() {
const contador = document.getElementById("contadorBanners");
const total = bannersSeleccionados.length;



if (!contador) {
  console.warn("⚠️ No se encontró el elemento #contadorBanners");
  return;
}

// 🧠 Texto dinámico sin máximo
contador.textContent = `${total} banner${total !== 1 ? 's' : ''} agregados 🎯`;

// 🎨 Visual style
contador.className = `glass-badge px-3 rounded-pill  ${
  total === cantidadMaxima ? 'glass-badge' : 'glass-badge'
}`;

// ✨ Animación sutil
contador.classList.add("animate__animated", "animate__bounceIn");
setTimeout(() => contador.classList.remove("animate__animated", "animate__bounceIn"), 600);


}






function limpiarCamposBanner() {
  bannersSeleccionados = [];
  document.getElementById("buscarBanner").value = "";
  document.getElementById("codigoGenerado").value = "";

  // 🧼 Restaurar imagen de espera en preview
  document.getElementById("previewHTML").innerHTML = `
    <div class="d-flex flex-column align-items-center justify-content-center" style="min-height: 250px;">
      <i class='bx bx-image-alt' style="font-size: 4rem; opacity: 0.3;"></i>
      <p class="mt-2 mb-0 text-white-50">Esperando selección...</p>
    </div>
  `;

  // 🧮 Reset contador
  const contador = document.getElementById("contadorBanners");
  if (contador) contador.textContent = "0 banners agregados";

  // 🔄 Reset barra de progreso
  const barra = document.getElementById("barraProgreso");
  if (barra) barra.style.width = "0%";

  // 🧽 Limpiar recientes
  bannersRecientes = [];
  localStorage.removeItem("bannersRecientes");
  renderizarRecientes(); // ← actualiza la vista inmediatamente

  // ✅ Toast opcional
  mostrarToast("🧼 Todos los campos y recientes fueron limpiados", "info");
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



function mostrarToast(mensaje, tipo = 'purple-toast') {
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




window.addEventListener("DOMContentLoaded", () => {
const loader = document.getElementById("loaderOverlay");

const tiempoMinimoVisible = 800;
const tiempoInicio = Date.now();

requestAnimationFrame(() => {
  const tiempoTranscurrido = Date.now() - tiempoInicio;
  const restante = Math.max(0, tiempoMinimoVisible - tiempoTranscurrido);

  setTimeout(() => {
    loader.style.opacity = "0";
    setTimeout(() => loader.remove(), 500); // coincide con transición CSS
  }, restante);
});
});




function mostrarBannerEnPreview(htmlDelBanner) {
const contenedor = document.getElementById("previewHTML");
const imagenEspera = document.getElementById("imagenEspera");

// Elimina imagen si existe
if (imagenEspera) imagenEspera.remove();

// Inserta el banner
contenedor.innerHTML += htmlDelBanner;

// Baja el scroll al final si se agregó algo nuevo
contenedor.scrollTop = contenedor.scrollHeight;
}

function limpiarPreviewHTML() {
const contenedor = document.getElementById("previewHTML");
contenedor.innerHTML = `
  <img id="imagenEspera" src="https://i.imgur.com/Q1qVbSQ.png" alt="Esperando contenido"
       class="mx-auto d-block img-fluid opacity-50" style="max-width: 180px;">
`;
}





document.getElementById('guardarNuevoBanner').addEventListener('click', () => {
const nombre = document.getElementById('nuevoNombre').value.trim();
let href = document.getElementById('nuevoHref').value.trim();
const img_src = document.getElementById('nuevoImg').value.trim();
const alt = document.getElementById('nuevoAlt').value.trim();

if (!nombre || !img_src) {
  mostrarToast("❌ Debes ingresar al menos el nombre y la URL de la imagen", "danger");
  return;
}

// 🧠 Si el href es del dominio sodimac-cl, aplicar AMPscript
if (href.startsWith("https://www.sodimac.cl/sodimac-cl")) {
  href = `%%=RedirectTo(concat('${href}',@prefix))=%%`;
}

const nuevoBanner = { nombre, href, img_src, alt };

// 🔥 Guardar en archivo lógico (banners.json o cyber-banner.json)
guardarBannerEnSeleccion(nuevoBanner);

mostrarToast("✅ Banner creado exitosamente", "success");

['nuevoNombre', 'nuevoHref', 'nuevoImg', 'nuevoAlt'].forEach(id => {
  document.getElementById(id).value = '';
});

const modal = bootstrap.Modal.getInstance(document.getElementById('modalCrearBanner'));
modal.hide();
});


/*
<!-- Función para guardar en 2 archivos y alert -->
function preguntarYGuardarBannerJSON() {
Swal.fire({
  title: '¿Dónde quieres guardar el JSON?',
  text: 'Elige el archivo donde guardar los banners',
  icon: 'question',
  showCancelButton: true,
  confirmButtonText: '📁 Guardar en banners.json',
  cancelButtonText: '💾 Guardar en cyber-banner.json',
  reverseButtons: true
}).then((result) => {
  if (result.isConfirmed) {
    descargarJSON(bannersJSON, 'banners.json');
  } else if (result.dismiss === Swal.DismissReason.cancel) {
    descargarJSON(bannersJSON, 'cyber-banner.json');
  }
});
}




function guardarBannerEnSeleccion(banner) {
Swal.fire({
  title: '¿Dónde deseas guardar este banner?',
  text: 'Elige el archivo lógico',
  icon: 'question',
  showCancelButton: true,
  confirmButtonText: '📁 Guardar en banners.json',
  cancelButtonText: '💾 Guardar en cyber-banner.json',
  reverseButtons: true
}).then((result) => {
  if (result.isConfirmed) {
    bannersJSON.push(banner);
    guardarEnStorageBanners();
    guardarBannerEnBackend(banner, 'normal');
    renderizarBanners(bannersJSON, '#listaBanners');
    mostrarToast('✅ Guardado en banners.json');
  } else if (result.dismiss === Swal.DismissReason.cancel) {
    cyberBannersJSON.push(banner);
    guardarEnStorageBanners();
    guardarBannerEnBackend(banner, 'cyber');
    renderizarBanners(cyberBannersJSON, '#listaCyberBanners');
    mostrarToast('✅ Guardado en cyber-banner.json');
  }
  
});
}

*/


function preguntarYGuardarBannerJSON(banner) {
// Siempre guardar en banners.json
bannersJSON.push(banner);
guardarEnStorageBanners();
guardarBannerEnBackend(banner, 'normal');
renderizarBanners(bannersJSON, '#listaBanners');
mostrarToast('✅ Guardado automáticamente en banners.json');
}


function guardarBannerEnSeleccion(banner) {
// Guardar siempre en banners.json sin preguntar
bannersJSON.push(banner);
guardarEnStorageBanners();
guardarBannerEnBackend(banner, 'normal');
renderizarBanners(bannersJSON, '#listaBanners');
mostrarToast('✅ Guardado directamente en banners.json');
}




function guardarEnLocalStorage() {
localStorage.setItem('bannersJSON', JSON.stringify(bannersJSON));
localStorage.setItem('cyberBannersJSON', JSON.stringify(cyberBannersJSON));
}


function cargarDesdeLocalStorage() {
bannersJSON = JSON.parse(localStorage.getItem('bannersJSON')) || [];
cyberBannersJSON = JSON.parse(localStorage.getItem('cyberBannersJSON')) || [];

renderizarBanners(bannersJSON, '#listaBanners');
renderizarBanners(cyberBannersJSON, '#listaCyberBanners');
}

window.addEventListener('DOMContentLoaded', cargarDesdeLocalStorage);

// 🔗 Función para guardar banner en backend
function guardarBannerEnBackend(banner, tipo) {
fetch('http://localhost:3000/guardar-banner', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ tipo, banner })
})
.then(res => res.text())
.then(msg => {
  mostrarToast(`💾 ${msg}`, "success");

  // 🔁 Agrega a la UI si aún no estaba (solo respaldo extra)
  if (tipo === 'cyber' && !cyberBannersJSON.includes(banner)) {
    cyberBannersJSON.push(banner);
    guardarEnStorageBanners();
    renderizarBanners(cyberBannersJSON, '#listaCyberBanners');
  } else if (tipo === 'normal' && !bannersJSON.includes(banner)) {
    bannersJSON.push(banner);
    guardarEnStorageBanners();
    renderizarBanners(bannersJSON, '#listaBanners');
  }
})
.catch(err => {
  console.error('❌ Error al guardar en backend', err);
  mostrarToast('❌ Error al guardar en backend', 'danger');
});
}


// ✅ Lógica de carga y persistencia en localStorage para banners
let bannersJSON = JSON.parse(localStorage.getItem("bannersJSON")) || [];
let cyberBannersJSON = JSON.parse(localStorage.getItem("cyberBannersJSON")) || [];

function guardarEnStorageBanners() {
localStorage.setItem("bannersJSON", JSON.stringify(bannersJSON));
localStorage.setItem("cyberBannersJSON", JSON.stringify(cyberBannersJSON));
}

function cargarDesdeStorageBanners() {
bannersJSON = JSON.parse(localStorage.getItem("bannersJSON")) || [];
cyberBannersJSON = JSON.parse(localStorage.getItem("cyberBannersJSON")) || [];
renderizarBanners(bannersJSON, '#listaBanners');
renderizarBanners(cyberBannersJSON, '#listaCyberBanners');
}

window.addEventListener('DOMContentLoaded', () => {
cargarDesdeStorageBanners();
});



function transformarYGuardarEnBackend() {
const inputHTML = document.getElementById("areaHTML").value;
const tipo = document.getElementById("tipoArchivo").value;

const doc = new DOMParser().parseFromString(inputHTML, "text/html");
const tabla = doc.querySelector("table");
const img = tabla?.querySelector("img");
const a = tabla?.querySelector("a");

if (!tabla || !img) {
  mostrarToast("❌ Debes incluir al menos una <table> con <img>", "danger");
  return;
}

// 🧠 Buscar comentario anterior a la tabla
const comentarioNodo = Array.from(doc.childNodes).find(n =>
  n.nodeType === Node.COMMENT_NODE && n.textContent.trim()
);

const nombre = comentarioNodo?.textContent.trim() || img?.alt || "Sin nombre";

const banner = {
  nombre,
  href: a?.getAttribute("href") || "",
  img_src: img?.getAttribute("src") || "",
  alt: img?.getAttribute("alt") || ""
};

fetch("http://localhost:3000/guardar-banner", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ tipo, banner })
})
  .then(res => res.text())
  .then(msg => {
    mostrarToast("✅ Banner guardado en archivo JSON", "success");
    document.getElementById("resultadoJSON").textContent = JSON.stringify(banner, null, 2);
    navigator.clipboard.writeText(JSON.stringify(banner, null, 2));
  })
  .catch(err => {
    console.error("❌ Error al guardar:", err);
    mostrarToast("❌ Error al guardar en backend", "danger");
  });

  fetch("/.netlify/functions/guardar-banner", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tipo, banner })
  })
  
}

// START FUNCION MODAL DE AYUDA

document.addEventListener('DOMContentLoaded', () => {
  fetch('README.md')
    .then(res => res.text())
    .then(data => {
      document.getElementById('contenidoAyuda').textContent = data;
    })
    .catch(err => {
      document.getElementById('contenidoAyuda').innerHTML = "<div class='text-danger'>❌ Error al cargar la ayuda.</div>";
      console.error("Error al cargar guía:", err);
    });
});

// FIN FUNCION MODAL DE AYUDA


// START DE LISTAS RECIENTES


// Agrega un banner a los recientes (máximo 8)
function agregarARecientes(banner) {
  const index = bannersRecientes.findIndex(b => b.nombre === banner.nombre);

  if (index !== -1) {
    // Si ya existe, aumentar contador
    bannersRecientes[index].usos = (bannersRecientes[index].usos || 0) + 1;
  } else {
    // Si es nuevo, agregarlo con contador
    banner.usos = 1;
    bannersRecientes.unshift(banner);
  }

  localStorage.setItem("bannersRecientes", JSON.stringify(bannersRecientes));
  renderizarRecientes();
}

// Renderiza los banners recientes en el contenedor #listaRecientes Badge
/*function renderizarRecientes() {
  const cont = document.getElementById("listaRecientes");

  if (!cont) return;

  cont.innerHTML = "";

  if (!Array.isArray(bannersRecientes) || bannersRecientes.length === 0) {
    cont.innerHTML = "<span class='text-secondary'>Sin banners recientes aún</span>";
    return;
  }

  const titulo = document.createElement("div");
  titulo.className = "col-12 fw-semibold text-white-50 mb-1";
  titulo.textContent = "🕘 Banners recientes usados:";
  cont.appendChild(titulo);

  bannersRecientes.slice(0, 5).forEach((b, index) => {
    const wrapper = document.createElement("div");
    wrapper.className = "d-inline-flex align-items-center me-2 mb-2 bg-dark border border-light rounded-pill px-2";
    wrapper.style.paddingRight = "6px";

    const item = document.createElement("button");
    item.className = "btn btn-sm btn-link text-light text-decoration-none p-0 me-2";
    item.textContent = b.nombre || '[Sin nombre]';
    item.onclick = () => {
      generarBannerDesdeJson(b);
      actualizarVistaBanner(b);
      renderizarRecientes();

      mostrarToast(`✅ "${b.nombre}" agregado desde recientes`, "success");

      // Guardar el nombre en vista
      window.bannerEnVista = b.nombre;
    };

    const closeBtn = document.createElement("button");
    closeBtn.className = "btn-close btn-close-white btn-sm";
    closeBtn.style.opacity = 0.7;
    closeBtn.onclick = (e) => {
      e.stopPropagation();
      bannersRecientes = bannersRecientes.filter(r => r.nombre !== b.nombre);
      localStorage.setItem("bannersRecientes", JSON.stringify(bannersRecientes));
      renderizarRecientes();

      // Solo limpiar si se estaba mostrando el mismo banner
      if (window.bannerEnVista === b.nombre) {
        const preview = document.getElementById("previewHTML");
        const codigo = document.getElementById("codigoGenerado");
        const contador = document.getElementById("contadorBanners");
        const inputBuscar = document.getElementById("buscarBanner");

        if (preview) {
          preview.innerHTML = `
            <div class="d-flex flex-column align-items-center justify-content-center" style="min-height: 250px;">
              <i class='bx bx-image-alt' style="font-size: 4rem; opacity: 0.3;"></i>
              <p class="mt-2 mb-0 text-white-50">Esperando selección...</p>
            </div>
          `;
        }
        if (codigo) codigo.value = "";
        if (inputBuscar) inputBuscar.value = "";

        window.bannerEnVista = null;
      }
    };

    wrapper.appendChild(item);
    wrapper.appendChild(closeBtn);
    cont.appendChild(wrapper);
  });
}*/


// Renderiza los banners recientes en el contenedor #listaRecientes 

function renderizarRecientes() {
  const cont = document.getElementById("listaRecientes");
  if (!cont) return;

  cont.innerHTML = "";

  if (!Array.isArray(bannersRecientes) || bannersRecientes.length === 0) {
    cont.innerHTML = `<div class="text-secondary px-3 py-2">No hay banners recientes aún.</div>`;
    return;
  }

  const titulo = document.createElement("div");
  titulo.className = "px-2 fw-semibold text-white-50 mb-2";
  // titulo.textContent = "🕘 Banners recientes usados:";
  cont.appendChild(titulo);

  bannersRecientes.slice(0, 30).forEach((b) => {
    const wrapper = document.createElement("div");
    wrapper.className = "banner-item d-flex align-items-center gap-3 px-3 py-2";
    wrapper.style.cursor = "pointer";
    wrapper.onclick = () => {
       // Incrementar clics
  b.clicks = (b.clicks || 0) + 1;
  localStorage.setItem("bannersRecientes", JSON.stringify(bannersRecientes));

  generarBannerDesdeJson(b);
  actualizarVistaBanner(b);
  renderizarRecientes();
  mostrarToast(`✅ "${b.nombre}" agregado desde recientes`, "success");
  window.bannerEnVista = b.nombre;
    };

    const img = document.createElement("img");
    img.src = b.img_src;
    img.alt = b.alt || "Banner";
    img.style.width = "38px";
    img.style.height = "38px";
    img.style.objectFit = "cover";
    img.style.borderRadius = "4px";

    const info = document.createElement("div");
// Detectar tipo según el nombre
let tipo = "Banner";
let tipoClase = "badge badge-green";

if (/^huincha/i.test(b.nombre)) {
  tipo = "Huincha";
  tipoClase = "badge badge-orange";
}

    info.className = "flex-grow-1";
    info.innerHTML = `
    <div class="nombre text-truncate text-light" title="${b.nombre}">${b.nombre}</div>
    <div class="tipo mt-1"><span class="${tipoClase}"> ${tipo}</span></div>
  `;
  

    const closeBtn = document.createElement("button");
    closeBtn.className = "tooltip-btn";
    closeBtn.style.background = "transparent"; // ❌ Elimina fondo gris
closeBtn.style.boxShadow = "none";         // ❌ Elimina sombra por si acaso
closeBtn.style.border = "none";            // ❌ Asegura que no tenga bordes
closeBtn.style.opacity = "0.7";  
closeBtn.style.fontSize = "1.3rem";  
closeBtn.style.zIndex = 9999; 

// Agregar el tooltip como un span hijo
const tooltip = document.createElement("span");
tooltip.className = "tooltip-close tooltip-text";
tooltip.textContent = "Eliminar";

// Asegúrate de que el botón tenga algo visual si la clase no lo muestra
closeBtn.innerHTML = "&times;"; // Alternativa visual si la clase falla

// Añadir tooltip al botón
closeBtn.appendChild(tooltip);

    closeBtn.onclick = (e) => {
      e.stopPropagation();
      bannersRecientes = bannersRecientes.filter(r => r.nombre !== b.nombre);
      localStorage.setItem("bannersRecientes", JSON.stringify(bannersRecientes));
      renderizarRecientes();

      if (window.bannerEnVista === b.nombre) {
        const preview = document.getElementById("previewHTML");
        const codigo = document.getElementById("codigoGenerado");
        const contador = document.getElementById("contadorBanners");
        const inputBuscar = document.getElementById("buscarBanner");

        if (preview) {
          preview.innerHTML = `
            <div class="d-flex flex-column align-items-center justify-content-center" style="min-height: 250px;">
              <i class='bx bx-image-alt' style="font-size: 4rem; opacity: 0.3;"></i>
              <p class="mt-2 mb-0 text-white-50">Esperando selección...</p>
            </div>
          `;
        }
        if (codigo) codigo.value = "";
        if (inputBuscar) inputBuscar.value = "";

        window.bannerEnVista = null;
      }
      
    };

    wrapper.appendChild(img);
    wrapper.appendChild(info);
    wrapper.appendChild(closeBtn);
    cont.appendChild(wrapper);
  });
}
// FinInicializar lista de banners recientes

// Cargar recientes desde localStorage cuando arranca
window.addEventListener("DOMContentLoaded", () => {
  const data = localStorage.getItem("bannersRecientes");
  if (data) {
    try {
      bannersRecientes = JSON.parse(data);
    } catch {
      bannersRecientes = [];
    }
  }
  renderizarRecientes();
});

// FIN DE LISTAS RECIENTES


const searchInput = document.getElementById("searchInput");
const clearBtn = document.getElementById("clearBtn");

clearBtn.addEventListener("click", () => {
  searchInput.value = "";
  searchInput.focus();
});











function agregarARecientes(banner) {
  const now = Date.now();

  // Elimina si ya existe
  bannersRecientes = bannersRecientes.filter(b => b.nombre !== banner.nombre);

  // Agrega el timestamp
  bannersRecientes.unshift({
    ...banner,
    timestamp: now,
    clicks: (banner.clicks || 0)
  });

  localStorage.setItem("bannersRecientes", JSON.stringify(bannersRecientes));
  renderizarRecientes();
}


