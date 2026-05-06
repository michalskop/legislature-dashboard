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

const sk: AboutContent = {
  pageTitle: "O projekte",
  intro: "nrsr.datatimes.cz je otvorený prehľad aktivity poslancov a strán v Národnej rade Slovenskej republiky.",
  backLabel: "← Späť na prehľad",
  sections: [
    {
      title: "Čo zobrazujeme",
      paragraphs: [
        { type: "text", text: "Pre každého poslanca a každú poslankyňu zobrazujeme tri základné metriky vypočítané z hlasovaní v parlamente:" },
        {
          type: "list",
          items: [
            { label: "Účasť na hlasovaniach", description: "podiel hlasovaní, na ktorých bol/a poslanec/poslankyňa prítomný/prítomná." },
            { label: "Rebelita", description: "ako často hlasuje proti stanovisku vlastného poslaneckého klubu." },
            { label: "Vládnosť", description: "ako často hlasuje zhodne s vládnou koalíciou." },
          ],
        },
        { type: "text", text: "Ďalej zobrazujeme pozície poslancov na základe ich hlasovania vypočítané metódou WPCA (vážená analýza hlavných komponentov), ktorá odhaľuje, kto v parlamente hlasuje podobne." },
      ],
    },
    {
      title: "Dáta",
      paragraphs: [
        {
          type: "external-link",
          href: "https://www.nrsr.sk",
          text: "webstránky Národnej rady SR (nrsr.sk)",
          suffix: "Dáta o hlasovaniach pochádzajú z {link}.",
        },
        { type: "text", text: "Stránka sa automaticky aktualizuje každý deň." },
      ],
    },
    {
      title: "Autori",
      paragraphs: [
        {
          type: "links",
          items: [
            { href: "https://datatimes.sk", label: "DataTimes.sk", description: "" },
            { href: "https://kohovolit.eu", label: "KohoVolit.eu", description: "" },
          ],
        },
      ],
    },
    {
      title: "Ďalšie projekty",
      paragraphs: [
        {
          type: "links",
          items: [
            { href: "https://volebnakalkulacka.sk", label: "Volebná kalkulačka", description: "— porovnajte svoj postoj s postojmi strán a kandidátov" },
          ],
        },
      ],
    },
  ],
};

const en: AboutContent = {
  pageTitle: "About the project",
  intro: "nrsr.datatimes.cz is an open overview of MP and party activity in the National Council of the Slovak Republic.",
  backLabel: "← Back to overview",
  sections: [
    {
      title: "What we show",
      paragraphs: [
        { type: "text", text: "For each MP we display three core metrics calculated from parliamentary votes:" },
        {
          type: "list",
          items: [
            { label: "Attendance", description: "share of votes where the MP was present." },
            { label: "Rebelliousness", description: "how often the MP votes against their own parliamentary club." },
            { label: "Gov. alignment", description: "how often the MP votes in line with the governing coalition." },
          ],
        },
        { type: "text", text: "We also show ideological positions derived from voting patterns using WPCA (Weighted Principal Component Analysis), revealing who votes similarly in parliament." },
      ],
    },
    {
      title: "Data",
      paragraphs: [
        {
          type: "external-link",
          href: "https://www.nrsr.sk",
          text: "National Council of the SR website (nrsr.sk)",
          suffix: "Voting data is sourced from the {link}.",
        },
        { type: "text", text: "The page updates automatically every day." },
      ],
    },
    {
      title: "Authors",
      paragraphs: [
        {
          type: "links",
          items: [
            { href: "https://datatimes.sk", label: "DataTimes.sk", description: "" },
            { href: "https://kohovolit.eu", label: "KohoVolit.eu", description: "" },
          ],
        },
      ],
    },
  ],
};

export const aboutContent: Record<string, AboutContent> = { sk, en };
