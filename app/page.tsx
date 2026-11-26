import type { Metadata } from "next";
import PabloPortfolio from "@/components/PabloPortfolio";

export const metadata: Metadata = {
  title: "Pablo CF | Bachata y clases de baile",
  description: "Portfolio de Pablo CF, vídeos de baile y reserva de clases particulares.",
};

export default function HomePage() {
  return <PabloPortfolio bookingHref="/clases" />;
}
