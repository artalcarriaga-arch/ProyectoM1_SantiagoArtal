const btn = document.querySelector('button');
const palette = document.getElementById('palette');
const sizeSelect = document.getElementById('size');

function hslToHex(h, s, l) {
    s /= 100;
    l /= 100;
    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    const toHex = x => Math.round(x * 255).toString(16).padStart(2, '0');
    return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}

function generatePalette() {
    const size = parseInt(sizeSelect.value);
    palette.innerHTML = '';

    for (let i = 0; i < size; i++) {
        const h = Math.floor(Math.random() * 360);
        const s = Math.floor(Math.random() * 61) + 40; // 40–100%
        const l = Math.floor(Math.random() * 41) + 30; // 30–70%
        const hslStr = `hsl(${h}, ${s}%, ${l}%)`;
        const hexStr = hslToHex(h, s, l);

        const swatch = document.createElement('div');
        swatch.className = 'swatch';
        swatch.innerHTML = `
            <div class="swatch-color" style="background-color: ${hslStr}"></div>
            <div class="swatch-hex">${hexStr}</div>
            <div class="swatch-hsl">hsl(${h}, ${s}%, ${l}%)</div>
        `;
        palette.appendChild(swatch);
    }
}

btn.addEventListener('click', () => {
    btn.classList.add('pressed');
    setTimeout(() => btn.classList.remove('pressed'), 150);
    generatePalette();
});