# 🚀 Guide de Déploiement : HomeMed Frontend sur Vercel

Ce guide vous accompagne pas à pas pour mettre en ligne l'interface de votre application.

---

### 1. Préparatifs (Déjà fait par moi)
J'ai ajouté le fichier `vercel.json` dans le dossier `frontend`. Ce fichier est indispensable pour que la navigation (les routes comme `/dashboard`) fonctionne correctement sur Vercel.

---

### 2. Procédure sur le tableau de bord Vercel

Suivez ces étapes sur [Vercel.com](https://vercel.com) :

1.  **Nouveau Projet** : Cliquez sur **"Add New"** > **"Project"**.
2.  **Import GitHub** : Connectez votre compte GitHub et importez le dépôt `HomeMed-Manager`.
3.  **Configuration du dossier** :
    - Cliquez sur **"Edit"** à côté de **"Root Directory"**.
    - Sélectionnez le dossier `frontend`.
4.  **Variables d'Environnement** (CRUCIAL) :
    - Allez dans la section **"Environment Variables"**.
    - Ajoutez la variable suivante :
        - **Key** : `VITE_API_URL`
        - **Value** : `https://home-med.github.ma/api` (Notez le `/api` à la fin).
5.  **Build** : Cliquez sur **"Deploy"**.

---

### 3. Autorisation de Sécurité (CORS)

> [!IMPORTANT]
> **Étape indispensable sur votre serveur Backend** :
> Pour que le frontend puisse parler au backend, vous devez autoriser l'adresse Vercel.
> 1. Ouvrez le fichier `.env` sur votre serveur **Backend**.
> 2. Mettez à jour ces deux lignes avec votre URL Vercel (ex: `https://homemed-manager.vercel.app`) :
>    ```env
>    SANCTUM_STATEFUL_DOMAINS=homemed-manager.vercel.app
>    FRONTEND_URL=https://homemed-manager.vercel.app
>    ```

---

### 4. Vérification finale
Une fois le déploiement terminé, ouvrez votre lien Vercel. Vous devriez voir la page de connexion. Testez la navigation : si vous rafraîchissez la page sur le Dashboard et que tout s'affiche, c'est que `vercel.json` est bien actif !

**C'est prêt ! HomeMed est maintenant en ligne !** 🌍✨
