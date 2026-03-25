const btn        = document.querySelector('button');
const palette    = document.getElementById('palette');
const sizeSelect = document.getElementById('size');
const toast = document.getElementById('toast');
let toastTimer;


function hslToHex(h, s, l) {
    s /= 100;
    l /= 100;
    const k     = n => (n + h / 30) % 12;
    const a     = s * Math.min(l, 1 - l);
    const f     = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    const toHex = x => Math.round(x * 255).toString(16).padStart(2, '0');
    return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}

function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2000);
}

function generatePalette() {
    const size = parseInt(sizeSelect.value);
    palette.innerHTML = '';
    palette.className = `size-${size}`;

    const colors = [];

    for (let i = 0; i < size; i++) {
        const h      = Math.floor(Math.random() * 360);
        const s      = Math.floor(Math.random() * 61) + 40;
        const l = Math.floor(Math.random() * 41) + 30;
        colors.push({ h, s, l });
        const hslStr = `hsl(${h}, ${s}%, ${l}%)`;
        const hexStr = hslToHex(h, s, l);

        function loadSavedPalette() {
    const saved = localStorage.getItem('savedPalette');
    if (!saved) return;

    const colors = JSON.parse(saved);
    palette.className = `size-${colors.length}`;

    colors.forEach(({ h, s, l }) => {
        const hslStr = `hsl(${h}, ${s}%, ${l}%)`;
        const hexStr = hslToHex(h, s, l);
    })
}
        
        const swatch = document.createElement('div');
        swatch.className = 'swatch';
        swatch.setAttribute('aria-label', `Color ${hexStr}`);
        swatch.innerHTML = `
            <div class="swatch-color" style="background-color: ${hslStr}"></div>
            <div class="swatch-info">
                <div class="swatch-hsl">
                    <span>HSL: ${h}, ${s}%, ${l}%</span>
                    <button class="copy-btn" type="button" aria-label="Copiar HSL">⎘</button>
                </div>
                <div class="swatch-hex">
                    <span>HEX: ${hexStr}</span>
                    <button class="copy-btn" type="button" aria-label="Copiar HEX">⎘</button>
                </div>
            </div>
        `;

        const [hslBtn, hexBtn] = swatch.querySelectorAll('.copy-btn');
        hslBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(`hsl(${h}, ${s}%, ${l}%)`);
            showToast('Color copiado');
        });
        hexBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(hexStr);
            showToast('Color copiado');
        });

        palette.appendChild(swatch);
    }
    localStorage.setItem('savedPalette', JSON.stringify(colors));
}

btn.addEventListener('click', () => {
    btn.classList.add('pressed');
    setTimeout(() => btn.classList.remove('pressed'), 150);
    generatePalette();
    showToast('Paleta de colores generada');
    setTimeout(() => toast.classList.remove('show'), 2000);
});

loadSavedPalette();