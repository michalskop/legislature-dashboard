import { getAllMpProfiles, getAllPartyProfiles } from "@/lib/data";
import { MpMetricSwarmChart } from "@/components/MpMetricSwarmChart";
import { WpcaScatterChart } from "@/components/WpcaScatterChart";

export default async function HomePage() {
  const [allMps, parties] = await Promise.all([getAllMpProfiles(), getAllPartyProfiles()]);
  const mps = allMps.filter((m) => m.isCurrent);

  return (
    <div className="space-y-10">
      <section>
        <h1 className="text-3xl font-bold mb-2">Poslanecká sněmovna</h1>
        <p className="text-muted-foreground text-lg">
          Přehled aktivity poslanců a stran v české Poslanecké sněmovně 2025–2029.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-1">Účast na hlasování</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Každý bod = jeden poslanec/poslankyně. Kliknutím přejdete na jeho/její profil.
        </p>
        <MpMetricSwarmChart
          mps={mps}
          parties={parties}
          metric="attendance"
          extraReferenceLines={[{ value: 0.5, label: "50\u00a0%" }]}
        />
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-1">Ideologické pozice</h2>
        <p className="text-sm text-muted-foreground mb-4">
          2D mapa poslanců podle způsobu hlasování (WPCA). Kliknutím přejdete na profil.
        </p>
        <WpcaScatterChart mps={mps} parties={parties} />
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-1">Rebelita</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Jak často poslanec/poslankyně hlasuje proti svému klubu.
        </p>
        <MpMetricSwarmChart
          mps={mps}
          parties={parties}
          metric="rebelity"
          yMode="auto"
          yDecimals={1}
        />
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-1">Vládnost</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Jak často poslanec/poslankyně hlasuje shodně s vládní koalicí.
        </p>
        <MpMetricSwarmChart
          mps={mps}
          parties={parties}
          metric="govity"
          yMode="auto"
        />
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <a
          href="/poslanci"
          className="block p-6 bg-surface-2 rounded-badge hover:bg-surface-3 transition-colors"
        >
          <h2 className="text-xl font-semibold mb-1">Poslanci</h2>
          <p className="text-sm text-muted-foreground">
            Účast na hlasování, věrnost straně a další metriky pro každého poslance.
          </p>
        </a>
        <a
          href="/strany"
          className="block p-6 bg-surface-2 rounded-badge hover:bg-surface-3 transition-colors"
        >
          <h2 className="text-xl font-semibold mb-1">Strany</h2>
          <p className="text-sm text-muted-foreground">
            Přehled stran a jejich poslaneckých klubů s agregovanými metrikami.
          </p>
        </a>
      </section>
    </div>
  );
}
