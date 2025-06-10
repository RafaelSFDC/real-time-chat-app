// Script para inicializar salas de exemplo no Firebase
// Execute com: node scripts/init-rooms.js

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Configuração do Firebase (substitua pelos seus dados)
const firebaseConfig = {
  // Adicione sua configuração aqui
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const sampleRooms = [
  {
    name: 'Geral',
    description: 'Discussões gerais da equipe',
    isPrivate: false,
    members: [], // Será preenchido com IDs de usuários reais
  },
  {
    name: 'Desenvolvimento',
    description: 'Discussões sobre desenvolvimento de software',
    isPrivate: false,
    members: [],
  },
  {
    name: 'Design',
    description: 'Discussões sobre design e UX/UI',
    isPrivate: false,
    members: [],
  },
  {
    name: 'Marketing',
    description: 'Estratégias e campanhas de marketing',
    isPrivate: false,
    members: [],
  },
];

async function createSampleRooms() {
  try {
    console.log('Criando salas de exemplo...');
    
    for (const room of sampleRooms) {
      const docRef = await addDoc(collection(db, 'rooms'), {
        ...room,
        createdBy: 'system',
        createdAt: serverTimestamp(),
      });
      
      console.log(`Sala "${room.name}" criada com ID: ${docRef.id}`);
    }
    
    console.log('Todas as salas foram criadas com sucesso!');
  } catch (error) {
    console.error('Erro ao criar salas:', error);
  }
}

// Executar apenas se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  createSampleRooms();
}
