export interface AboutSection {
  title: string;
  paragraphs: Array<
    | { type: "text"; text: string }
    | { type: "list"; items: Array<{ label: string; description: string }> }
    | { type: "links"; items: Array<{ href: string; label: string; description: string }> }
    | { type: "external-link"; href: string; text: string; suffix?: string }
  >;
}

export interface AboutContent {
  pageTitle: string;
  intro: string;
  sections: AboutSection[];
  backLabel: string;
}

const cs: AboutContent = {
  pageTitle: "O projektu",
  intro: "Sněmovna.DataTimes.cz je otevřený přehled aktivity poslanců a stran v Poslanecké sněmovně Parlamentu České republiky.",
  backLabel: "← Zpět na přehled",
  sections: [
    {
      title: "Co zobrazujeme",
      paragraphs: [
        { type: "text", text: "Pro každého poslance a každou poslankyni zobrazujeme čtyři základní metriky vypočítané z hlasování ve sněmovně:" },
        {
          type: "list",
          items: [
            { label: "Účast na hlasováních", description: "podíl hlasování, na nichž byl/a poslanec/poslankyně přítomen/přítomna." },
            { label: "Rebelování", description: "jak často hlasuje proti stanovisku vlastního poslaneckého klubu." },
            { label: "Shoda s vládou", description: "jak často hlasuje shodně s vládní koalicí." },
            { label: "Opravy hlasování", description: 'počet dodatečně opravených (tzv. \u201eoops\u201c) hlasování.' },
          ],
        },
        { type: "text", text: "Dále zobrazujeme pozice poslanců na základě jejich hlasování vypočtené metodou WPCA (vážená analýza hlavních komponent), která odhaluje, kdo v sněmovně hlasuje podobně." },
      ],
    },
    {
      title: "Data",
      paragraphs: [
        {
          type: "external-link",
          href: "https://www.psp.cz/sqw/hp.sqw?k=1300",
          text: "otevřených dat Poslanecké sněmovny ČR",
          suffix: "Data o hlasování pocházejí z {link}.",
        },
        { type: "text", text: "Stránka se automaticky aktualizuje každý den." },
      ],
    },
    {
      title: "Autoři",
      paragraphs: [
        {
          type: "links",
          items: [
            { href: "https://datatimes.cz", label: "DataTimes.cz", description: "" },
            { href: "https://kohovolit.eu", label: "KohoVolit.eu", description: "" },
          ],
        },
      ],
    },
    {
      title: "Další projekty",
      paragraphs: [
        {
          type: "links",
          items: [
            { href: "https://mandaty.cz", label: "Mandáty.cz", description: "— Agregace volebních průzkumů" },
            { href: "https://volebnikalkulacka.cz", label: "Volební kalkulačka", description: "— porovnejte svůj postoj s postoji stran a kandidátů" },
          ],
        },
      ],
    },
  ],
};

// English — not yet translated, same structure with Czech text
const en: AboutContent = {
  ...cs,
  pageTitle: "About the project",
  backLabel: "← Back to overview",
  // TODO: translate remaining content
};

export const aboutContent: Record<string, AboutContent> = { cs, en };
