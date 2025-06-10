# Mensagem de Commit Sugerida

```
feat: implementa funcionalidades avançadas do chat

✨ Novas funcionalidades:
- Suporte completo a emojis com emoji picker integrado
- Preservação de quebras de linha (Shift+Enter para nova linha)
- Sistema de menções (@usuário) com autocomplete inteligente
- Sistema de salas/rooms para organizar conversas
- Sidebar com busca em tempo real de usuários e salas
- Layout responsivo com sidebar colapsível

🎨 Melhorias na interface:
- Header dinâmico mostrando informações da sala atual
- Botões dedicados para emojis e menções
- Renderização aprimorada de mensagens com quebras de linha
- Destaque visual para menções nas mensagens
- Navegação intuitiva entre chat global e salas

🔧 Implementações técnicas:
- Novos hooks: useUsers, useRooms
- Componentes: ChatSidebar, MessageInput aprimorado
- Tipos TypeScript atualizados para suportar salas e menções
- Integração com emoji-picker-react
- Sistema de busca otimizado no Firestore

📱 Experiência do usuário:
- Autocomplete de usuários ao digitar @
- Navegação com teclado nas sugestões de menção
- Inserção de emojis na posição do cursor
- Criação rápida de salas na sidebar
- Busca instantânea de usuários e salas

🗃️ Estrutura de dados:
- Mensagens agora suportam roomId e mentions
- Coleção de rooms no Firestore
- Sistema de membros por sala
- Filtragem de mensagens por sala

Todas as funcionalidades são type-safe e seguem as melhores práticas do React e TypeScript.
```
