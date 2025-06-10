# 🔥 Configuração do Firebase

## 1. Criar Projeto no Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Adicionar projeto"
3. Digite o nome do projeto (ex: "chat-app")
4. Desabilite o Google Analytics (opcional)
5. Clique em "Criar projeto"

## 2. Configurar Authentication

1. No painel do Firebase, vá em **Authentication**
2. Clique em **Começar**
3. Na aba **Sign-in method**, habilite:
   - **Email/Password** (clique e ative)

## 3. Configurar Firestore Database

1. No painel do Firebase, vá em **Firestore Database**
2. Clique em **Criar banco de dados**
3. Escolha **Iniciar no modo de teste** (por enquanto)
4. Selecione uma localização (ex: southamerica-east1)

## 4. Configurar Regras de Segurança do Firestore

Substitua as regras padrão por estas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Messages are readable by authenticated users
    // Only the message author can write/update their messages
    match /messages/{messageId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null 
        && request.auth.uid == resource.data.userId
        && request.auth.email == resource.data.userEmail;
      allow update, delete: if request.auth != null 
        && request.auth.uid == resource.data.userId;
    }
    
    // Typing indicators
    match /typing/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 5. Obter Configuração do Firebase

1. No painel do Firebase, clique no ícone de **engrenagem** ⚙️
2. Vá em **Configurações do projeto**
3. Na seção **Seus aplicativos**, clique em **</>** (Web)
4. Digite um nome para o app (ex: "chat-app-web")
5. **NÃO** marque "Firebase Hosting"
6. Clique em **Registrar app**
7. Copie a configuração que aparece

## 6. Atualizar arquivo firebase.ts

Substitua o conteúdo do arquivo `app/lib/firebase.ts` com suas credenciais:

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "SUA_API_KEY_AQUI",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto-id",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "sua-app-id-aqui"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
```

## 7. Variáveis de Ambiente (Opcional - Recomendado)

Para maior segurança, você pode usar variáveis de ambiente:

1. Crie um arquivo `.env.local` na raiz do projeto:

```env
VITE_FIREBASE_API_KEY=sua_api_key_aqui
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto-id
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=sua_app_id_aqui
```

2. Atualize o `firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};
```

## 8. Testar a Aplicação

Após configurar o Firebase, execute:

```bash
yarn dev
```

A aplicação estará disponível em `http://localhost:5173`

## ⚠️ Importante

- **Nunca** commite suas credenciais do Firebase no Git
- Use variáveis de ambiente para produção
- Configure regras de segurança adequadas antes de ir para produção
- Monitore o uso do Firebase para evitar custos inesperados
