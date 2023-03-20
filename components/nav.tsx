import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import TwitterSolid from "@/public/icons/twitter-solid.svg";
import GithubSolid from "@/public/icons/github-solid.svg";
import { event } from "@/lib/ga";

const schema = z.object({
  token: z
    .string({
      invalid_type_error: "Please enter an OpenAI token",
      required_error: "This field is required",
    })
    .regex(/^sk-[A-Za-z0-9-_]{48}$/, "Please enter an OpenAI token")
    .min(51, "Please enter an OpenAI token")
    .max(51, "Please enter an OpenAI token"),
});

type FormState = {
  token: string;
};

export default function Nav() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormState>({
    resolver: zodResolver(schema),
  });
  const [tokenSaved, setTokenSaved] = useLocalStorage("token_saved", false);
  const [open, setOpen] = React.useState(false);
  const tokenMutation = useMutation({
    mutationFn: (token: string) =>
      fetch("/api/openai/setToken", {
        method: "POST",
        body: JSON.stringify({ token }),
        headers: { "Content-Type": "application/json" },
      }),
    onSuccess: () => {
      setTokenSaved(true);
    },
  });

  const [mounted, setMounted] = React.useState(false);
  const { theme, setTheme } = useTheme();

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setMounted(true);
    }
  }, []);

  const onSubmit = (data: FormState) => {
    event({
      action: "set_api_key",
      category: "user_interaction",
      label: "User sets OpenAI API key",
    });
    tokenMutation.mutate(data?.token ?? "");
    setOpen(false);
  };

  return (
    <header className="absolute top-0 flex items-center justify-between w-full px-5 py-5 lg:px-20">
      <button
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        className={cn(
          "p-3 transition-colors rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700",
          {
            "text-slate-700": theme === "light",
            "text-slate-100": theme === "dark",
          }
        )}
      >
        {mounted ? (
          <>
            {theme === "light" ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </>
        ) : (
          <span className="block w-5 h-5" />
        )}
      </button>
      <div className="flex items-center gap-4 ">
        <a
          className="p-3 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
          href="https://github.com/gonzarascon/help-the-cook"
          rel="noopener noreferrer"
          target="_blank"
        >
          <GithubSolid className="w-6 h-6 opacity-75 fill-slate-400 dark:fill-slate-200" />
        </a>
        <a
          className="p-3 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
          href="https://twitter.com/Gonza_Rascon"
          rel="noopener noreferrer"
          target="_blank"
        >
          <TwitterSolid className="w-5 h-5 opacity-75 fill-slate-400 dark:fill-slate-200" />
        </a>
        <Dialog
          open={open}
          onOpenChange={(open) => {
            setOpen(open);
            event({
              action: "toggle_api_modal",
              category: "user_interaction",
              label: "User toggles the set api modal",
              value: open,
            });
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
              Add Open AI API Key
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Open AI Token</DialogTitle>
              <DialogDescription className="font-lato">
                In order to this app to work, you should set{" "}
                <a
                  className="text-purple-500 underline"
                  href="https://help.openai.com/en/articles/4936850-where-do-i-find-my-secret-api-key"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  your Open AI API Key
                </a>
                . Don&apos;t worry, we will never store it anywhere else than
                your browser.
              </DialogDescription>
            </DialogHeader>
            <form className="py-4" onSubmit={handleSubmit(onSubmit)}>
              <Label
                htmlFor="token"
                className="text-right dark:text-white font-lato"
              >
                Your Open AI API Key
              </Label>
              <Input id="token" {...register("token")} className="col-span-3" />
              <span className="block mt-2 min-h-[20px] text-sm font-light text-rose-600">
                {errors.token?.message}
              </span>
              <Button type="submit" className="block mt-5 ml-auto">
                Save changes
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );
}
