# Mensagem de Commit Sugerida

```
feat: implementa funcionalidades avançadas do chat com context menu e sidebar responsiva

✨ Novas funcionalidades principais:
- Suporte completo a emojis com emoji picker integrado
- Preservação de quebras de linha (Shift+Enter para nova linha)
- Sistema de menções (@usuário) com autocomplete inteligente
- Sistema de salas/rooms públicas e privadas
- Context menu para interação com mensagens (editar, excluir, reagir)
- Sistema de reações com emojis nas mensagens
- Sidebar responsiva com componente shadcn/ui

🎯 Interação com mensagens:
- Context menu ao clicar com botão direito nas mensagens
- Edição de mensagens próprias com indicador visual
- Exclusão de mensagens com confirmação
- Sistema de reações com emojis
- Cópia de texto das mensagens
- Indicador de mensagens editadas

🏠 Sistema de salas aprimorado:
- Criação de salas públicas e privadas
- Switch para alternar tipo de sala na criação
- Ícones diferenciados (Hash para públicas, Lock para privadas)
- Correção do bug de formulário de criação que ficava aberto
- Navegação entre chat global e salas

📱 Sidebar responsiva:
- Implementação com componente Sidebar do shadcn/ui
- SidebarProvider para gerenciamento de estado
- SidebarTrigger no header para mobile
- Layout responsivo que se adapta a diferentes telas
- Busca em tempo real de usuários e salas

🎨 Melhorias na interface:
- Header dinâmico com informações da sala atual
- Botões dedicados para emojis e menções
- Renderização aprimorada com quebras de linha preservadas
- Destaque visual para menções nas mensagens
- Reações exibidas abaixo das mensagens
- Layout otimizado para mobile e desktop

🔧 Implementações técnicas:
- Novos hooks: useUsers, useRooms com funcionalidades completas
- Context menu integrado com shadcn/ui
- Tipos TypeScript para reações e edição de mensagens
- Funções de editar, excluir e reagir no useChat
- Sistema de busca otimizado no Firestore
- Sidebar provider para responsividade

📊 Estrutura de dados expandida:
- Mensagens com suporte a reações, edição e menções
- Campos: reactions, isEdited, updatedAt
- Salas com tipo público/privado
- Sistema de membros e permissões

🚀 Experiência do usuário:
- Autocomplete inteligente para menções
- Navegação com teclado nas sugestões
- Inserção de emojis na posição do cursor
- Criação rápida de salas com opção privada
- Busca instantânea e responsiva
- Context menu intuitivo para ações

Todas as funcionalidades são type-safe, responsivas e seguem as melhores práticas do React e TypeScript.
```
