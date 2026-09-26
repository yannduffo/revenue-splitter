# Indexer dev notes

- All ERC20 transfers on 320 blocks : 26_832


## Architecture choice 

Procédure de choix de l'architecture de l'indexer entre : 
- A : full ponder -> pas raisonnable : récupérer tous les Transfer ERC20 pour avoir de l'utilité pour seulement une poignée n'est pas efficace
- B : hybride ponder + viem worker (pas très intéressant car ponder fait la partie "facile")
- C : full custom viem worker

### Plan d'action C : 

Plan d'action (option C)

  1. Test décisif (~15 min). Un script viem qui lance getLogs avec Transfer et topic2 = [SPLITTER_A, SPLITTER_B] sur 10
     000 blocs chez Infura. Il faut vérifier que le OU fonctionne, mesurer la latence et chercher une limite
     éventuelle sur la taille du tableau (il faudra peut-être découper en lots, par exemple de 500 adresses). Je ne
     connais pas la limite d'Infura, c'est à mesurer.
  2. Schéma Postgres (db/schema.sql) :
     - splitters + splitter_members (membres et parts, déjà dans l'événement) ;
     - deposits et claims, clé (tx_hash, log_index), plus block_number et block_time ;
     - checkpoints (bloc + hash de chaque fin de plage) : curseur = MAX(block_number), sert aussi aux reorgs.
     - Pas de migrations : changement de schéma = reset + resync (quelques secondes).
  3. Boucle du worker, un tick toutes les 12 s, sur la plage [curseur+1, tête−N] :
     - (a) Lire les SplitterCreated de la plage → liste des splitters à jour.
     - (b) Transfer (topic2 = splitters) et Claimed (address = splitters) sur LA MÊME plage, par lots de 500 adresses.
     - Écrire les lignes et le checkpoint dans une seule transaction, avec ON CONFLICT DO NOTHING.
     - Pas de backfill par splitter : un splitter créé au bloc c est interrogé dès c, tout avance avec un seul curseur.
       Le rattrapage initial, c'est la même boucle en fenêtres de 10k.
     - block_time : Infura ne renvoie pas blockTimestamp → un getBlock par bloc distinct contenant des logs.
  4. Reorgs. Rester quelques blocs derrière la tête (N ≈ 5 à 12) et comparer le hash stocké du dernier bloc. En cas de divergence,
     supprimer les lignes au-delà de la divergence et reculer le curseur. Ça fait environ 30 lignes. N'attends pas le bloc finalized : avec
     environ 15 min de retard, la démo « j'envoie un token et il apparaît » ne marcherait plus. Les soldes, eux, restent en direct puisque
     ce sont des appels de vue.
  5. Petite API (Hono) avec des routes qui correspondent une à une à tes fonctions :
  | Route                                   | Remplace                          |
  |-----------------------------------------|-----------------------------------|
  | /splitters                              | listSplitters et getSplitterBlock |
  | /splitters/:addr/tokens                 | discoverTokens                    |
  | /splitters/:addr/history                | getHistory                        |
  | /splitters/:addr/claimed?token=|member= | la partie Claimed de balance.ts   |

  6. Bascule côté web. Réécrire ces 4 fichiers de lib/chain/, puis retirer le cache getLogs du proxy /api/rpc. Les hooks et les composants
     ne bougent pas.
  7. Déploiement. Ajouter postgres et worker au docker-compose.yml existant.

### étape 1 :

|Test|Question|Consequence|
|----|-----|----|
| T1 | Infura renvoie-t-il le même résultat pour to: [A, B] (OU) que pour deux requêtes séparées ? | Si c'est non, l'option C ne tient pas |
| T2 | Combien coûte un balayage complet factory → tête en une seule requête OU par fenêtre ? | Le temps du backfill initial |
| T3 | À partir de combien d'adresses dans le tableau Infura refuse-t-il ou tronque-t-il ? | La taille des lots dans le worker |
| T4 | Claimed fonctionne-t-il avec address: [A, B] ? | Si le même mécanisme couvre tous les événements |
| T5 | Quel écart entre latest, safe et finalized sur Sepolia ? | Le choix de N pour les reorgs |

**Résultats** : 
- T1 : le OU sur topic2 renvoie exactement la même chose que les requêtes séparées. Aucun ERC-721 (topics=3
  partout).
- T2 : l'historique complet se reconstruit en 11 appels et ~1,6 s de requêtes réelles (le reste, c'est la pause que
  le script ajoute exprès). Aujourd'hui, le web paie ce coût à chaque visite, pour chaque splitter et chaque type de
  requête.
- T3 : la limite d'Infura se situe entre 1 000 et 2 000 adresses. Le worker enverra ses adresses par lots de 500, ce
  qui laisse une marge confortable.
- T4 : address: [A, B] fonctionne pour Claimed. Le même mécanisme couvre donc les 3 événements.
- T5 : finalized a 86 blocs de retard (environ 17 min), trop pour la démo. On confirme donc un petit retard sur la
  tête, avec vérification du hash.
