# Diagramme de Classes - HomeMed Manager (Architecture Complète)

Ce diagramme représente la structure complète de la base de données et les relations entre les différents modules du système.

```mermaid
classDiagram
    direction TB

    %% Global Styling
    classDef core fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#1f2937;
    classDef logic fill:#dcfce7,stroke:#16a34a,stroke-width:2px,color:#1f2937;
    classDef share fill:#e0e7ff,stroke:#4f46e5,stroke-width:2px,color:#1f2937;
    classDef system fill:#f3f4f6,stroke:#9ca3af,stroke-dasharray: 5 5;

    class User {
        +int id
        +string name
        +string email
        +string role
        +isAdmin() bool
        +canAccessPanel() bool
    }
    class Profil {
        +int id
        +string nom
        +string relation
        +date date_naissance
        +photo photo
    }
    class Medicament {
        +int id
        +string nom
        +string type
        +string posologie
        +int quantite
        +int seuil_alerte
        +bool is_public
        +getStockFaible() bool
        +getExpire() bool
        +getTraitementActif() bool
    }
    class MasterMedicament {
        +int id
        +string nom
        +string description
        +string dosage_standard
    }
    class Rappel {
        +int id
        +string moment
        +time heure
    }
    class Prise {
        +int id
        +datetime date_prise
        +bool pris
    }
    class Groupe {
        +int id
        +string nom
        +string code_invitation
    }
    class GroupInvitation {
        +int id
        +string email
        +string token
        +string status
    }
    class MedicamentRequest {
        +int id
        +string status
        +string notes
    }
    class SharingMessage {
        +int id
        +string content
        +bool is_read
    }
    class Achat {
        +int id
        +int quantite
        +string statut
    }
    class Notification {
        +int id
        +string type
        +json data
        +datetime read_at
    }
    class NotificationPreference {
        +int id
        +bool email_notify
        +bool push_notify
    }
    class ActivityLog {
        +int id
        +string action
        +string description
    }
    class Setting {
        +int id
        +string key
        +string value
    }

    %% Applying styles
    class User,Profil,NotificationPreference core;
    class Medicament,Rappel,Prise,MasterMedicament logic;
    class Groupe,GroupInvitation,MedicamentRequest,SharingMessage share;
    class Notification,ActivityLog,Setting system;

    %% Relationships
    User "1" *-- "many" Profil : Possède
    User "1" -- "1" NotificationPreference : Définit
    Profil "1" -- "many" Medicament : Contient
    Medicament "1" -- "many" Rappel : Planifie
    Medicament "*" -- "0..1" MasterMedicament : Référence
    Rappel "1" -- "many" Prise : Enregistre
    Medicament "1" -- "many" Achat : Génère
    
    User "many" -- "many" Groupe : Participe
    User "1" --> "many" Groupe : Propriétaire
    Groupe "1" -- "many" GroupInvitation : Envoie
    Groupe "1" -- "many" MedicamentRequest : Contextualise
    Medicament "1" -- "many" MedicamentRequest : Cible
    MedicamentRequest "1" -- "many" SharingMessage : Contient
    
    User "1" -- "many" Notification : Reçoit
    User "1" -- "many" ActivityLog : Produit
```

## Architecture Logicielle
- **Core (Jaune)** : Gestion de l'identité et des préférences de l'utilisateur.
- **Logique Métier (Vert)** : Gestion des médicaments, de l'observance et du catalogue maître.
- **Partage (Bleu)** : Système collaboratif incluant invitations, demandes et messagerie contextuelle.
- **Système (Gris)** : Maintenance du système, logs d'audit et configuration globale.
