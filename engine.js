/**
 * Planet Zoo Wishlist - Dynamic Drag & Drop Engine
 * 
 * Usa File System Access API para manipulação de JSON
 * Detecção dinâmica de extensões PNG/JPG
 */

// Estado global da aplicação
let currentIndex = {};
let originalIndex = {};
let fileHandle = null; // Handle do arquivo JSON atual

// Abrir JSON usando File System Access API
async function openJSON() {
    try {
        const [handle] = await window.showOpenFilePicker({
            types: [{ accept: { "application/json": [".json"] } }]
        });
        
        const file = await handle.getFile();
        const text = await file.text();
        return { data: JSON.parse(text), handle };
    } catch (error) {
        if (error.name !== 'AbortError') {
            console.error('Erro ao abrir arquivo:', error);
            throw error;
        }
        return null; // Usuário cancelou
    }
}

// Salvar JSON no mesmo arquivo
async function saveJSON(handle, obj) {
    try {
        const writable = await handle.createWritable();
        await writable.write(JSON.stringify(obj, null, 2));
        await writable.close();
        console.log('✅ Arquivo salvo com sucesso');
    } catch (error) {
        console.error('Erro ao salvar arquivo:', error);
        throw error;
    }
}

// Sistema de carregamento universal (Chrome File System Access API + Firefox FileReader)
async function loadIndex() {
    console.log('🔄 Iniciando interface de carregamento...');
    
    const container = document.getElementById('blocksContainer');
    const hasFileSystemAccess = 'showOpenFilePicker' in window;
    
    container.innerHTML = `
        <div style="text-align: center; padding: 50px; border: 2px dashed #ddd; border-radius: 10px; margin: 20px;">
            <h3>📁 Carregar arquivo JSON</h3>
            <p>Selecione seu arquivo de configuração:</p>
            
            ${hasFileSystemAccess ? `
                <button id="openFileBtn" style="background: #007bff; color: white; padding: 15px 30px; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; margin: 20px;">
                    📂 Abrir arquivo JSON (Chrome/Edge)
                </button>
            ` : `
                <input type="file" id="fileInput" accept=".json" style="margin: 20px;">
                <br>
                <label for="fileInput" style="background: #007bff; color: white; padding: 15px 30px; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; display: inline-block;">
                    📂 Selecionar arquivo JSON
                </label>
            `}
            
            <div style="background: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <strong>💡 DICA:</strong> Use seu arquivo index.json ou configuração salva
            </div>
            
            <button onclick="loadDemoData()" style="background: #28a745; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">
                🎯 Usar dados de demonstração
            </button>
        </div>
    `;
    
    if (hasFileSystemAccess) {
        // Chrome/Edge: File System Access API
        document.getElementById('openFileBtn').addEventListener('click', async () => {
            try {
                const result = await openJSON();
                if (result) {
                    currentIndex = result.data;
                    originalIndex = JSON.parse(JSON.stringify(result.data));
                    fileHandle = result.handle;
                    
                    console.log(`✅ Arquivo carregado: ${result.handle.name}`);
                    await renderBlocks();
                    showStatus(`"${result.handle.name}" carregado!`, 'success');
                }
            } catch (error) {
                showStatus(`Erro: ${error.message}`, 'error');
            }
        });
    } else {
        // Firefox: FileReader API  
        document.getElementById('fileInput').addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (file && file.type === 'application/json') {
                const reader = new FileReader();
                reader.onload = async function(e) {
                    try {
                        const data = JSON.parse(e.target.result);
                        currentIndex = data;
                        originalIndex = JSON.parse(JSON.stringify(data));
                        fileHandle = null; // Firefox não tem handle persistente
                        
                        console.log(`✅ Arquivo carregado: ${file.name}`);
                        await renderBlocks();
                        showStatus(`"${file.name}" carregado!`, 'success');
                    } catch (error) {
                        showStatus(`Erro ao ler ${file.name}: ${error.message}`, 'error');
                    }
                };
                reader.readAsText(file);
            }
        });
    }
    
    // Função demo
    window.loadDemoData = async function() {
        currentIndex = {
            "2": ["image115", "image114"], 
            "3": ["image205", "image204", "image203"]
        };
        originalIndex = JSON.parse(JSON.stringify(currentIndex));
        fileHandle = null;
        
        console.log('🎯 Dados demo carregados');
        await renderBlocks();
        showStatus('Dados de demonstração ativados!', 'success');
    };
}

// Detecta dinamicamente a extensão da imagem (testa PNG primeiro, depois JPG)
function getImageSrc(imageName) {
    // Retorna uma Promise que resolve com o src correto
    return new Promise((resolve) => {
        const img = new Image();
        
        // Testa PNG primeiro
        img.onload = () => resolve(`images/${imageName}.png`);
        img.onerror = () => {
            // Se PNG falhou, usa JPG
            resolve(`images/${imageName}.jpg`);
        };
        
        img.src = `images/${imageName}.png`;
    });
}

// Cria o elemento HTML de uma imagem com detecção dinâmica
async function createImageElement(imageName, blockNumber, index) {
    const imageItem = document.createElement('div');
    imageItem.className = 'image-item';
    imageItem.draggable = true;
    imageItem.dataset.imageName = imageName;
    imageItem.dataset.blockNumber = blockNumber;
    imageItem.dataset.index = index;
    
    // Detectar extensão dinamicamente
    const imageSrc = await getImageSrc(imageName);
    
    imageItem.innerHTML = `
        <img src="${imageSrc}" alt="${imageName}">
        <div class="image-number">${imageName.replace('image', '')}</div>
        <div class="remove-btn" onclick="removeImage('${imageName}', '${blockNumber}')" title="Remover imagem">×</div>
    `;
    
    // Event listeners para drag & drop
    imageItem.addEventListener('dragstart', handleDragStart);
    imageItem.addEventListener('dragover', handleDragOver);
    imageItem.addEventListener('drop', handleDrop);
    imageItem.addEventListener('dragend', handleDragEnd);
    
    return imageItem;
}

// Cria botão de adicionar imagem
function createAddButton(blockNumber) {
    const addButton = document.createElement('div');
    addButton.className = 'add-button';
    addButton.innerHTML = `
        <div class="add-icon" onclick="addImage('${blockNumber}')" title="Adicionar nova imagem">+</div>
    `;
    return addButton;
}

// Renderiza todos os blocos na tela
async function renderBlocks() {
    const container = document.getElementById('blocksContainer');
    container.innerHTML = '';
    
    // Ordenar os blocos por número
    const sortedBlocks = Object.keys(currentIndex).sort((a, b) => parseInt(a) - parseInt(b));
    
    for (const blockNumber of sortedBlocks) {
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
        
        // Adicionar as imagens (com await para detecção de extensão)
        for (let index = 0; index < images.length; index++) {
            const imageName = images[index];
            const imageElement = await createImageElement(imageName, blockNumber, index);
            gridContainer.appendChild(imageElement);
        }
        
        // Adicionar botão "+" ao final
        const addButton = createAddButton(blockNumber);
        gridContainer.appendChild(addButton);
        
        blockElement.appendChild(header);
        blockElement.appendChild(gridContainer);
        container.appendChild(blockElement);
    }
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
    
    // Auto-salvar
    autoSaveData();
    
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

// Salva com suporte universal (Chrome File System Access + Firefox download)
async function saveIndex() {
    try {
        if ('showSaveFilePicker' in window) {
            // Chrome/Edge: File System Access API
            if (fileHandle) {
                await saveJSON(fileHandle, currentIndex);
                showStatus(`"${fileHandle.name}" atualizado!`, 'success');
            } else {
                const handle = await window.showSaveFilePicker({
                    suggestedName: 'index_updated.json',
                    types: [{ accept: { "application/json": [".json"] } }]
                });
                
                await saveJSON(handle, currentIndex);
                fileHandle = handle;
                showStatus(`"${handle.name}" criado!`, 'success');
            }
        } else {
            // Firefox: Download tradicional
            const dataStr = JSON.stringify(currentIndex, null, 2);
            const dataBlob = new Blob([dataStr], {type: 'application/json'});
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = 'index_updated.json';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            showStatus('Arquivo "index_updated.json" baixado!', 'success');
        }
    } catch (error) {
        if (error.name !== 'AbortError') {
            console.error('Erro ao salvar:', error);
            showStatus(`Erro: ${error.message}`, 'error');
        }
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

// Remove uma imagem do bloco
async function removeImage(imageName, blockNumber) {
    if (confirm(`Tem certeza que deseja remover a imagem ${imageName}?`)) {
        // Remover do array
        const imageIndex = currentIndex[blockNumber].indexOf(imageName);
        if (imageIndex > -1) {
            currentIndex[blockNumber].splice(imageIndex, 1);
            
            // Auto-salvar
            autoSaveData();
            
            // Re-renderizar
            await renderBlocks();
            
            showStatus(`Imagem ${imageName} removida do Bloco ${blockNumber}`, 'success');
        }
    }
}

// Adiciona uma nova imagem ao bloco
async function addImage(blockNumber) {
    // Criar input de arquivo
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.png,.jpg,.jpeg';
    
    input.onchange = async function(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // Validar formato
        const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
        if (!validTypes.includes(file.type)) {
            alert('Formato inválido! Use apenas PNG ou JPEG.');
            return;
        }
        
        try {
            // Calcular próximo número
            const allImages = Object.values(currentIndex).flat();
            const imageNumbers = allImages.map(name => parseInt(name.replace('image', ''))).filter(n => !isNaN(n));
            const nextNumber = Math.max(...imageNumbers) + 1;
            
            // Determinar extensão
            const extension = file.type === 'image/png' ? 'png' : 'jpg';
            const newImageName = `image${nextNumber}`;
            
            // Redimensionar e converter para blob
            const resizedBlob = await resizeImage(file, 60, 60); // Tamanho das imagens na grid
            
            // NOTA: Em ambiente serverless, não podemos salvar a imagem no servidor
            // Por enquanto, apenas adicionamos ao JSON (a imagem ficará quebrada até ser colocada manualmente na pasta)
            
            // Adicionar ao array
            currentIndex[blockNumber].push(newImageName);
            
            // Auto-salvar
            autoSaveData();
            
            // Re-renderizar
            await renderBlocks();
            
            showStatus(`Imagem ${newImageName}.${extension} adicionada ao Bloco ${blockNumber}! NOTA: Coloque o arquivo manualmente na pasta 'images/'`, 'success');
            
            // Criar download da imagem redimensionada para o usuário
            const link = document.createElement('a');
            link.href = URL.createObjectURL(resizedBlob);
            link.download = `${newImageName}.${extension}`;
            link.click();
            
        } catch (error) {
            console.error('Erro ao adicionar imagem:', error);
            showStatus(`Erro ao adicionar imagem: ${error.message}`, 'error');
        }
    };
    
    input.click();
}

// Redimensiona imagem para o tamanho especificado
function resizeImage(file, width, height) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = function() {
            canvas.width = width;
            canvas.height = height;
            
            // Desenhar imagem redimensionada
            ctx.drawImage(img, 0, 0, width, height);
            
            // Converter para blob
            canvas.toBlob(resolve, file.type);
        };
        
        img.src = URL.createObjectURL(file);
    });
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
window.removeImage = removeImage;
window.addImage = addImage;

// Inicialização da aplicação com carregamento automático do JSON original
async function init() {
    console.log('🚀 Iniciando Planet Zoo Wishlist Engine...');
    
    // Verificar suporte para File System Access API
    if ('showOpenFilePicker' in window) {
        console.log('📂 Usando File System Access API (Chrome/Edge)');
    } else {
        console.log('📂 Usando FileReader API (compatibilidade Firefox)');
    }
    
    try {
        // Tentar carregar automaticamente dados de configuração existentes
        const savedData = localStorage.getItem('planetzoo_auto_data');
        if (savedData) {
            console.log('📋 Carregando dados salvos automaticamente...');
            currentIndex = JSON.parse(savedData);
            originalIndex = JSON.parse(JSON.stringify(currentIndex));
            await renderBlocks();
            showStatus('Dados carregados automaticamente!', 'success');
        } else {
            // Se não há dados salvos, mostrar interface de carregamento
            await loadIndex();
        }
        
    } catch (error) {
        console.error('❌ Erro na inicialização:', error);
        showStatus(`Erro: ${error.message}`, 'error');
        // Em caso de erro, mostrar interface de carregamento
        await loadIndex();
    }
}

// Salva dados automaticamente no localStorage para persistência entre sessões
function autoSaveData() {
    try {
        localStorage.setItem('planetzoo_auto_data', JSON.stringify(currentIndex));
        console.log('💾 Dados salvos automaticamente');
    } catch (error) {
        console.warn('⚠️ Erro ao salvar automaticamente:', error);
    }
}

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}