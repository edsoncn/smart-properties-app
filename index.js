// index.js
import express from "express";

const app = express();
const PORT = 3000;

// Ruta principal
app.get("/", (req, res) => {
  res.send("Hola mundo desde Express con Node.js v22!");
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
