# Diagramme de Cas d'Utilisation - HomeMed Manager (Complet)

Ce diagramme représente l'intégralité des fonctionnalités du système pour la présentation du projet.

```mermaid
useCaseDiagram
    actor "Utilisateur" as U
    actor "Administrateur" as A
    actor "IA Assistant" as AI

    %% Styling for Actors
    style U fill:#3b82f6,stroke:#1d4ed8,stroke-width:2px,color:#fff
    style A fill:#ef4444,stroke:#b91c1c,stroke-width:2px,color:#fff
    style AI fill:#8b5cf6,stroke:#6d28d9,stroke-width:2px,color:#fff

    subgraph "Système HomeMed Manager"
        %% Account & Security
        usecase "S'authentifier" as UC_AUTH
        usecase "Gérer ses profils famille" as UC_PROF
        usecase "Régler les préférences notifications" as UC_PREF

        %% Health & Inventory
        usecase "Gérer l'inventaire personnel" as UC_MED
        usecase "Scanner/Ajouter un traitement" as UC_SCAN
        usecase "Planifier des rappels" as UC_RAPPEL
        usecase "Valider/Invalider une prise" as UC_PRISE
        usecase "Consulter les rapports d'observance" as UC_REPORT
        
        %% Social & Sharing
        usecase "Gérer ses Groupes de partage" as UC_GROUP
        usecase "Inviter un membre (Code/Lien)" as UC_INVITE
        usecase "Demander un médicament au groupe" as UC_REQ
        usecase "Discuter via le chat de partage" as UC_CHAT
        
        %% AI & Intelligence
        usecase "Consulter l'IA sur un traitement" as UC_AI_CONSULT
        usecase "Analyser une ordonnance" as UC_OCR
        
        %% Logistics & Purchase
        usecase "Gérer la liste d'achats" as UC_SHOP
        usecase "Acheter un médicament (Log)" as UC_BUY
        
        %% Administration
        usecase "Gérer le catalogue Maître" as UC_MASTER
        usecase "Consulter les logs d'activité" as UC_LOGS
        usecase "Gérer les paramètres système" as UC_SETTINGS
    end

    %% User Relations
    U --> UC_AUTH
    U --> UC_PROF
    U --> UC_PREF
    U --> UC_MED
    U --> UC_RAPPEL
    U --> UC_PRISE
    U --> UC_REPORT
    U --> UC_GROUP
    U --> UC_REQ
    U --> UC_SHOP
    U --> UC_AI_CONSULT

    %% Relations avec inclusion
    UC_MED ..> UC_SCAN : <<include>>
    UC_GROUP ..> UC_INVITE : <<include>>
    UC_REQ ..> UC_CHAT : <<include>>
    UC_SHOP ..> UC_BUY : <<include>>
    UC_AI_CONSULT ..> UC_OCR : <<extend>>

    %% Admin Relations
    A --|> U
    A --> UC_MASTER
    A --> UC_LOGS
    A --> UC_SETTINGS

    %% AI Relations
    AI --> UC_AI_CONSULT
    AI --> UC_OCR
```

## Description des Modules
- **Santé (Health)** : Cœur du système permettant le suivi rigoureux des traitements.
- **Collaboration (Social)** : Permet de créer un réseau d'entraide familial ou amical.
- **Intelligence (AI)** : Apporte une aide à la décision et simplifie la saisie (OCR).
- **Logistique (Logistics)** : Assure que le stock ne tombe jamais à zéro grâce à la liste d'achats.
- **Administration** : Contrôle la cohérence des données globales et la sécurité.
