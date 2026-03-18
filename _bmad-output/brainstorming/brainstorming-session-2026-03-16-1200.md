---
stepsCompleted: [1, 2, 3, 4]
workflow_completed: true
session_active: false
inputDocuments: []
session_topic: 'Reprendre le projet Arrathon proprement — clarifier les fonctionnalités, simplifier les zones floues, définir la roadmap MVP'
session_goals: 'Définir le MVP, résoudre les features complexes (organisateur intérimaire, sous-équipes, paiements), préparer les epics/stories pour un redémarrage sur Hono + archi hexagonale'
selected_approach: 'ai-recommended'
techniques_used: ['First Principles Thinking', 'Question Storming', 'SCAMPER Method']
ideas_generated: []
context_file: '_bmad/bmm/data/project-context-template.md'
---

# Brainstorming Session Results

**Facilitateur :** Sacha
**Date :** 2026-03-16

## Session Overview

**Topic :** Reprendre le projet Arrathon proprement — clarifier les fonctionnalités, simplifier les zones floues, définir la roadmap MVP
**Goals :** Définir le MVP, résoudre les features complexes (organisateur intérimaire, sous-équipes, paiements), préparer les epics/stories pour un redémarrage sur Hono + archi hexagonale

### Context Guidance

Projet de bar crawl gamifié (arrathons d'arrondissements). Modèle de données existant : Users, Arrathons, Locations, tables de liaison. Stack actuelle à migrer vers Hono + architecture hexagonale. Diagramme Excalidraw disponible comme référence.

### Session Setup

Session focalisée sur la clarification du scope et la simplification des features avant reprise du développement. Plusieurs fonctionnalités marquées comme "shit" par Sacha lui-même, notamment : organisateur intérimaire, sous-équipes avec leader, gestion des frais type Tricount intégré.

## Technique Selection

**Approche :** Techniques recommandées par IA
**Contexte d'analyse :** Projet Arrathon avec focus sur clarification MVP et simplification

**Techniques recommandées :**

- **First Principles Thinking :** Dépouiller toutes les hypothèses pour retrouver le core value proposition
- **Question Storming :** Générer uniquement des questions pour cartographier les zones floues et le bon problème à résoudre
- **SCAMPER Method :** Passer les features complexes à travers 7 lentilles pour les transformer en solutions élégantes

**Rationale IA :** Séquence fondation → exploration → affinement, adaptée à un projet existant à reprendre proprement avec des features à simplifier.

---

## Technique 1 — First Principles Thinking

**[Fondation #1]** : La Vérité d'Eau
_Concept_: L'app est d'abord un système de vérité partagée — tout le monde voit la même liste, le même ordre, les mêmes changements en temps réel. Plus de "mauvaise liste partagée sur le groupe".
_Novelty_: Ce n'est pas une app de planning, c'est une app qui synchronise la réalité du groupe pendant l'événement.

**[Fondation #2]** : Le Fil d'Ariane
_Concept_: Traçabilité vivante — qui est où, qui a validé quoi, le tracé type Strava à la fin. La mémoire collective de l'arrathon.
_Novelty_: L'arrathon a une identité narrative — pas juste des coordonnées GPS mais une histoire avec des scores, des pénalités de triche, des temps par arrondissement.

**[Fondation #3]** : L'Anti-Chaos Financier
_Concept_: Prévision + comptabilisation des frais avant et pendant l'arrathon. Qui participe à quelle tranche ? Quels frais s'appliquent à qui ?
_Novelty_: Le Tricount intégré avec la structure de l'arrathon — les frais d'un ravital chez Bob ne concernent que ceux qui sont passés chez Bob.

**[Fondation #4]** : Le Paradoxe de la Localisation
_Concept_: La géolocalisation ne supprime pas le chaos — elle donne la confiance pour l'embrasser. Savoir où est le groupe permet de s'éloigner explorer sans angoisser d'être perdu pour de vrai.
_Novelty_: L'app ne résout pas la perte — elle transforme "perdu avec anxiété" en "séparé avec sérénité".

**[Fondation #5]** : Le MVP comme Couteau Suisse Minimal
_Concept_: 5 piliers non-négociables. Sans un seul d'eux, l'app échoue son job le jour J.
_Novelty_: La complexité de la description initiale se réduit à 5 primitives — tout le reste est une extension.

**[Fondation #6]** : La Hiérarchie des Primitives
_Concept_: Pilier 0 est l'identité du groupe. Piliers 1-3 sont l'expérience live. Les paiements sont un confort, pas une survie.
_Novelty_: En retirant les paiements du MVP strict, on libère de la complexité technique significative pour la v1.

### MVP consolidé

| Priorité | Pilier | Statut |
|---|---|---|
| 0 | Gestion des participants (créer, inviter, rôles orga/participant) | Sine qua non |
| 1 | Liste des lieux synchronisée (type unique : bar/appart/monument/ravitail) | Sine qua non |
| 2 | Géoloc du groupe | Sine qua non |
| 3 | Validation des lieux + notifications | Sine qua non |
| 4 | Paiements partagés | Phase 1.5 ou 2 |

---

## Technique 2 — Question Storming

### Questions générées

**Temps & scoring :**
- Comment on compte le temps du arrathon ? des lieux ?
- Comment on score ? on pénalise ? Est-ce qu'on félicite certaines actions ?
- Un participant qui fait la moitié peut-il quand même apparaître dans le classement final ?
- Comment on gère quelqu'un qui fait 20→10 et quelqu'un qui fait 10→1 — sont-ils en compétition ?

**Progression & gouvernance :**
- Comment on définit qu'on passe à l'étape suivante ?
- Si l'organisateur est parti, est-ce que l'on peut continuer ?
- Combien d'organisateurs minimum pour qu'un arrathon soit "sain" ?
- Un organisateur peut-il supprimer un participant en cours de route ?
- Que se passe-t-il si tous les organisateurs abandonnent l'arrathon ?
- Qui hérite des droits si l'organisateur principal est hors service ?

**Finances :**
- Comment on s'assure qu'il n'y a pas d'abus dans les dépenses ? des doublons ?
- Comment on gère le bon sens — un participant paye pour son frère ou son copain/copine ?
- Comment gérer une approximation des prix (ex. rhum déjà possédé avant le jour J) ?

**Participants & edge cases :**
- Est-ce qu'un participant peut être invité en dernière minute après le début de l'arrathon ?
- Que se passe-t-il si un joueur n'a plus de batterie mais qu'il fait bien le arrathon ?
- Que se passe-t-il si finalement il recharge sa batterie mais plus tard dans le jeu ?
- Un joueur ne veut pas autoriser le GPS, peut-il participer ?
- Un participant a eu un pb ne peut pas valider certains bars au milieu mais veut nous rejoindre — comment on compte ça ?

**Validation & preuve :**
- Doit-on valider qu'un bar/lieu a été validé avec preuve photo ? vidéo ? ou on fait confiance ?
- Comment valide-t-on qu'un lieu a été atteint sans GPS précis en intérieur ?

**Lieux & carte :**
- Qui peut proposer un nouveau lieu pendant l'arrathon — tout le monde ou seulement les organisateurs ?
- Un appartement ravital doit-il être confirmé à l'avance ou peut-il être improvisé ?
- Comment on gère un lieu qui change d'adresse ou de nom entre la planification et le jour J ?
- Quelle limite de joueurs affichés sur une carte ?
- Comment on délimite les zones où l'on va ?
- Quel système de localisation utiliser ?

**Sous-arrathon / modularité :**
- Comment définit-on précisément un "semi-arrathon" — par nombre de lieux, par arrondissements, par durée ?
- Comment on définit le début officiel d'un arrathon ?

**Exportabilité / scale :**
- L'arrathon hors Paris — comment on remplace la contrainte "arrondissement dans l'ordre" ?
- Est-ce que l'app doit gérer plusieurs arrathons simultanés pour des groupes différents ?
- Un arrathon peut-il être public — visible et rejoignable par des inconnus ?

**Social / fun :**
- Est-ce qu'on partage les résultats à l'extérieur — type résumé Instagram-able ?
- Les photos ont-elles un intérêt dans l'app ou c'est laissé à Messenger ?
- Qui voit les pénalités d'un joueur — tout le monde ou seulement les organisateurs ?

---

## Technique 3 — SCAMPER Method

**[SCAMPER #1]** : Organisateur Intérimaire → Supprimé
_Concept_: Remplacé par N organisateurs nommés dès la création. Si tous les orgas sont HS → mode lecture seule, l'arrathon continue sur le plan prévu sans modification possible.
_Novelty_: Zéro infrastructure de détection/vote. La prévention (plusieurs orgas) vaut mieux que la gestion de crise.

**[SCAMPER #2]** : Sous-équipes / Leader → Supprimé
_Concept_: Les deux vrais besoins sous-jacents résolus séparément — filtre map individuel (je suis juste mes 3 potes) + validation autonome naturelle (chacun valide les lieux lui-même, l'app ne "sait" pas que tu t'es séparé).
_Novelty_: Zéro concept de "sous-équipe" dans le modèle de données. Deux features légères remplacent un système complexe.

**[SCAMPER #3]** : Paiements — 3 couches contextuelles
_Concept_: (1) Pack de départ optionnel/obligatoire (dossard, écocup...), (2) coûts fixes par lieu automatiquement attribués si tu y passes, (3) dépenses dynamiques déclarées en live par n'importe quel participant. Calcul in-app "qui doit quoi à qui" + contact direct. Deadline de remboursement fixée par l'orga.
_Novelty_: Les frais sont contextuels au parcours — tu n'as pas payé le ravital si tu n'y es pas passé. Différence fondamentale avec Tricount.

---

## Organisation & Priorisation

### Thèmes identifiés

**Thème 1 — Identité & Participants** *(le "qui")*
- Création d'arrathon avec N organisateurs dès le départ
- Inviter des participants (lien, QR code)
- Rejoindre en cours de route (mid-arrathon)
- Participation partielle déclarée (je commence au bar 10)
- Abandon + retour possible
- Mode lecture seule si tous les orgas sont HS

**Thème 2 — Parcours & Lieux** *(le "quoi/où")*
- Liste synchronisée en temps réel (type unique : bar / appart / monument / ravitail)
- Ordonnancement par les orgas
- Finalisation d'un lieu = bouton orga → notification groupe → lieu suivant actif
- Gestion des changements de lieu en live (remplacement si fermé)
- Lieux avec coûts fixes associés
- Appartement avec infos propriétaire + description

**Thème 3 — Expérience Live** *(le "pendant")*
- Géoloc de tous les participants sur la carte
- Filtre map individuel (je suis juste mes 3 potes)
- Validation de lieu par géolocalisation
- Notifications push pour chaque étape
- Validation autonome si séparé du groupe
- Gestion batterie morte → reconnexion en cours de route

**Thème 4 — Gamification & Scoring** *(le "fun")*
- Score individuel basé sur les lieux validés
- Pénalités (lieux loupés, triche de transport, abandon)
- Temps par lieu + temps total
- Tracé Strava-like à la fin
- Classement final

**Thème 5 — Finances** *(le "combien")*
- Pack de départ optionnel/obligatoire
- Coûts fixes par lieu (attribués automatiquement si passage)
- Dépenses dynamiques déclarées en live
- Calcul in-app "qui doit quoi à qui" + numéro de contact
- Deadline de remboursement fixée par l'orga

**Thème 6 — Mémoire & Social** *(le "après")*
- Résumé final partageable : tracé, scores, classement
- Photos géolocalisées *(Phase 2)*
- Export / partage externe *(Phase 2)*

---

### Roadmap par phases

**Phase 0 — MVP : "Ça marche le jour J"**
> L'app a de la valeur sans rien d'autre

- Création d'arrathon + gestion des participants (invitations, rôles orga/participant)
- Liste des lieux synchronisée en temps réel (tous types confondus)
- Finalisation d'un lieu par l'orga → notification → lieu suivant actif
- Géolocalisation du groupe sur la carte
- Validation de lieu par géoloc
- Rejoindre en cours de route + participation partielle + abandon

**Phase 1 — "C'est vraiment fun maintenant"**
> L'app devient une expérience, pas juste un outil

- Gamification : scores, pénalités, temps par lieu, tracé Strava-like, classement final
- Résumé final partageable (Instagram-able)
- Finances : pack de départ + coûts fixes par lieu + dépenses dynamiques + calcul in-app
- Filtre map individuel
- Mode lecture seule si tous les orgas sont HS
- Gestion batterie morte / reconnexion

**Phase 2 — "Polish & fiabilité"**
> Une fois qu'on a de vrais utilisateurs

- Disputes financières + justificatifs
- Photos géolocalisées
- Auto-validation par timer si orgas HS

**Phase 3 — "Scale"**
> Après validation du concept

- Arrathon hors Paris (système de quartiers)
- Arrathon public / rejoignable par des inconnus

---

### Décisions actées

| Feature | Décision | Raison |
|---|---|---|
| Organisateur intérimaire | ❌ Supprimé | Remplacé par N orgas dès le départ + lecture seule |
| Sous-équipes / leader | ❌ Supprimé | Filtre map + validation autonome suffisent |
| Export Tricount | ⏳ Phase 2 | Calcul in-app suffit pour v1 |
| Auto-validation par timer | ⏳ Phase 2 | Edge case rare, pas de valeur MVP |
| Arrathon hors Paris | ⏳ Phase 3 | Scale post-validation |
| Arrathon public | ⏳ Phase 3 | Scale post-validation |

---

## Session Summary

**Techniques utilisées :** First Principles Thinking → Question Storming → SCAMPER Method

**Breakthroughs clés :**
1. L'app est un **système de vérité partagée**, pas un outil de planning — la distinction change toute l'architecture.
2. La géoloc ne résout pas le chaos — elle donne la **confiance pour l'embrasser** (séparé avec sérénité vs perdu avec anxiété).
3. 3 features "shit" transformées : organisateur intérimaire et sous-équipes supprimés, paiements clarifiés en 3 couches simples.
4. Le MVP tient en **4 piliers** : participants → lieux → géoloc → validation+notifications. Les paiements et la gamification attendent la Phase 1.

**Questions ouvertes à résoudre en Phase 1 :**
- Algorithme de scoring exact (temps, pénalités, pondération)
- Précision GPS en intérieur (bar, appartement) — confiance ou validation manuelle ?
- Limite de participants visibles sur la carte en simultané
- Définition exacte du "semi-arrathon"
