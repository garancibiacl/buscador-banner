exports.handler = async function(event, context) {
    const fs = require("fs");
    const path = require("path");
  
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: "Method Not Allowed",
      };
    }
  
    try {
      const body = JSON.parse(event.body);
      const { tipo, banner } = body;
  
      const carpeta = path.resolve("/tmp");
      const nombreArchivo = tipo === "huinchas" ? "huinchas.json"
                        : tipo === "banners-cyber" ? "banners-cyber.json"
                        : "banners.json";
  
      const rutaArchivo = path.join(carpeta, nombreArchivo);
  
      let datosActuales = [];
      if (fs.existsSync(rutaArchivo)) {
        const contenido = fs.readFileSync(rutaArchivo, "utf8");
        datosActuales = JSON.parse(contenido || "[]");
      }
  
      datosActuales.push(banner);
      fs.writeFileSync(rutaArchivo, JSON.stringify(datosActuales, null, 2));
  
      return {
        statusCode: 200,
        body: "Banner guardado correctamente en " + nombreArchivo,
      };
    } catch (error) {
      console.error("Error al guardar:", error);
      return {
        statusCode: 500,
        body: "Error al guardar banner",
      };
    }
  };