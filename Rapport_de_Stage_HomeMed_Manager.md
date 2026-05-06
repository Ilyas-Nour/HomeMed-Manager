# Rapport de Stage : HomeMed Manager

## Page de Garde

**PROJET : HOMEMED MANAGER**  
*Plateforme Intelligente de Gestion de Médicaments à Domicile*

**Étudiant :** [Votre Nom]  
**Structure d'accueil :** [Nom de l'Entreprise/Institution]  
**Période :** [Dates du stage]  
**Encadrant :** [Nom de l'encadrant]

---

## Remerciements

Je tiens à exprimer ma profonde gratitude à l’ensemble de l’équipe de [Structure d'accueil] pour leur accueil chaleureux et leur accompagnement tout au long de ce stage.

Un merci particulier à mon encadrant, [Nom de l'encadrant], pour ses conseils précieux et sa disponibilité. Je remercie également mes professeurs pour la formation de qualité qu’ils m’ont dispensée, ainsi que ma famille pour leur soutien constant.

---

## Résumé

**Problématique :** La gestion des médicaments à domicile est souvent désorganisée : oublis de prises, médicaments périmés non détectés, et difficulté de partage d'informations au sein d'une famille ou d'un groupe d'entraide.

**Solutions proposées :** Développement de "HomeMed Manager", une application web moderne utilisant Laravel (Backend) et React (Frontend). La solution inclut un suivi d'observance en temps réel, une gestion d'inventaire avec alertes de stock bas, un système de partage collaboratif entre membres d'un groupe, et une assistance par IA pour la lecture d'ordonnances (OCR).

**Résultats :** Une plateforme fonctionnelle permettant de centraliser la santé familiale, de réduire les erreurs médicamenteuses et d'optimiser les achats de médicaments grâce à une liste de courses automatisée.

---

## Table des matières

1. [Introduction générale](#introduction-générale)
2. [Chapitre 1 : Présentation de la structure d’accueil](#chapitre-1-présentation-de-la-structure-daccueil)
3. [Chapitre 2 : Présentation du projet](#chapitre-2-présentation-du-projet)
4. [Chapitre 3 : Conception du projet](#chapitre-3-conception-du-projet)
5. [Chapitre 4 : Réalisation et test](#chapitre-4-réalisation-et-test)
6. [Conclusion générale et perspectives](#conclusion-générale-et-perspectives)

---

## Introduction générale

### Objectifs
L'objectif principal est de concevoir une plateforme centralisée facilitant la gestion quotidienne des traitements médicaux pour les particuliers et les familles.

### Contexte
Dans un environnement où la santé connectée prend de l'ampleur, HomeMed Manager s'inscrit comme un assistant personnel de santé préventif et organisationnel.

### Problématique
Comment assurer un suivi thérapeutique rigoureux et une gestion optimale des stocks de médicaments dans un cadre familial tout en favorisant l'entraide ?

### Structure du rapport
Le rapport s'articule autour de quatre chapitres : la présentation de l'entité d'accueil, l'analyse du projet, la phase de conception technique, et enfin la réalisation concrète du système.

---

## Chapitre 1 : Présentation de la structure d’accueil

*[Note : À personnaliser selon votre entreprise]*
La structure d'accueil, [Nom], est spécialisée dans [Domaine d'activité]. Elle se distingue par son expertise en [Technologies/Services] et sa volonté d'innovation constante.

---

## Chapitre 2 : Présentation du projet

### Problématique détaillée
La gestion manuelle des médicaments présente des risques :
- **Risque d'erreur :** Oubli ou double prise.
- **Gaspillage :** Médicaments qui périment car oubliés au fond de l'armoire.
- **Logistique :** Rupture de stock de traitements chroniques.

### Planning prévisionnel
1. **Analyse & Spécification (Semaine 1-2)**
2. **Conception UI/UX & Base de données (Semaine 3-4)**
3. **Développement Backend & API (Semaine 5-8)**
4. **Développement Frontend & Intégration (Semaine 9-12)**
5. **Tests, Déploiement & Documentation (Semaine 13-14)**

### Étude de l’existant
Les solutions actuelles sont soit trop simplistes (rappels sur smartphone sans gestion de stock), soit trop complexes (logiciels médicaux professionnels non adaptés au grand public).

### Choix de la méthodologie de développement
Nous avons opté pour la méthode **Agile Scrum**, permettant une flexibilité face aux changements et des livraisons régulières de fonctionnalités via des sprints de deux semaines.

### Critique des solutions actuelles
Le manque de collaboration est le point faible majeur. Une mère de famille ne peut pas voir si son enfant a pris son médicament si elle n'est pas physiquement présente. HomeMed résout cela par la synchronisation cloud.

---

## Chapitre 3 : Conception du projet

### Architecture du Système
Le projet repose sur une architecture découplée :
- **Backend :** API RESTful avec Laravel.
- **Frontend :** Single Page Application (SPA) avec React.
- **Communication :** WebSockets (Laravel Reverb) pour les notifications temps réel.

### Diagramme de Cas d'Utilisation
Le système identifie trois acteurs : l'Utilisateur, l'Administrateur et l'IA Assistant.
- **Utilisateur :** Gère ses médicaments, planifie des rappels, participe à des groupes.
- **IA Assistant :** Analyse les ordonnances via OCR.

### Modèle de données (Diagramme de Classes)
Les entités principales incluent :
- `User` & `Profil` (Multi-profils par compte).
- `Medicament` (Stock, posologie, alertes).
- `Groupe` (Partage et collaboration).
- `Rappel` & `Prise` (Suivi d'observance).

---

## Chapitre 4 : Réalisation et test

### Technologies utilisées
- **Frontend :** React 18, Tailwind CSS v4, Lucide React (Icônes).
- **Backend :** PHP 8.3+, Laravel 11.
- **Base de données :** MySQL.
- **Outils :** Git, Vite, Postman.

### Fonctionnalités réalisées
1. **Tableau de bord :** Vue d'ensemble des médicaments à prendre aujourd'hui.
2. **Gestion des Groupes :** Invitation de membres via code unique et chat de partage.
3. **Système de Rappels :** Notifications push et email avant chaque prise.
4. **Liste d'achats :** Génération automatique quand le stock descend sous un seuil défini.

### Tests
- **Tests Unitaires :** Validation des calculs de stock dans le backend.
- **Tests d'Intégration :** Vérification du flux de demande de médicament entre deux utilisateurs.
- **Tests Utilisateurs :** Vérification de l'ergonomie de l'interface mobile-first.

---

## Conclusion générale et perspectives

Ce stage m'a permis d'appréhender le cycle de vie complet d'une application web moderne. J'ai pu renforcer mes compétences en développement Fullstack et en gestion de projet Agile.

**Perspectives :**
- Développement d'une application mobile native (React Native).
- Intégration avec des objets connectés (piluliers intelligents).
- Extension de l'IA pour détecter les interactions médicamenteuses dangereuses.
