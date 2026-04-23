# Diagramme d'État - Cycle de Vie d'un Médicament

Ce diagramme illustre les différents états d'un médicament dans le système HomeMed Manager, de son ajout à son épuisement ou expiration.

```mermaid
stateDiagram-v2
    [*] --> EnStock : Ajout au Profil
    
    state EnStock {
        [*] --> QuantiteNormale
        QuantiteNormale --> StockFaible : Quantité <= Seuil Alerte
        StockFaible --> QuantiteNormale : Achat / Réapprovisionnement
        StockFaible --> Rupture : Quantité == 0
        Rupture --> QuantiteNormale : Achat / Réapprovisionnement
    }
    
    state Alertes <<choice>>
    
    EnStock --> Alertes : Vérification quotidienne
    Alertes --> Expiré : Date Expiration < Aujourd'hui
    Alertes --> TraitementActif : Date Début <= Aujourd'hui <= Date Fin
    
    Expiré --> [*] : Suppression / Archivage
    
    TraitementActif --> RappelEnvoyé : Heure du Rappel
    RappelEnvoyé --> PriseEnregistrée : Validation Utilisateur
    PriseEnregistrée --> EnStock : Décrémenter Stock
    
    Rupture --> ListeAchats : Ajout automatique
    ListeAchats --> EnStock : Validation Achat
```

## Description des États
1. **EnStock** : Le médicament est disponible dans l'armoire à pharmacie.
2. **StockFaible** : Le système déclenche une notification visuelle pour prévenir l'utilisateur.
3. **Rupture** : Le médicament est épuisé. Le système suggère de l'ajouter à la liste d'achats.
4. **Expiré** : Le médicament est périmé. Une alerte critique est affichée pour éviter tout risque de santé.
5. **TraitementActif** : L'utilisateur est actuellement sous traitement avec ce médicament (période définie).
