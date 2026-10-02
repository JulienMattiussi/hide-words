# hide-words

Application **100% front-end** : on cache **jusqu'à trois codes** dans une même
**grande grille de lettres**. Chaque code est un message rendu en pixel-art
(bitmap) ; ses cases (le tracé) sont remplies par une **clé** de lettres. Le
bruit (lettres aléatoires du fond) exclut toutes les lettres des clés, si bien
que révéler un code revient à **noircir toutes les lettres de sa clé** : la
forme apparaît. Interface en **français**. Partage la stack et les conventions
de `mix-my-names`.

Le point clé : chaque case appartient à un **sous-ensemble de codes** (une
région du diagramme de Venn, représentée par un masque de bits). La lettre d'une
case de région S doit être présente dans **toutes** les clés de S et dans
**aucune** autre. Cela garantit que noircir la clé i révèle exactement le tracé
du code i, indépendamment des autres. Les tracés sont positionnés en décalé pour
se croiser le moins possible ; les clés sont **auto-générées** (une lettre
exclusive par région occupée), ou **saisies manuellement** avec validation.

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
│   ├── keys.ts               # regionLetters / validateKeys / autoKeys : clés par région
│   ├── layout.ts             # autoOffsets + composeMasks : décalages et composition
│   ├── rng.ts                # createRng : générateur pseudo-aléatoire à seed
│   └── grid.ts               # buildGrid : compose les codes + remplit le fond
├── GridView.tsx              # Rendu de la grille (une couleur par code en mode révélé)
├── Segmented.tsx             # Sélecteur segmenté (groupe de boutons aria-pressed)
├── App.tsx                   # UI (panneau d'options)
├── main.tsx                  # Point d'entrée
├── index.css                 # Import Tailwind + reset minimal
└── vite-env.d.ts             # Types Vite
public/
├── favicon.svg               # Favicon
└── og.png                    # Image Open Graph (1200x630)
tests/
├── setup.ts                  # Setup Testing Library (jest-dom)
├── unit/                     # Vitest - logique pure (text, font, pattern, keys, layout, grid)
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
- **Clés** (`src/lib/keys.ts`) : une région est un masque de bits (bit i = code
  i). `regionLetters` renvoie les lettres présentes dans toutes les clés de la
  région et dans aucune autre ; `validateKeys` exige au moins une telle lettre
  pour chaque région occupée ; `autoKeys` attribue une lettre exclusive par
  région (régions simples d'abord), puis complète les clés propres jusqu'à 4
  lettres.
- **Placement** (`src/lib/layout.ts`) : `autoOffsets` place chaque code à tour de
  rôle, en cherchant dans une fenêtre autour du centre le décalage qui minimise
  le recouvrement avec les tracés déjà posés (en gardant >= 1 croisement si
  possible) ; `composeMasks` peint tous les motifs dans un même canevas et
  renvoie un masque par code.
- **Grille** (`src/lib/grid.ts`) : `buildGrid` calcule le masque de région de
  chaque case, valide les clés saisies (à défaut, le message sert de clé) et
  bascule sur les clés auto-générées si la combinaison est invalide. Il applique
  ensuite marge + orientation, puis remplit chaque case : région -> lettres de
  `regionLetters` en rotation, fond -> bruit (`noiseAlphabet`, exclut les
  lettres des clés). Chaque case : `{ char, mask }`.
- **Rendu** (`src/GridView.tsx`, `src/App.tsx`) : panneau (nombre de codes 1 à
  3, orientation, message + clé + décalage dx/dy par code, génération des clés,
  placement automatique, affichage par code, impressions grille / solutions /
  code seul) et grille. En mode révélé, chaque code a sa couleur (bleu, rouge,
  ambre), les intersections une couleur commune (violet).

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
