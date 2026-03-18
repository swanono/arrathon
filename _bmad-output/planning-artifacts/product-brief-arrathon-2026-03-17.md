---
stepsCompleted: [1, 2, 3, 4, 5, 6]
workflow_completed: true
inputDocuments: ['_bmad-output/brainstorming/brainstorming-session-2026-03-16-1200.md']
date: 2026-03-17
author: Sacha
---

# Product Brief: Arrathon

## Executive Summary

Arrathon est une application mobile de coordination d'événements de type "barathon" — une aventure sociale qui consiste à parcourir les arrondissements de Paris dans l'ordre décroissant (20ème → 1er), en validant une consommation dans un bar ou lieu sélectionné par arrondissement. L'app résout le chaos organisationnel du jour J en devenant le système de vérité partagée du groupe : liste des lieux synchronisée, géolocalisation collective, validation des étapes et suivi de progression en temps réel.

---

## Core Vision

### Problem Statement

Organiser un arrathon aujourd'hui repose entièrement sur WhatsApp, Google Maps, et la mémoire d'un seul organisateur. Conséquences : mauvaise liste partagée sur le groupe, barre de batterie critique qui coupe la communication, organisateur inaccessible qui bloque la progression, participants perdus sans moyen de retrouver le groupe, frais impossibles à partager correctement après coup.

### Problem Impact

Sans outil dédié, les arrathons dépendent d'un seul point de défaillance humaine. Quand l'organisateur principal est hors service (épuisé, déconnecté, ou "trop dans l'ambiance"), l'événement perd son fil directeur. Les participants ne savent plus où aller, qui est encore dans le groupe, ou combien ils doivent à qui.

### Why Existing Solutions Fall Short

- **WhatsApp** : flux de messages qui noie l'information critique (quel est le prochain bar ?)
- **Google Maps** : pas de notion de groupe, de validation, ni de progression partagée
- **Tricount** : gestion financière isolée du contexte de l'événement
- **Aucun outil** ne combine coordination live + géoloc collective + validation de parcours + partage des frais contextualisés

### Proposed Solution

Une app dédiée aux arrathons avec 4 piliers fondamentaux :
1. **Gestion des participants** — créer l'événement, inviter, définir les rôles organisateurs/participants
2. **Liste des lieux synchronisée** — un seul itinéraire visible par tous, modifiable par les orgas, avec finalisation lieu par lieu
3. **Géolocalisation collective** — carte live du groupe, filtre individuel, validation de lieu par géoloc
4. **Notifications push** — le groupe avance ensemble, même sans WhatsApp ouvert

### Key Differentiators

- Contexte événementiel natif : les frais, la carte, les validations sont liés à la structure de l'arrathon
- "Séparé avec sérénité" : la géoloc ne supprime pas le chaos, elle donne la confiance pour l'embrasser
- Concept exportable : Paris aujourd'hui, n'importe quelle ville avec des quartiers demain

---

## Target Users

### Primary Users

**Persona 1 — Lucas, l'Organisateur** *(25-32 ans, fan de Paris et de bonnes soirées)*
Lucas a eu l'idée de l'arrathon pour l'anniversaire d'un pote. Il connaît Paris par cœur, il a une liste de bars dans la tête depuis des semaines. Le jour J, il jongle entre être garant de l'ambiance et être le seul à savoir "c'est quoi la suite". Son téléphone est à 30% de batterie à 23h, les messages WhatsApp s'accumulent, et trois potes lui demandent où ils sont en même temps. Il aimerait profiter autant que les autres — mais c'est lui qui doit garder la tête froide.
*Moment "aha" :* Quand il appuie sur "Finaliser ce bar" et que tout le monde reçoit la notification avec le suivant, sans qu'il ait à écrire un seul message.

**Persona 2 — Camille, la Participante** *(22-30 ans, dans le groupe mais pas organisatrice)*
Camille sait vaguement qu'il y a un arrathon ce soir, elle a dit oui sur le groupe WhatsApp. Elle arrive au 15ème arrondissement directement (demi-arrathon), trouve difficilement le groupe qui est éparpillé, et ne sait pas exactement ce qu'elle a "validé" ou ce qu'elle doit encore faire. Elle voudrait voir où sont ses potes sur une carte sans avoir à demander toutes les 10 minutes.
*Moment "aha" :* Quand elle ouvre l'app et voit instantanément les points de ses potes sur la carte et le prochain lieu en gras.

**Persona 5 — Marie, la Logisticienne du Matin** *(souvent complice de l'orga)*
Marie a commandé 40 écocups, fait imprimer les dossards avec les noms, et gère la caisse de départ. Tout ça se passe le matin avant le premier bar. Elle a besoin que chaque participant confirme sa participation et son pack en amont pour ne pas commander en trop ou en moins. Le jour J, elle distribue tout avant le départ et veut voir en un coup d'œil qui a payé son pack et qui ne l'a pas encore fait.
*Moment "aha" :* La liste des participants confirmés avec statut de paiement du pack, sans faire le tour de WhatsApp.

### Secondary Users

**Persona 3 — Antoine, l'Hôte du Ravital** *(ami du groupe, pas forcément dans l'arrathon complet)*
Antoine a proposé son appart du 12ème comme point de ravitaillement — rhum arrangé maison et quelques chips. Il veut juste savoir approximativement quand le groupe arrive pour ne pas être dans sa douche. Cas critique : Baptiste est encore au bar précédent quand il reçoit la notif "Le groupe arrive dans ~15 min chez toi". L'orga peut basculer l'ordre en live (bar du bas → appartement Baptiste), les retardataires voient la mise à jour immédiatement.

**Persona 4 — Le Participant Fantôme** *(a rejoint, a disparu, veut revenir)*
Il était là au 18ème, il a pris le métro pour rentrer chez lui, mais finalement il redescend rejoindre le groupe. Il a sa pénalité, il le sait, mais il veut quand même figurer dans le classement final.

**Persona 6 — Le Nouveau du Groupe**
On lui dit "prochain RDV c'est chez Benjamin pour le ravito". Il ne sait pas où habite Benjamin. L'app affiche l'adresse du ravital directement sur la carte — il tape sur le point, voit "Chez Benjamin — 14 rue des Martyrs, 9ème", ouvre Maps depuis l'app. Zéro question sur WhatsApp.

### User Journey — Lucas (Organisateur)

| Phase | Action | Douleur actuelle | Valeur Arrathon App |
|---|---|---|---|
| **Avant (J-7)** | Planifie la liste des bars | Partage un Google Doc / message WhatsApp épinglé | Liste structurée dans l'app, modifiable |
| **Avant (J-1)** | Vérifie que les bars sont ouverts | Appels manuels / Google | Alertes horaires d'ouverture |
| **Matin J** | Gère les packs (écocup, dossards) | WhatsApp pour confirmer qui vient et qui a payé | Liste participants + statut paiement pack |
| **Jour J — Départ** | Lance l'arrathon, invite les retardataires | Lien WhatsApp + recopier l'ordre des bars | Lien d'invitation unique, tout est dans l'app |
| **Pendant** | Fait avancer le groupe | Écrit "on part au suivant" sur WhatsApp | Bouton "Finaliser" → notification automatique |
| **Pendant** | Gère un bar fermé ou ravital pas prêt | Cherche une alternative, prévient tout le monde | Modifie la liste, push notification auto |
| **Fin** | Calcule qui doit quoi | Tricount laborieux le lendemain | Récap financier contextuel dans l'app |
| **Après** | Revit la soirée | Photos éparpillées sur Messenger | Résumé avec tracé + classement + stats |

---

## Success Metrics

**Indicateur clé #1 — L'app survit au jour J**
Un arrathon complet réalisé avec l'app sans retour sur WhatsApp pour coordonner les lieux ou la progression. Cible : 1er arrathon test réussi sans incident bloquant.

**Indicateur clé #2 — Adoption spontanée**
Les participants ouvrent l'app au moins 3 fois pendant l'arrathon sans qu'on leur demande. Cible : taux d'ouverture active > 80% des participants sur un événement.

**Indicateur clé #3 — Réutilisation**
Un utilisateur ayant participé à un arrathon en crée ou rejoint un autre dans les 6 mois. Cible : taux de rétention > 60% à 6 mois.

### Business Objectives

| Horizon | Objectif |
|---|---|
| **3 mois** | 1 arrathon test complet réalisé avec l'app (cercle proche) |
| **6 mois** | 3-5 arrathons organisés par des utilisateurs hors réseau direct |
| **12 mois** | Communauté active de ~50 organisateurs récurrents à Paris |
| **Phase 3** | Premier arrathon organisé hors Paris |

### Key Performance Indicators

| KPI | Mesure | Cible |
|---|---|---|
| **Complétion du parcours** | % de lieux validés par participant sur un arrathon | > 70% |
| **Activation organisateur** | Délai entre création du compte et premier arrathon créé | < 30 min |
| **Stabilité live** | Incidents bloquants pendant un événement (sync, géoloc...) | 0 en Phase 0 |
| **Engagement financier** | % d'organisateurs qui activent le module finances à la création | Mesuré, cible à définir en Phase 1 |
| **NPS informel** | "Tu recommandes l'app à un pote qui organise ?" | > 8/10 |

---

## MVP Scope

### Core Features (Phase 0)

**Authentification & Profil**
- Inscription / connexion (OAuth Google)
- Profil utilisateur minimal (nom, photo)

**Gestion de l'Arrathon**
- Créer un arrathon (nom, date, description, N organisateurs)
- Inviter des participants via lien unique
- Rôles : organisateur / participant
- Rejoindre en cours de route + déclarer participation partielle (je commence au bar X)
- Abandon + retour possible

**Gestion des Lieux**
- Créer/modifier/supprimer des lieux dans l'itinéraire (type : bar, appartement, monument, ravitail)
- Ordonner les lieux, associer une adresse
- Finaliser un lieu (bouton orga) → notification push → lieu suivant actif
- Modifier l'ordre en live (remplacement si lieu fermé)

**Carte & Géolocalisation**
- Carte live avec position de tous les participants
- Filtre : afficher seulement certains participants
- Validation d'un lieu par géoloc (rayon configurable)
- Notifications push à chaque changement d'étape

**Pack de départ (logistique)**
- L'orga définit un pack optionnel/obligatoire avec prix et contenu (écocup, dossard...)
- Statut de paiement du pack par participant, visible par l'orga

### Out of Scope for MVP

| Feature | Phase cible |
|---|---|
| Gamification (scores, pénalités, tracé Strava, classement) | Phase 1 |
| Résumé final partageable | Phase 1 |
| Module finances complet (dépenses dynamiques, calcul in-app) | Phase 1 |
| Disputes financières / justificatifs | Phase 2 |
| Photos géolocalisées | Phase 2 |
| Auto-validation par timer si orgas HS | Phase 2 |
| Arrathon hors Paris | Phase 3 |
| Arrathon public / rejoignable par inconnus | Phase 3 |

### MVP Success Criteria

- **Test alpha (2 personnes)** : parcours complet de bout en bout fonctionnel sans bug bloquant — critère de sortie du MVP avant tout vrai arrathon
- 0 retour sur WhatsApp pour coordination des lieux lors du test
- Confiance suffisante pour proposer l'app à un groupe réel en Phase 1

### Future Vision

Arrathon devient la référence des événements sociaux itinérants — d'abord en France (autres villes après Paris), puis exportable partout où il y a une culture de bar crawl communautaire. À terme : marketplace d'événements publics, partenariats avec des bars, version "corporate" pour team buildings urbains.
