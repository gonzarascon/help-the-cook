import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useMutation } from "@tanstack/react-query";
import { cn } from "@/lib/cn";
import { Input } from "./ui/input";
import { useTheme } from "next-themes";
import Sun from "@/public/icons/sun-outline.svg";
import Moon from "@/public/icons/moon-outline.svg";

export default function Nav() {
  const [tokenSaved, setTokenSaved] = useLocalStorage("token_saved", false);
  const [open, setOpen] = React.useState(false);
  const [token, setToken] = React.useState<string | null>(null);
  const tokenMutation = useMutation({
    mutationFn: (token: string) =>
      fetch("/api/openai/setToken", {
        method: "POST",
        body: JSON.stringify({ token }),
        headers: { "Content-Type": "application/json" },
      }),
  });

  const { theme, setTheme } = useTheme();

  return (
    <header className="absolute top-0 flex items-center justify-between w-full px-20 py-5">
      <button
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        className="p-3 transition-colors rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
      >
        {theme === "light" ? (
          <Sun className="w-5 h-5 text-slate-700" />
        ) : (
          <Moon className="w-5 h-5 text-slate-100" />
        )}
      </button>

      <Dialog
        open={open}
        onOpenChange={(open) => {
          setOpen(open);
          if (!tokenSaved) {
            setTokenSaved(true);
          }
        }}
      >
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className={cn({
              "animate-ring ease-in-out direction-alternate delay-100 justify-self-end":
                !tokenSaved,
            })}
          >
            Add Open AI Token
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Open AI Token</DialogTitle>
            <DialogDescription className="font-lato">
              In order to this app to work, you should set your Open AI Token.
              Don&apos;t worry, we will never store it anywhere else than your
              browser.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label
              htmlFor="token"
              className="text-right dark:text-white font-lato"
            >
              Your Open AI Token
            </Label>
            <Input
              id="token"
              onChange={(e) => setToken(e.target.value)}
              className="col-span-3"
            />
          </div>
          <DialogFooter>
            <Button
              type="submit"
              onClick={() => {
                tokenMutation.mutate(token ?? "");
                setOpen(false);
              }}
            >
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}
