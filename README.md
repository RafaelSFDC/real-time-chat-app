# 💬 Chat App - Aplicativo de Chat em Tempo Real

Um aplicativo de chat moderno e completo construído com React Router, Firebase, TypeScript e Shadcn/ui.

## ✨ Funcionalidades

### 🔐 **Autenticação Completa**
- ✅ Login com email e senha
- ✅ Registro de novos usuários
- ✅ Validação de formulários com Zod
- ✅ Proteção de rotas
- ✅ Estados de loading e tratamento de erros

### 💬 **Chat em Tempo Real**
- ✅ Mensagens instantâneas com Firebase Firestore
- ✅ Interface responsiva e moderna
- ✅ Diferenciação visual entre mensagens próprias e de outros usuários
- ✅ Timestamps formatados (hoje, ontem, data completa)
- ✅ Scroll automático para novas mensagens
- ✅ **Suporte a emojis** com emoji picker integrado
- ✅ **Preservação de quebras de linha** (Shift+Enter)
- ✅ **Sistema de menções** (@usuário) com autocomplete
- ✅ **Sidebar com busca** de usuários e salas
- ✅ **Sistema de salas/rooms** para organizar conversas

### 🎯 **Funcionalidades Avançadas**
- ✅ Indicador "usuário está digitando..."
- ✅ Limite de 500 caracteres por mensagem com contador
- ✅ Validação de mensagens vazias
- ✅ Estados de loading durante envio
- ✅ Tratamento de erros com notificações

### 🎨 **Interface Profissional**
- ✅ Design moderno com Shadcn/ui
- ✅ Tema escuro/claro automático
- ✅ Layout responsivo (desktop e mobile)
- ✅ Animações suaves
- ✅ Componentes acessíveis

## 🛠️ Stack Tecnológica

- **Frontend:** React 19 + React Router 7 + Vite
- **Backend:** Firebase (Auth + Firestore)
- **Styling:** TailwindCSS + Shadcn/ui
- **TypeScript:** 100% type-safe
- **Validação:** Zod + React Hook Form
- **Ícones:** Lucide React

## 🚀 Instalação e Configuração

### 1. Clone e instale dependências

```bash
git clone <seu-repositorio>
cd chat-app
yarn install
```

### 2. Configure o Firebase

Siga as instruções detalhadas no arquivo [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) para:
- Criar projeto no Firebase
- Configurar Authentication
- Configurar Firestore Database
- Obter credenciais de configuração

### 3. Configure as variáveis de ambiente

1. Copie o arquivo de exemplo:
```bash
cp .env.example .env.local
```

2. Edite o arquivo `.env.local` com suas credenciais do Firebase:
```env
VITE_FIREBASE_API_KEY=sua_api_key_aqui
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto-id
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=sua_app_id_aqui
```

> ⚠️ **Importante**: Nunca commite o arquivo `.env.local` no Git. Ele já está incluído no `.gitignore`.

### 4. Execute a aplicação

```bash
yarn dev
```

Acesse `http://localhost:5173` no seu navegador.

## 📁 Estrutura do Projeto

```
app/
├── components/
│   ├── auth/           # Componentes de autenticação
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── ProtectedRoute.tsx
│   ├── chat/           # Componentes do chat
│   │   ├── ChatRoom.tsx
│   │   ├── ChatHeader.tsx
│   │   ├── MessageList.tsx
│   │   └── MessageInput.tsx
│   └── ui/             # Componentes UI (Shadcn)
├── contexts/
│   └── AuthContext.tsx # Context de autenticação
├── hooks/
│   ├── useChat.ts      # Hook para mensagens
│   └── useTypingIndicator.ts
├── lib/
│   ├── firebase.ts     # Configuração Firebase
│   └── utils.ts        # Utilitários
├── routes/             # Rotas da aplicação
│   ├── home.tsx
│   ├── auth.tsx
│   └── chat.tsx
└── types/
    └── index.ts        # Tipos TypeScript
```

## 🔒 Segurança

### Regras do Firestore

As regras de segurança estão configuradas para:
- Usuários autenticados podem ler todas as mensagens
- Apenas o autor pode criar/editar suas próprias mensagens
- Indicadores de digitação são controlados por usuário

### Validações

- Validação client-side com Zod
- Sanitização de inputs
- Proteção contra XSS
- Limite de caracteres por mensagem

## 🧪 Testes

Execute a verificação de tipos:

```bash
yarn typecheck
```

## 📱 Responsividade

A aplicação é totalmente responsiva e funciona perfeitamente em:
- 📱 Mobile (320px+)
- 📱 Tablet (768px+)
- 💻 Desktop (1024px+)

## 🎨 Personalização

### Temas
O aplicativo suporta tema escuro/claro automático baseado na preferência do sistema.

### Cores
Personalize as cores editando as variáveis CSS no arquivo `app/app.css`.

### Componentes
Todos os componentes UI são baseados no Shadcn/ui e podem ser facilmente customizados.

## 🆕 Novas Funcionalidades Implementadas

### 😀 **Suporte a Emojis**
- Emoji picker integrado com mais de 1000 emojis
- Botão dedicado para abrir o seletor de emojis
- Inserção de emojis na posição do cursor
- Interface responsiva e moderna

### 📝 **Quebras de Linha**
- Suporte completo a quebras de linha nas mensagens
- `Shift + Enter` para nova linha
- `Enter` para enviar mensagem
- Renderização preserva formatação original

### 👥 **Sistema de Menções**
- Digite `@` para mencionar usuários
- Autocomplete inteligente com busca por nome e email
- Navegação com setas do teclado
- Destaque visual das menções nas mensagens
- Armazenamento das menções no banco de dados

### 🏠 **Sistema de Salas**
- Criação de salas públicas e privadas
- Chat global para conversas gerais
- Navegação entre salas na sidebar
- Contador de membros por sala
- Busca de salas públicas

### 🔍 **Sidebar com Busca**
- Busca em tempo real de usuários e salas
- Interface organizada com seções
- Criação rápida de novas salas
- Lista de salas do usuário
- Acesso rápido ao chat global

### 🎯 **Melhorias na Interface**
- Layout com sidebar responsiva
- Header dinâmico mostrando sala atual
- Botões de ação para emojis e menções
- Indicadores visuais melhorados
- Experiência de usuário aprimorada

## 🚀 Deploy

### Vercel (Recomendado)
```bash
yarn build
# Deploy para Vercel
```

### Docker
```bash
docker build -t chat-app .
docker run -p 3000:3000 chat-app
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🙏 Agradecimentos

- [React Router](https://reactrouter.com/) - Framework React
- [Firebase](https://firebase.google.com/) - Backend as a Service
- [Shadcn/ui](https://ui.shadcn.com/) - Componentes UI
- [TailwindCSS](https://tailwindcss.com/) - CSS Framework
- [Lucide](https://lucide.dev/) - Ícones

---

**Desenvolvido com ❤️ usando React Router + Firebase**
