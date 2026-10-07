// Esperar a que cargue el documento
document.addEventListener("DOMContentLoaded", () => {
  inicializarGraficas();
});

function inicializarGraficas() {
  // Gráfica de Barras: Ventas por Categoría (Ejemplo de inicio)
  const ctxCategorias = document.getElementById('graficaCategorias').getContext('2d');
  new Chart(ctxCategorias, {
    type: 'bar',
    data: {
      labels: ['Abarrotes', 'Lácteos', 'Carnes', 'Frutas y Verduras', 'Bebidas'],
      datasets: [{
        label: 'Ventas ($)',
        data: [12000, 19000, 8000, 15000, 22000],
        backgroundColor: '#10b981'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#cbd5e1' } }
      },
      scales: {
        x: { ticks: { color: '#94a3b8' } },
        y: { ticks: { color: '#94a3b8' } }
      }
    }
  });

  // Gráfica de Líneas: Tendencia Mensual
  const ctxTendencia = document.getElementById('graficaTendencia').getContext('2d');
  new Chart(ctxTendencia, {
    type: 'line',
    data: {
      labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
      datasets: [{
        label: 'Ventas Mensuales',
        data: [30000, 45000, 40000, 60000, 55000, 75000],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        fill: true,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#cbd5e1' } }
      },
      scales: {
        x: { ticks: { color: '#94a3b8' } },
        y: { ticks: { color: '#94a3b8' } }
      }
    }
  });
}

// Función simulada para cargar datos desde la API cuando esté lista
function cargarDatos() {
  console.log("Petición a la API del Supermercado ejecutada...");
  
  // Aquí haremos el fetch() cuando tengamos el endpoint de la API
  document.getElementById("kpi-ventas").innerText = "$76,000.00";
  document.getElementById("kpi-transacciones").innerText = "1,240";
  document.getElementById("kpi-promedio").innerText = "$61.29";
  document.getElementById("kpi-categoria").innerText = "Bebidas";

  const tbody = document.getElementById("tabla-body");
  tbody.innerHTML = `