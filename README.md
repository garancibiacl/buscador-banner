# 🧭 GUÍA RÁPIDA: Cómo usar el Buscador de Banners

✨ Esta herramienta fue creada para **ahorrarte tiempo**, ayudarte a seleccionar banners visuales y generar código HTML con solo unos clics.  
Sigue estos pasos sencillos y estarás listo.

---

## ✅ 1. Buscar y agregar banners

🔍 **¿Quieres agregar un banner ya existente?**

1. Ve al campo que dice:  
   `🔎 Buscar banner por nombre`
2. Escribe el nombre del banner (ej: *"cyber cocina"*, *"huincha jardín"*).
3. Te aparecerán sugerencias. Haz clic en la que quieras.
4. El banner se agregará automáticamente al listado visual.

👉 Si quieres agregar otro **debajo**, repite el proceso.

🗑️ Para **eliminar** uno que ya agregaste:  
haz clic en la ❌ del banner que quieras quitar.

---

## ✅ 2. Crear un nuevo banner desde cero

🧱 ¿No encuentras tu banner? ¡Créalo!

1. Haz clic en el botón **“➕ Crear Banner”**
2. Se abrirá un **modal** con 4 campos:
   - **Nombre** → título del banner (solo para ti)
   - **URL del enlace** → hacia dónde va el usuario si hace clic
   - **Imagen (src)** → link directo a la imagen del banner
   - **Texto alternativo (alt)** → descripción accesible de la imagen
3. Completa los campos.
4. Haz clic en **Guardar banner**.

⚙️ Si la URL es del dominio `www.sodimac.cl/sodimac-cl`, se convertirá automáticamente en AMPscript, para que funcione en campañas.

El banner se guardará automáticamente en el archivo `banners.json` y estará disponible para futuras búsquedas.

---

## ✅ 3. Copiar el HTML limpio generado

🧩 ¿Ya seleccionaste los banners que necesitas?

1. Haz clic en el botón **“📋 Copiar HTML”**
2. Se copiará automáticamente al portapapeles el bloque HTML con todos los banners seleccionados.
3. Puedes pegarlo en tu editor, en tu herramienta de marketing o donde lo necesites.

Incluye enlaces, imágenes, AMPscript (si aplica) y estructura lista para envío.

---

## ✅ 4. Otras funciones útiles

💾 **Transformar una tabla HTML en JSON**  
¿Tienes un banner ya armado como tabla y quieres pasarlo a JSON?

1. Haz clic en “🧩 Transformar tabla HTML a JSON”
2. Pega el código HTML (incluyendo el `<!-- comentario -->` si quieres que se use como nombre).
3. Haz clic en **“Transformar y guardar”**.
4. Se guarda automáticamente en tu archivo y queda disponible.

---

## 🧠 Tips para sacarle el máximo provecho

- Usa nombres fáciles de recordar para buscar tus banners.
- Agrupa por campaña o tipo: *“cyber cocina”*, *“huincha jardín”*.
- Puedes crear huinchas (banners sin URL) dejando el campo de enlace vacío.
- Si pegas solo un path de imagen (`/static/...`), el sistema lo convierte en URL completa.