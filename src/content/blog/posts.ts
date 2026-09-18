import levisHero from "@/assets/blog/levis-vintage-hero.jpg";
import taillesHero from "@/assets/blog/tailles-vintage-hero.jpg";
import entretienHero from "@/assets/blog/entretien-cuir-denim-hero.jpg";
import cartesHero from "@/assets/blog/cartes-pokemon-etat-rarete-hero.jpg";
import authentifierHero from "@/assets/blog/authentifier-carte-pokemon-hero.jpg";
import popCultureHero from "@/assets/blog/pop-culture-valeur-hero.jpg";

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
    readingTime: "3 min de lecture",
    excerpt:
      "Une veste en jean qui a quarante ans a forcément une histoire. Le vintage, c'est ça : des objets qui parlent tout seuls, à condition de savoir où regarder.",
    heroImage: levisHero,
    heroAlt: "Veste en jean vintage sur cintre dans une lumière chaude",
    content: [
      {
        type: "paragraph",
        text: "Une veste en jean qui a quarante ans a forcément une histoire. On ne la connaît jamais vraiment, cette histoire, mais on peut la lire un peu, dans une étiquette jaunie, une couture qui a tenu bon, un bouton usé d'une façon très particulière. Le vintage, c'est ça : des objets qui parlent tout seuls, à condition de savoir où regarder avant de sortir la carte bleue.",
      },
      { type: "heading", text: "L'étiquette" },
      {
        type: "paragraph",
        text: "Le logo Levi's a changé plusieurs fois. Jusqu'au milieu des années 70, le \"E\" de \"LEVI'S\" était en majuscule sur l'étiquette rouge (le fameux Big E). Après, il passe en minuscule. Donc si quelqu'un te vend une pièce \"années 80\" avec un Big E bien visible, il y a un problème quelque part, soit dans la datation, soit dans l'étiquette elle-même.",
      },
      {
        type: "paragraph",
        text: "Le numéro RN cousu à l'intérieur donne aussi une fourchette d'années assez précise si tu prends le temps de le chercher en ligne. Et la mention \"Made in USA\" disparaît petit à petit à partir des années 90, quand la production part à l'étranger. Une pièce qui l'a encore a de bonnes chances d'être plus vieille qu'elle n'en a l'air sur la photo.",
      },
      { type: "heading", text: "Les coutures et le tissu" },
      {
        type: "paragraph",
        text: "Le denim ancien vient souvent de métiers à tisser plus anciens, ce qui donne un liseré coloré visible quand on retourne l'ourlet — les puristes appellent ça du selvedge. Les finitions de couture aussi ont changé avec le temps ; certains points qu'on voit partout aujourd'hui étaient beaucoup plus rares il y a trente ou quarante ans.",
      },
      { type: "heading", text: "Les boutons" },
      {
        type: "paragraph",
        text: "Un vrai bouton Levi's porte un marquage en creux. La matière compte : le laiton d'époque a une patine qu'aucun produit ne recrée artificiellement. Si les boutons d'une pièce censée dater des années 80 brillent comme s'ils sortaient de l'usine hier, méfiance.",
      },
      { type: "heading", text: "Ce qui peut clocher sur une annonce" },
      {
        type: "paragraph",
        text: "Le cas le plus fréquent, ce sont des rééditions récentes vendues de bonne foi comme du vrai vintage — le vendeur lui-même s'est trompé. Plus rare mais ça arrive : des pièces reconstituées à partir de plusieurs vêtements différents, recousues ensemble. Ce n'est pas malhonnête en soi, mais ce n'est plus tout à fait la pièce d'origine.",
      },
      { type: "quote", text: "Une vraie pièce vintage raconte son âge dans les détails qu'on oublie de regarder." },
      {
        type: "paragraph",
        text: "Un findr qui connaît ces réflexes ne va pas juste te trouver une veste Levi's au hasard. Il va te trouver la bonne, celle qui correspond vraiment à ce que tu décris.",
      },
      {
        type: "paragraph",
        text: "Tu cherches une pièce précise ? Décris-la et laisse la communauté s'en occuper.",
      },
    ],
  },
  {
    slug: "guide-tailles-vintage-m-annees-80",
    title: "Guide des tailles vintage : pourquoi un \"M\" des années 80 n'est pas un \"M\" d'aujourd'hui",
    category: "Mode & Maroquinerie",
    publishedAt: "2026-09-18",
    readingTime: "2 min de lecture",
    excerpt:
      "Le colis arrive, l'étiquette disait M, et pourtant la pièce ne va pas. Les tailles vintage demandent surtout de regarder les mesures.",
    heroImage: taillesHero,
    heroAlt: "Vêtements vintage pliés avec un mètre ruban",
    content: [
      {
        type: "paragraph",
        text: "Le colis arrive. On l'ouvre avec cette petite excitation qu'on connaît tous. On enfile la pièce attendue depuis des semaines, et elle ne va pas. Pourtant l'étiquette disait \"M\", ta taille habituelle. Personne n'a menti dans l'histoire — les tailles ont juste beaucoup bougé depuis les années 80.",
      },
      { type: "heading", text: "Pourquoi les tailles ont changé" },
      {
        type: "paragraph",
        text: "Les silhouettes ont évolué, les tissus aussi, et les marques ont eu tendance à gonfler discrètement leurs tailles au fil des décennies (le fameux vanity sizing, qui flatte le client au moment d'essayer). Résultat : un \"M\" d'il y a quarante ans correspond souvent, en mesures réelles, à un \"S\" d'aujourd'hui. Et les standards français, anglais et américains n'ont jamais été rigoureusement identiques non plus.",
      },
      { type: "heading", text: "Le seul chiffre qui compte vraiment" },
      {
        type: "paragraph",
        text: "Avant d'accepter une proposition, demande trois mesures : le tour de poitrine à plat (mesuré d'une couture à l'autre, puis doublé), la longueur épaule à épaule, et la longueur de manche depuis la couture d'épaule. Ça prend trente secondes à écrire dans un message, et ça t'évite une déception à la réception du colis.",
      },
      {
        type: "paragraph",
        text: "Un bon findr y pense souvent avant même qu'on le lui demande. Certains photographient carrément le vêtement à plat à côté d'un mètre-ruban. Si ce n'est pas fait, demande-le, personne ne le prend mal.",
      },
      { type: "quote", text: "Sur le vintage, le centimètre ne ment jamais. L'étiquette, quelquefois." },
      {
        type: "paragraph",
        text: "Un doute sur une taille avant d'accepter ? Demande les mesures, c'est fait pour ça.",
      },
    ],
  },
  {
    slug: "entretenir-cuir-denim-vintage",
    title: "Comment entretenir et faire durer une pièce en cuir ou en denim vintage",
    category: "Mode & Maroquinerie",
    publishedAt: "2026-09-18",
    readingTime: "3 min de lecture",
    excerpt:
      "Une pièce vintage a déjà survécu à beaucoup de choses. La garder longtemps demande surtout de ne pas trop en faire.",
    heroImage: entretienHero,
    heroAlt: "Veste en cuir, denim et produits d'entretien sur une table en bois",
    content: [
      {
        type: "paragraph",
        text: "Une pièce vintage qui arrive jusqu'à toi a déjà survécu à beaucoup de choses. Des lavages, des propriétaires, des étés trop chauds, des placards mal aérés pendant vingt ans. Elle est encore là. La vraie question, maintenant, c'est de savoir si tu vas être celui qui la garde en bon état encore longtemps, ou celui qui l'abîme en deux saisons à force de trop bien vouloir faire.",
      },
      { type: "heading", text: "Le cuir" },
      {
        type: "paragraph",
        text: "Moins on y touche, mieux il se porte. Un chiffon légèrement humide suffit pour la poussière. Un baume nourrissant une ou deux fois par an, pas plus, et jamais un produit à base de silicone qui finit par étouffer le cuir sur la durée. Et surtout, jamais de séchage près d'une source de chaleur — ça craquelle en quelques heures ce que la pièce a mis des décennies à préserver.",
      },
      { type: "heading", text: "Le denim" },
      {
        type: "paragraph",
        text: "Pas besoin de le laver après chaque port, souvent c'est même l'inverse qui l'a gardé en bon état jusqu'ici. Quand un lavage devient vraiment nécessaire : eau froide, cycle délicat, vêtement retourné à l'envers pour protéger les coutures visibles. Le sèche-linge est à éviter, l'air libre à plat fait le travail sans risquer un rétrécissement.",
      },
      { type: "heading", text: "Le rangement" },
      {
        type: "paragraph",
        text: "La lumière directe décolore plus vite qu'on ne le pense, même filtrée par une vitre. L'humidité attaque les fibres sans qu'on s'en rende compte avant plusieurs mois. Un placard sombre et sec fait déjà l'essentiel du travail.",
      },
      { type: "heading", text: "Réparer, jusqu'à un certain point" },
      {
        type: "paragraph",
        text: "Une couture qui craque ou un bouton qui se détache, ça se répare facilement et ça vaut le coup. Une reteinture complète ou un remplacement de zones entières, en revanche, peut faire perdre à la pièce ce qui la rendait intéressante au départ. Sur quelque chose de vraiment précieux, mieux vaut l'avis d'un professionnel du textile ancien qu'un bricolage bien intentionné mais définitif.",
      },
      { type: "quote", text: "Le meilleur entretien d'une pièce vintage, c'est souvent de la toucher le moins possible." },
      {
        type: "paragraph",
        text: "Une pièce vintage prend soin de toi depuis des décennies. Rends-lui la pareille.",
      },
    ],
  },
  {
    slug: "cartes-pokemon-etat-rarete",
    title: "Cartes Pokémon : comment vérifier l'état et la rareté avant d'acheter",
    category: "Pop Culture & TCG",
    publishedAt: "2026-09-18",
    readingTime: "4 min de lecture",
    excerpt:
      "Avant d'accepter une proposition, quelques détails permettent de vérifier l'édition, la rareté et l'état réel d'une carte.",
    heroImage: cartesHero,
    heroAlt: "Cartes de collection sous protection avec une loupe sur une table",
    content: [
      {
        type: "paragraph",
        text: "Une carte Pokémon bien conservée après trente ans dans une boîte à chaussures, ça a quelque chose d'assez improbable. C'est peut-être pour ça que le marché attire autant de monde — et malheureusement, autant de mauvaises surprises pour qui ne sait pas exactement quoi regarder.",
      },
      { type: "heading", text: "Comprendre ce qu'on a sous les yeux" },
      {
        type: "paragraph",
        text: "Le symbole de rareté, en bas à droite de la carte, donne une première indication : cercle pour commune, losange pour peu commune, étoile pour rare (et parmi les rares, certaines sont holographiques, ce qui change beaucoup de choses côté valeur). L'édition compte tout autant. Une carte \"1st Edition\" ou \"Shadowless\" des tout premiers tirages n'a rien à voir avec une réimpression plus récente du même personnage, même si les deux se ressemblent à l'œil nu.",
      },
      {
        type: "paragraph",
        text: "Deux autres détails valent le coup d'œil avant d'accepter une proposition : le symbole d'extension, souvent discret en bas de l'illustration, qui indique précisément de quelle série la carte est issue, et l'année d'impression indiquée en petit près du copyright. Ensemble, ces deux éléments permettent de vérifier que la carte proposée par le findr est bien celle que recherche le buyr, et pas seulement un Pokémon du même nom sorti dans une édition différente.",
      },
      { type: "heading", text: "Juger l'état sur une simple photo" },
      {
        type: "paragraph",
        text: "Regarde les coins : nets et tranchants, ou déjà arrondis et blanchis à l'usure ? Vérifie le centrage de l'image dans son cadre — un décalage visible fait souvent chuter la valeur. La brillance de l'hologramme se juge aussi en photo, sous un bon angle. Et les bords, cornés ou impeccables, se voient tout de suite.",
      },
      {
        type: "paragraph",
        text: "Pour décrire précisément ce que tu vois, la communauté des collectionneurs utilise un vocabulaire assez standardisé, hérité de l'anglais. Voici les termes que tu croiseras le plus souvent dans une proposition, et ce qu'ils recouvrent vraiment :",
      },
      {
        type: "glossary",
        entries: [
          {
            term: "Mint",
            abbreviation: "M",
            description: "État quasi parfait, sorti tout droit de son booster : aucun défaut visible, coins nets, aucune rayure.",
          },
          {
            term: "Near Mint",
            abbreviation: "NM",
            description: "Presque parfait, avec une imperfection minime qu'on ne voit qu'en cherchant vraiment : un tout petit signe de manipulation.",
          },
          {
            term: "Excellent",
            abbreviation: "EX",
            description: "Légère usure visible à l'œil nu : coins un peu émoussés, très fines marques de manipulation.",
          },
          {
            term: "Good",
            abbreviation: "GD",
            description: "Usure modérée : coins arrondis, quelques petites rayures visibles sans lampe ni loupe.",
          },
          {
            term: "Lightly Played",
            abbreviation: "LP",
            description: "Signes d'utilisation clairs mais qui n'affectent ni la lisibilité ni la tenue de la carte : petites éraflures, coins légèrement abîmés.",
          },
          {
            term: "Played",
            abbreviation: "PL",
            description: "Usure importante : coins nettement arrondis, plis possibles, la carte a clairement vécu.",
          },
          {
            term: "Poor",
            abbreviation: "PO",
            description: "Dommages sérieux : plis marqués, déchirures ou taches possibles, coins très abîmés.",
          },
        ],
      },
      {
        type: "paragraph",
        text: "Ces termes ne remplacent jamais une bonne photo, mais ils permettent d'avoir une conversation précise avec un findr avant d'accepter une proposition, plutôt que de se contenter d'un vague \"bon état\".",
      },
      {
        type: "paragraph",
        text: "Rien de tout ça ne demande un équipement particulier. Juste l'habitude de regarder au bon endroit, et le réflexe de demander une photo sous un angle précis avant de valider une proposition.",
      },
      { type: "quote", text: "Une carte Pokémon rare n'a de valeur que si son état est aussi bon que son nom." },
      {
        type: "paragraph",
        text: "Tu cherches une carte précise, dans un état précis ? Les chineurs de la communauté savent où regarder.",
      },
    ],
  },
  {
    slug: "authentifier-carte-pokemon-rare",
    title: "Où et comment authentifier une carte Pokémon rare (guide débutant)",
    category: "Pop Culture & TCG",
    publishedAt: "2026-09-18",
    readingTime: "2 min de lecture",
    excerpt:
      "Reconnaître une contrefaçon ne demande pas forcément du matériel coûteux : certains réflexes simples font déjà la différence.",
    heroImage: authentifierHero,
    heroAlt: "Carte de collection inspectée à la loupe sous une lampe",
    content: [
      {
        type: "paragraph",
        text: "Plus une carte devient recherchée, plus les copies suivent. C'est une règle presque universelle sur tout marché de collector, et les cartes Pokémon rares n'y échappent pas. La bonne nouvelle, c'est que reconnaître une contrefaçon ne demande ni matériel coûteux ni des années d'expérience — juste quelques réflexes qui s'apprennent en quelques minutes.",
      },
      { type: "heading", text: "Le test de la lumière" },
      {
        type: "paragraph",
        text: "Les vraies cartes ont une fine couche noire entre les deux faces de carton. Tenue face à une lumière vive, une vraie carte laisse filtrer un halo sombre net sur les contours. Une contrefaçon est souvent bien plus fine, presque transparente sous cette même lumière. C'est le test le plus simple et souvent le plus révélateur des trois qu'on va voir ici.",
      },
      { type: "heading", text: "Le poids et la texture" },
      {
        type: "paragraph",
        text: "Une vraie carte a un grain particulier, un peu rigide, résultat d'une fabrication en plusieurs couches. Une contrefaçon paraît souvent plus légère et plus souple, presque plastique au toucher. C'est difficile à juger sur une photo, ce qui plaide pour passer par un findr qui a déjà la carte entre les mains plutôt que d'acheter à l'aveugle sur une image seule.",
      },
      { type: "heading", text: "Les détails d'impression" },
      {
        type: "paragraph",
        text: "La police de caractères, l'épaisseur des traits, la précision des couleurs : les contrefaçons progressent d'année en année, mais elles ratent encore souvent les détails typographiques officiels. Un nom d'attaque mal centré, une couleur trop saturée, un symbole d'énergie imprécis. Ce sont ces petits écarts qui trahissent le faux à un œil habitué.",
      },
      { type: "heading", text: "Pourquoi un findr expérimenté change tout" },
      {
        type: "paragraph",
        text: "Un chineur qui a déjà eu des centaines de cartes entre les mains repère un problème en quelques secondes. Là où un œil neuf pourrait hésiter longtemps sans jamais vraiment trancher, quelqu'un qui a l'habitude sait tout de suite si quelque chose cloche.",
      },
      { type: "quote", text: "Le meilleur détecteur de faux reste un chineur qui en a déjà vu des centaines." },
      {
        type: "paragraph",
        text: "Envie d'une carte authentique, sans mauvaise surprise ? Laisse un findr expérimenté s'en charger.",
      },
    ],
  },
  {
    slug: "pop-culture-vintage-objets-valeur",
    title: "Pop culture vintage : les objets qui prennent (vraiment) de la valeur",
    category: "Pop Culture & TCG",
    publishedAt: "2026-09-18",
    readingTime: "3 min de lecture",
    excerpt:
      "Tous les objets collectors ne prennent pas de valeur. La rareté réelle, l'état et la demande actuelle font la différence.",
    heroImage: popCultureHero,
    heroAlt: "Objets pop culture vintage et collectibles rangés sur une étagère",
    content: [
      {
        type: "paragraph",
        text: "\"Garde tout, un jour ça vaudra de l'or.\" On l'a tous entendu au moins une fois. Si c'était vrai, n'importe quel grenier serait un coffre-fort. La réalité du marché de la pop culture vintage est un peu plus subtile : certains objets prennent effectivement de la valeur avec le temps, d'autres, produits par millions et vendus comme \"édition limitée\" à l'époque, ne bougeront jamais vraiment.",
      },
      { type: "heading", text: "La rareté qui compte, pas celle qu'on te vend" },
      {
        type: "paragraph",
        text: "Beaucoup de produits étiquetés \"collector\" à leur sortie ont en fait été fabriqués en très grande quantité — justement parce que le mot \"collector\" faisait vendre. La rareté qui compte vraiment se construit souvent malgré la marque : une série arrêtée trop tôt, une erreur de fabrication jamais corrigée, un objet promotionnel distribué en quantités réellement faibles sans grand bruit médiatique à l'époque.",
      },
      { type: "heading", text: "L'état compte plus que l'âge" },
      {
        type: "paragraph",
        text: "Un objet vieux de quarante ans mais abîmé vaut souvent moins qu'un objet plus récent gardé impeccable, boîte d'origine incluse. La boîte, justement, change tout : un jouet sorti de son emballage perd une bonne partie de sa valeur de collection, même parfaitement intact, simplement parce que l'emballage lui-même est devenu la pièce la plus rare de l'ensemble.",
      },
      { type: "heading", text: "La mode qui passe, contre la passion qui reste" },
      {
        type: "paragraph",
        text: "Un engouement très fort mais court retombe souvent aussi vite qu'il est monté, une fois que la tendance s'essouffle. À l'inverse, tout ce qui s'appuie sur une vraie communauté de fans qui dure depuis des décennies garde beaucoup mieux sa valeur, voire continue à grimper.",
      },
      {
        type: "paragraph",
        text: "Les jouets d'époque encore scellés dans leur boîte d'origine sont recherchés précisément parce que presque tous les autres exemplaires ont fini ouverts et utilisés. Les cartes suivent une logique proche, où l'ancienneté seule ne suffit jamais : il faut la rareté, l'état, et la demande actuelle réunis. Les consoles et objets électroniques anciens, eux, prennent particulièrement de valeur quand ils fonctionnent encore, ce qui élimine d'office une bonne partie des exemplaires mal conservés.",
      },
      {
        type: "paragraph",
        text: "Sur une marketplace inversée comme Findr, le meilleur baromètre n'est pas un algorithme ou une estimation. C'est directement ce que les buyrs cherchent, avec de vrais budgets annoncés — un signal plus honnête que n'importe quelle cote théorique.",
      },
      { type: "quote", text: "La vraie rareté ne se décrète pas sur l'emballage, elle se constate des années après." },
      {
        type: "paragraph",
        text: "Envie de savoir ce que vaut vraiment ta collection ? Regarde ce que les buyrs cherchent en ce moment.",
      },
    ],
  },
];

export const getBlogPostBySlug = (slug: string | undefined): BlogPost | undefined =>
  blogPosts.find((post) => post.slug === slug);
