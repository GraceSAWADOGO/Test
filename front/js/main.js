// Script principal pour le système de support

document.addEventListener('DOMContentLoaded', function() {
    // Animation de défilement fluide pour les liens d'ancrage
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId !== '#') {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 100,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Animation pour les cartes de fonctionnalités et catégories
    const animateOnScroll = function() {
        const elements = document.querySelectorAll('.feature-card, .category-card');
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementPosition < windowHeight - 100) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    };

    // Initialiser les styles pour l'animation
    const cards = document.querySelectorAll('.feature-card, .category-card');
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });

    // Exécuter l'animation au chargement et au défilement
    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll(); // Exécuter une fois au chargement

    // Déconnexion automatique sur le bouton logout
    const logoutBtn = document.querySelector('a.btn.btn-primary[href="../index.html"]');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            // Supprimer le token et infos utilisateur
            localStorage.removeItem('token');
            localStorage.removeItem('userEmail');
            // Redirection (optionnelle, car le href le fait déjà)
            // window.location.href = 'index.html';
        });
    }

    // Protection des boutons d'accès aux tickets si non connecté
    const token = localStorage.getItem('token');
    // Sur la page d'accueil (index.html)
    if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname === '/index.html') {
        // Boutons dans le header
        const ticketsNav = document.querySelector('a[href="user/usertickets.html"]');
        const createNav = document.querySelector('a[href="user/createticket.html"]');
        // Boutons dans la section hero
        const heroCreate = document.querySelector('a.btn.btn-primary[href="user/createticket.html"]');
        const heroTickets = document.querySelector('a.btn.btn-secondary[href="user/usertickets.html"]');
        if (!token) {
            if (ticketsNav) ticketsNav.style.display = 'none';
            if (createNav) createNav.style.display = 'none';
            if (heroCreate) heroCreate.style.display = 'none';
            if (heroTickets) heroTickets.style.display = 'none';
        }
    }

    // Gestion du menu mobile (à implémenter si nécessaire)
    // const mobileMenuButton = document.querySelector('.mobile-menu-button');
    // const navMenu = document.querySelector('nav ul');
    // 
    // if (mobileMenuButton && navMenu) {
    //     mobileMenuButton.addEventListener('click', function() {
    //         navMenu.classList.toggle('active');
    //     });
    // }
});