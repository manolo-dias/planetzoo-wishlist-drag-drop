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

// Mapa de extensões das imagens PNG (resto é JPG)
const EXTENSIONS_MAP = {
    "image4": "png", "image7": "png", "image8": "png", "image9": "png", 
    "image44": "png", "image57": "png", "image79": "png", "image81": "png", 
    "image83": "png", "image85": "png", "image96": "png", "image102": "png", 
    "image104": "png", "image107": "png", "image110": "png", "image157": "png", 
    "image197": "png"
};

// Carrega os mapeamentos de extensões das imagens
function loadExtensionsMap() {
    extensionsMap = EXTENSIONS_MAP;
    return Promise.resolve();
}

// Carrega JSON com sistema de versionamento - SEM DADOS HARDCODED
async function loadIndex() {
    console.log('🔄 Sistema de carregamento de JSON iniciado...');
    
    const jsonFiles = [
        'index_updated.json',  // Versão mais recente (se existir)
        'index.json'           // Versão original (fallback)
    ];
    
    for (const fileName of jsonFiles) {
        console.log(`📂 Tentando carregar: ${fileName}`);
        
        // Método 1: XMLHttpRequest (mais compatível com file://)
        try {
            const data = await loadJSONFile(fileName);
            if (data && Object.keys(data).length > 0) {
                currentIndex = data;
                originalIndex = await loadOriginalJSON(); // Sempre manter referência ao original
                console.log(`✅ ${fileName} carregado com sucesso!`);
                console.log(`📊 Carregados ${Object.keys(currentIndex).length} blocos`);
                return currentIndex;
            }
        } catch (error) {
            console.log(`⚠️ Falha ao carregar ${fileName}: ${error.message}`);
            continue; // Tenta o próximo arquivo
        }
    }
    
    throw new Error('❌ Nenhum arquivo JSON foi encontrado. Verifique se index.json existe na pasta.');
}

// Carrega arquivo JSON usando XMLHttpRequest (compatível com file://)
function loadJSONFile(fileName) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', fileName, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200 || xhr.status === 0) { // 0 = file://
                    try {
                        const data = JSON.parse(xhr.responseText);
                        resolve(data);
                    } catch (error) {
                        reject(new Error(`JSON inválido: ${error.message}`));
                    }
                } else {
                    reject(new Error(`Erro HTTP: ${xhr.status}`));
                }
            }
        };
        xhr.onerror = () => reject(new Error('Erro de rede'));
        xhr.send();
    });
}

// Carrega sempre o JSON original como referência
async function loadOriginalJSON() {
    try {
        const data = await loadJSONFile('index.json');
        return data;
    } catch (error) {
        console.warn('⚠️ Não foi possível carregar index.json original');
        return currentIndex; // Usa os dados atuais como fallback
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

// Sistema de salvamento com versionamento - SEM localStorage
function saveIndex() {
    try {
        const timestamp = Date.now();
        const dataStr = JSON.stringify(currentIndex, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        // Criar arquivo de atualização (sobrescreve o anterior)
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = 'index_updated.json'; // Nome específico para versão atualizada
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log('💾 Arquivo index_updated.json criado');
        showStatus('Configuração salva! Veja as instruções.', 'success');
        
        // Instruções claras para o usuário
        setTimeout(() => {
            alert(`✅ ARQUIVO SALVO: index_updated.json

📝 INSTRUÇÕES:
1. O arquivo "index_updated.json" foi baixado
2. Mova este arquivo para a MESMA PASTA onde está o index.html
3. Recarregue a página (F5)

🔄 COMO FUNCIONA:
• O sistema sempre carrega "index_updated.json" se existir
• Se não existir, carrega o "index.json" original
• Suas alterações ficam em "index_updated.json"
• O "index.json" original nunca é modificado

⚠️ IMPORTANTE: Mova o arquivo baixado para a pasta do projeto!`);
        }, 500);
        
    } catch (error) {
        console.error('Erro ao salvar:', error);
        showStatus('Erro ao criar arquivo de configuração.', 'error');
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

// Inicialização da aplicação - Carrega apenas do JSON
async function init() {
    console.log('🚀 Iniciando Planet Zoo Wishlist Engine...');
    
    try {
        // Carregar dados do sistema de versionamento JSON
        await loadIndex();
        
        // Verificar se carregou dados
        if (Object.keys(currentIndex).length === 0) {
            throw new Error('Nenhum bloco foi carregado do JSON');
        }
        
        // Carregar mapeamento de extensões
        loadExtensionsMap();
        
        // Renderizar interface
        renderBlocks();
        
        // Estatísticas
        const totalImages = Object.values(currentIndex).reduce((sum, block) => sum + block.length, 0);
        console.log('✅ Engine carregada com sucesso!');
        console.log(`🖼️ Total de ${totalImages} imagens em ${Object.keys(currentIndex).length} blocos`);
        
    } catch (error) {
        console.error('❌ Erro na inicialização:', error);
        showStatus(`${error.message}`, 'error');
        
        // Mostrar instruções se o arquivo não foi encontrado
        if (error.message.includes('JSON foi encontrado')) {
            setTimeout(() => {
                alert(`❌ ERRO: Arquivo index.json não encontrado!

📝 SOLUÇÃO:
1. Certifique-se que o arquivo "index.json" está na mesma pasta do index.html
2. Verifique se o arquivo não está corrompido
3. Se você moveu os arquivos, certifique-se que todos estão juntos

📁 ESTRUTURA NECESSÁRIA:
• index.html
• index.json  ← ESTE ARQUIVO É OBRIGATÓRIO
• engine.js
• images/ (pasta com as imagens)`);
            }, 1000);
        }
    }
}

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}