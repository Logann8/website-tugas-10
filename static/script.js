document.getElementById('binomialForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const n = parseInt(document.getElementById('n').value);
    const p = parseFloat(document.getElementById('p').value);
    const k = parseInt(document.getElementById('k').value);

    if (n < 0 || p < 0 || p > 1 || k < 0 || k > n) {
        alert('Masukkan nilai yang valid untuk n, p, dan k!');
        return;
    }

    const response = await fetch('/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ n, p, k })
    });

    const data = await response.json();

    document.getElementById('result').style.display = 'block';
    document.getElementById('calculationSteps').textContent = data.calculation_steps;

    drawBarChart('pmfCanvas', data.pmf_values, 'Grafik Fungsi Massa Probabilitas (PMF)', 'Jumlah Keberhasilan (k)', 'Probabilitas');
    drawLineChart('cdfCanvas', data.cdf_values, 'Grafik Fungsi Distribusi Kumulatif (CDF)', 'Jumlah Keberhasilan (k)', 'Probabilitas Kumulatif');
});

function drawBarChart(canvasId, data, title, xLabel, yLabel) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const width = canvas.width - 80;
    const height = canvas.height - 80;
    const maxData = Math.max(...data);

    const barWidth = width / data.length;
    const padding = 40;

    data.forEach((value, index) => {
        const barHeight = (value / maxData) * height;
        const x = padding + index * barWidth;
        const y = canvas.height - padding - barHeight;

        ctx.fillStyle = 'rgba(0, 123, 255, 0.7)';
        ctx.fillRect(x, y, barWidth - 5, barHeight);

        ctx.fillStyle = '#000';
        ctx.fillText(index, x + barWidth / 2 - 10, canvas.height - padding + 15);
    });

    ctx.fillText(title, canvas.width / 2, 20);
}

function drawLineChart(canvasId, data, title, xLabel, yLabel) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const width = canvas.width - 80;
    const height = canvas.height - 80;
    const maxData = Math.max(...data);

    const stepX = width / (data.length - 1);
    const padding = 40;

    const points = data.map((value, index) => {
        const x = padding + index * stepX;
        const y = canvas.height - padding - (value / maxData) * height;
        return { x, y, value };
    });

    // Draw axes
    ctx.beginPath();
    ctx.moveTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.moveTo(padding, canvas.height - padding);
    ctx.lineTo(padding, padding);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Draw line
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach((point) => ctx.lineTo(point.x, point.y));
    ctx.strokeStyle = 'rgba(40, 167, 69, 0.7)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw points and annotate (simplified)
    points.forEach((point, index) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(40, 167, 69, 1)';
        ctx.fill();

        // Add labels only for certain points (e.g., every 5th point or first/last)
        if (index % 5 === 0 || index === points.length - 1) {
            ctx.fillStyle = '#000';
            ctx.font = '12px Arial';
            ctx.fillText(point.value.toFixed(2), point.x, point.y - 10);
        }
    });

    // Add labels
    ctx.fillStyle = '#000';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(title, canvas.width / 2, 20);

    ctx.textAlign = 'center';
    ctx.fillText(xLabel, canvas.width / 2, canvas.height - 10);

    ctx.save();
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText(yLabel, -canvas.height / 2, 20);
    ctx.restore();
}
