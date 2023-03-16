import "@/styles/globals.css";
import { AppProps } from "next/app";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Chivo, Lato } from "next/font/google";
import { cn } from "@/lib/cn";

const queryClient = new QueryClient();

const chivo = Chivo({ subsets: ["latin"], variable: "--font-chivo" });
const lato = Lato({
  subsets: ["latin"],
  variable: "--font-lato",
  weight: ["300", "400"],
});

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <div
        className={cn(
          "bg-slate-50 dark:bg-slate-800 font-sans",
          chivo.variable,
          lato.variable
        )}
      >
        <Component {...pageProps} />
        <style jsx global>{`
          :root {
            --font-chivo: ${chivo.style.fontFamily};
            --font-lato: ${lato.style.fontFamily};
          }
        `}</style>
      </div>
    </QueryClientProvider>
  );
}
