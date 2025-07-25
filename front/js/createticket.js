const BASE_URL = 'https://test-ftxe.onrender.com'; // URL de ton backend Render

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('ticketForm');
    const descriptionTextarea = document.getElementById('description');
    const charCount = document.querySelector('.char-count');
    const cancelBtn = document.querySelector('.cancel-btn');
    const submitBtn = document.querySelector('.submit-btn');

    function updateCharCount() {
        const currentLength = descriptionTextarea.value.length;
        const maxLength = 500;
        charCount.textContent = `${currentLength}/${maxLength}`;
        if (currentLength > maxLength * 0.9) {
            charCount.style.color = '#ef4444';
        } else if (currentLength > maxLength * 0.7) {
            charCount.style.color = '#f59e0b';
        } else {
            charCount.style.color = '#9ca3af';
        }
    }

    function limitTextarea() {
        if (descriptionTextarea.value.length > 500) {
            descriptionTextarea.value = descriptionTextarea.value.substring(0, 500);
        }
        updateCharCount();
    }

    descriptionTextarea.addEventListener('input', limitTextarea);
    descriptionTextarea.addEventListener('keyup', updateCharCount);

    function validateForm() {
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.style.borderColor = '#ef4444';
                isValid = false;
            } else {
                field.style.borderColor = '#d1d5db';
            }
        });

        const emailField = document.getElementById('email');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailField.value && !emailRegex.test(emailField.value)) {
            emailField.style.borderColor = '#ef4444';
            isValid = false;
        }

        return isValid;
    }

    form.querySelectorAll('[required]').forEach(field => {
        field.addEventListener('blur', function() {
            if (!this.value.trim()) {
                this.style.borderColor = '#ef4444';
            } else {
                this.style.borderColor = '#d1d5db';
            }
        });

        field.addEventListener('input', function() {
            if (this.value.trim()) {
                this.style.borderColor = '#d1d5db';
            }
        });
    });

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.style.borderColor = '#ef4444';
                isValid = false;
            } else {
                field.style.borderColor = '#d1d5db';
            }
        });
        if (!isValid) {
            showNotification('Please fill in all required fields correctly.', 'error');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

        try {
            const formData = new FormData(form);
            const ticketData = {
                title: formData.get('ticketTitle'),
                category: formData.get('category'),
                priority: formData.get('priority'),
                description: formData.get('description')
            };

            const token = localStorage.getItem('token');
            if (!token) {
                showNotification('Please log in to create a ticket.', 'error');
                window.location.href = '../login.html';
                return;
            }

            const response = await fetch(`${BASE_URL}/api/tickets`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(ticketData)
            });

            if (response.ok) {
                const result = await response.json();
                showNotification('Ticket created successfully!', 'success');
                form.reset();
                updateCharCount();
                setTimeout(() => {
                    window.location.href = 'usertickets.html';
                }, 2000);
            } else {
                const errorData = await response.json();
                showNotification(errorData.message || 'Failed to create ticket.', 'error');
            }
        } catch (error) {
            console.error('Error creating ticket:', error);
            showNotification('An error occurred while creating the ticket.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Ticket';
        }
    });

    cancelBtn.addEventListener('click', function() {
        if (form.querySelector('input, textarea, select').value) {
            if (confirm('Are you sure you want to cancel? All entered data will be lost.')) {
                window.location.href = 'usertickets.html';
            }
        } else {
            window.location.href = 'usertickets.html';
        }
    });

    function showNotification(message, type = 'info') {
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${getNotificationIcon(type)}"></i>
                <span>${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${getNotificationColor(type)};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 1000;
            max-width: 400px;
            animation: slideIn 0.3s ease-out;
        `;

        notification.querySelector('.notification-content').style.cssText = `
            display: flex;
            align-items: center;
            gap: 0.75rem;
        `;

        notification.querySelector('.notification-close').style.cssText = `
            background: none;
            border: none;
            color: white;
            font-size: 1.25rem;
            cursor: pointer;
            margin-left: auto;
        `;

        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s ease-in';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }

    function getNotificationIcon(type) {
        switch (type) {
            case 'success': return 'fa-check-circle';
            case 'error': return 'fa-exclamation-circle';
            case 'warning': return 'fa-exclamation-triangle';
            default: return 'fa-info-circle';
        }
    }

    function getNotificationColor(type) {
        switch (type) {
            case 'success': return '#10b981';
            case 'error': return '#ef4444';
            case 'warning': return '#f59e0b';
            default: return '#6366f1';
        }
    }

    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    updateCharCount();

    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
        document.getElementById('email').value = userEmail;
    }
});
