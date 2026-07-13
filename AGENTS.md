# hidden-word

Application **100% front-end** : on cache un mot dans une **grande grille de
lettres**. Les cases du tracé du mot sont noircies (mode révélé) et dessinent le
mot en pixel-art sur la grille ; le reste de la grille est du bruit (lettres
aléatoires). Interface en **français**. Partage la stack et les conventions de
`mix-my-names`.

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
│   ├── text.ts               # normalizeWord : garde lettres/accents/chiffres/casse
│   ├── font.ts               # Fonte bitmap 5x9 (A-Z, a-z, 0-9, accents français)
│   ├── pattern.ts            # wordToPattern : compose les glyphes en un motif
│   ├── rng.ts                # createRng : générateur pseudo-aléatoire à seed
│   └── grid.ts               # buildGrid : place le tracé + remplit le fond
├── App.tsx                   # UI (panneau d'options + rendu de la grille)
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
- **Motif** (`src/lib/pattern.ts`) : `wordToPattern` concatène les glyphes du
  mot (normalisé) avec une colonne d'espacement, et renvoie une matrice de
  booléens (les cases « allumées » = le tracé).
- **Grille** (`src/lib/grid.ts`) : `buildGrid` centre le motif dans une grille
  `cols x rows`. Les cases du tracé sont remplies par les **lettres du mot à
  cacher** (répétées, dans l'ordre de lecture) ; les autres cases reçoivent une
  lettre aléatoire (RNG à seed, reproductible). Chaque case : `{ char, on }`.
- **Rendu** (`src/App.tsx`) : panneau d'options (dimensions, mot à cacher,
  lettres du tracé, bascule caché/révélé, impression cachée/révélée) et grille.
  En mode révélé, les cases `on` sont noircies.

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
