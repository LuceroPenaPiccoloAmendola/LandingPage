// --- GUARDIA DE SESIÓN Y ROLES PARA SUPERMARKET ---

const AUTH_SUPABASE_URL = 'https://sppydfpfikqvxaviwfem.supabase.co';
const AUTH_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwcHlkZnBmaWtxdnhhdml3ZmVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM5MTg0NTcsImV4cCI6MjEwOTQ5NDQ1N30.g17KVS9WLU4uew9uhEh0HqP5Ul-ZwTrgljYXHbBysrA';

const _authSupabase = window._supabase || supabase.createClient(AUTH_SUPABASE_URL, AUTH_SUPABASE_ANON_KEY);

async function protegerVista({ requiereAdmin = false } = {}) {
    const { data: { session }, error: sessionError } = await _authSupabase.auth.getSession();

    if (sessionError || !session) {
        window.location.href = 'index.html';
        return null;
    }

    const { data: rol, error: rolError } = await _authSupabase
        .schema('dw')
        .rpc('obtener_mi_rol');

    if (rolError || !rol) {
        alert('Tu cuenta no tiene un rol activo asignado. Contacta al administrador.');
        await _authSupabase.auth.signOut();
        window.location.href = 'index.html';
        return null;
    }

    if (requiereAdmin && rol !== 'admin') {
        alert('Acceso restringido: solo los administradores pueden acceder a esta sección.');
        window.location.href = 'menu.html';
        return null;
    }

    window.usuarioActual = {
        user: session.user,
        rol: rol
    };

    aplicarPermisosUI(rol);
    return window.usuarioActual;
}

function aplicarPermisosUI(rol) {
    // Mostrar enlace de Administración solo a administradores
    const navAdmin = document.getElementById('navAdminItem');
    if (navAdmin) {
        navAdmin.style.display = rol === 'admin' ? '' : 'none';
    }

    // Si no es admin, ocultar botones de eliminar visibles
    if (rol !== 'admin') {
        document.querySelectorAll('[data-requiere-rol="admin"]').forEach(el => {
            el.style.display = 'none';
        });
    }
}

async function cerrarSesionSeguro() {
    await _authSupabase.auth.signOut();
    window.location.href = 'index.html';
}