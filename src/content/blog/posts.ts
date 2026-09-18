import levisHero from "@/assets/blog/levis-vintage-hero.jpg";
import taillesHeroAsset from "@/assets/blog/hero-guide-tailles-vintage.jpg.asset.json";
import entretienHeroAsset from "@/assets/blog/hero-entretien-cuir-denim.jpg.asset.json";
import cartesHero from "@/assets/blog/cartes-pokemon-etat-rarete-hero.jpg";
import authentifierHero from "@/assets/blog/authentifier-carte-pokemon-hero.jpg";
import popCultureHeroAsset from "@/assets/blog/hero-objets-valeur-pop-culture.jpg.asset.json";

export type BlogContentBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "quote"; text: string }
  | { type: "glossary"; entries: GlossaryEntry[] };

export interface GlossaryEntry {
  term: string;
  abbreviation: string;
  description: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  category: "Mode & Maroquinerie" | "Pop Culture & TCG";
  publishedAt: string;
  readingTime: string;
  excerpt: string;
  heroImage: string;
  heroAlt: string;
  content: BlogContentBlock[];
}

export const blogPosts: BlogPost[] = [
  {
    slug: "comment-reconnaitre-vraie-piece-vintage-levis",
    title: "Comment reconnaître une vraie pièce vintage Levi's",
    category: "Mode & Maroquinerie",
    publishedAt: "2026-09-18",
    readingTime: "4 min de lecture",
    excerpt:
      "Les repères essentiels pour vérifier une pièce Levi's vintage : étiquette, coutures, tissu, boutons et annonces douteuses.",
    heroImage: levisHero,
    heroAlt: "Veste en jean vintage sur cintre dans une lumière chaude",
    content: [
      { type: "heading", text: "Commencer par l'étiquette" },
      {
        type: "paragraph",
        text: "Sur une pièce Levi's vintage, l'étiquette donne souvent les premiers indices. Le fameux Big E, avec un E majuscule sur la petite étiquette rouge, renvoie aux productions antérieures au milieu des années 70. Sa présence ne suffit pas à elle seule à authentifier une pièce, mais son absence ou sa forme permet déjà de situer l'époque probable.",
      },
      {
        type: "paragraph",
        text: "Le numéro RN peut aussi aider à lire l'étiquette, tout comme la mention « Made in USA ». Cette mention, longtemps associée à certaines productions historiques, disparaît progressivement vers les années 90. Si une annonce présente une pièce comme très ancienne tout en montrant une étiquette incohérente avec cette période, il faut ralentir l'achat et demander plus de photos.",
      },
      { type: "heading", text: "Coutures et tissu" },
      {
        type: "paragraph",
        text: "Le tissu et les coutures racontent beaucoup. Sur certains jeans anciens, le selvedge est un détail important : on le reconnaît généralement au bord fini visible à l'intérieur de la jambe. Ce n'est pas un certificat d'authenticité absolu, mais c'est un indice cohérent avec certaines périodes et certaines gammes.",
      },
      {
        type: "paragraph",
        text: "Les coutures doivent aussi être observées de près. Une vraie pièce vintage garde souvent des irrégularités, une patine et une densité de toile qui ne ressemblent pas toujours aux finitions très propres d'une réédition récente. Les zones d'usure, les ourlets et les réparations éventuelles doivent rester logiques avec l'âge annoncé.",
      },
      { type: "heading", text: "Boutons" },
      {
        type: "paragraph",
        text: "Les boutons sont un autre point de contrôle. Un marquage en creux, un métal cohérent avec l'époque et un laiton qui a vécu peuvent confirmer l'impression générale. À l'inverse, des boutons trop neufs, trop brillants ou mal assortis au reste de la pièce peuvent signaler une réparation récente ou une reconstitution.",
      },
      { type: "heading", text: "Ce qui peut clocher sur une annonce" },
      {
        type: "paragraph",
        text: "Le piège le plus courant reste la réédition vendue comme vintage. Certaines rééditions reprennent les codes historiques de Levi's et peuvent être de très belles pièces, mais elles ne doivent pas être présentées comme des originaux d'époque. Le prix, la description et les photos doivent être alignés avec cette réalité.",
      },
      {
        type: "paragraph",
        text: "Il faut aussi se méfier des pièces reconstituées : étiquette ancienne sur vêtement plus récent, boutons changés, patch remplacé, ou assemblage de plusieurs éléments. Avant d'accepter une annonce, demande des photos nettes de l'étiquette, des boutons, des coutures intérieures, du patch et des zones d'usure. Une vraie bonne annonce vintage supporte toujours les gros plans.",
      },
    ],
  },
  {
    slug: "guide-tailles-vintage-m-annees-80",
    title: "Guide des tailles vintage : pourquoi un \"M\" des années 80 n'est pas un \"M\" d'aujourd'hui",
    category: "Mode & Maroquinerie",
    publishedAt: "2026-09-18",
    readingTime: "3 min de lecture",
    excerpt:
      "Vanity sizing, standards FR/UK/US différents et trois mesures à demander avant d'accepter.",
    heroImage: taillesHeroAsset.url,
    heroAlt: "Buste de couture mesuré au mètre-ruban pour guider les tailles vintage",
    content: [
      { type: "heading", text: "Pourquoi un M vintage peut tailler différemment" },
      {
        type: "paragraph",
        text: "Un « M » des années 80 n'est pas forcément un « M » d'aujourd'hui. Les coupes ont changé, les standards de taille aussi, et le vanity sizing a déplacé les repères : une taille affichée peut sembler plus flatteuse qu'elle ne l'aurait été à une autre époque. Résultat, l'étiquette seule ne suffit jamais pour acheter une pièce vintage.",
      },
      {
        type: "paragraph",
        text: "Les différences entre standards français, britanniques et américains ajoutent encore de la confusion. Une veste, une chemise ou un blouson peut avoir été produit pour un marché précis, avec des correspondances qui ne parlent plus vraiment aux acheteurs actuels. Même deux pièces portant la même taille peuvent tomber très différemment selon la décennie, la marque et la coupe.",
      },
      { type: "heading", text: "Les trois mesures à demander avant d'accepter" },
      {
        type: "paragraph",
        text: "Avant d'accepter une pièce vintage, demande trois mesures simples. La première est le tour de poitrine à plat doublé : le vendeur mesure la largeur sous les aisselles, vêtement posé à plat, puis multiplie par deux. C'est souvent la mesure la plus utile pour savoir si une veste, une chemise ou un sweat pourra fermer correctement.",
      },
      {
        type: "paragraph",
        text: "La deuxième mesure est l'épaule à épaule. Elle permet de comprendre la carrure réelle de la pièce, surtout sur les vestes, blazers, manteaux et chemises structurées. La troisième est la manche, mesurée de l'épaule à la couture. Cette mesure évite les mauvaises surprises sur les pièces anciennes dont les manches peuvent être plus courtes que les standards actuels.",
      },
      {
        type: "paragraph",
        text: "Avec ces trois mesures, tu ne dépends plus seulement d'une lettre sur une étiquette. Tu peux comparer avec un vêtement qui te va déjà bien et décider plus sereinement. Dans le vintage, la bonne taille est moins une taille affichée qu'un ensemble de mesures vérifiables.",
      },
    ],
  },
  {
    slug: "entretenir-cuir-denim-vintage",
    title: "Comment entretenir et faire durer une pièce en cuir ou en denim vintage",
    category: "Mode & Maroquinerie",
    publishedAt: "2026-09-18",
    readingTime: "4 min de lecture",
    excerpt:
      "Les bons gestes pour le cuir, le denim, le rangement et les réparations raisonnables.",
    heroImage: entretienHeroAsset.url,
    heroAlt: "Blouson en cuir vintage sur mannequin dans une boutique de vêtements anciens",
    content: [
      { type: "heading", text: "Cuir" },
      {
        type: "paragraph",
        text: "Une pièce en cuir vintage se traite avec douceur. Le premier geste consiste à retirer la poussière avec un chiffon légèrement humide, sans détremper la matière. Le cuir n'aime ni l'excès d'eau, ni les nettoyages agressifs. Si la pièce est ancienne, il vaut mieux faire peu, mais bien.",
      },
      {
        type: "paragraph",
        text: "Un baume adapté peut être appliqué une à deux fois par an, selon l'état du cuir. Il nourrit la matière et limite le dessèchement. En revanche, il faut éviter les produits au silicone, qui peuvent donner un effet brillant artificiel et étouffer le cuir. Il faut aussi éviter la chaleur directe : radiateur, sèche-cheveux, soleil brûlant ou coffre de voiture en été.",
      },
      { type: "heading", text: "Denim" },
      {
        type: "paragraph",
        text: "Le denim vintage se lave rarement. Un lavage trop fréquent fatigue la toile, délave la couleur et accélère l'usure des fibres. Quand le lavage devient nécessaire, il vaut mieux utiliser de l'eau froide, retourner la pièce et choisir un cycle doux. Le sèche-linge est à éviter : il peut rétrécir, casser les fibres et marquer les zones déjà fragilisées.",
      },
      {
        type: "paragraph",
        text: "Entre deux lavages, l'aération suffit souvent. Un jean, une veste ou une chemise en denim peut retrouver de la fraîcheur simplement en étant suspendu quelques heures dans un endroit sec et ventilé. L'objectif n'est pas de figer la pièce, mais de préserver sa patine sans l'user inutilement.",
      },
      { type: "heading", text: "Rangement" },
      {
        type: "paragraph",
        text: "Le rangement joue un rôle important dans la durée de vie d'une pièce vintage. La lumière directe peut ternir les couleurs et assécher certaines matières. L'humidité, elle, favorise les odeurs, les taches et parfois les moisissures. Une pièce vintage se conserve mieux dans un endroit sec, à l'abri du soleil, avec assez d'espace pour respirer.",
      },
      { type: "heading", text: "Réparer jusqu'à un certain point" },
      {
        type: "paragraph",
        text: "Réparer fait partie de la vie d'une pièce ancienne. Un bouton remplacé, une couture reprise ou une petite déchirure consolidée peuvent prolonger son usage sans lui retirer son intérêt. Mais il existe un point où la réparation change la nature de la pièce : trop de parties remplacées, une coupe transformée ou des éléments incohérents peuvent faire perdre de la valeur.",
      },
      {
        type: "paragraph",
        text: "Avant d'acheter, il faut donc regarder ce qui est usé, ce qui est réparable et ce qui fait partie du charme de l'objet. Une belle pièce vintage n'est pas forcément parfaite. Elle doit surtout être saine, portable et cohérente avec son histoire.",
      },
    ],
  },
  {
    slug: "cartes-pokemon-etat-rarete",
    title: "Cartes Pokémon : comment vérifier l'état et la rareté avant d'acheter",
    category: "Pop Culture & TCG",
    publishedAt: "2026-09-18",
    readingTime: "5 min de lecture",
    excerpt:
      "Symboles de rareté, édition, extension, année d'impression et état visible sur photo.",
    heroImage: cartesHero,
    heroAlt: "Cartes de collection sous protection avec une loupe sur une table",
    content: [
      { type: "heading", text: "Symboles de rareté" },
      {
        type: "paragraph",
        text: "Avant d'acheter une carte Pokémon, commence par regarder son symbole de rareté. Il se trouve généralement en bas de la carte. Le cercle indique une carte commune, le losange une carte peu commune, et l'étoile une carte rare. Certaines cartes rares existent aussi en version holographique, ce qui peut modifier fortement l'intérêt de la carte selon l'édition, l'état et la demande.",
      },
      { type: "heading", text: "Édition" },
      {
        type: "paragraph",
        text: "L'édition est un autre repère majeur. La mention 1st Edition attire souvent l'attention, mais elle doit être vérifiée avec soin : emplacement du logo, cohérence avec la langue, l'année, le set et l'apparence générale. Pour certaines cartes anciennes, la notion de Shadowless peut aussi entrer en jeu. Elle désigne des cartes sans l'ombre portée autour de l'illustration, selon les séries concernées.",
      },
      {
        type: "paragraph",
        text: "Ces détails ne doivent jamais être lus isolément. Une carte annoncée comme 1st Edition ou Shadowless doit montrer des photos assez nettes pour vérifier la typographie, les bordures, le symbole d'extension et les informations imprimées en bas de carte.",
      },
      { type: "heading", text: "Symbole d'extension et année d'impression" },
      {
        type: "paragraph",
        text: "Le symbole d'extension permet d'identifier la série à laquelle appartient la carte. Il doit correspondre au visuel, à la langue et à l'année d'impression. L'année, imprimée en bas de carte, donne un repère utile, mais elle ne suffit pas à elle seule à prouver la rareté ou la valeur.",
      },
      {
        type: "paragraph",
        text: "Une annonce sérieuse doit permettre de croiser ces informations. Si le symbole d'extension, l'année ou la rareté annoncée ne correspondent pas au reste de la carte, mieux vaut demander une photo supplémentaire ou passer son tour.",
      },
      { type: "heading", text: "État sur photo" },
      {
        type: "paragraph",
        text: "L'état se juge d'abord sur les photos. Les coins doivent être observés de près : blanchiment, pli, choc ou arrondi excessif peuvent faire baisser la valeur. Le centrage compte aussi, surtout pour les cartes recherchées. Une carte mal centrée peut rester désirable, mais elle ne se valorise pas de la même façon qu'un exemplaire bien équilibré.",
      },
      {
        type: "paragraph",
        text: "Sur une carte holographique, la brillance de l'hologramme mérite une attention particulière. Rayures, micro-rayures, traces ou voile terne peuvent être difficiles à voir sur une seule photo. Les bords, le dos de la carte et la surface doivent donc être montrés clairement. Pour une carte chère, une annonce sans photos détaillées est rarement suffisante.",
      },
      { type: "heading", text: "Glossaire de l'état" },
      {
        type: "paragraph",
        text: "Les vendeurs utilisent souvent des abréviations pour décrire l'état d'une carte. Elles ne remplacent pas les photos, mais elles donnent une première grille de lecture.",
      },
      {
        type: "glossary",
        entries: [
          { term: "Mint", abbreviation: "M", description: "Carte dans un état quasiment parfait, sans défaut visible important. C'est un niveau très exigeant, rarement garanti uniquement avec quelques photos." },
          { term: "Near Mint", abbreviation: "NM", description: "Carte très propre, avec seulement de très légères traces possibles. Les coins, les bords et la surface doivent rester excellents." },
          { term: "Excellent", abbreviation: "EX", description: "Très bon état général, avec une usure légère mais visible si l'on regarde attentivement les bords, les coins ou la surface." },
          { term: "Good", abbreviation: "GD", description: "Bon état de collection courante, mais avec des marques visibles : petits défauts, blanchiment, rayures ou coins légèrement fatigués." },
          { term: "Lightly Played", abbreviation: "LP", description: "Carte légèrement jouée, qui présente des traces d'utilisation nettes mais reste agréable à posséder et à manipuler." },
          { term: "Played", abbreviation: "PL", description: "Carte jouée, avec une usure marquée. Elle peut rester intéressante pour compléter une collection, mais son état pèse fortement sur sa valeur." },
          { term: "Poor", abbreviation: "PO", description: "Carte en mauvais état, avec défauts importants : plis, forte usure, surface abîmée ou bords très marqués." },
        ],
      },
    ],
  },
  {
    slug: "authentifier-carte-pokemon-rare",
    title: "Où et comment authentifier une carte Pokémon rare (guide débutant)",
    category: "Pop Culture & TCG",
    publishedAt: "2026-09-18",
    readingTime: "4 min de lecture",
    excerpt:
      "Test de la lumière, poids, texture, détails d'impression et œil d'un chineur expérimenté.",
    heroImage: authentifierHero,
    heroAlt: "Carte de collection inspectée à la loupe sous une lampe",
    content: [
      { type: "heading", text: "Test de la lumière" },
      {
        type: "paragraph",
        text: "Le test de la lumière fait partie des premiers gestes que certains collectionneurs utilisent pour repérer une carte suspecte. En plaçant une source lumineuse derrière la carte, on peut parfois observer un halo sombre entre les deux faces. Cette couche interne fait partie de la construction de nombreuses cartes authentiques et peut aider à distinguer une impression trop simple ou trop transparente.",
      },
      {
        type: "paragraph",
        text: "Ce test ne doit pas être utilisé seul. La lumière, l'angle, l'usure et la qualité des photos peuvent tromper. Pour une carte rare, il vaut mieux l'utiliser comme un indice parmi d'autres, jamais comme une preuve définitive.",
      },
      { type: "heading", text: "Poids et texture" },
      {
        type: "paragraph",
        text: "Le poids et la texture donnent aussi des informations. Une carte trop souple, trop rigide, trop brillante ou trop légère peut éveiller un doute. Les cartes anciennes ont une sensation particulière au toucher, liée au papier, à l'impression et à l'usure naturelle. Une fausse carte peut parfois sembler immédiatement différente, même si elle paraît correcte en photo.",
      },
      {
        type: "paragraph",
        text: "Quand l'achat se fait à distance, il faut demander des photos nettes du recto, du verso, des bords et de la surface. Pour une carte de valeur, une vidéo courte peut aussi aider à observer la texture, la brillance et les éventuels défauts sous plusieurs angles.",
      },
      { type: "heading", text: "Détails d'impression" },
      {
        type: "paragraph",
        text: "Les détails d'impression sont essentiels. La netteté du texte, la saturation des couleurs, l'épaisseur des bordures, les symboles, l'énergie, les accents et les micro-détails doivent être cohérents avec l'édition annoncée. Une couleur trop vive, un texte légèrement flou ou une bordure étrange peuvent signaler une reproduction.",
      },
      { type: "heading", text: "L'œil d'un chineur expérimenté" },
      {
        type: "paragraph",
        text: "Un chineur expérimenté repère souvent un problème en quelques secondes, parce qu'il a vu beaucoup de cartes authentiques et beaucoup de cartes douteuses. Il compare instinctivement le rendu, le poids visuel, les proportions et les détails. Pour un débutant, l'objectif est de ralentir, de vérifier chaque indice et de ne pas se laisser emporter par l'urgence d'une bonne affaire.",
      },
      {
        type: "paragraph",
        text: "Pour les cartes rares ou très chères, l'authentification peut aussi passer par un avis spécialisé ou une société de grading reconnue. Avant cela, un bon findr peut déjà filtrer les annonces, repérer les incohérences et demander les photos qui manquent.",
      },
    ],
  },
  {
    slug: "pop-culture-vintage-objets-valeur",
    title: "Pop culture vintage : les objets qui prennent (vraiment) de la valeur",
    category: "Pop Culture & TCG",
    publishedAt: "2026-09-18",
    readingTime: "4 min de lecture",
    excerpt:
      "Rareté réelle, état, passion durable, consoles fonctionnelles et vrais budgets des buyrs.",
    heroImage: popCultureHeroAsset.url,
    heroAlt: "Objets pop culture vintage sur étagère avec figurine musicale et voiture de collection",
    content: [
      { type: "heading", text: "Rareté réelle vs « collector » marketing" },
      {
        type: "paragraph",
        text: "Tous les objets présentés comme « collector » ne prennent pas de valeur. La rareté réelle ne vient pas seulement d'une étiquette marketing, d'une série limitée annoncée ou d'un emballage nostalgique. Elle dépend du nombre d'exemplaires disponibles, de la demande réelle, de l'état, de la version, de la complétude et de l'histoire de l'objet.",
      },
      {
        type: "paragraph",
        text: "Un objet produit en masse peut rester très désiré s'il touche une génération, mais il ne devient pas automatiquement rare. À l'inverse, une pièce discrète, peu conservée ou difficile à trouver en bon état peut devenir beaucoup plus intéressante avec le temps.",
      },
      { type: "heading", text: "L'état plus important que l'âge" },
      {
        type: "paragraph",
        text: "L'âge seul ne suffit pas. Dans la pop culture vintage, l'état pèse souvent plus lourd que l'ancienneté. Une console fonctionnelle, une figurine complète, une carte bien conservée ou un objet avec sa boîte d'origine peut avoir beaucoup plus d'intérêt qu'un exemplaire plus ancien mais abîmé, incomplet ou modifié.",
      },
      {
        type: "paragraph",
        text: "La boîte d'origine, les notices, les accessoires, les câbles, les autocollants, les certificats ou les protections peuvent changer la perception d'un objet. Plus l'ensemble est complet, plus il devient facile à évaluer et à transmettre.",
      },
      { type: "heading", text: "Mode qui passe vs passion qui reste" },
      {
        type: "paragraph",
        text: "Certaines tendances montent très vite puis retombent. Les objets qui tiennent vraiment dans le temps sont souvent liés à une passion durable : univers de jeu, musique, animation, cinéma, sport, enfance ou culture graphique. La valeur vient alors d'une communauté qui continue à chercher, comparer et collectionner.",
      },
      {
        type: "paragraph",
        text: "Les consoles fonctionnelles en sont un bon exemple. Une console vintage qui s'allume, lit correctement les jeux et conserve ses accessoires d'origine parle autant aux collectionneurs qu'aux joueurs. La nostalgie compte, mais l'usage réel compte aussi.",
      },
      { type: "heading", text: "Le baromètre Findr" },
      {
        type: "paragraph",
        text: "Sur findr, le baromètre est ce que les buyrs cherchent avec de vrais budgets. Une pièce qui attire vraiment l'attention n'est pas seulement celle qui fait du bruit sur les réseaux : c'est celle pour laquelle quelqu'un est prêt à formuler une recherche précise, à fixer un budget et à attendre le bon objet.",
      },
      {
        type: "paragraph",
        text: "C'est ce signal qui rend la chasse intéressante. Les findrs peuvent repérer les demandes récurrentes, comprendre quels objets sont réellement désirés et distinguer la rareté utile du simple argument de vente.",
      },
    ],
  },
];
export const getBlogPostBySlug = (slug: string | undefined): BlogPost | undefined =>
  blogPosts.find((post) => post.slug === slug);
