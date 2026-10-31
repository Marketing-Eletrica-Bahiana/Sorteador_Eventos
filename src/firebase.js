import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Configuração web do Firebase. Não é segredo: quem protege os dados são as regras do Firestore.
const firebaseConfig = {
  apiKey: 'AIzaSyAu0ECPPA0HlaRpbGh09vNok-pTwRKr_cU',
  authDomain: 'sorteador-eventos-eb.firebaseapp.com',
  projectId: 'sorteador-eventos-eb',
  storageBucket: 'sorteador-eventos-eb.firebasestorage.app',
  messagingSenderId: '1023888130075',
  appId: '1:1023888130075:web:984079eadfa13e5c97f8be',
}

export const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
auth.languageCode = 'pt-BR'

export const db = getFirestore(app)

export const DOMINIO_EMPRESA = 'eletricabahiana.com.br'

export const provedorGoogle = new GoogleAuthProvider()
// "hd" faz o Google oferecer só contas da empresa. A checagem que vale fica no ProvedorAcesso e nas regras.
provedorGoogle.setCustomParameters({ hd: DOMINIO_EMPRESA, prompt: 'select_account' })
