// Script de mise à jour du ticket

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

document.addEventListener('DOMContentLoaded', async () => {
    const ticketId = getTicketIdFromUrl();
    if (!ticketId) {
        alert('Ticket ID manquant dans l’URL.');
        window.location.href = 'usertickets.html';
        return;
    }
    // Pré-remplir le formulaire
    try {
        const ticket = await fetchTicket(ticketId);
        document.getElementById('ticketTitle').value = ticket.title || '';
        document.getElementById('category').value = ticket.category || '';
        document.getElementById('description').value = ticket.description || '';
    } catch (e) {
        alert('Erreur lors du chargement du ticket.');
        window.location.href = 'usertickets.html';
        return;
    }
    // Gestion du compteur de caractères
    const description = document.getElementById('description');
    const charCount = document.querySelector('.char-count');
    if (description && charCount) {
        description.addEventListener('input', () => {
            charCount.textContent = description.value.length + '/500';
        });
        charCount.textContent = description.value.length + '/500';
    }
    // Soumission du formulaire
    const form = document.getElementById('updateTicketForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const title = document.getElementById('ticketTitle').value.trim();
            const category = document.getElementById('category').value;
            const descriptionValue = document.getElementById('description').value.trim();
            if (!title || !category || !descriptionValue) {
                alert('Veuillez remplir tous les champs.');
                return;
            }
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:5001/api/tickets/${ticketId}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': 'Bearer ' + token,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        title,
                        category,
                        description: descriptionValue
                    })
                });
                if (!response.ok) throw new Error('Erreur lors de la mise à jour');
                window.location.href = 'usertickets.html';
            } catch (e) {
                alert('Erreur lors de la mise à jour du ticket.');
            }
        });
    }
    // Annuler = retour à la fiche du ticket
    const cancelBtn = document.querySelector('.cancel-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            window.location.href = `ticketdetail.html?id=${encodeURIComponent(ticketId)}`;
        });
    }
}); 