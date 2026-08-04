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

// Site-wide "About" content — describes Mesta.DataTimes.cz as a whole
// (currently: Praha), not any one city's own page.
const cs: AboutContent = {
  pageTitle: "O projektu",
  intro: "Mesta.DataTimes.cz je otevřený přehled jmenovitých hlasování zastupitelstev českých měst. V této verzi je k dispozici hlavní město Praha; další města přibudou postupně.",
  backLabel: "← Zpět na přehled",
  sections: [
    {
      title: "Co zobrazujeme",
      paragraphs: [
        { type: "text", text: "Pro každého zastupitele a každou zastupitelku zobrazujeme metriky vypočítané z jmenovitých hlasování zastupitelstva:" },
        {
          type: "list",
          items: [
            { label: "Účast na hlasováních", description: "podíl hlasování, na nichž byl/a zastupitel/ka přítomen/přítomna." },
            { label: "Rebelování", description: "jak často hlasuje proti stanovisku vlastního klubu." },
            { label: "Shoda s koalicí", description: "jak často hlasuje shodně s vedením města (koalicí)." },
          ],
        },
        { type: "text", text: "Dále zobrazujeme pozice zastupitelů na základě jejich hlasování vypočtené metodou WPCA (vážená analýza hlavních komponent), která odhaluje, kdo v zastupitelstvu hlasuje podobně." },
      ],
    },
    {
      title: "Data",
      paragraphs: [
        { type: "text", text: "Data pro Prahu pocházejí z otevřených dat hlavního města Prahy (portál Golemio, licence CC BY 4.0) za volební období 2022–2026 a jsou zpracována stejným datovým pipeline jako Poslanecká sněmovna ČR na snemovna.datatimes.cz." },
        { type: "text", text: "Klubová/stranická příslušnost zastupitelů vychází z výsledků komunálních voleb 2022 (volby.cz) — živá data o klubech nejsou pro Prahu strojově dostupná. Vládní koalice (SPOLU pro Prahu, Česká pirátská strana, STAROSTOVÉ A NEZÁVISLÍ, od 15. 2. 2023) je určena podle veřejně dostupné koaliční smlouvy." },
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

const en: AboutContent = {
  pageTitle: "About the project",
  intro: "Mesta.DataTimes.cz is an open dashboard of roll-call votes in Czech municipal assemblies. This version covers the City of Prague; more cities will follow.",
  backLabel: "← Back to overview",
  sections: [
    {
      title: "What we show",
      paragraphs: [
        { type: "text", text: "For each councillor, we show metrics derived from the assembly's roll-call votes:" },
        {
          type: "list",
          items: [
            { label: "Attendance", description: "share of voting events where the councillor was present." },
            { label: "Rebelliousness", description: "how often they vote against their own group's position." },
            { label: "Coalition alignment", description: "how often they vote in line with the city's governing coalition." },
          ],
        },
        { type: "text", text: "We also show councillors' voting positions computed with WPCA (weighted principal component analysis), which reveals who votes similarly." },
      ],
    },
    {
      title: "Data",
      paragraphs: [
        { type: "text", text: "Prague's data comes from the City of Prague's open data (Golemio portal, CC BY 4.0 license) for the 2022–2026 term, processed by the same data pipeline as the Chamber of Deputies dashboard at snemovna.datatimes.cz." },
        { type: "text", text: "Councillors' group affiliation is sourced from the 2022 municipal election results (volby.cz) — live group/klub data isn't machine-readable for Prague. The governing coalition (SPOLU pro Prahu, Česká pirátská strana, STAROSTOVÉ A NEZÁVISLÍ, since 2023-02-15) follows the publicly available coalition agreement." },
      ],
    },
    {
      title: "Authors",
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
      title: "Other projects",
      paragraphs: [
        {
          type: "links",
          items: [
            { href: "https://mandaty.cz", label: "Mandáty.cz", description: "— Poll aggregation" },
            { href: "https://volebnikalkulacka.cz", label: "Volební kalkulačka", description: "— compare your views with parties' and candidates'" },
          ],
        },
      ],
    },
  ],
};

export const aboutContent: Record<string, AboutContent> = { cs, en };
