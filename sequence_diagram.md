# Diagrammes de Séquence - HomeMed Manager (Processus Métiers)

Cette page documente les interactions dynamiques critiques entre les composants du système.

---

## 1. Suivi d'Observance (Toggle Prise)
*Ce flux montre comment une prise est enregistrée et comment le stock est décrémenté.*

```mermaid
sequenceDiagram
    autonumber
    actor U as Utilisateur
    participant F as Frontend
    participant C as PriseController
    participant DB as Database
    participant WS as WebSocket (Reverb)

    U->>F: Coche "Pris"
    F->>C: POST /api/prises/toggle
    activate C
    C->>DB: Transaction: Update Prise + Decrement Medicament
    DB-->>C: Succès
    C->>WS: Broadcast 'DataChanged'
    C-->>F: JSON (Prise + Med New Stock)
    deactivate C
    F->>U: Feedback visuel
```

---

## 2. Demande de Partage (Social Collaboration)
*Ce flux illustre la demande d'un médicament entre deux membres d'un groupe.*

```mermaid
sequenceDiagram
    autonumber
    actor U1 as Demandeur
    actor U2 as Propriétaire
    participant F as Frontend (React)
    participant RC as RequestController
    participant DB as Database

    U1->>F: Sélectionne un Medicament Public (Groupe)
    F->>RC: POST /api/requests (medicament_id, notes)
    activate RC
    RC->>DB: Create MedicamentRequest (Status: Pending)
    DB-->>RC: ID: 50
    RC-->>F: HTTP 201 Created
    deactivate RC
    
    Note over RC, U2: Notification Temps Réel
    RC->>U2: Push Notification: "Demande reçue"
    
    U2->>F: Accepte la demande
    F->>RC: PATCH /api/requests/50 (Status: Accepted)
    activate RC
    RC->>DB: Update Status
    RC-->>F: OK
    deactivate RC
    
    RC->>U1: Push Notification: "Demande acceptée"
```

---

## 3. Automatisation des Alertes & Logistique
*Ce flux montre comment le système réagit à un stock bas.*

```mermaid
sequenceDiagram
    autonumber
    participant S as System Task (Cron/Event)
    participant NS as NotificationService
    participant U as Utilisateur
    participant AC as AchatController
    participant DB as Database

    S->>DB: Scan Medicaments (quantite <= seuil_alerte)
    DB-->>S: Liste des alertes
    
    loop Pour chaque alerte
        S->>NS: triggerAlert(med_id)
        NS->>U: Notification Push/In-App: "Stock Faible !"
        
        opt Si auto-ajout activé
            S->>AC: addToShoppingList(med_id)
            AC->>DB: Create Achat (Statut: À acheter)
        end
    end
```

## Synthèse technique
Ces diagrammes démontrent la robustesse des interactions :
- **Atomicité** dans la gestion des prises.
- **Réactivité** dans la collaboration sociale.
- **Proactivité** dans la gestion logistique.
