// URL que nos dará Render cuando creemos la API
const API_URL = "https://tu-api-en-render.onrender.com/api/consumo-agua";

async function cargarDatos() {
  try {
    const response = await fetch(API_URL);
    const datos = await response.json();
    console.log("Datos recibidos de la BD:", datos);
    
    // Aquí actualizas tu HTML o gráficos con los datos
  } catch (error) {
    console.error("Error al obtener los datos:", error);
  }
}

cargarDatos();