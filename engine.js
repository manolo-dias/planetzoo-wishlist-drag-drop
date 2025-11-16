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

// Dados embutidos no JavaScript - 100% serverless
const EXTENSIONS_MAP = {
    "image4": "png", "image7": "png", "image8": "png", "image9": "png", 
    "image44": "png", "image57": "png", "image79": "png", "image81": "png", 
    "image83": "png", "image85": "png", "image96": "png", "image102": "png", 
    "image104": "png", "image107": "png", "image110": "png", "image157": "png", 
    "image197": "png"
};

const DEFAULT_INDEX = {
  "2": ["image115", "image114"],
  "3": ["image205", "image204", "image203"],
  "7": ["image195", "image191", "image190", "image193", "image192", "image156", "image164"],
  "15": ["image31", "image34", "image18", "image174", "image170", "image146", "image149", "image152", "image155", "image202", "image182", "image181", "image184", "image183", "image180"],
  "17": ["image104", "image102", "image110", "image107", "image96", "image24", "image65", "image128", "image118", "image121", "image126", "image145", "image154", "image151", "image142", "image139", "image179"],
  "18": ["image205", "image204", "image203", "image31", "image34", "image18", "image174", "image170", "image146", "image149", "image152", "image155", "image202", "image182", "image181", "image184", "image183", "image180", "image165", "image162", "image148", "image32", "image33", "image35", "image22", "image55", "image58", "image61", "image62", "image133", "image93", "image132", "image14", "image16", "image20", "image49", "image52", "image60", "image67", "image64", "image51", "image48", "image167", "image113", "image103", "image101", "image108", "image105", "image94", "image91", "image99", "image97", "image88", "image136", "image134", "image124", "image122", "image129", "image127", "image117", "image116", "image120", "image119", "image59", "image66", "image63", "image50", "image47", "image56", "image53", "image42", "image41", "image45", "image82", "image80", "image86", "image84"],
  "19": ["image115", "image114", "image104", "image102", "image110", "image107", "image96", "image200", "image201", "image98", "image199", "image198", "image36", "image37", "image38", "image39", "image26", "image28", "image29"],
  "20": ["image197", "image36", "image37", "image38", "image39", "image26", "image28", "image29", "image70", "image71", "image73", "image75", "image77", "image112", "image89", "image90", "image109", "image106", "image95", "image92"],
  "24": ["image157", "image165", "image162", "image148", "image40", "image12", "image79", "image81", "image85", "image87", "image46", "image131", "image177", "image176", "image158", "image160", "image163", "image140", "image111"],
  "25": ["image32", "image33", "image35", "image22", "image55", "image58", "image61", "image62", "image133", "image93", "image132", "image100", "image137", "image135", "image125", "image123", "image130", "image57", "image54", "image8", "image7", "image10", "image9", "image4", "image3"],
  "27": ["image195", "image191", "image190", "image193", "image192", "image156", "image164", "image6", "image5", "image2", "image1", "image186", "image185", "image189", "image197", "image83", "image43", "image44", "image168", "image169", "image188", "image187", "image157", "image40", "image12", "image79", "image81"],
  "29": ["image14", "image16", "image20", "image49", "image52", "image60", "image67", "image64", "image51", "image48", "image167", "image113", "image103", "image101", "image108", "image105", "image94", "image91", "image99", "image97", "image88", "image136", "image134", "image124", "image122", "image129", "image127", "image117", "image116"],
  "35": ["image167", "image113", "image103", "image101", "image108", "image105", "image94", "image91", "image99", "image97", "image88", "image136", "image134", "image124", "image122", "image129", "image127", "image117", "image116", "image120", "image119", "image59", "image66", "image63", "image50", "image47", "image56", "image53", "image42", "image41", "image45", "image82", "image80", "image86", "image84"],
  "39": ["image161", "image147", "image144", "image153", "image150", "image141", "image138", "image143", "image173", "image178", "image172", "image175", "image171", "image166", "image159", "image74", "image72", "image78", "image76", "image69", "image68", "image30", "image23", "image21", "image27", "image25", "image15", "image19", "image17", "image13", "image11", "image194", "image196"],
  "47": ["image74", "image72", "image78", "image76", "image69", "image68", "image30", "image23", "image21", "image27", "image25", "image15", "image19", "image17", "image13", "image11", "image194", "image196", "image6", "image5", "image2", "image1", "image186", "image185", "image189", "image197", "image83", "image43", "image44", "image168", "image169", "image188", "image187", "image157", "image40", "image12", "image79", "image81", "image85", "image87", "image46", "image131", "image177", "image176", "image158", "image160"],
  "60": ["image167", "image113", "image103", "image101", "image108", "image105", "image94", "image91", "image99", "image97", "image88", "image136", "image134", "image124", "image122", "image129", "image127", "image117", "image116", "image120", "image119", "image59", "image66", "image63", "image50", "image47", "image56", "image53", "image42", "image41", "image45", "image82", "image80", "image86", "image84", "image161", "image147", "image144", "image153", "image150", "image141", "image138", "image143", "image173", "image178", "image172", "image175", "image171", "image166", "image159", "image74", "image72", "image78", "image76", "image69", "image68", "image30", "image23", "image21"]
};

// Carrega os dados embutidos - 100% serverless
function loadExtensionsMap() {
    extensionsMap = EXTENSIONS_MAP;
    return Promise.resolve();
}

// Carrega o index embutido - 100% serverless  
function loadIndex() {
    currentIndex = JSON.parse(JSON.stringify(DEFAULT_INDEX)); // Deep copy
    originalIndex = JSON.parse(JSON.stringify(DEFAULT_INDEX)); // Deep copy
    return Promise.resolve(currentIndex);
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

// Salva o estado atual - 100% serverless com download automático
function saveIndex() {
    try {
        // Salva no localStorage para persistência local
        localStorage.setItem('planetzoo_index', JSON.stringify(currentIndex));
        
        // Cria arquivo JSON para download
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

// Inicialização da aplicação - 100% serverless
function init() {
    console.log('🚀 Iniciando Planet Zoo Wishlist Engine...');
    
    // Verificar se há dados salvos no localStorage
    const savedData = localStorage.getItem('planetzoo_index');
    if (savedData) {
        try {
            currentIndex = JSON.parse(savedData);
            originalIndex = JSON.parse(JSON.stringify(DEFAULT_INDEX)); // Keep original as default
            console.log('📂 Dados carregados do localStorage');
        } catch (error) {
            console.warn('❌ Erro ao carregar localStorage, usando dados padrão');
            loadIndex();
        }
    } else {
        loadIndex();
    }
    
    loadExtensionsMap();
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