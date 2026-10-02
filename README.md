<div align="center">

# hide-words

### Des codes cachés dans une grille de lettres.

[![hide-words](public/og.png)](https://hide-words.vercel.app)

**[hide-words.vercel.app](https://hide-words.vercel.app)**

![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38BDF8?logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-16A34A)

</div>

---

Un générateur de **grilles à message caché**. Écrivez jusqu'à **trois codes** :
chacun est dessiné en **pixel-art** au milieu d'une grande grille de lettres
aléatoires. À l'oeil nu, rien ne dépasse. Mais chaque code a sa **clé** : noircissez
toutes les lettres de la clé, et le message apparaît.

Les trois codes partagent la même grille et peuvent se croiser : révéler l'un ne
trahit jamais les autres. Imprimez la grille vierge pour jouer, puis les solutions
pour corriger.

100% front-end, aucun backend : tout se calcule dans le navigateur.

## Le principe

```
 Grille cachée                             Clé « HIDE » noircie

 J P C H P V A I Z E H I E H J I E         J P C █ P V A █ Z █ █ █ █ █ J █ █
 P G P I Z N F E C N F H Q X F I V         P G P █ Z N F █ C N F █ Q X F █ V
 M T Y I X X L E F B F H T Q Z I G         M T Y █ X X L █ F B F █ T Q Z █ G
 B G P I E H I E N N Q H B Y T I P   ->    B G P █ █ █ █ █ N N Q █ B Y T █ P
 G P N I C B K E U J L H P N C I B         G P N █ C B K █ U J L █ P N C █ B
 U L Z I J K K E G U V H L N L I L         U L Z █ J K K █ G U V █ L N L █ L
 X J K I T B J E X H I E H I J E H         X J K █ T B J █ X █ █ █ █ █ J █ █
```

Le bruit du fond **n'utilise aucune lettre des clés**. Le tracé d'un code n'est
fait **que** de lettres de sa clé. Résultat : noircir une clé révèle exactement
son tracé, rien de plus, rien de moins.

## Fonctionnalités

- **Jusqu'à trois codes** dans une même grille, chacun avec sa couleur en mode
  révélé (et une couleur dédiée pour les croisements).
- **Messages multilignes** : texte centré ligne par ligne, avec une fonte bitmap
  5x9 maison qui couvre A-Z, a-z, 0-9 et **tous les accents français**.
- **Clés automatiques** : un clic génère des clés minimales et valides, avec
  une lettre exclusive par zone de croisement.
- **Clés manuelles** validées en direct : l'appli signale tout de suite quelle
  combinaison de codes manque d'une lettre propre.
- **Placement automatique** des codes, décalés pour se croiser le moins possible,
  ou **réglage fin** au clavier (`dx` / `dy`).
- **Paysage ou portrait**, la grille s'adapte au format de la feuille.
- **Impression A4** : grille cachée, solution complète, ou solution d'un seul
  code, mise à l'échelle pour tenir sur une page.

## Comment ça marche

Chaque case de la grille appartient à un **sous-ensemble de codes** (une zone du
diagramme de Venn, stockée comme un masque de bits). La lettre d'une case de la
zone S doit apparaître dans **toutes** les clés de S, et dans **aucune** autre.
C'est cette règle qui garantit que les codes se révèlent indépendamment.

| Étape | Fichier | Rôle |
|---|---|---|
| **Fonte** | `src/lib/font.ts` | Glyphes 5x9, lettres accentuées composées (corps + diacritique). |
| **Motif** | `src/lib/pattern.ts` | Transforme un texte multiligne en matrice de pixels. |
| **Placement** | `src/lib/layout.ts` | Décale les motifs pour minimiser les croisements, puis compose les masques. |
| **Clés** | `src/lib/keys.ts` | Génère ou valide les clés, zone par zone. |
| **Grille** | `src/lib/grid.ts` | Remplit chaque case selon sa zone, et le fond avec un bruit sans lettre de clé. |

## Démarrage

```bash
make install   # installe les dépendances
make start     # serveur de dev sur http://localhost:1515
```

## Commandes

| Commande | Effet |
|---|---|
| `make start` | Serveur de dev (port 1515) |
| `make build` | Build de production |
| `make test` | Tests (Vitest + Testing Library) |
| `make check` | build + lint + typecheck + knip + tests |
| `make fix` | Format (Prettier) + lint (ESLint) |

Voir [AGENTS.md](AGENTS.md) pour l'arborescence et les conventions.

## Stack

React 19 - TypeScript (strict) - Vite - Tailwind CSS v4 - Vitest - ESLint -
Prettier - Knip.

## Licence

MIT - YavaDeus
