// --- MOTOR GENERAL CRUD PARA SUPABASE (MULTI-MÓDULO) ---

let moduloActualConfig = {};

// 1. Configurar el módulo activo (tabla, llave primaria, nombre descriptivo y campos)
// Ejemplo con campos dinámicos:
// configurarCRUD({
//     tabla: 'dim_producto',
//     idField: 'id_producto',
//     nombreModulo: 'Producto',
//     campos: [
//         { inputId: 'formNombre', columna: 'nombre_producto', label: 'Nombre', tipo: 'texto', requerido: true },
//         { inputId: 'formPrecio', columna: 'precio', label: 'Precio', tipo: 'numero', requerido: false }
//     ]
// });
function configurarCRUD(config) {
    moduloActualConfig = {
        campos: null,
        ...config
    };
}

function obtenerCamposEfectivos() {
    if (Array.isArray(moduloActualConfig.campos) && moduloActualConfig.campos.length > 0) {
        return moduloActualConfig.campos;
    }
    // Compatibilidad por defecto para clientes / dim_cliente
    return [
        { inputId: 'formNombre', columna: 'nombre_cliente', alias: ['nombre'], label: 'Nombre', tipo: 'texto', requerido: true },
        { inputId: 'formCorreo', columna: 'email', alias: ['correo'], label: 'Correo', tipo: 'texto', requerido: false },
        { inputId: 'formTelefono', columna: 'telefono', label: 'Teléfono', tipo: 'numero', requerido: false }
    ];
}

function obtenerValorDeItem(item, campo) {
    if (!item) return '';
    if (item[campo.columna] !== undefined && item[campo.columna] !== null) {
        return item[campo.columna];
    }
    if (Array.isArray(campo.alias)) {
        for (const key of campo.alias) {
            if (item[key] !== undefined && item[key] !== null) {
                return item[key];
            }
        }
    }
    return '';
}

// 2. Abrir Modal para Crear o Editar
function abrirModalCRUD(item = null) {
    const modal = document.getElementById('modalForm');
    const titulo = document.getElementById('modalTitulo');
    const idInput = document.getElementById('formId');

    if (!modal || !titulo) return;

    if (idInput) {
        idInput.value = item ? item[moduloActualConfig.idField] : '';
    }

    if (item) {
        titulo.innerText = `Editar ${moduloActualConfig.nombreModulo} #${item[moduloActualConfig.idField]}`;
    } else {
        titulo.innerText = `Registrar Nuevo ${moduloActualConfig.nombreModulo}`;
    }

    const campos = obtenerCamposEfectivos();
    campos.forEach(campo => {
        const el = document.getElementById(campo.inputId);
        if (!el) return;
        el.value = item ? obtenerValorDeItem(item, campo) : '';
    });

    modal.style.display = 'flex';
}

function cerrarModalCRUD() {
    const modal = document.getElementById('modalForm');
    if (modal) modal.style.display = 'none';
}

// 3. Función general para Guardar (Insert o Update) en Supabase
async function guardarRegistroCRUD(_supabase, callbackRecargar) {
    const id = document.getElementById('formId') ? document.getElementById('formId').value.trim() : '';
    const campos = obtenerCamposEfectivos();
    const datosAEnviar = {};

    for (const campo of campos) {
        const el = document.getElementById(campo.inputId);
        if (!el) continue;

        const rawVal = el.value.trim();
        const etiqueta = campo.label || campo.columna;

        if (campo.requerido && rawVal === '') {
            alert(`El campo "${etiqueta}" es obligatorio.`);
            el.focus();
            return;
        }

        if (campo.tipo === 'numero') {
            if (rawVal === '') {
                datosAEnviar[campo.columna] = null;
            } else {
                const num = Number(rawVal);
                if (Number.isNaN(num)) {
                    alert(`El campo "${etiqueta}" debe ser un número válido.`);
                    el.focus();
                    return;
                }
                datosAEnviar[campo.columna] = num;
            }
        } else if (campo.tipo === 'booleano') {
            if (rawVal === '') {
                datosAEnviar[campo.columna] = null;
            } else {
                datosAEnviar[campo.columna] = rawVal === 'true' || rawVal === '1';
            }
        } else {
            datosAEnviar[campo.columna] = rawVal === '' ? null : rawVal;
        }
    }

    let resultado = null;

    try {
        if (id === '') {
            resultado = await _supabase
                .schema('dw')
                .from(moduloActualConfig.tabla)
                .insert([datosAEnviar]);
        } else {
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
        if (typeof callbackRecargar === 'function') callbackRecargar(true);

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
        if (typeof callbackRecargar === 'function') callbackRecargar(true);

    } catch (err) {
        console.error('Error al eliminar:', err);
        alert('No se pudo eliminar el registro (puede estar asociado a transacciones en el Data Warehouse).');
    }
}