let chart;

let selectedCountry = "usa";
let selectedLength = "short";
let selectedWatch = "average";
let selectedNiche = "finance";

function setupSelector(id, setter) {
    document.querySelectorAll(`#${id} .select-btn`).forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(`#${id} .select-btn`).forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            setter(btn.dataset.value);
        });
    });
}

setupSelector("countrySelector", v => selectedCountry = v);
setupSelector("lengthSelector", v => selectedLength = v);
setupSelector("watchSelector", v => selectedWatch = v);
setupSelector("nicheSelector", v => selectedNiche = v);

function getBaseRange(length) {
    if (length === "short") {
        return [0.02, 0.06]; // Creator Fund realistic
    }
    if (length === "medium") {
        return [0.30, 1.00]; // Creator Rewards realistic US
    }
    if (length === "long") {
        return [0.40, 1.20];
    }
}

function countryAdjustment(country) {
    return {
        usa: 1.0,
        uk: 0.8,
        canada: 0.8,
        australia: 0.85,
        other: 0.4
    }[country];
}

// Small adjustments only — no huge jumps
function nicheAdjustment(niche) {
    return {
        finance: 1.10,
        tech: 1.08,
        education: 1.05,
        fitness: 1.00,
        gaming: 0.95,
        lifestyle: 0.90
    }[niche];
}

// Watch time controls position within range
function watchPosition(watch) {
    return {
        low: 0.15,
        average: 0.45,
        high: 0.75,
        excellent: 0.95
    }[watch];
}

function calculate() {

    const views = parseFloat(document.getElementById("views").value);
    const engagement = parseFloat(document.getElementById("engagement").value) / 100;

    if (!views || !engagement) {
        alert("Fill all fields.");
        return;
    }

    let [minRPM, maxRPM] = getBaseRange(selectedLength);

    // Country modifies base range
    const countryMultiplier = countryAdjustment(selectedCountry);
    minRPM *= countryMultiplier;
    maxRPM *= countryMultiplier;

    // Content type slightly modifies range
    const nicheMultiplier = nicheAdjustment(selectedNiche);
    minRPM *= nicheMultiplier;
    maxRPM *= nicheMultiplier;

    // Watch time positions payout inside range
    const watchRatio = watchPosition(selectedWatch);

    let rpm = minRPM + (maxRPM - minRPM) * watchRatio;

    // Engagement provides small bonus realism (max +10%)
    const engagementBonus = Math.min(engagement, 0.15) * 0.5;
    rpm *= (1 + engagementBonus);

    // Hard cap to prevent unrealistic inflation
    const absoluteCap = maxRPM * 1.15;
    rpm = Math.min(rpm, absoluteCap);

    const earnings = (views / 1000) * rpm;

    animateValue("rpm", rpm);
    animateValue("earnings", earnings);

    document.getElementById("results").classList.add("show");

    renderGrowthChart(earnings);

    document.getElementById("breakdown").innerText =
        `RPM range adjusted by country & content type. Watch time determines payout position. Engagement adds minor performance bonus.`;
}

function animateValue(id, value) {
    let obj = document.getElementById(id);
    let start = 0;
    let duration = 700;
    let startTime = null;

    function animate(currentTime) {
        if (!startTime) startTime = currentTime;
        let progress = currentTime - startTime;
        let percent = Math.min(progress / duration, 1);
        let current = start + (value * percent);

        obj.innerText = "$" + current.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        if (percent < 1) requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
}

function renderGrowthChart(base) {
    const ctx = document.getElementById('growthChart').getContext('2d');
    if (chart) chart.destroy();

    let data = [];
    let current = base;

    for (let i = 0; i < 12; i++) {
        data.push(current);
        current *= 1.01; // extremely conservative growth
    }

    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array.from({ length: 12 }, (_, i) => `Month ${i + 1}`),
            datasets: [{
                label: "Projected Per-Video Earnings",
                data: data,
                tension: 0.4,
                fill: true
            }]
        }
    });
}