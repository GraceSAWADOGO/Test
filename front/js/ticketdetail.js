function getTicketIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

async function fetchTicket(id) {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:5001/api/tickets/${id}`, {
        headers: { 'Authorization': 'Bearer ' + token }
    });
    if (!response.ok) throw new Error('Erreur lors de la récupération du ticket');
    return await response.json();
}

function formatDate(dateString) {
    if (!dateString) return 'Non disponible';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getPriorityClass(priority) {
    if (!priority) return '';
    const priorityLower = priority.toLowerCase();
    if (priorityLower === 'low') return 'priority-low';
    if (priorityLower === 'medium') return 'priority-medium';
    if (priorityLower === 'high') return 'priority-high';
    return '';
}

document.addEventListener('DOMContentLoaded', async () => {
    // Masquer le header si admin=1 dans l'URL
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === '1') {
        const header = document.querySelector('header');
        if (header) header.style.display = 'none';
    }

    const ticketId = getTicketIdFromUrl();
    if (!ticketId) {
        document.body.innerHTML = '<p>Ticket ID manquant dans l\'URL.</p>';
        return;
    }
    
    try {
        const ticket = await fetchTicket(ticketId);
        
        // Titre
        document.getElementById('ticket-title').textContent = ticket.title || 'Aucun titre';
        
        // Description
        document.getElementById('ticket-description').textContent = ticket.description || 'Aucune description';
        
        // Priority
        const priorityEl = document.getElementById('ticket-priority');
        priorityEl.textContent = ticket.priority ? ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1) : 'Non définie';
        priorityEl.className = 'priority-badge ' + getPriorityClass(ticket.priority);
        
        // Category
        document.getElementById('ticket-category').textContent = ticket.category || 'Non définie';
        
        // Status
        const statusEl = document.getElementById('ticket-status');
        if (statusEl) {
            statusEl.textContent = ticket.status ? ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1) : 'Non défini';
        }
        // Dates
        document.getElementById('ticket-created').textContent = formatDate(ticket.created_at);
        document.getElementById('ticket-updated').textContent = formatDate(ticket.updated_at);
        
    } catch (e) {
        document.body.innerHTML = '<p>Erreur lors de la récupération du ticket.</p>';
    }

    // Gestion du bouton options (...)
    const optionsBtn = document.getElementById('ticket-options-btn');
    const optionsMenu = document.getElementById('ticket-options-menu');
    if (optionsBtn && optionsMenu) {
        optionsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            optionsMenu.style.display = optionsMenu.style.display === 'block' ? 'none' : 'block';
        });
        // Fermer le menu si on clique ailleurs
        document.addEventListener('click', () => {
            optionsMenu.style.display = 'none';
        });
        optionsMenu.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
    // Action update
    const updateBtn = document.getElementById('option-update');
    if (updateBtn) {
        updateBtn.addEventListener('click', () => {
            window.location.href = `updateticket.html?id=${encodeURIComponent(ticketId)}`;
        });
    }
    // Action delete
    const deleteBtn = document.getElementById('option-delete');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', async () => {
            if (!confirm('Voulez-vous vraiment supprimer ce ticket ?')) return;
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:5001/api/tickets/${ticketId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': 'Bearer ' + token }
                });
                if (!response.ok) throw new Error('Erreur lors de la suppression');
                window.location.href = 'usertickets.html';
            } catch (e) {
                alert('Erreur lors de la suppression du ticket.');
            }
        });
    }
});
