import type { Metadata } from "next";
import { ORG } from "@/lib/org-data";
import { MapaPessoasView } from "./mapa-pessoas-view";

export const metadata: Metadata = { title: "Mapa & Pessoas" };

export default function MapaPessoasPage() {
  return <MapaPessoasView org={ORG} />;
}
