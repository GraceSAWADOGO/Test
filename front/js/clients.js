// JS dynamique pour SupportOverview.html

// Utilitaire pour formater la date (si besoin)
function formatDate(dateStr) {
    const d = new Date(dateStr);
    if (isNaN(d)) return '';
    return d.toLocaleDateString('fr-FR');
}

// Récupère les valeurs des filtres et recherche
function getFilters() {
    return {
        status: document.getElementById('statusFilter')?.value || '',
        priority: document.getElementById('priorityFilter')?.value || '',
        dateOfCreation: document.getElementById('dateOfCreation')?.value || '',
        search: document.querySelector('.search-box input')?.value.trim() || '',
    };
}

// Filtrage et tri des tickets
function filterAndSortTickets(tickets, filters) {
    return tickets.filter(ticket => {
        // Filtre par status (normalisation de la casse)
        if (filters.status && filters.status !== 'All Status' && ticket.status.toLowerCase() !== filters.status.toLowerCase()) return false;
        // Filtre par priorité (normalisation de la casse)
        if (filters.priority && filters.priority !== 'All Priority' && ticket.priority.toLowerCase() !== filters.priority.toLowerCase()) return false;
        // Filtre par date de création (compare uniquement année, mois, jour)
        if (filters.dateOfCreation) {
            const inputDate = parseFlexibleDate(filters.dateOfCreation);
            // On ne garde que la partie date (sans l'heure) du ticket
            const ticketDate = parseFlexibleDate((ticket.date || '').split(' ')[0]);
            if (!inputDate || !ticketDate ||
                inputDate.getFullYear() !== ticketDate.getFullYear() ||
                inputDate.getMonth() !== ticketDate.getMonth() ||
                inputDate.getDate() !== ticketDate.getDate()
            ) return false;
        }
        // Recherche (id, subject, clientUsername)
        if (filters.search) {
            const search = normalizeString(filters.search);
            if (
                !(ticket.id && normalizeString(ticket.id).includes(search)) &&
                !(ticket.subject && normalizeString(ticket.subject).includes(search)) &&
                !(ticket.title && normalizeString(ticket.title).includes(search)) // au cas où
            ) return false;
        }
        return true;
    });
}

// Fonction utilitaire pour parser différents formats de date
function parseFlexibleDate(str) {
    if (!str) return null;
    // Essaye yyyy-mm-dd (ISO)
    let d = new Date(str);
    if (!isNaN(d)) return d;
    // Essaye mm/dd/yyyy ou mm-dd-yyyy (prioritaire)
    const mdy = str.match(/^([0-9]{2})[\/\-]([0-9]{2})[\/\-]([0-9]{4})$/);
    if (mdy) return new Date(`${mdy[3]}-${mdy[1]}-${mdy[2]}`);
    // Essaye dd/mm/yyyy ou dd-mm-yyyy
    const dmy = str.match(/^([0-9]{2})[\/\-]([0-9]{2})[\/\-]([0-9]{4})$/);
    if (dmy) return new Date(`${dmy[3]}-${dmy[2]}-${dmy[1]}`);
    return null;
}

function normalizeString(str) {
    if (!str) return '';
    return String(str)
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // enlève les accents
        .replace(/\s+/g, ' ') // espaces multiples en un seul
        .trim();
}

// === NOUVELLE LOGIQUE POUR AFFICHER LES CLIENTS UNIQUEMENT ===

function filterClients(clients, searchValue, dateValue) {
    let filtered = clients;
    if (searchValue) {
        const search = searchValue.trim().toLowerCase();
        filtered = filtered.filter(client =>
            (client.id && String(client.id).toLowerCase().includes(search)) ||
            (client.username && client.username.toLowerCase().includes(search)) ||
            (client.email && client.email.toLowerCase().includes(search))
        );
    }
    if (dateValue) {
        const inputDate = parseFlexibleDate(dateValue);
        if (inputDate) {
            filtered = filtered.filter(client => {
                if (!client.created_at) return false;
                const clientDate = new Date(client.created_at);
                return (
                    clientDate.getFullYear() === inputDate.getFullYear() &&
                    clientDate.getMonth() === inputDate.getMonth() &&
                    clientDate.getDate() === inputDate.getDate()
                );
            });
        }
    }
    return filtered;
}

let allClients = [];

async function fetchAndDisplayClients() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5001/api/users', {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });
        if (!response.ok) throw new Error('Erreur lors de la récupération des clients');
        const clients = await response.json();
        allClients = clients;
        renderClients(clients);
    } catch (err) {
        const tbody = document.getElementById('clientsTableBody');
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#e53e3e;">Erreur lors du chargement des clients.</td></tr>`;
    }
}

function renderClients(clients) {
    const tbody = document.getElementById('clientsTableBody');
    tbody.innerHTML = '';
    if (!clients.length) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#888;">Aucun client trouvé.</td></tr>`;
        return;
    }
    clients.forEach(client => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${client.id || ''}</td>
            <td>${client.created_at ? new Date(client.created_at).toLocaleDateString('fr-FR') : ''}</td>
            <td>${client.email || ''}</td>
            <td>${client.username || ''}</td>
        `;
        tbody.appendChild(tr);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    fetchAndDisplayClients();
    const searchInput = document.querySelector('.search-box input');
    const dateInput = document.getElementById('dateOfCreation');
    function updateFilter() {
        const filtered = filterClients(allClients, searchInput ? searchInput.value : '', dateInput ? dateInput.value : '');
        renderClients(filtered);
    }
    if (searchInput) {
        searchInput.addEventListener('input', updateFilter);
    }
    if (dateInput) {
        dateInput.addEventListener('input', updateFilter);
        dateInput.addEventListener('change', updateFilter);
    }
    // Fonctionnalité Clear Filters
    const clearBtn = document.querySelector('.btn-clear');
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            if (searchInput) searchInput.value = '';
            if (dateInput) dateInput.value = '';
            updateFilter();
        });
    }
});

// Bulk actions
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
                    // Optionnel : afficher une erreur pour ce ticket
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
                        body: JSON.stringify({ status: 'resolved' }) // <-- en minuscules
                    });
                    allTickets = allTickets.map(t => t.id === id ? { ...t, status: 'resolved' } : t);
                } catch (err) {
                    // Optionnel : afficher une erreur pour ce ticket
                }
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
                } catch (err) {
                    // Optionnel : afficher une erreur pour ce ticket
                }
            }
            filterAndRenderTickets();
        } else {
            alert('Veuillez choisir une action.');
        }
    });
}

// Gestion du bouton Log out
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
        localStorage.removeItem('token');
        window.location.href = '../login.html';
    });
}