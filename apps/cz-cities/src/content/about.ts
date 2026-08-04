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

// PLACEHOLDER content — task A1 scaffold only. Describes the generic pattern,
// not any real city. Real per-city "About" copy (data source, coalition
// definitions, etc.) is part of task A2/A3 once real city data exists.
const cs: AboutContent = {
  pageTitle: "O projektu",
  intro: "Mesta.DataTimes.cz je plánovaný otevřený přehled hlasování zastupitelstev českých měst. Tato stránka je zatím jen ukázkový scaffold bez skutečných dat.",
  backLabel: "← Zpět na přehled",
  sections: [
    {
      title: "Co budeme zobrazovat",
      paragraphs: [
        { type: "text", text: "Pro každého zastupitele a každou zastupitelku budeme zobrazovat tři základní metriky vypočítané z hlasování v zastupitelstvu:" },
        {
          type: "list",
          items: [
            { label: "Účast na hlasováních", description: "podíl hlasování, na nichž byl/a zastupitel/ka přítomen/přítomna." },
            { label: "Rebelování", description: "jak často hlasuje proti stanovisku vlastního klubu." },
            { label: "Shoda s koalicí", description: "jak často hlasuje shodně s vedením města (koalicí)." },
          ],
        },
        { type: "text", text: "Dále budeme zobrazovat pozice zastupitelů na základě jejich hlasování vypočtené metodou WPCA (vážená analýza hlavních komponent), která odhaluje, kdo v zastupitelstvu hlasuje podobně." },
      ],
    },
    {
      title: "Data",
      paragraphs: [
        { type: "text", text: "Data v této verzi jsou zástupná (placeholder) — projekt zatím čeká na dokončení datové pipeline pro jednotlivá města (Praha, Brno, Ostrava)." },
        { type: "text", text: "Až budou k dispozici skutečná data, tato stránka bude aktualizována a bude odkazovat na konkrétní otevřená data daného města." },
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
