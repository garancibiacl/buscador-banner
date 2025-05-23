
let bannersJSON = [];

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
  const tablaHTML = `
<table width="600" cellspacing="0" cellpadding="0" align="center">
  <tr>
    <td colspan="2" align="center">
      <a href="${banner.href}" target="_blank">
        <img src="${banner.img_src}" alt="${banner.alt}" style="display:block;" border="0">
      </a>
    </td>
  </tr>
</table>`.trim();

  document.getElementById("previewHTML").innerHTML = `
    <a href="${banner.href}" target="_blank">
      <img src="${banner.img_src}" class="img-fluid rounded shadow" id="previewImg">
    </a>
  `;
  document.getElementById("codigoGenerado").value = tablaHTML;
}

function copiarCodigo() {
  const area = document.getElementById("codigoGenerado");
  area.select();
  document.execCommand("copy");
  alert("✅ HTML copiado");
}
