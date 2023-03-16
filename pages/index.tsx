import { Input } from "@/components/ui/input";
import type { NextPage } from "next";
import Head from "next/head";
import { useFieldArray, useForm } from "react-hook-form";
import PlusCircleSolid from "@/public/icons/plus-circle-solid.svg";
import { cn } from "@/lib/cn";
import { useMutation } from "@tanstack/react-query";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import ReactMarkdown from "react-markdown";
import { Transition } from "@headlessui/react";
import Cross from "@/public/icons/close-outline.svg";
import { useState, useEffect } from "react";
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

const schema = z.object({
  ingredients: z.array(z.object({ value: z.string().min(3) })),
});

const ingredientPlaceholders: string[] = [
  "3 carrots",
  "Two kiwis",
  "3oz of milk",
  "A cup of sugar",
  "1/4 teaspoon of salt",
  "1/2 onion, chopped",
  "1 pound ground beef",
  "1 can of tomato sauce",
  "2 cloves of garlic, minced",
  "1/2 cup of olive oil",
];

type FormState = {
  token: string;
  ingredients: { value: string }[];
};

const Home: NextPage = () => {
  const [tokenSaved, setTokenSaved] = useLocalStorage("token_saved", false);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const {
    control,
    register,
    handleSubmit,
    formState: { isValid, isSubmitting },
    getValues,
  } = useForm<FormState>({
    resolver: zodResolver(schema),
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "ingredients",
  });

  const tokenMutation = useMutation({
    mutationFn: (token: string) =>
      fetch("/api/openai/setToken", {
        method: "POST",
        body: JSON.stringify({ token }),
        headers: { "Content-Type": "application/json" },
      }),
  });

  const recipeMutation = useMutation({
    mutationFn: (items: string[]) =>
      fetch("/api/openai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      }),
    onSuccess: async (data) => {
      if (data.ok) {
        const body = data.body;
        const reader = body?.getReader();
        const decoder = new TextDecoder();
        let done = false;

        if (reader) {
          while (!done) {
            const { value, done: doneReading } = await reader.read();
            done = doneReading;
            const chunkValue = decoder.decode(value);

            setText((prev) => prev + chunkValue);
          }
        }
      }
    },
  });

  const generateRecipe = (data: FormState) => {
    recipeMutation.mutate(
      data.ingredients.map((ingredient) => ingredient.value)
    );
  };

  return (
    <div>
      <Head>
        <title>Help the cook!</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="w-full min-h-screen px-20 bg-top bg-cover py-28 bg-mesh-orange-purple">
        <div className="absolute top-5 right-5">
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
                  "animate-ring ease-in-out direction-alternate delay-100":
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
                  In order to this app to work, you should set your Open AI
                  Token. Don&apos;t worry, we will never store it anywhere else
                  than your browser.
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
                  {...register("token")}
                  className="col-span-3"
                />
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  onClick={() => {
                    tokenMutation.mutate(getValues("token"));
                    setOpen(false);
                  }}
                >
                  Save changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <section className="min-h-[65vh] flex flex-col justify-center e">
          <h1 className="text-6xl font-bold text-slate-700 dark:text-white">
            Help the <span className="text-purple-500">cook</span> 🧑‍🍳
          </h1>

          <p className="mt-3 text-2xl font-light dark:text-slate-100 font-lato">
            Don&apos;t know what to cook today? Just list the ingredients in
            your fridge and let the AI help you choose
          </p>

          <form
            className="w-full mt-8 mb-6 space-y-10"
            onSubmit={handleSubmit(generateRecipe)}
          >
            <div className="flex items-center justify-center w-full gap-5 flex-nowrap">
              <div
                className={cn(
                  "overflow-auto max-w-[calc((245px*3))] scrollbar pb-2 border-r border-transparent transition-colors hidden",
                  { "w-full border-slate-700 block": fields.length !== 0 }
                )}
              >
                <fieldset className="flex items-center gap-4 mx-auto">
                  {fields.map((field, index) => (
                    <div className="relative p-2 group" key={field.id}>
                      <Input
                        {...register(`ingredients.${index}.value`)}
                        className="min-w-[200px]"
                      />
                      <button
                        type="button"
                        className="absolute top-0 right-0 transition-opacity opacity-0 group-hover:opacity-100"
                        onClick={() => remove(index)}
                      >
                        <PlusCircleSolid className="w-5 h-5 text-red-500 rotate-45 hover:text-red-400" />
                      </button>
                    </div>
                  ))}
                </fieldset>
              </div>
              <button
                className="flex items-center self-start gap-3 p-5 transition-opacity bg-purple-600 border border-purple-500 rounded-lg bg-opacity-30 group hover:bg-opacity-50"
                onClick={() =>
                  append({
                    value:
                      ingredientPlaceholders[
                        Math.floor(
                          Math.random() * ingredientPlaceholders.length
                        )
                      ],
                  })
                }
                type="button"
              >
                <PlusCircleSolid className="w-6 h-6 text-purple-100" />
                <span className="text-sm font-semibold text-purple-100">
                  Add ingredient
                </span>
              </button>
            </div>

            <button
              className="block px-5 py-3 mx-auto font-bold text-green-100 transition-opacity bg-green-700 border border-green-500 rounded-lg bg-opacity-30 hover:bg-opacity-50 disabled:bg-gray-700 disabled:text-white disabled:border-gray-400"
              type="submit"
              disabled={
                !isValid ||
                isSubmitting ||
                recipeMutation.isLoading ||
                fields.length === 0
              }
            >
              Let&apos;s get cooking!
            </button>
          </form>
        </section>
        <div className="flex flex-wrap items-center max-w-4xl mt-6 sm:w-full">
          <Transition show={!!text} className="max-w-prose">
            <Transition.Child
              className="flex flex-row-reverse items-center w-full gap-4 mb-20"
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <button
                onClick={() => {
                  setText("");
                }}
                className="flex items-center px-4 py-1 mx-auto text-red-300 transition-opacity bg-red-600 border border-red-400 rounded-full hover:gap-2 group w-fit bg-opacity-30 hover:bg-opacity-70 flex-nowrap"
              >
                <span className="w-0 opacity-0 overflow-hidden transition-all group-hover:w-[50px] group-hover:opacity-100">
                  Clear
                </span>{" "}
                <Cross className="w-3 h-3" />
              </button>
              <hr className="border-none h-0.5 dark:bg-slate-100 rounded-md w-full" />
            </Transition.Child>
            <Transition.Child
              className="w-full"
              enter="transition ease-in-out duration-300 transform"
              enterFrom="scale-0 opacity-0"
              enterTo="scale-100 opacity-100"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-0"
            >
              <ReactMarkdown className="w-full mb-12 prose xl:prose-xl dark:prose-headings:text-purple-500 dark:prose-p:text-slate-200 dark:prose-li:text-slate-300 dark:prose-strong:text-purple-500">
                {text ?? ""}
              </ReactMarkdown>
            </Transition.Child>
          </Transition>
        </div>
      </main>
    </div>
  );
};

export default Home;
