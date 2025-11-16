# 🦁 Planet Zoo Wishlist - Drag & Drop Interface

Uma interface dinâmica e interativa para organizar e reordenar a wishlist de animais do Planet Zoo através de drag & drop.

## 🚀 Funcionalidades

- ✅ **Organização por Blocos**: As imagens são organizadas em blocos numerados (2, 3, 7, 15, etc.)
- ✅ **Drag & Drop**: Arraste e solte imagens entre diferentes posições dentro dos blocos
- ✅ **Detecção Automática**: Detecta automaticamente se a imagem é PNG ou JPG
- ✅ **Persistência**: Salva as alterações em arquivo JSON para download
- ✅ **Restaurar Original**: Botão para voltar à ordem original quando necessário
- ✅ **Interface Responsiva**: Design moderno e adaptável para diferentes dispositivos
- ✅ **Feedback Visual**: Mensagens de sucesso/erro e efeitos visuais durante o drag

## 📁 Estrutura do Projeto

```
planetzoo_wishlist/
├── index.html              # Interface principal
├── engine.js               # Engine JavaScript principal
├── index.json              # Configuração dos blocos e ordem das imagens
├── extensions_map.json     # Mapa das extensões das imagens (PNG/JPG)
├── images/                 # Pasta com todas as 205 imagens
│   ├── image1.jpg
│   ├── image4.png
│   └── ...
├── wishlistpacks.html      # Arquivo HTML original (referência)
└── README.md              # Este arquivo
```

## 🛠️ Como Usar

1. **Iniciar Servidor Local**:
   ```bash
   cd planetzoo_wishlist
   python3 -m http.server 8000
   ```

2. **Acessar a Interface**:
   - Abra o navegador e acesse `http://localhost:8000`
   - A interface carregará automaticamente todos os blocos e imagens

3. **Reordenar Imagens**:
   - Clique e arraste qualquer imagem para uma nova posição
   - As alterações são aplicadas instantaneamente
   - Funciona entre diferentes blocos também

4. **Salvar Alterações**:
   - Clique no botão "💾 Salvar Ordem"
   - O arquivo `index.json` será baixado automaticamente
   - Substitua o arquivo original para manter as alterações

5. **Restaurar Original**:
   - Clique no botão "🔄 Restaurar Original"
   - Confirme a ação no modal
   - A ordem original será restaurada imediatamente

## 🎨 Características Técnicas

- **Framework**: Vanilla JavaScript (sem dependências)
- **Drag & Drop**: HTML5 Drag and Drop API nativa
- **Responsivo**: CSS Grid e Flexbox
- **Persistência**: JSON + LocalStorage + Download automático
- **Detecção de Extensão**: Sistema inteligente PNG/JPG fallback
- **Organização**: 16 blocos com 205 imagens únicas totais

## 📊 Estatísticas do Projeto

- **205 imagens únicas** de animais do Planet Zoo
- **16 blocos** organizados por números (2, 3, 7, 15, 17, 18, 19, 20, 24, 25, 27, 29, 35, 39, 47, 60)
- **Formatos suportados**: JPG e PNG
- **Interface 100% funcional** com drag & drop

## 🔧 Desenvolvimento

O projeto foi desenvolvido seguindo as especificações:

1. **Conversão do HTML original**: Extraída a estrutura e ordem das imagens
2. **Sistema de blocos**: Implementada organização por containers numerados  
3. **Engine dinâmica**: JavaScript carrega e gerencia as imagens automaticamente
4. **Drag & Drop**: Sistema completo de reordenação visual
5. **Persistência**: Salva e carrega estados do JSON

## 📝 Notas Importantes

- As imagens mantêm sua organização original por blocos
- Cada bloco pode conter imagens únicas (sem duplicatas no mesmo bloco)
- O sistema detecta automaticamente PNG vs JPG
- As alterações são locais até serem salvas via download
- Interface otimizada para uso em desktop e mobile

---

**Desenvolvido com ❤️ para a comunidade Planet Zoo**