let gasChart, tempChart, phChart;
let alarmPlayed = false;

// Global chart defaults
Chart.defaults.color = "#64748b";
Chart.defaults.font.family = "'Inter', sans-serif";

async function fetchData() {
    try {
        const res = await fetch("http://3.7.48.90:8000/api/spills");
        const data = await res.json();

        if (!data) {
            document.getElementById("status").innerText = "AWAITING SENSOR DATA...";
            document.getElementById("status").style.background = "#94a3b8";
            document.getElementById("status").style.color = "white";
            return;
        }

        const latest = data;

        // Update UI values
        document.getElementById("gas").innerText =
            Number(latest.gas_level || 0).toFixed(1) + " ppm";

        document.getElementById("temp").innerText =
            Number(latest.temperature || 0).toFixed(1) + " °C";

        document.getElementById("ph").innerText =
            Number(latest.ph || 0).toFixed(2);

        // Generate fake risk for UI (since backend doesn't send it)
        let risk = "NORMAL";
        if (latest.gas_level > 70 || latest.temperature > 70) {
            risk = "CRITICAL";
        } else if (latest.gas_level > 40) {
            risk = "HIGH";
        }

        updateStatus(risk);

        // For charts, simulate small history (since backend gives only latest)
        const fakeData = generateFakeHistory(latest);

        updateCharts(fakeData);
        updateDataLogs(fakeData);

    } catch (e) {
        console.log("Fetch error:", e);
        document.getElementById("status").innerText = "SERVER OFFLINE";
        document.getElementById("status").style.background = "#e2e8f0";
        document.getElementById("status").style.color = "#475569";
    }
}

// Create fake history for charts
function generateFakeHistory(latest) {
    const data = [];
    for (let i = 0; i < 10; i++) {
        data.push({
            gas: latest.gas_level + (Math.random() * 10 - 5),
            temperature: latest.temperature + (Math.random() * 5 - 2),
            ph: latest.ph + (Math.random() * 0.5 - 0.25),
            time: new Date().toLocaleTimeString(),
            risk: "NORMAL"
        });
    }
    return data;
}

function updateStatus(risk) {
    const status = document.getElementById("status");
    const alertBox = document.getElementById("alertBox");
    const sound = document.getElementById("alarmSound");
    const body = document.body;

    status.innerText = risk;

    status.style.color = "white";
    status.style.background = "#e2e8f0";
    body.classList.remove("danger");

    if (risk === "CRITICAL") {
        status.style.background = "#ef4444";
        alertBox.style.display = "block";
        body.classList.add("danger");

        if (!alarmPlayed) {
            sound.play().catch(() => {});
            alarmPlayed = true;
        }
    } else {
        alertBox.style.display = "none";
        alarmPlayed = false;

        if (risk === "HIGH") {
            status.style.background = "#f59e0b";
        } else {
            status.style.background = "#10b981";
        }
    }
}

function createChart(ctx, label, colorHex) {
    let fallbackBgColor = colorHex.includes('rgb')
        ? colorHex.replace(')', ', 0.15)').replace('rgb', 'rgba')
        : 'rgba(255, 255, 255, 0.1)';

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
                pointRadius: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } }
        }
    });
}

function updateCharts(data) {
    const labels = data.map(d => d.time);

    if (!gasChart) {
        gasChart = createChart(document.getElementById("gasChart"), "Gas", "rgb(239,68,68)");
        tempChart = createChart(document.getElementById("tempChart"), "Temp", "rgb(245,158,11)");
        phChart = createChart(document.getElementById("phChart"), "pH", "rgb(14,165,233)");
    }

    gasChart.data.labels = labels;
    gasChart.data.datasets[0].data = data.map(d => d.gas);

    tempChart.data.labels = labels;
    tempChart.data.datasets[0].data = data.map(d => d.temperature);

    phChart.data.labels = labels;
    phChart.data.datasets[0].data = data.map(d => d.ph);

    gasChart.update();
    tempChart.update();
    phChart.update();
}

function updateDataLogs(data) {
    const tbody = document.getElementById('data-logs-body');
    if (!tbody) return;

    tbody.innerHTML = '';

    data.forEach(d => {
        const row = `
            <tr>
                <td>${d.time}</td>
                <td>${d.gas.toFixed(1)}</td>
                <td>${d.temperature.toFixed(1)}</td>
                <td>${d.ph.toFixed(2)}</td>
                <td>${d.risk}</td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

// Auto refresh
setInterval(fetchData, 2000);
fetchData();

// Tabs + dropdown (unchanged)
document.addEventListener("DOMContentLoaded", () => {
    const navItems = document.querySelectorAll('.nav-item');
    const tabPanes = document.querySelectorAll('.tab-pane');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(nav => nav.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));

            item.classList.add('active');
            const targetId = item.getAttribute('data-tab');
            if(targetId) {
                document.getElementById(targetId).classList.add('active');
            }
        });
    });

    const userProfileBtn = document.getElementById("user-profile-btn");
    const userDropdown = document.getElementById("user-dropdown");

    if (userProfileBtn && userDropdown) {
        userProfileBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle("show");
        });

        document.addEventListener("click", (e) => {
            if (!userProfileBtn.contains(e.target)) {
                userDropdown.classList.remove("show");
            }
        });
    }
});