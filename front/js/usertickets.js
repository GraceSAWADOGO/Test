document.addEventListener('DOMContentLoaded', function() {
    // Gestion des filtres
    const filterButtons = document.querySelectorAll('.filter-btn');
    const ticketItems = document.querySelectorAll('.ticket-item');
    
    // État des filtres actifs
    const activeFilters = {
        status: 'all',
        priority: 'all'
    };
    
    // Ajouter des écouteurs d'événements aux boutons de filtre
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filterType = this.getAttribute('data-filter');
            const filterValue = this.getAttribute('data-value');
            
            // Mettre à jour l'état du filtre actif
            activeFilters[filterType] = filterValue;
            
            // Mettre à jour l'apparence des boutons
            document.querySelectorAll(`.filter-btn[data-filter="${filterType}"]`).forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');
            
            // Appliquer les filtres
            applyFilters();
        });
    });
    
    // Fonction pour appliquer les filtres
    function applyFilters() {
        const ticketItems = document.querySelectorAll('.ticket-item'); // Correction : sélectionner dynamiquement
        ticketItems.forEach(item => {
            const statusElement = item.querySelector('.ticket-status');
            const priorityElement = item.querySelector('.ticket-priority');

            // On récupère la valeur de la classe (ex: 'high', 'medium', 'low')
            const itemStatus = statusElement ? statusElement.classList[1] : '';
            const itemPriority = priorityElement ? priorityElement.classList[1] : '';

            // Correction : normaliser la casse pour la comparaison
            const statusMatch = activeFilters.status === 'all' || itemStatus === activeFilters.status;
            const priorityMatch = activeFilters.priority === 'all' || itemPriority === activeFilters.priority;

            if (statusMatch && priorityMatch) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
        // Mettre à jour le compteur de tickets visibles
        updateTicketCount();
    }
    
    // Fonction pour mettre à jour le compteur de tickets
    function updateTicketCount() {
        const visibleTickets = document.querySelectorAll('.ticket-item').length === 0 ? 0 : Array.from(document.querySelectorAll('.ticket-item')).filter(item => item.style.display === 'block').length;
        document.querySelector('.tickets-list-section h2').textContent = `${visibleTickets} Ticket${visibleTickets > 1 ? 's' : ''}`;
    }
    
    // Animation au survol des cartes de statistiques
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 10px 15px rgba(0, 0, 0, 0.1)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.05)';
        });
    });
    
    // Simulation de chargement des données depuis une API
    async function fetchTickets() {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Veuillez vous connecter.');
            window.location.href = 'login.html';
            return;
        }
        try {
            const response = await fetch('http://localhost:5001/api/tickets/my', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const tickets = await response.json();
                renderTickets(tickets);
            } else {
                document.querySelector('.tickets-list-section').innerHTML = '<p>Erreur lors du chargement des tickets.</p>';
            }
        } catch (err) {
            document.querySelector('.tickets-list-section').innerHTML = '<p>Erreur réseau ou serveur.</p>';
        }
    }

    // Fonction pour afficher dynamiquement les tickets
    function renderTickets(tickets) {
        const listSection = document.querySelector('.tickets-list-section');
        if (!tickets || tickets.length === 0) {
            listSection.innerHTML = '<h2>0 Ticket</h2><p>Aucun ticket trouvé.</p>';
            updateStats(0, 0, 0, 0);
            return;
        }
        listSection.innerHTML = `<h2>${tickets.length} Ticket${tickets.length > 1 ? 's' : ''}</h2>`;
        // Compteurs pour les stats
        let total = tickets.length;
        let open = 0, inProgress = 0, resolved = 0;
        tickets.forEach(ticket => {
            const status = ticket.status ? ticket.status.toLowerCase() : 'open';
            if (status === 'open') open++;
            else if (status === 'in progress' || status === 'in-progress') inProgress++;
            else if (status === 'resolved') resolved++;
        });
        updateStats(total, open, inProgress, resolved);
        tickets.forEach(ticket => {
            const statusClass = ticket.status ? ticket.status.replace(/\s/g, '-').toLowerCase() : 'open';
            const priorityClass = ticket.priority ? ticket.priority.toLowerCase() : 'medium';
            // Correction ici : on prend created_at ou createdAt
            const createdRaw = ticket.created_at || ticket.createdAt || '';
            const updatedRaw = ticket.updated_at || ticket.updatedAt || '';
            const createdAt = createdRaw ? formatDateFr(createdRaw) : '';
            const updatedAt = updatedRaw ? formatDateFr(updatedRaw) : '';
            listSection.innerHTML += `
                <div class="ticket-item">
                    <div class="ticket-header">
                        <div class="ticket-id">${ticket.id || ticket._id}</div>
                        <div class="ticket-status ${statusClass}">${ticket.status || 'Open'}</div>
                        <div class="ticket-priority ${priorityClass}">${ticket.priority} Priority</div>
                    </div>
                    <h3 class="ticket-title">${ticket.title}</h3>
                    <p class="ticket-description">${ticket.description}</p>
                    <div class="ticket-meta">
                        <div class="ticket-category">
                            <i class="fas fa-tag"></i> ${ticket.category}
                        </div>
                        <div class="ticket-date">
                            <i class="fas fa-calendar-alt"></i> Created ${createdAt}
                        </div>
                        <div class="ticket-update">
                            <i class="fas fa-clock"></i> Updated ${updatedAt}
                        </div>
                    </div>
                    <div class="ticket-actions">
                        <a href="ticketdetail.html?id=${ticket.id || ticket._id}" class="btn-secondary">View Details</a>
                    </div>
                </div>
            `;
        });
        // Appliquer les filtres après le rendu
        applyFilters();
    }

    // Fonction pour mettre à jour les stats
    function updateStats(total, open, inProgress, resolved) {
        const statCards = document.querySelectorAll('.stat-card');
        if (statCards.length >= 4) {
            statCards[0].querySelector('.stat-number').textContent = total;
            statCards[1].querySelector('.stat-number').textContent = open;
            statCards[2].querySelector('.stat-number').textContent = inProgress;
            statCards[3].querySelector('.stat-number').textContent = resolved;
        }
    }

    // Fonction utilitaire pour formater la date en JJ/MM/AAAA
    function formatDateFr(dateStr) {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        if (isNaN(d)) return '';
        return d.toLocaleDateString('fr-FR');
    }

    // Appeler la fonction au chargement de la page
    fetchTickets();
});