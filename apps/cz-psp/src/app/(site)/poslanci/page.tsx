import { getAllMpProfiles } from "@/lib/data";
import { SortableMpTable } from "@/components/SortableMpTable";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Poslanci — snemovna.datatimes.cz",
};

export default async function PoslanciPage() {
  const mps = await getAllMpProfiles();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Poslanci</h1>
      <SortableMpTable mps={mps} />
    </div>
  );
}
