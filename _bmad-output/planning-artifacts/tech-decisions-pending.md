# Pending Tech Decisions

## External Services Stack (Epic 5/6)

### Decision: Routing provider (ORS)

**Context:** OpenRouteService pour calculer les trajets piétons entre les lieux de l'arrathon.

**Options:**
- ORS Cloud API — gratuit jusqu'à 2000 req/jour
- ORS self-hosted IDF — ~€3/mois sur Hetzner (extrait OSM Île-de-France ~300MB, ~512MB RAM)

**Question ouverte:** Quel est le vrai use case du routing ?
- **Cas A** (groupe) — 1 calcul quand l'orga finalise une étape, même route pour tout le monde → ORS Cloud gratuit largement suffisant
- **Cas B** (individuel) — recalcul temps réel par personne perdue → volume élevé, ORS Cloud saturé en minutes → self-host nécessaire

**À décider avant Epic 5.** L'archi hexagonale (RoutingPort + ORSAdapter) permet de switcher sans impact domaine.

**Recommandation actuelle:** Partir sur ORS Cloud API gratuit, trancher Cas A vs B quand on implémente la carte live.

---

### Decision: Map rendering

**Choix retenu:** Mapbox (`@rnmapbox/maps`) pour le rendu carte React Native.
- Bon free tier (50k tile loads/mois)
- SDK React Native propre
- Compatible avec ORS pour les routes

**Clé API:** À ajouter dans `.env` avant Epic 5.

---

### Decision: Expired arrathons

Voir `x-2-expired-arrathons.md` — comportement non défini, à brainstormer avant d'implémenter.

---

## Architecture Notes

### Hexagonal — Ports externes prévus

```
PlaceSearchPort     ← GooglePlacesAdapter     (Epic 4)
RoutingPort         ← ORSAdapter              (Epic 5/6)
MapRenderingPort    ← Mapbox (mobile only)    (Epic 5)
PushNotifPort       ← ExpoNotificationsAdapter (Epic 6)
GeoLocationPort     ← ExpoLocationAdapter     (Epic 5)
```

Chaque adapter est interchangeable sans toucher au domaine.
