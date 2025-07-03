// Constantes
const GRID_WIDTH = 40;
const GRID_HEIGHT = 40;
const EMPTY = 0;
const HEAD = 1;
const TAIL = 2;
const CONDUCTOR = 3;

// Variables de estado
let grid = [];
let nextGrid = [];
let currentState = EMPTY;
let isRunning = false;
let generation = 0;
let intervalId = null;
let speed = 5;

// Elementos DOM
const gridElement = document.getElementById('grid');
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const stepBtn = document.getElementById('step-btn');
const clearBtn = document.getElementById('clear-btn');
const speedInput = document.getElementById('speed');
const speedValue = document.getElementById('speed-value');
const generationElement = document.getElementById('generation');
const activeCellsElement = document.getElementById('active-cells');
const stateOptions = document.querySelectorAll('.state-option');

// Inicializar la cuadrícula
function initializeGrid() {
    grid = [];
    gridElement.innerHTML = '';
    
    for (let y = 0; y < GRID_HEIGHT; y++) {
        grid[y] = [];
        nextGrid[y] = [];
        
        for (let x = 0; x < GRID_WIDTH; x++) {
            grid[y][x] = EMPTY;
            nextGrid[y][x] = EMPTY;
            
            const cell = document.createElement('div');
            cell.className = 'cell empty';
            cell.dataset.x = x;
            cell.dataset.y = y;
            
            // Eventos para dibujar
            cell.addEventListener('mousedown', () => handleCellClick(x, y));
            cell.addEventListener('mouseenter', (e) => {
                if (e.buttons === 1) {
                    handleCellClick(x, y);
                }
            });
            
            gridElement.appendChild(cell);
        }
    }
    
    generation = 0;
    updateStats();
}

// Manejar clic en celda para dibujar
function handleCellClick(x, y) {
    grid[y][x] = currentState;
    renderCell(x, y);
}

// Renderizar una celda
function renderCell(x, y) {
    const cell = document.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
    if (!cell) return;
    
    cell.className = 'cell';
    switch (grid[y][x]) {
        case EMPTY:
            cell.classList.add('empty');
            break;
        case HEAD:
            cell.classList.add('head');
            break;
        case TAIL:
            cell.classList.add('tail');
            break;
        case CONDUCTOR:
            cell.classList.add('conductor');
            break;
    }
}

// Renderizar la cuadrícula
function renderGrid() {
    for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
            renderCell(x, y);
        }
    }
}

// Actualizar estadísticas
function updateStats() {
    generationElement.textContent = generation;
    
    let activeCount = 0;
    for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
            if (grid[y][x] !== EMPTY) {
                activeCount++;
            }
        }
    }
    
    activeCellsElement.textContent = activeCount;
}

// Calcular la siguiente generación
function nextGeneration() {
    // Crear una copia de la cuadrícula actual para cálculos
    for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
            nextGrid[y][x] = grid[y][x];
            
            // Aplicar reglas de WireWorld
            switch (grid[y][x]) {
                case EMPTY:
                    // Vacío permanece vacío
                    break;
                case HEAD:
                    // Cabeza se convierte en cola
                    nextGrid[y][x] = TAIL;
                    break;
                case TAIL:
                    // Cola se convierte en conductor
                    nextGrid[y][x] = CONDUCTOR;
                    break;
                case CONDUCTOR:
                    // Conductor se convierte en cabeza si 1 o 2 vecinos son cabezas
                    let headCount = 0;
                    
                    // Verificar los 8 vecinos
                    for (let dy = -1; dy <= 1; dy++) {
                        for (let dx = -1; dx <= 1; dx++) {
                            if (dx === 0 && dy === 0) continue;
                            
                            const ny = y + dy;
                            const nx = x + dx;
                            
                            if (ny >= 0 && ny < GRID_HEIGHT && nx >= 0 && nx < GRID_WIDTH) {
                                if (grid[ny][nx] === HEAD) {
                                    headCount++;
                                }
                            }
                        }
                    }
                    
                    if (headCount === 1 || headCount === 2) {
                        nextGrid[y][x] = HEAD;
                    }
                    break;
            }
        }
    }
    
    // Intercambiar cuadrículas
    const temp = grid;
    grid = nextGrid;
    nextGrid = temp;
    
    generation++;
    renderGrid();
    updateStats();
}

// Iniciar la simulación
function startSimulation() {
    if (isRunning) return;
    isRunning = true;
    intervalId = setInterval(nextGeneration, 1000 / speed);
}

// Detener la simulación
function stopSimulation() {
    if (!isRunning) return;
    isRunning = false;
    clearInterval(intervalId);
}

// Avanzar una generación
function stepSimulation() {
    stopSimulation();
    nextGeneration();
}

// Limpiar la cuadrícula
function clearGrid() {
    stopSimulation();
    for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
            grid[y][x] = EMPTY;
        }
    }
    generation = 0;
    renderGrid();
    updateStats();
}

// Establecer estado de dibujo
function setDrawingState(state) {
    currentState = parseInt(state);
    
    stateOptions.forEach(option => {
        if (parseInt(option.dataset.state) === currentState) {
            option.classList.add('active');
        } else {
            option.classList.remove('active');
        }
    });
}

// Cargar circuito predefinido (diodo)
function loadDiodePreset() {
    clearGrid();
    
    // Circuito de diodo
    const centerY = Math.floor(GRID_HEIGHT / 2);
    
    // Línea conductora horizontal
    for (let x = 5; x < GRID_WIDTH - 5; x++) {
        grid[centerY][x] = CONDUCTOR;
    }
    
    // Estructura de diodo
    for (let y = centerY - 2; y <= centerY + 2; y++) {
        grid[y][20] = CONDUCTOR;
    }
    grid[centerY][20] = EMPTY;
    
    // Electrón para iniciar el flujo
    grid[centerY][6] = HEAD;
    grid[centerY][7] = TAIL;
    
    renderGrid();
}

// Cargar circuito predefinido (compuerta XOR)
function loadXORPreset() {
    clearGrid();
    
    // Compuerta XOR
    const centerY = Math.floor(GRID_HEIGHT / 2);
    
    // Líneas de entrada
    for (let x = 5; x < 20; x++) {
        grid[centerY - 5][x] = CONDUCTOR;
        grid[centerY + 5][x] = CONDUCTOR;
    }
    
    // Estructura de la compuerta
    grid[centerY - 5][20] = CONDUCTOR;
    grid[centerY + 5][20] = CONDUCTOR;
    grid[centerY - 4][21] = CONDUCTOR;
    grid[centerY + 4][21] = CONDUCTOR;
    grid[centerY - 3][22] = CONDUCTOR;
    grid[centerY + 3][22] = CONDUCTOR;
    grid[centerY - 2][23] = CONDUCTOR;
    grid[centerY + 2][23] = CONDUCTOR;
    grid[centerY - 1][24] = CONDUCTOR;
    grid[centerY + 1][24] = CONDUCTOR;
    grid[centerY][25] = CONDUCTOR;
    grid[centerY][26] = CONDUCTOR;
    
    // Línea de salida
    for (let x = 26; x < GRID_WIDTH - 5; x++) {
        grid[centerY][x] = CONDUCTOR;
    }
    
    // Electrones para demostrar entradas
    grid[centerY - 5][6] = HEAD;
    grid[centerY - 5][7] = TAIL;
    
    renderGrid();
}

// Cargar circuito predefinido (generador de reloj)
function loadClockPreset() {
    clearGrid();
    
    // Generador de reloj
    const centerY = Math.floor(GRID_HEIGHT / 2);
    
    // Estructura de anillo
    for (let x = 10; x < 30; x++) {
        grid[centerY - 5][x] = CONDUCTOR;
        grid[centerY + 5][x] = CONDUCTOR;
    }
    for (let y = centerY - 4; y <= centerY + 4; y++) {
        grid[y][10] = CONDUCTOR;
        grid[y][30] = CONDUCTOR;
    }
    
    // Conexiones cruzadas para crear oscilador
    grid[centerY - 5][15] = EMPTY;
    grid[centerY - 5][25] = EMPTY;
    grid[centerY + 5][15] = EMPTY;
    grid[centerY + 5][25] = EMPTY;
    
    // Electrón inicial
    grid[centerY - 5][11] = HEAD;
    grid[centerY - 5][12] = TAIL;
    
    renderGrid();
}

// Event listeners
startBtn.addEventListener('click', startSimulation);
stopBtn.addEventListener('click', stopSimulation);
stepBtn.addEventListener('click', stepSimulation);
clearBtn.addEventListener('click', clearGrid);

speedInput.addEventListener('input', () => {
    speed = parseInt(speedInput.value);
    speedValue.textContent = speed;
    
    if (isRunning) {
        stopSimulation();
        startSimulation();
    }
});

stateOptions.forEach(option => {
    option.addEventListener('click', () => {
        setDrawingState(option.dataset.state);
    });
});

document.getElementById('diode-preset').addEventListener('click', loadDiodePreset);
document.getElementById('xor-preset').addEventListener('click', loadXORPreset);
document.getElementById('clock-preset').addEventListener('click', loadClockPreset);

// Inicializar la simulación
initializeGrid();
setDrawingState(EMPTY);

// Patrón inicial para demostración
for (let i = 10; i < 30; i++) {
    grid[20][i] = CONDUCTOR;
}
grid[20][10] = HEAD;
grid[20][11] = TAIL;
renderGrid();

// Exportar la cuadrícula a JSON
function exportGrid() {
    const data = {
        grid: grid,
        generation: generation
    };
    const json = JSON.stringify(data);
    const blob = new Blob([json], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wireworld_${new Date().toISOString().slice(0,19).replace(/:/g,'-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Importar la cuadrícula desde JSON
function importGrid() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = e => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = event => {
            try {
                const data = JSON.parse(event.target.result);
                
                // Validar estructura de datos
                if (!data.grid || !Array.isArray(data.grid)) {
                    throw new Error('Formato de archivo inválido');
                }
                
                stopSimulation();
                grid = data.grid;
                generation = data.generation || 0;
                renderGrid();
                updateStats();
            } catch (error) {
                alert(`Error al importar: ${error.message}`);
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

document.getElementById('import-btn').addEventListener('click', importGrid);
document.getElementById('export-btn').addEventListener('click', exportGrid);