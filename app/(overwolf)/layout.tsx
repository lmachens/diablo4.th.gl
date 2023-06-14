import { Metadata } from "next";
import { Inter } from "next/font/google";
import PlausibleTracker from "../components/plausible-tracker";
import "../globals.css";
import { OverwolfRouterProvider } from "./components/overwolf-router";

const inter = Inter({ subsets: ["latin"] });

export function generateMetadata(): Metadata {
  return {
    title: {
      default: "Sanctuary | Diablo 4 Map",
      template: "%s | Diablo 4 Map",
    },
  };
}

function OverwolfLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body
        className={`${inter.className} h-screen flex flex-col text-white app antialiased select-none overflow-hidden`}
      >
        <OverwolfRouterProvider>{children}</OverwolfRouterProvider>
        <PlausibleTracker
          domain={process.env.NEXT_PUBLIC_PLAUSIBLE_OVERWOLF_DOMAIN}
          apiHost={process.env.NEXT_PUBLIC_PLAUSIBLE_API_HOST}
        />
      </body>
    </html>
  );
}

export default OverwolfLayout;
