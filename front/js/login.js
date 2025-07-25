document.addEventListener('DOMContentLoaded', function() {
    // Gestion de l'affichage/masquage du mot de passe
    const togglePassword = document.querySelector('.toggle-password');
    const passwordInput = document.querySelector('#password');
    
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            // Changer l'icône
            const icon = this.querySelector('i');
            if (type === 'password') {
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            } else {
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            }
        });
    }
    
    // Gestion du formulaire de connexion
    const loginForm = document.getElementById('login-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            // Récupération des valeurs du formulaire
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            if (!email || !password) {
                alert('Veuillez remplir tous les champs.');
                return;
            }

            try {
                const response = await fetch('http://localhost:5001/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();
                console.log('Réponse backend:', data);

                if (response.ok && data.token) {
                    localStorage.setItem('token', data.token);
                    // Redirection selon le rôle
                    if (data.user && data.user.role === 'Admin') {
                        window.location.href = 'admin/clients.html';
                    } else {
                        window.location.href = 'connect.html';
                    }
                } else {
                    alert(data.message || 'Erreur lors de la connexion');
                }
            } catch (err) {
                alert('Erreur réseau ou serveur.');
            }
        });
    }
});