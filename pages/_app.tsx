import "@/styles/globals.css";
import { AppProps } from "next/app";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="bg-slate-50 dark:bg-slate-800">
        <Component {...pageProps} />
      </div>
    </QueryClientProvider>
  );
}
