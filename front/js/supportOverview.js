// JS dynamique pour SupportOverview.html

// Utilitaire pour formater la date (affichage en format français)
function formatDate(dateStr) {
    const d = new Date(dateStr);
    if (isNaN(d)) return '';
    return d.toLocaleDateString('fr-FR');
}

// Récupère les valeurs des filtres et de la recherche
function getFilters() {
    return {
        status: document.getElementById('statusFilter')?.value || '',
        priority: document.getElementById('priorityFilter')?.value || '',
        dateOfCreation: document.getElementById('dateOfCreation')?.value || '',
        search: document.querySelector('.search-box input')?.value.trim() || '',
    };
}

// Fonction pour filtrer et trier les tickets selon les filtres donnés
function filterAndSortTickets(tickets, filters) {
    return tickets.filter(ticket => {
        if (filters.status && filters.status !== 'All Status' && ticket.status.toLowerCase() !== filters.status.toLowerCase()) return false;
        if (filters.priority && filters.priority !== 'All Priority' && ticket.priority.toLowerCase() !== filters.priority.toLowerCase()) return false;

        if (filters.dateOfCreation) {
            const inputDate = parseFlexibleDate(filters.dateOfCreation);
            const ticketDate = parseFlexibleDate((ticket.date || '').split(' ')[0]);
            if (!inputDate || !ticketDate ||
                inputDate.getFullYear() !== ticketDate.getFullYear() ||
                inputDate.getMonth() !== ticketDate.getMonth() ||
                inputDate.getDate() !== ticketDate.getDate()
            ) return false;
        }

        if (filters.search) {
            const search = normalizeString(filters.search);
            if (
                !(ticket.id && normalizeString(ticket.id).includes(search)) &&
                !(ticket.subject && normalizeString(ticket.subject).includes(search)) &&
                !(ticket.title && normalizeString(ticket.title).includes(search))
            ) return false;
        }
        return true;
    });
}

// Parse plusieurs formats de date possibles
function parseFlexibleDate(str) {
    if (!str) return null;
    str = str.replace(/\//g, '-');
    let d = new Date(str);
    if (!isNaN(d)) return d;
    const mdy = str.match(/^([0-9]{2})-([0-9]{2})-([0-9]{4})$/);
    if (mdy) return new Date(`${mdy[3]}-${mdy[1]}-${mdy[2]}`);
    const dmy = str.match(/^([0-9]{2})-([0-9]{2})-([0-9]{4})$/);
    if (dmy) return new Date(`${dmy[3]}-${dmy[2]}-${dmy[1]}`);
    return null;
}

// Normalise la chaîne pour comparaison (minuscules, sans accents, espaces réduits)
function normalizeString(str) {
    if (!str) return '';
    return String(str)
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

// Affiche les tickets dans le tableau HTML
function renderTickets(tickets) {
    const tbody = document.getElementById('ticketsTableBody');
    tbody.innerHTML = '';
    if (tickets.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="8" style="text-align:center; color:#888;">Aucun ticket trouvé.</td>`;
        tbody.appendChild(tr);
        return;
    }

    tickets.forEach(ticket => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="checkbox-cell">
                <input type="checkbox" class="row-checkbox" data-ticket-id="${ticket.id}">
            </td>
            <td>${ticket.id || ''}</td>
            <td>${formatDate(ticket.date) || ''}</td>
            <td>${ticket.subject || ticket.title || ''}</td>
            <td><span class="badge ${ticket.priority ? ticket.priority.toLowerCase() : ''}">${ticket.priority || ''}</span></td>
            <td>${ticket.clientUsername || ''}</td>
            <td><span class="badge ${ticket.status ? ticket.status.toLowerCase().replace(/\s/g, '') : ''}">${ticket.status ? ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1) : ''}</span></td>
            <td class="actions-cell">
                <button class="action-btn view"><i class="ri-eye-line"></i></button>
                <button class="action-btn delete" data-ticket-id="${ticket.id}"><i class="ri-delete-bin-line"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Gestion du Select All
    const selectAllCheckbox = document.querySelector('.select-all-checkbox');
    const rowCheckboxes = document.querySelectorAll('.row-checkbox');

    if (selectAllCheckbox) {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.addEventListener('change', function() {
            rowCheckboxes.forEach(cb => cb.checked = selectAllCheckbox.checked);
        });
    }

    rowCheckboxes.forEach(cb => {
        cb.addEventListener('change', function() {
            if (!cb.checked && selectAllCheckbox) selectAllCheckbox.checked = false;
            else if ([...rowCheckboxes].every(c => c.checked) && selectAllCheckbox) selectAllCheckbox.checked = true;
        });
    });

    // Suppression individuelle d'un ticket
    const deleteButtons = document.querySelectorAll('.action-btn.delete');
    deleteButtons.forEach(btn => {
        btn.addEventListener('click', async function() {
            const ticketId = this.getAttribute('data-ticket-id');
            if (!ticketId) return;
            if (!confirm('Voulez-vous vraiment supprimer ce ticket ?')) return;
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:5001/api/tickets/${ticketId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': 'Bearer ' + token }
                });
                if (!response.ok) throw new Error('Erreur lors de la suppression');
                allTickets = allTickets.filter(t => t.id !== ticketId);
                filterAndRenderTickets();
            } catch (err) {
                alert('Erreur lors de la suppression du ticket.');
            }
        });
    });

    // Redirection vers détail du ticket au clic sur l’œil
    const viewButtons = document.querySelectorAll('.action-btn.view');
    viewButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const tr = btn.closest('tr');
            if (!tr) return;
            const idCell = tr.querySelector('td:nth-child(2)');
            if (!idCell) return;
            const ticketId = idCell.textContent.trim().replace(/^#/, '');
            if (!ticketId) return;
            window.location.href = `../user/ticketdetail.html?id=${encodeURIComponent(ticketId)}&admin=1`;
        });
    });
}

let allTickets = [];

// Récupération des tickets depuis l'API puis affichage
async function fetchAndDisplayTickets() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5001/api/tickets', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        if (!response.ok) throw new Error('Erreur lors de la récupération des tickets');
        let tickets = await response.json();
        tickets = tickets.map(t => ({
            id: t.id || t._id || '',
            subject: t.subject || t.title || '',
            priority: t.priority || '',
            status: t.status || '',
            date: t.created_at || t.date || t.createdAt || '',
            clientUsername: t.creator_username || t.clientUsername || t.username || t.created_by_username || '',
        }));
        allTickets = tickets;
        filterAndRenderTickets();
    } catch (err) {
        const tbody = document.getElementById('ticketsTableBody');
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:#e53e3e;">Erreur lors du chargement des tickets.</td></tr>`;
    }
}

// Applique les filtres et affiche les tickets filtrés
function filterAndRenderTickets() {
    const filters = getFilters();
    const filtered = filterAndSortTickets(allTickets, filters);
    renderTickets(filtered);
}

// Ajout des listeners sur les filtres et recherche
function setupListeners() {
    const statusFilter = document.getElementById('statusFilter');
    const priorityFilter = document.getElementById('priorityFilter');
    const searchInput = document.querySelector('.search-box input');
    const dateOfCreationInput = document.getElementById('dateOfCreation');

    if (statusFilter) statusFilter.addEventListener('change', filterAndRenderTickets);
    if (priorityFilter) priorityFilter.addEventListener('change', filterAndRenderTickets);
    if (searchInput) searchInput.addEventListener('input', filterAndRenderTickets);
    if (dateOfCreationInput) dateOfCreationInput.addEventListener('change', filterAndRenderTickets);
}

// Initialisation au chargement DOM
document.addEventListener('DOMContentLoaded', () => {
    setupListeners();
    fetchAndDisplayTickets();

    // Bouton "Clear Filters"
    const clearBtn = document.querySelector('.btn-clear');
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            const statusFilter = document.getElementById('statusFilter');
            const priorityFilter = document.getElementById('priorityFilter');
            const dateInput = document.getElementById('dateOfCreation');
            const searchInput = document.querySelector('.search-box input');

            if (statusFilter) statusFilter.value = 'All Status';
            if (priorityFilter) priorityFilter.value = 'All Priority';
            if (dateInput) dateInput.value = '';
            if (searchInput) searchInput.value = '';

            filterAndRenderTickets();
        });
    }
});

// Actions groupées (bulk)
const applyBulkButton = document.getElementById('applyBulkAction');
if (applyBulkButton) {
    applyBulkButton.addEventListener('click', async function() {
        const bulkAction = document.getElementById('bulkAction').value;
        const selectedCheckboxes = document.querySelectorAll('.row-checkbox:checked');
        const selectedIds = Array.from(selectedCheckboxes).map(cb => cb.getAttribute('data-ticket-id'));
        if (selectedIds.length === 0) {
            alert('Veuillez sélectionner au moins un ticket.');
            return;
        }
        const token = localStorage.getItem('token');

        if (bulkAction === 'Delete Selected') {
            if (!confirm('Voulez-vous vraiment supprimer les tickets sélectionnés ?')) return;
            for (const id of selectedIds) {
                try {
                    await fetch(`http://localhost:5001/api/tickets/${id}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': 'Bearer ' + token }
                    });
                    allTickets = allTickets.filter(t => t.id !== id);
                } catch (err) {
                    // Optionnel : gérer erreurs par ticket
                }
            }
            filterAndRenderTickets();

        } else if (bulkAction === 'Mark as Resolved') {
            for (const id of selectedIds) {
                try {
                    await fetch(`http://localhost:5001/api/tickets/${id}`, {
                        method: 'PUT',
                        headers: {
                            'Authorization': 'Bearer ' + token,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ status: 'resolved' })
                    });
                    allTickets = allTickets.map(t => t.id === id ? { ...t, status: 'resolved' } : t);
                } catch (err) {}
            }
            filterAndRenderTickets();

        } else if (bulkAction === 'Mark as In progress') {
            for (const id of selectedIds) {
                try {
                    await fetch(`http://localhost:5001/api/tickets/${id}`, {
                        method: 'PUT',
                        headers: {
                            'Authorization': 'Bearer ' + token,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ status: 'in progress' })
                    });
                    allTickets = allTickets.map(t => t.id === id ? { ...t, status: 'in progress' } : t);
                } catch (err) {}
            }
            filterAndRenderTickets();

        } else {
            alert('Veuillez choisir une action.');
        }
    });
}

// Gestion du bouton Logout
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
        localStorage.removeItem('token');
        window.location.href = '../login.html';
    });
}
