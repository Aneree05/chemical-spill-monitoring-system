let gasChart, tempChart, phChart;
let alarmPlayed = false;

// Global chart defaults for a clean light theme
Chart.defaults.color = "#64748b";
Chart.defaults.font.family = "'Inter', sans-serif";

async function fetchData() {
    try {
        const res = await fetch("http://127.0.0.1:8000/data");
        const data = await res.json();

        if (!data || data.length === 0) {
            document.getElementById("status").innerText = "AWAITING SENSOR DATA...";
            document.getElementById("status").style.background = "#94a3b8"; // slate
            document.getElementById("status").style.color = "white";
            return;
        }

        const latest = data[data.length - 1];

        // Format to 1 decimal place if needed
        document.getElementById("gas").innerText = Number(latest.gas).toFixed(1) + " ppm";
        document.getElementById("temp").innerText = Number(latest.temperature).toFixed(1) + " °C";
        document.getElementById("ph").innerText = Number(latest.ph).toFixed(2);

        updateStatus(latest.risk);
        updateCharts(data);
        updateDataLogs(data);
    } catch (e) {
        console.log("Could not fetch data (possibly mock server is down):", e);
        document.getElementById("status").innerText = "SERVER OFFLINE";
        document.getElementById("status").style.background = "#e2e8f0";
        document.getElementById("status").style.color = "#475569";
    }
}

function updateStatus(risk) {
    const status = document.getElementById("status");
    const alertBox = document.getElementById("alertBox");
    const sound = document.getElementById("alarmSound");
    const body = document.body;

    status.innerText = risk;

    // Reset styles
    status.style.color = "white";
    status.style.background = "#e2e8f0";
    body.classList.remove("danger");

    if (risk === "CRITICAL") {
        status.style.background = "#ef4444"; // Solid Red
        alertBox.style.display = "block";
        body.classList.add("danger");

        if (!alarmPlayed) {
            sound.play().catch(e => console.log("Audio play prevented by browser"));
            alarmPlayed = true;
        }

    } else {
        alertBox.style.display = "none";
        alarmPlayed = false;

        if (risk === "HIGH") {
            status.style.background = "#f59e0b"; // Amber
        } else {
            // NORMAL / LOW
            status.style.background = "#10b981"; // Emerald
        }
    }
}

function createChart(ctx, label, colorHex) {
    // Generate an rgba version of the hex/rgb string for fill styling (lighter for day mode)
    let fallbackBgColor = colorHex.includes('rgb') ? 
        colorHex.replace(')', ', 0.15)').replace('rgb', 'rgba') : 
        'rgba(255, 255, 255, 0.1)';

    return new Chart(ctx, {
        type: "line",
        data: {
            labels: [],
            datasets: [{
                label: label,
                data: [],
                borderColor: colorHex,
                backgroundColor: fallbackBgColor,
                borderWidth: 2,
                pointBackgroundColor: "#ffffff",
                pointBorderColor: colorHex,
                pointHoverBackgroundColor: colorHex,
                pointHoverBorderColor: "#ffffff",
                pointRadius: 3,
                pointHoverRadius: 6,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: "rgba(30, 41, 59, 0.95)",
                    titleFont: { size: 13, family: "'Inter', sans-serif", weight: '600' },
                    bodyFont: { size: 13, family: "'Inter', sans-serif" },
                    padding: 12,
                    cornerRadius: 8,
                    displayColors: false
                }
            },
            scales: {
                x: {
                    grid: { color: "rgba(0, 0, 0, 0.04)", drawBorder: false },
                    ticks: { maxTicksLimit: 6 }
                },
                y: {
                    grid: { color: "rgba(0, 0, 0, 0.04)", drawBorder: false },
                    beginAtZero: false
                }
            }
        }
    });
}

function updateCharts(data) {
    const labels = data.map(d => d.time);

    if (!gasChart) {
        // refined, desaturated professional colors
        gasChart = createChart(document.getElementById("gasChart"), "Gas (ppm)", "rgb(239, 68, 68)"); // Red-500
        tempChart = createChart(document.getElementById("tempChart"), "Temperature (°C)", "rgb(245, 158, 11)"); // Amber-500
        phChart = createChart(document.getElementById("phChart"), "pH Level", "rgb(14, 165, 233)"); // Sky-500
    }

    gasChart.data.labels = labels;
    gasChart.data.datasets[0].data = data.map(d => d.gas);

    tempChart.data.labels = labels;
    tempChart.data.datasets[0].data = data.map(d => d.temperature);

    phChart.data.labels = labels;
    phChart.data.datasets[0].data = data.map(d => d.ph);

    gasChart.update('none'); // Update without full animation for smoother loop
    tempChart.update('none');
    phChart.update('none');
}

setInterval(fetchData, 2000);
fetchData(); // initial fetch immediately

// --- NEW FUNCTIONALITY ADDED: TAB NAVIGATION & DATA LOGS ---

function updateDataLogs(data) {
    const tbody = document.getElementById('data-logs-body');
    if (!tbody) return;
    
    // Show only the last 15 entries, reversed so newest is on top
    const recentData = [...data].reverse().slice(0, 15);
    
    tbody.innerHTML = '';
    
    recentData.forEach(d => {
        let riskBadge = '';
        if (d.risk === 'CRITICAL') {
            riskBadge = '<span class="badge critical">Critical</span>';
        } else if (d.risk === 'HIGH') {
            riskBadge = '<span class="badge warning">Warning</span>';
        } else {
            riskBadge = '<span class="badge normal">Normal</span>';
        }
        
        const row = `
            <tr>
                <td>${d.time}</td>
                <td>${d.gas}</td>
                <td>${d.temperature}</td>
                <td>${d.ph}</td>
                <td>${riskBadge}</td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

// Tab Switching functionality
document.addEventListener("DOMContentLoaded", () => {
    const navItems = document.querySelectorAll('.nav-item');
    const tabPanes = document.querySelectorAll('.tab-pane');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active classes
            navItems.forEach(nav => nav.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            // Add active class to clicked item and corresponding pane
            item.classList.add('active');
            const targetId = item.getAttribute('data-tab');
            if(targetId) {
                document.getElementById(targetId).classList.add('active');
            }
        });
    });

    // User Profile Dropdown logic
    const userProfileBtn = document.getElementById("user-profile-btn");
    const userDropdown = document.getElementById("user-dropdown");

    if (userProfileBtn && userDropdown) {
        userProfileBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle("show");
        });

        // Close dropdown when clicking outside
        document.addEventListener("click", (e) => {
            if (!userProfileBtn.contains(e.target)) {
                userDropdown.classList.remove("show");
            }
        });
    }
});