const eventsData = {
    "2024-06-10": [
        { title: "Exámenes Finales - Periodo A", time: "08:00 AM", location: "Aulas Generales" },
        { title: "Junta de Profesores", time: "02:00 PM", location: "Sala de Juntas" }
    ],
    "2024-06-20": [
        { title: "Límite de Entrega de Proyectos", time: "11:59 PM", location: "Plataforma Online" }
    ],
    "2024-06-05": [
        { title: "Taller de Robótica", time: "10:00 AM", location: "Laboratorio 2" }
    ]
};

let currentDate = new Date(2024, 5, 1); 

function renderCalendar() {
    const grid = document.getElementById('calendarGrid');
    const monthText = document.getElementById('current-month');
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    
    grid.innerHTML = '';
    monthText.innerText = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

    ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].forEach(day => {
        grid.innerHTML += `<div class="day-name">${day}</div>`;
    });

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    let firstDayIndex = new Date(year, month, 1).getDay() - 1;
    if (firstDayIndex === -1) firstDayIndex = 6; 

    const lastDay = new Date(year, month + 1, 0).getDate();
    const prevLastDay = new Date(year, month, 0).getDate();

    for (let i = firstDayIndex; i > 0; i--) {
        grid.innerHTML += `<div class="day gray"><span class="day-number">${prevLastDay - i + 1}</span></div>`;
    }

    for (let i = 1; i <= lastDay; i++) {
        const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const isToday = new Date().toDateString() === new Date(year, month, i).toDateString();
        
        let eventHtml = '';
        if (eventsData[dateString]) {
            eventHtml = `<div class="event-dot">${eventsData[dateString][0].title}</div>`;
        }

        grid.innerHTML += `
            <div class="day ${isToday ? 'today' : ''}" onclick="showEvents('${dateString}', ${i})">
                <span class="day-number">${i}</span>
                ${eventHtml}
            </div>
        `;
    }
}

function changeMonth(step) {
    currentDate.setMonth(currentDate.getMonth() + step);
    document.getElementById('event-panel').style.display = 'none'; 
    renderCalendar();
}

function showEvents(dateKey, dayNumber) {
    const panel = document.getElementById('event-panel');
    const list = document.getElementById('event-list');
    const title = document.getElementById('panel-date');
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    list.innerHTML = '';
    title.innerText = `Eventos del ${dayNumber} de ${monthNames[currentDate.getMonth()]}, ${currentDate.getFullYear()}`;

    if (eventsData[dateKey]) {
        eventsData[dateKey].forEach(ev => {
            list.innerHTML += `
                <div class="event-detail-item">
                    <strong>${ev.title}</strong><br>
                    <small><i class="far fa-clock"></i> ${ev.time} | <i class="fas fa-map-marker-alt"></i> ${ev.location}</small>
                </div>
            `;
        });
    } else {
        list.innerHTML = '<p style="color: #94a3b8;">No hay eventos programados para este día.</p>';
    }

    panel.style.display = 'block';
    
    document.querySelectorAll('.day').forEach(d => d.classList.remove('selected'));
    // Usamos event.currentTarget para referirnos al elemento clickeado
    if(event) event.currentTarget.classList.add('selected');
}

// Inicializar el calendario
renderCalendar();
