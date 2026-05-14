// =============================================
//  ADMIN AVISOS - JS
//  Archivo: js/administraravisos.js
// =============================================

// --- Funciones globales (fuera del DOMContentLoaded) ---
// Necesario porque los onclick del HTML las llaman directamente

function abrirModal(tipo, titulo) {
    titulo = titulo || '';
    var overlay  = document.getElementById('modalOverlay');
    var titulo_h = document.getElementById('modalTitle');
    var input    = document.getElementById('inputTitulo');
    var desc     = document.getElementById('inputDescripcion');

    if (tipo === 'editar') {
        titulo_h.textContent = 'Modificar Aviso';
        input.value = titulo;
    } else {
        titulo_h.textContent = 'Publicar Nuevo Aviso';
        input.value = '';
        if (desc) desc.value = '';
    }

    overlay.classList.add('active');
    setTimeout(function () { input.focus(); }, 250);
}

function cerrarModal() {
    document.getElementById('modalOverlay').classList.remove('active');
}

function eliminarFila(btn) {
    if (!confirm('¿Estás seguro de que quieres eliminar este aviso permanentemente?')) return;
    var fila = btn.closest('tr');
    fila.style.transition = 'opacity 0.2s ease';
    fila.style.opacity = '0';
    setTimeout(function () { fila.remove(); }, 200);
}

// --- Eventos (después de que cargue el DOM) ---

document.addEventListener('DOMContentLoaded', function () {

    var btnNuevoAviso  = document.getElementById('btnNuevoAviso');
    var btnCerrarModal = document.getElementById('btnCerrarModal');
    var btnCancelar    = document.getElementById('btnCancelar');
    var btnGuardar     = document.getElementById('btnGuardar');
    var modalOverlay   = document.getElementById('modalOverlay');
    var inputTitulo    = document.getElementById('inputTitulo');
    var searchInput    = document.getElementById('searchInput');
    var fileZone       = document.getElementById('fileZone');
    var fileInput      = document.getElementById('fileInput');

    // Botón publicar nuevo aviso
    btnNuevoAviso.addEventListener('click', function () {
        abrirModal('crear');
    });

    // Cerrar modal
    btnCerrarModal.addEventListener('click', cerrarModal);
    btnCancelar.addEventListener('click', cerrarModal);

    // Cerrar al hacer clic fuera
    modalOverlay.addEventListener('click', function (e) {
        if (e.target === modalOverlay) cerrarModal();
    });

    // Cerrar con Escape
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') cerrarModal();
    });

    // Guardar aviso
    btnGuardar.addEventListener('click', function () {
        var titulo = inputTitulo.value.trim();
        if (!titulo) {
            inputTitulo.style.borderColor = 'rgba(239, 68, 68, 0.6)';
            inputTitulo.focus();
            setTimeout(function () {
                inputTitulo.style.borderColor = '';
            }, 1500);
            return;
        }
        // TODO: conectar con base de datos
        cerrarModal();
    });

    // Buscador
    searchInput.addEventListener('input', function () {
        var query = this.value.toLowerCase();
        var filas = document.querySelectorAll('#tablaBody tr');
        filas.forEach(function (fila) {
            fila.style.display = fila.textContent.toLowerCase().includes(query) ? '' : 'none';
        });
    });

    // Zona de carga de imagen
    fileZone.addEventListener('click', function () {
        fileInput.click();
    });

    fileInput.addEventListener('change', function () {
        if (this.files && this.files[0]) {
            fileZone.querySelector('p').textContent = this.files[0].name;
            fileZone.style.borderColor = 'rgba(59, 125, 216, 0.5)';
        }
    });

    fileZone.addEventListener('dragover', function (e) {
        e.preventDefault();
        this.style.borderColor = 'rgba(59, 125, 216, 0.5)';
    });

    fileZone.addEventListener('dragleave', function () {
        this.style.borderColor = '';
    });

    fileZone.addEventListener('drop', function (e) {
        e.preventDefault();
        this.style.borderColor = '';
        var archivo = e.dataTransfer.files[0];
        if (archivo && archivo.type.startsWith('image/')) {
            this.querySelector('p').textContent = archivo.name;
            this.style.borderColor = 'rgba(59, 125, 216, 0.5)';
        }
    });

});
