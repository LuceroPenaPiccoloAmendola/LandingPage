// --- MOTOR GENERAL CRUD PARA SUPABASE ---

let moduloActualConfig = {};

// 1. Configurar el módulo activo (tabla, llave primaria y nombre descriptivo)
function configurarCRUD(config) {
    // config ejemplo: { tabla: 'dim_cliente', idField: 'id_cliente', nombreModulo: 'Cliente' }
    moduloActualConfig = config;
}

// 2. Abrir Modal para Crear o Editar
function abrirModalCRUD(item = null) {
    const modal = document.getElementById('modalForm');
    const titulo = document.getElementById('modalTitulo');
    
    // Limpiar o rellenar el ID oculto
    document.getElementById('formId').value = item ? item[moduloActualConfig.idField] : '';
    
    if (item) {
        titulo.innerText = `Editar ${moduloActualConfig.nombreModulo} #${item[moduloActualConfig.idField]}`;
        // Rellenar campos apuntando a los nombres exactos de tus columnas
        if(document.getElementById('formNombre')) document.getElementById('formNombre').value = item.nombre_cliente || item.nombre || '';
        if(document.getElementById('formCorreo')) document.getElementById('formCorreo').value = item.email || item.correo || '';
        if(document.getElementById('formTelefono')) document.getElementById('formTelefono').value = item.telefono || '';
    } else {
        titulo.innerText = `Registrar Nuevo ${moduloActualConfig.nombreModulo}`;
        if(document.getElementById('formNombre')) document.getElementById('formNombre').value = '';
        if(document.getElementById('formCorreo')) document.getElementById('formCorreo').value = '';
        if(document.getElementById('formTelefono')) document.getElementById('formTelefono').value = '';
    }
    
    modal.style.display = 'flex';
}

function cerrarModalCRUD() {
    document.getElementById('modalForm').style.display = 'none';
}

// 3. Función general para Guardar (Insert o Update) en Supabase
async function guardarRegistroCRUD(_supabase, callbackRecargar) {
    const id = document.getElementById('formId').value;
    const nombre = document.getElementById('formNombre') ? document.getElementById('formNombre').value.trim() : null;
    const correo = document.getElementById('formCorreo') ? document.getElementById('formCorreo').value.trim() : null;
    const telefonoInput = document.getElementById('formTelefono') ? document.getElementById('formTelefono').value.trim() : null;

    if (!nombre) {
        alert('El nombre es obligatorio.');
        return;
    }

    let resultado = null;

    try {
        let telefonoFinal = telefonoInput ? Number(telefonoInput) : null;

        let datosAEnviar = {
            nombre_cliente: nombre,
            email: correo,
            telefono: telefonoFinal
        };

        if (id === '') {
            // INSERT explícito asegurando la llamada al esquema dw
            resultado = await _supabase
                .schema('dw')
                .from(moduloActualConfig.tabla)
                .insert([datosAEnviar]);
        } else {
            // UPDATE explícito asegurando la llamada al esquema dw
            resultado = await _supabase
                .schema('dw')
                .from(moduloActualConfig.tabla)
                .update(datosAEnviar)
                .eq(moduloActualConfig.idField, id);
        }

        const { error } = resultado;
        if (error) {
            console.error('--- ERROR DE SUPABASE ---');
            console.error('Mensaje:', error.message);
            console.error('Detalle:', error.details);
            console.error('Sugerencia (Hint):', error.hint);
            console.error('Código:', error.code);
            alert(`Error de base de datos: ${error.message}`);
            return;
        }

        alert(id === '' ? '¡Registro creado exitosamente!' : '¡Registro actualizado exitosamente!');
        cerrarModalCRUD();
        if (typeof callbackRecargar === 'function') callbackRecargar(0);

    } catch (err) {
        console.error('Error general al procesar la operación:', err);
        alert('Hubo un error al procesar la operación. Revisa la consola (F12) para ver el detalle.');
    }
}

// 4. Función general para Borrar en Supabase
async function eliminarRegistroCRUD(_supabase, id, callbackRecargar) {
    if (!confirm(`¿Estás seguro de eliminar el registro #${id}?`)) return;

    try {
        const { error } = await _supabase
            .schema('dw')
            .from(moduloActualConfig.tabla)
            .delete()
            .eq(moduloActualConfig.idField, id);

        if (error) throw error;

        alert('Registro eliminado correctamente.');
        if (typeof callbackRecargar === 'function') callbackRecargar(0);

    } catch (err) {
        console.error('Error al eliminar:', err);
        alert('No se pudo eliminar el registro (puede estar asociado a transacciones en el Data Warehouse).');
    }
}