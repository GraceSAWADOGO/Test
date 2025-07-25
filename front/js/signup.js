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

    // Gestion du formulaire d'inscription
    const signupForm = document.getElementById('signup-form');
    
    if (signupForm) {
        signupForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            // Récupération des valeurs du formulaire
            const username = document.getElementById('username').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const accountTypeInput = document.querySelector('input[name="account-type"]:checked');
            if (!accountTypeInput) {
                alert('Veuillez sélectionner un type de compte.');
                return;
            }
            const accountType = accountTypeInput.value;

            // Validation simple côté client
            if (!username || !email || !password) {
                alert('Veuillez remplir tous les champs obligatoires.');
                return;
            }

            // Préparation des données pour l'envoi à l'API
            const userData = {
                username: username,
                email: email,
                password: password,
                role: accountType
            };

            try {
                const response = await fetch('http://localhost:5001/api/auth/signup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                });

                if (response.ok) {
                    const data = await response.json();
                    // Stocker le token JWT
                    if (data.token) {
                        localStorage.setItem('token', data.token);
                        localStorage.setItem('userEmail', email);
                    }
                    console.log('Réponse backend:', data);

                    // Redirection selon le rôle retourné
                    if (data.user && data.user.role === 'Admin') {
                        window.location.href = 'admin/dashboard.html';
                    } else {
                        window.location.href = 'connect.html';
                    }
                } else {
                    const errorData = await response.json();
                    alert(errorData.message || 'Erreur lors de la création du compte.');
                }
            } catch (err) {
                alert('Erreur réseau ou serveur.');
            }
        });
    }

    // (Optionnel) Fonction de redirection selon type de compte sélectionné (non appelée dans ce code)
    function redirectToPage() {
        const accountTypeInput = document.querySelector('input[name="account-type"]:checked');
        if (!accountTypeInput) return;
        const accountType = accountTypeInput.value;
        console.log("Redirection en cours...", accountType);

        if (accountType === "User") {
            window.location.href = '../connect.html'; // Pour User
        } else if (accountType === "Admin") {
            window.location.href = 'admin/supportOverview.html'; // Pour Admin
        }
    }
});
