// =============================================
//  DASHBOARD - LÓGICA DEL MENÚ PRINCIPAL DE MINA LINK
// =============================================

document.addEventListener('DOMContentLoaded', () => {
    const successOverlay = document.getElementById('successOverlay');
    const successTitle = document.getElementById('successTitle');
    const successMessage = document.getElementById('successMessage');

    // Función para mostrar overlay animado y redirigir
    function showSuccessAndRedirect(role, redirectUrl) {
        let roleTitle = '';
        let roleMessage = '';

        switch (role) {
            case 'estudiante':
                roleTitle = 'Módulo Estudiantes';
                roleMessage = 'Cargando panel de servicios estudiantiles...';
                break;
            case 'administrador':
                roleTitle = 'Módulo Administrador';
                roleMessage = 'Cargando panel de administración...';
                break;
            default:
                roleTitle = 'Accediendo';
                roleMessage = 'Redirigiendo al módulo...';
        }

        successTitle.textContent = roleTitle;
        successMessage.textContent = roleMessage;
        successOverlay.classList.add('active');

        setTimeout(() => {
            if (redirectUrl) {
                window.location.href = redirectUrl;
            } else {
                alert(`Módulo "${role}" - En construcción.`);
                successOverlay.classList.remove('active');
            }
        }, 1500);
    }

    // Manejar clics en las tarjetas completas
    const cards = document.querySelectorAll('.role-card');
    cards.forEach(card => {
        card.addEventListener('click', (e) => {
            // Si dio clic directamente en el botón, dejamos que el evento del botón se encargue
            if (e.target.closest('.card-btn')) return;

            const role = card.getAttribute('data-role');
            const url = card.getAttribute('data-url');
            showSuccessAndRedirect(role, url);
        });
    });

    // Manejar clics solo en los botones internos de las tarjetas
    const cardBtns = document.querySelectorAll('.card-btn');
    cardBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Evitamos duplicar la ejecución si burbujea a la tarjeta
            const role = btn.getAttribute('data-role');
            const parentCard = btn.closest('.role-card');
            const url = parentCard ? parentCard.getAttribute('data-url') : null;
            showSuccessAndRedirect(role, url);
        });
    });
});