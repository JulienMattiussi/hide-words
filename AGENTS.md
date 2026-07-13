# hidden-word

Application **100% front-end** : on cache **deux codes** dans une même **grande
grille de lettres**. Chaque code est un message rendu en pixel-art (bitmap) ;
ses cases (le tracé) sont remplies par une **clé** de lettres. Le bruit
(lettres aléatoires du fond) exclut toutes les lettres des clés, si bien que
révéler un code revient à **noircir toutes les lettres de sa clé** : la forme
apparaît. Interface en **français**. Partage la stack et les conventions de
`mix-my-names`.

Le point clé : les deux clés sont **disjointes sauf 2 lettres communes**. Les
tracés sont positionnés en décalé pour se croiser le moins possible ; aux
**intersections** (cases appartenant aux deux tracés) on place une des 2 lettres
partagées. Ainsi noircir la clé 1 ne révèle que le code 1 (et inversement), les
deux révélations restant indépendantes.

---

## Stack technique

| Outil | Usage |
|---|---|
| React 19 + TypeScript | UI |
| Vite | Build / dev server (port **1515**) |
| Tailwind CSS v4 | Styles (via `@tailwindcss/vite`, pas de config JS) |
| Vitest + Testing Library | Tests unitaires et composants |
| Prettier | Formatage |
| ESLint (typescript-eslint) | Linting |
| Knip | Détection des fichiers / exports / dépendances inutilisés |

---

## Arborescence

```
src/
├── lib/                      # Logique pure, zéro React (entièrement testée)
│   ├── text.ts               # normalizeLetters / normalizeTextLines
│   ├── font.ts               # Fonte bitmap 5x9 (A-Z, a-z, 0-9, accents français)
│   ├── pattern.ts            # wordToPattern (une ligne) + textToPattern (multiligne)
│   ├── keys.ts               # analyzeKeys : valide la combinaison des 2 clés
│   ├── layout.ts             # bestOffset + placeMasks : décalage et composition
│   ├── rng.ts                # createRng : générateur pseudo-aléatoire à seed
│   └── grid.ts               # buildGrid : compose les 2 codes + remplit le fond
├── GridView.tsx              # Rendu de la grille (2 couleurs en mode révélé)
├── App.tsx                   # UI (panneau d'options)
├── main.tsx                  # Point d'entrée
├── index.css                 # Import Tailwind + reset minimal
└── vite-env.d.ts             # Types Vite
public/
└── favicon.svg               # Favicon
tests/
├── setup.ts                  # Setup Testing Library (jest-dom)
├── unit/                     # Vitest - logique pure (text, font, pattern, grid)
└── component/                # Vitest + Testing Library (App)
```

---

## Le concept, en détail

- **Fonte bitmap** (`src/lib/font.ts`) : chaque caractère est une matrice
  **5x9** (`#`/`.`). Les 2 rangées du haut sont la zone des diacritiques, les 7
  du bas le corps. Les lettres accentuées sont **composées** (corps de la lettre
  de base + marque : aigu, grave, circonflexe, tréma) ; `ç`/`Ç` ont un corps
  dédié. Couvre A-Z, a-z, 0-9 et les accents français.
- **Motif** (`src/lib/pattern.ts`) : `wordToPattern` concatène les glyphes d'une
  ligne ; `textToPattern` empile les lignes (texte multiligne, lignes centrées)
  et renvoie une matrice de booléens (les cases « allumées » = le tracé).
- **Clés** (`src/lib/keys.ts`) : `analyzeKeys` normalise les deux clés, calcule
  lettres propres / partagées, et valide (exactement 2 partagées, chaque clé
  garde >= 1 lettre propre).
- **Placement** (`src/lib/layout.ts`) : `bestOffset` cherche le décalage qui
  minimise les intersections (fenêtre autour du centre, en gardant >= 1 croisement
  si possible) ; `placeMasks` peint les deux motifs dans un même canevas et
  renvoie les masques `primary` / `secondary`.
- **Grille** (`src/lib/grid.ts`) : `buildGrid` compose les deux masques, applique
  marge + orientation, puis remplit chaque case selon sa classe : intersection
  -> lettre partagée, code 1 seul -> lettre propre au code 1, code 2 seul ->
  propre au code 2, fond -> bruit dérivé (`noiseAlphabet`, exclut les lettres des
  clés). Chaque case : `{ char, primary, secondary }`. Le second code est ignoré
  si sa combinaison est invalide (`secondActive`).
- **Rendu** (`src/GridView.tsx`, `src/App.tsx`) : panneau (orientation, 2 codes
  message + clé, décalage auto/manuel, mode d'affichage, impressions) et grille.
  En mode révélé, code 1 et code 2 ont chacun leur couleur, les intersections une
  troisième.

---

## Contraintes techniques

- **100% front-end** : aucun appel serveur, pas de backend.
- **Pas de SSR** : Vite SPA. Ne pas introduire Next.js ou Remix.
- **Alias `@/`** pointe vers `src/`. Toujours l'utiliser pour les imports
  internes, jamais de chemins relatifs `../../`.
- **Tailwind v4** : `@import 'tailwindcss'` dans le CSS, pas de
  `tailwind.config.js`.
- **TypeScript strict** : `noUnusedLocals`, `noUnusedParameters`,
  `noUncheckedIndexedAccess` activés. Ne pas les désactiver.

---

## Règles de développement

### Structure
- `src/lib/` : logique pure, zéro import React.
- `src/App.tsx` : le React (état, UI, rendu).
- **Taille des fichiers** : viser < ~300 lignes ; au-delà, découper.

### Qualité du code
- **Factoriser, ne pas dupliquer** : extraire les helpers réutilisables.
- **Pas de code mort** : tout export doit être utilisé ou testé. `make knip`
  doit rester vert.
- **Commentaires utiles seulement** : expliquer le pourquoi / le non-évident ;
  ne jamais paraphraser le code.

### Tests
- **Logique pure entièrement testée** (`src/lib/`).
- **Tests de composants** sur les interactions clés via Testing Library.

### Accessibilité
- Tout cliquable est un bouton/lien avec libellé accessible ; champs avec label
  ou `aria-label` ; focus clavier visible ; ne jamais coder l'information par la
  seule couleur.

### Qualité (avant de considérer une tâche terminée)
- `make check` doit passer (build + lint + typecheck + knip + tests).

---

## Commandes (Makefile)

| Commande | Effet |
|---|---|
| `make install` | Installe les dépendances |
| `make start` | Serveur de dev (http://localhost:1515) |
| `make build` | Build de production |
| `make lint` | ESLint |
| `make knip` | Détecte fichiers / exports / dépendances inutilisés |
| `make format` | Formate avec Prettier |
| `make typecheck` | Vérifie les types |
| `make test` | Tests unitaires et composants |
| `make fix` | Format + lint |
| `make check` | build + lint + typecheck + knip + tests |

---

## Conventions globales du dépôt

- **Code en anglais** : commentaires, identifiants, noms de variables et de
  fonctions. Seules les valeurs affichées à l'utilisateur sont en français.
- **Commits** : pas de trailer `Co-Authored-By`. Auteur = le compte git de
  YavaDeus uniquement. Vaut aussi pour les descriptions de pull request.
- **Typographie** : ne jamais introduire de tiret long (em-dash ou en-dash) dans
  le code, les chaînes, les commentaires ou la doc. Utiliser un tiret ASCII `-`,
  deux-points, parenthèses, ou reformuler.
