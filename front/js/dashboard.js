document.addEventListener('DOMContentLoaded', function() {
    // Line Chart
    const lineChart = echarts.init(document.getElementById('lineChart'));
    const lineOption = {
        animation: false,
        grid: { top: 20, right: 20, bottom: 40, left: 40 },
        xAxis: {
            type: 'category',
            data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            axisLine: { lineStyle: { color: '#e5e7eb' } },
            axisTick: { show: false },
            axisLabel: { color: '#6b7280' }
        },
        yAxis: {
            type: 'value',
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: { color: '#6b7280' },
            splitLine: { lineStyle: { color: '#f3f4f6' } }
        },
        series: [{
            data: [120, 132, 101, 134, 90, 230, 210, 182, 191, 234, 290, 330],
            type: 'line',
            smooth: true,
            lineStyle: { color: 'rgba(87, 181, 231, 1)', width: 3 },
            itemStyle: { color: 'rgba(87, 181, 231, 1)' },
            areaStyle: {
                color: {
                    type: 'linear',
                    x: 0, y: 0, x2: 0, y2: 1,
                    colorStops: [
                        { offset: 0, color: 'rgba(87, 181, 231, 0.1)' },
                        { offset: 1, color: 'rgba(87, 181, 231, 0.01)' }
                    ]
                }
            },
            showSymbol: false
        }],
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderColor: '#e5e7eb',
            textStyle: { color: '#1f2937' }
        }
    };
    lineChart.setOption(lineOption);

    // Pie Chart
    const pieChart = echarts.init(document.getElementById('pieChart'));
    const pieOption = {
        animation: false,
        series: [{
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['50%', '50%'],
            data: [
                { value: 335, name: 'High Priority', itemStyle: { color: 'rgba(252, 141, 98, 1)' } },
                { value: 310, name: 'Medium Priority', itemStyle: { color: 'rgba(251, 191, 114, 1)' } },
                { value: 234, name: 'Low Priority', itemStyle: { color: 'rgba(141, 211, 199, 1)' } },
                { value: 135, name: 'Critical', itemStyle: { color: 'rgba(87, 181, 231, 1)' } }
            ],
            label: {
                show: true,
                position: 'outside',
                color: '#1f2937',
                fontSize: 12
            },
            labelLine: { show: true, lineStyle: { color: '#d1d5db' } },
            itemStyle: { borderRadius: 4 }
        }],
        tooltip: {
            trigger: 'item',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderColor: '#e5e7eb',
            textStyle: { color: '#1f2937' }
        }
    };
    pieChart.setOption(pieOption);

    // Bar Chart
    const barChart = echarts.init(document.getElementById('barChart'));
    const barOption = {
        animation: false,
        grid: { top: 20, right: 20, bottom: 40, left: 40 },
        xAxis: {
            type: 'category',
            data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            axisLine: { lineStyle: { color: '#e5e7eb' } },
            axisTick: { show: false },
            axisLabel: { color: '#6b7280' }
        },
        yAxis: {
            type: 'value',
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: { color: '#6b7280' },
            splitLine: { lineStyle: { color: '#f3f4f6' } }
        },
        series: [
            {
                name: 'Solved',
                type: 'bar',
                data: [120, 200, 150, 80, 70, 110],
                itemStyle: {
                    color: 'rgba(87, 181, 231, 1)',
                    borderRadius: [4, 4, 0, 0]
                }
            },
            {
                name: 'Created',
                type: 'bar',
                data: [100, 180, 120, 90, 60, 130],
                itemStyle: {
                    color: 'rgba(141, 211, 199, 1)',
                    borderRadius: [4, 4, 0, 0]
                }
            }
        ],
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderColor: '#e5e7eb',
            textStyle: { color: '#1f2937' }
        },
        legend: {
            data: ['Solved', 'Created'],
            bottom: 0,
            textStyle: { color: '#6b7280' }
        }
    };
    barChart.setOption(barOption);
});

async function fetchTickets() {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:5001/api/tickets', {
        headers: { 'Authorization': 'Bearer ' + token }
    });
    if (!response.ok) throw new Error('Erreur lors de la récupération des tickets');
    return await response.json();
}

function getTicketsPerDay(tickets) {
    const counts = {};
    tickets.forEach(t => {
        const date = new Date(t.created_at || t.date || t.createdAt).toISOString().slice(0, 10);
        counts[date] = (counts[date] || 0) + 1;
    });
    const dates = Object.keys(counts).sort();
    return {
        dates,
        values: dates.map(d => counts[d])
    };
}

function getPriorityDistribution(tickets) {
    const priorities = { Low: 0, Medium: 0, High: 0 };
    tickets.forEach(t => {
        if (t.priority === 'low' || t.priority === 'Low') priorities.Low++;
        if (t.priority === 'Medium') priorities.Medium++;
        if (t.priority === 'High') priorities.High++;
    });
    return [
        { value: priorities.Low, name: 'Low Priority', itemStyle: { color: '#68d391' } },
        { value: priorities.Medium, name: 'Medium Priority', itemStyle: { color: '#f6ad55' } },
        { value: priorities.High, name: 'High Priority', itemStyle: { color: '#63b3ed' } }
    ];
}

function getCreatedAndSolvedPerDay(tickets) {
    const created = {};
    const solved = {};
    tickets.forEach(t => {
        const cdate = new Date(t.created_at || t.date || t.createdAt).toISOString().slice(0, 10);
        created[cdate] = (created[cdate] || 0) + 1;
        if (t.status === 'resolved' && t.updated_at) {
            const sdate = new Date(t.updated_at).toISOString().slice(0, 10);
            solved[sdate] = (solved[sdate] || 0) + 1;
        }
    });
    const allDates = Array.from(new Set([...Object.keys(created), ...Object.keys(solved)])).sort();
    return {
        dates: allDates,
        created: allDates.map(d => created[d] || 0),
        solved: allDates.map(d => solved[d] || 0)
    };
}

fetchTickets().then(tickets => {
    // Affichage dynamique du nombre de tickets
    const ticketsCountEl = document.querySelector('.metric-card .metric-number');
    if (ticketsCountEl) ticketsCountEl.textContent = tickets.length;

    // 1. Ticket Reply Time Trends
    const perDay = getTicketsPerDay(tickets);
    echarts.init(document.getElementById('lineChart')).setOption({
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: perDay.dates, boundaryGap: false, axisLine: { lineStyle: { color: '#e2e8f0' } }, axisTick: { show: false } },
        yAxis: { type: 'value', axisLine: { show: false }, splitLine: { lineStyle: { color: '#e2e8f0' } } },
        series: [{
            data: perDay.values,
            type: 'line',
            smooth: true,
            symbol: 'none',
            lineStyle: { color: '#38b2ac', width: 3 },
            areaStyle: { color: 'rgba(56,178,172,0.08)' }
        }]
    });

    // 2. Priority Distribution
    const pieData = getPriorityDistribution(tickets);
    echarts.init(document.getElementById('pieChart')).setOption({
        tooltip: { trigger: 'item' },
        legend: { orient: 'vertical', left: 'left' },
        series: [{
            name: 'Priority',
            type: 'pie',
            radius: ['55%', '80%'],
            avoidLabelOverlap: false,
            label: { show: true, position: 'outside' },
            labelLine: { show: true },
            data: pieData
        }]
    });

    // 3. Tickets Solved vs Created
    const solvedCreated = getCreatedAndSolvedPerDay(tickets);
    echarts.init(document.getElementById('barChart')).setOption({
        tooltip: { trigger: 'axis' },
        legend: { data: ['Solved', 'Created'], bottom: 0 },
        xAxis: { type: 'category', data: solvedCreated.dates, axisLine: { lineStyle: { color: '#e2e8f0' } }, axisTick: { show: false } },
        yAxis: { type: 'value', axisLine: { show: false }, splitLine: { lineStyle: { color: '#e2e8f0' } } },
        series: [
            { name: 'Solved', type: 'bar', data: solvedCreated.solved, itemStyle: { color: '#63b3ed' }, barWidth: 24 },
            { name: 'Created', type: 'bar', data: solvedCreated.created, itemStyle: { color: '#68d391' }, barWidth: 24 }
        ]
    });

    // 4. Recent Tickets (tableau)
    const recent = tickets.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 6);
    const tbody = document.querySelector('.tickets-table tbody');
    if (tbody) {
        tbody.innerHTML = '';
        recent.forEach(t => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${new Date(t.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                <td>${t.title || t.subject || ''}</td>
                <td><span class="badge ${t.status ? t.status.replace(/\s/g, '').toLowerCase() : ''}">${t.status ? t.status.charAt(0).toUpperCase() + t.status.slice(1) : ''}</span></td>
            `;
            tbody.appendChild(tr);
        });
    }
});

async function fetchClients() {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:5001/api/users', {
        headers: { 'Authorization': 'Bearer ' + token }
    });
    if (!response.ok) throw new Error('Erreur lors de la récupération des clients');
    return await response.json();
}

// Affichage dynamique du nombre de clients
fetchClients().then(clients => {
    const el = document.getElementById('allClientsCount');
    if (el) el.textContent = clients.length;
});

// Script pour rendre la navigation dynamique dans la sidebar
const navItems = document.querySelectorAll('.nav-menu .nav-item');
navItems.forEach(item => {
    item.addEventListener('click', function(e) {
        navItems.forEach(i => i.classList.remove('active'));
        this.classList.add('active');
        // Redirection si le lien n'est pas '#'
        const href = this.getAttribute('href');
        if (href && href !== '#') {
            window.location.href = href;
        }
        e.preventDefault();
    });
});
// Mettre 'Dashboard' actif par défaut si on est sur dashboard.html
window.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    if (path.includes('dashboard.html')) {
        navItems.forEach(i => i.classList.remove('active'));
        const dashLink = Array.from(navItems).find(i => i.textContent.trim().toLowerCase().includes('dashboard'));
        if (dashLink) dashLink.classList.add('active');
    }
});

// Gestion du bouton Log out
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
        localStorage.removeItem('token');
        window.location.href = '../login.html';
    });
}