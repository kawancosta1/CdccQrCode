# Guia de Configuração e Integração do Firebase

Este documento descreve como conectar o **QRCodeCDCC** ao Firebase para gerenciar dinamicamente o **Carrossel da Home** e os **Jogos do Espaço Lúdico** sem precisar alterar o código-fonte.

---

## 1. Criar Projeto no Firebase

1. Acesse o [Firebase Console](https://console.firebase.google.com/).
2. Clique em **Adicionar projeto** e nomeie como `qrcodecdcc` (ou nome de sua preferência).
3. Conclua a criação do projeto.

---

## 2. Ativar os Serviços Necessários

### A. Firebase Authentication
1. No menu lateral, acesse **Build > Authentication**.
2. Clique em **Começar**.
3. Em **Sign-in method**, ative o provedor **E-mail/senha**.
4. Na aba **Users**, clique em **Adicionar usuário** e cadastre o e-mail e a senha do administrador da biblioteca.

### B. Cloud Firestore
1. Acesse **Build > Firestore Database**.
2. Clique em **Criar banco de dados**.
3. Escolha uma localização geográfica próxima (ex: `southamerica-east1` em São Paulo).
4. No assistente inicial, selecione **Iniciar no modo de produção**.
5. As coleções utilizadas são:
   - `carrossel_home`: armazena os slides do carrossel inicial.
   - `jogos`: armazena os jogos de tabuleiro e suas regras oficiais.

### C. Firebase Storage
1. Acesse **Build > Storage**.
2. Clique em **Começar** e confirme o bucket padrão.
3. As imagens de upload são organizadas automaticamente nas pastas:
   - `carousel/`: imagens de slides em alta resolução.
   - `games/`: fotos de capas e tabuleiros de jogos.

---

## 3. Configurar as Regras de Segurança

Copie as regras dos arquivos da raiz do projeto para o console do Firebase ou faça o deploy via Firebase CLI:

### Administradores (passo obrigatório)

As regras abaixo só deixam **administradores** ler/escrever o painel. Administrador é o usuário cujo UID tem um documento em `admins/{uid}`:

1. Em **Authentication > Users**, copie o **UID** do usuário administrador.
2. Em **Firestore Database**, crie a coleção `admins` e um documento com **ID = UID copiado** (pode ter qualquer campo, ex.: `email`).
3. Em **Authentication > Settings > User actions**, desative a criação de novas contas (sign-up) para que ninguém se cadastre sozinho.

> Publique as regras (console ou `firebase deploy --only firestore:rules,storage`) **depois** de criar o documento do seu UID, senão você fica sem acesso ao painel.

### Firestore (`firestore.rules`):
```text
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // Administrador = usuário autenticado cujo UID tem um documento em /admins/{uid}.
    // Novos admins são criados pelo console do Firebase (ou por um admin já existente);
    // um usuário comum não consegue se promover, pois não tem permissão de escrita.
    function isAdmin() {
      return request.auth != null
          && exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }

    // Carrossel da Home:
    // - Leitura pública para qualquer visitante do site (Home).
    // - Criação, atualização e exclusão restritas a administradores.
    match /carrossel_home/{slideId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Jogos do Espaço Lúdico:
    // - Leitura pública para visualização no site (/espacoludico e regras).
    // - Gestão restrita a administradores.
    match /jogos/{jogoId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Coleções administrativas gerais (livros, estantes, salas, auditoria, configurações):
    // leitura e escrita apenas para administradores.
    match /{document=**} {
      allow read, write: if isAdmin();
    }
  }
}
```

### Storage (`storage.rules`):
```text
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {

    // Administrador = UID com documento em /admins/{uid} no Firestore.
    function isAdmin() {
      return request.auth != null
          && firestore.exists(/databases/(default)/documents/admins/$(request.auth.uid));
    }

    // Imagens do Carrossel da Home:
    // - Leitura pública para exibição na página inicial.
    // - Upload restrito a administradores, limitado a arquivos de imagem até 5MB.
    match /carousel/{allPaths=**} {
      allow read: if true;
      allow write: if isAdmin()
                   && request.resource.size < 5 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
    }

    // Fotos de capa dos Jogos do Espaço Lúdico:
    // - Leitura pública para exibição no catálogo.
    // - Upload restrito a administradores autenticados, imagem até 5MB.
    match /games/{allPaths=**} {
      allow read: if true;
      allow write: if isAdmin()
                   && request.resource.size < 5 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
    }
  }
}
```

---

## 4. Configurar as Variáveis de Ambiente

No seu arquivo `.env.local` (ou nas variáveis de ambiente da plataforma de hospedagem), preencha com as credenciais da sua aplicação Web criada no console:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=qrcodecdcc.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=qrcodecdcc
VITE_FIREBASE_STORAGE_BUCKET=qrcodecdcc.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=1:...
```

---

## 5. Modo Offline e Fallback Resiliente

Se as credenciais acima não forem fornecidas, ou caso o banco fique offline ou inacessível:
- O site **nunca quebra**: a Home e o Espaço Lúdico carregam os dados padrão locais com fotografias reais.
- O painel administrativo ativa o modo de **Demonstração Local (LocalStorage)**, permitindo cadastrar, editar, reordenar e testar todas as funcionalidades mesmo sem conexão à nuvem.
- No painel administrativo, há botões rápidos de **Restaurar Padrões** para semear ou recuperar os 5 slides e os 3 jogos originais a qualquer momento.
