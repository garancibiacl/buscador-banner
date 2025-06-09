const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.post('/guardar-banner', (req, res) => {
  const { tipo, banner } = req.body;

  const archivo = tipo === 'cyber' ? 'cyber-banner.json' : 'banners.json';
  const ruta = `./data/${archivo}`;

  fs.readFile(ruta, 'utf8', (err, data) => {
    let banners = [];

    if (!err && data) {
      try {
        banners = JSON.parse(data);
      } catch (e) {
        console.error('⚠️ Error al leer el JSON:', e);
      }
    }

    banners.push(banner);

    fs.writeFile(ruta, JSON.stringify(banners, null, 2), err => {
      if (err) {
        console.error('❌ No se pudo guardar:', err);
        return res.status(500).send('Error al guardar el banner.');
      }

      console.log(`✅ Banner guardado en ${archivo}`);
      res.send('Banner guardado correctamente.');
    });
  });
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Backend escuchando en http://localhost:${PORT}`);
  });
}
