const BASE_URL = 'https://test-ftxe.onrender.com'; // Backend Render

document.addEventListener("DOMContentLoaded", async function () {
    const userList = document.getElementById("clientsTableBody");
    console.log("userList:", userList);

    async function fetchUsers() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${BASE_URL}/api/users`, {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            const users = await response.json();
            console.log(users); // Pour debug

            if (!Array.isArray(users)) {
                console.error("Réponse inattendue :", users);
                return;
            }

            users.forEach(user => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${user.id || user._id || ''}</td>
                    <td>${user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : ''}</td>
                    <td>${user.email || ''}</td>
                    <td>${user.username || ''}</td>
                `;
                userList.appendChild(row);
            });

            // Ajout d'événements aux boutons après insertion dans le DOM
            document.querySelectorAll(".edit-btn").forEach(button => {
                button.addEventListener("click", editUser);
            });

            document.querySelectorAll(".delete-btn").forEach(button => {
                button.addEventListener("click", deleteUser);
            });
        } catch (error) {
            console.error("Erreur lors de la récupération des utilisateurs :", error);
        }
    }

    fetchUsers();

    async function editUser(event) {
        const id = event.target.getAttribute("data-id");
        const newName = prompt("Entrez le nouveau nom :");

        if (newName) {
            try {
                await fetch(`${BASE_URL}/api/tickets/${id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ name: newName }),
                });

                location.reload();
            } catch (error) {
                console.error("Erreur lors de la modification :", error);
            }
        }
    }

    async function deleteUser(event) {
        const id = event.target.getAttribute("data-id");

        if (confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) {
            try {
                await fetch(`${BASE_URL}/api/tickets/${id}`, {
                    method: "DELETE",
                });

                location.reload();
            } catch (error) {
                console.error("Erreur lors de la suppression :", error);
            }
        }
    }
});
