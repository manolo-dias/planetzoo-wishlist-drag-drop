/**
 * Planet Zoo Wishlist - Dynamic Drag & Drop Engine
 * 
 * Esta engine carrega dinamicamente as imagens organizadas por blocos,
 * permite reordenação via drag & drop e persiste o estado no index.json
 */

// Estado global da aplicação
let currentIndex = {};
let extensionsMap = {};
let originalIndex = {};

// Carrega os mapeamentos de extensões das imagens
async function loadExtensionsMap() {
    try {
        const response = await fetch('extensions_map.json');
        extensionsMap = await response.json();
    } catch (error) {
        console.error('Erro ao carregar extensions_map.json:', error);
        // Fallback: tenta ambas as extensões dinamicamente
        extensionsMap = {};
    }
}

// Carrega o index.json atual
async function loadIndex() {
    try {
        const response = await fetch('index.json');
        currentIndex = await response.json();
        originalIndex = JSON.parse(JSON.stringify(currentIndex)); // Deep copy
        return currentIndex;
    } catch (error) {
        console.error('Erro ao carregar index.json:', error);
        return {};
    }
}

// Detecta dinamicamente a extensão da imagem (PNG ou JPG)
function getImageExtension(imageName) {
    if (extensionsMap[imageName]) {
        return extensionsMap[imageName];
    }
    
    // Fallback: retorna jpg como padrão
    return 'jpg';
}

// Cria o elemento HTML de uma imagem
function createImageElement(imageName, blockNumber, index) {
    const extension = getImageExtension(imageName);
    const imageItem = document.createElement('div');
    imageItem.className = 'image-item';
    imageItem.draggable = true;
    imageItem.dataset.imageName = imageName;
    imageItem.dataset.blockNumber = blockNumber;
    imageItem.dataset.index = index;
    
    imageItem.innerHTML = `
        <img src="images/${imageName}.${extension}" 
             alt="${imageName}" 
             onerror="this.src='images/${imageName}.${extension === 'jpg' ? 'png' : 'jpg'}'">
        <div class="image-number">${imageName.replace('image', '')}</div>
    `;
    
    // Event listeners para drag & drop
    imageItem.addEventListener('dragstart', handleDragStart);
    imageItem.addEventListener('dragover', handleDragOver);
    imageItem.addEventListener('drop', handleDrop);
    imageItem.addEventListener('dragend', handleDragEnd);
    
    return imageItem;
}

// Renderiza todos os blocos na tela
function renderBlocks() {
    const container = document.getElementById('blocksContainer');
    container.innerHTML = '';
    
    // Ordenar os blocos por número
    const sortedBlocks = Object.keys(currentIndex).sort((a, b) => parseInt(a) - parseInt(b));
    
    sortedBlocks.forEach(blockNumber => {
        const images = currentIndex[blockNumber];
        
        // Criar o elemento do bloco
        const blockElement = document.createElement('div');
        blockElement.className = 'block';
        blockElement.dataset.blockNumber = blockNumber;
        
        // Header do bloco
        const header = document.createElement('div');
        header.className = 'block-header';
        header.innerHTML = `
            <div class="block-title">Bloco ${blockNumber}</div>
            <div class="block-count">${images.length} imagens</div>
        `;
        
        // Grid container para as imagens
        const gridContainer = document.createElement('div');
        gridContainer.className = 'grid-container';
        
        // Adicionar as imagens
        images.forEach((imageName, index) => {
            const imageElement = createImageElement(imageName, blockNumber, index);
            gridContainer.appendChild(imageElement);
        });
        
        blockElement.appendChild(header);
        blockElement.appendChild(gridContainer);
        container.appendChild(blockElement);
    });
}

// Variáveis para controle do drag & drop
let draggedElement = null;
let draggedFromBlock = null;
let draggedFromIndex = null;

function handleDragStart(e) {
    draggedElement = e.target.closest('.image-item');
    draggedFromBlock = draggedElement.dataset.blockNumber;
    draggedFromIndex = parseInt(draggedElement.dataset.index);
    
    draggedElement.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    const targetElement = e.target.closest('.image-item');
    if (targetElement && targetElement !== draggedElement) {
        targetElement.classList.add('drag-over');
    }
}

function handleDrop(e) {
    e.preventDefault();
    
    const targetElement = e.target.closest('.image-item');
    if (!targetElement || targetElement === draggedElement) {
        return;
    }
    
    const targetBlock = targetElement.dataset.blockNumber;
    const targetIndex = parseInt(targetElement.dataset.index);
    
    // Remover elemento da posição original
    const draggedImageName = draggedElement.dataset.imageName;
    currentIndex[draggedFromBlock].splice(draggedFromIndex, 1);
    
    // Inserir na nova posição
    currentIndex[targetBlock].splice(targetIndex, 0, draggedImageName);
    
    // Re-renderizar os blocos
    renderBlocks();
    
    // Mostrar status de sucesso
    showStatus('Imagem reposicionada com sucesso!', 'success');
}

function handleDragEnd(e) {
    // Limpar classes de drag
    document.querySelectorAll('.image-item').forEach(item => {
        item.classList.remove('dragging', 'drag-over');
    });
    
    draggedElement = null;
    draggedFromBlock = null;
    draggedFromIndex = null;
}

// Salva o estado atual no servidor (simulado via localStorage por enquanto)
async function saveIndex() {
    try {
        // Em uma implementação real, isso faria uma requisição POST para o servidor
        // Por enquanto, vamos simular salvando no localStorage
        localStorage.setItem('planetzoo_index', JSON.stringify(currentIndex));
        
        // Também vamos criar um novo arquivo JSON para download
        const dataStr = JSON.stringify(currentIndex, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = 'index.json';
        link.click();
        
        showStatus('Ordem salva com sucesso! Arquivo baixado.', 'success');
    } catch (error) {
        console.error('Erro ao salvar:', error);
        showStatus('Erro ao salvar a ordem.', 'error');
    }
}

// Restaura a ordem original
function resetToOriginal() {
    if (confirm('Tem certeza que deseja restaurar a ordem original? Todas as alterações serão perdidas.')) {
        currentIndex = JSON.parse(JSON.stringify(originalIndex));
        renderBlocks();
        showStatus('Ordem original restaurada.', 'success');
    }
}

// Mostra mensagens de status
function showStatus(message, type) {
    const statusElement = document.getElementById('status');
    statusElement.textContent = message;
    statusElement.className = `status ${type}`;
    statusElement.style.display = 'block';
    
    setTimeout(() => {
        statusElement.style.display = 'none';
    }, 3000);
}

// Funções expostas globalmente
window.saveOrder = saveIndex;
window.resetOrder = resetToOriginal;

// Inicialização da aplicação
async function init() {
    console.log('🚀 Iniciando Planet Zoo Wishlist Engine...');
    
    await loadExtensionsMap();
    await loadIndex();
    renderBlocks();
    
    console.log('✅ Engine carregada com sucesso!');
    console.log(`📊 Carregados ${Object.keys(currentIndex).length} blocos`);
    
    const totalImages = Object.values(currentIndex).reduce((sum, block) => sum + block.length, 0);
    console.log(`🖼️ Total de ${totalImages} imagens`);
}

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}