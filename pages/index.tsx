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
import { useState } from "react";
import useLocalStorage from "@/hooks/useLocalStorage";
import { event } from "@/lib/ga";

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
  ingredients: { value: string }[];
};

const Home: NextPage = () => {
  const [tokenSaved] = useLocalStorage("token_saved", false);

  const [text, setText] = useState("");
  const {
    control,
    register,
    handleSubmit,
    formState: { isValid, isSubmitting },
  } = useForm<FormState>({
    resolver: zodResolver(schema),
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "ingredients",
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
    event({
      action: "submit_form",
      category: "user_interaction",
      label: "Submit form",
    });
    setText("");
    recipeMutation.mutate(
      data.ingredients.map((ingredient) => ingredient.value)
    );
  };

  return (
    <div>
      <Head>
        <title>Help the cook!</title>
        <link rel="icon" href="/favicon.ico" />
        <meta name="og:title" content="Help the cook! 🧑‍🍳" />
        <meta
          name="og:description"
          content="AI to the rescue of cooking aficionados"
        />
        <meta
          name="og:image"
          content={`${
            process.env.VERCEL_URL ? "https://" + process.env.VERCEL_URL : ""
          }/og-image.png`}
        />
      </Head>

      <main className="w-full min-h-screen px-5 bg-top bg-cover lg:px-20 py-28 bg-mesh-light dark:bg-mesh-dark">
        <section className="min-h-[65vh] flex flex-col justify-center max-w-5xl mx-auto">
          <h1 className="text-5xl font-bold lg:text-6xl text-slate-700 dark:text-white">
            Help the <span className="text-purple-500">cook</span> 🧑‍🍳
          </h1>

          <p className="max-w-xl mt-3 text-xl font-light lg:text-2xl dark:text-slate-100 font-lato">
            Don&apos;t know what to cook today? Just list the ingredients you
            have at home and let the AI help you choose.
          </p>

          <form
            className="w-full mt-8 mb-6 space-y-10"
            onSubmit={handleSubmit(generateRecipe)}
          >
            <div className="flex flex-col items-center justify-center w-full gap-5 p-4 bg-white shadow-md lg:flex-row rounded-xl dark:bg-transparent dark:shadow-none flex-nowrap">
              <div
                className={cn(
                  "lg:overflow-auto max-w-[calc((245px*3))] scrollbar pb-2 lg:border-r border-transparent transition-colors hidden",
                  {
                    "w-full border-purple-700 dark:border-slate-700 block":
                      fields.length !== 0,
                  }
                )}
              >
                <fieldset className="flex flex-col items-center gap-4 mx-auto lg:flex-row">
                  {fields.map((field, index) => (
                    <div
                      className="relative w-full p-2 group lg:w-auto"
                      key={field.id}
                    >
                      <Input
                        {...register(`ingredients.${index}.value`)}
                        className="min-w-[200px]"
                        placeholder={
                          ingredientPlaceholders[
                            Math.floor(
                              Math.random() * ingredientPlaceholders.length
                            )
                          ]
                        }
                      />
                      <button
                        type="button"
                        className="absolute top-0 right-0 transition-opacity opacity-100 lg:opacity-0 group-hover:opacity-100"
                        onClick={() => remove(index)}
                      >
                        <PlusCircleSolid className="w-5 h-5 text-red-500 rotate-45 hover:text-red-400" />
                      </button>
                    </div>
                  ))}
                </fieldset>
              </div>
              <button
                className="flex items-center gap-3 p-5 transition-colors border border-purple-500 rounded-lg lg:self-start dark:transition-opacity hover:bg-purple-100 dark:bg-purple-600 dark:bg-opacity-30 group dark:hover:bg-opacity-50"
                onClick={() =>
                  append({
                    value: "",
                  })
                }
                type="button"
              >
                <PlusCircleSolid className="w-6 h-6 text-purple-500 dark:text-purple-100" />
                <span className="text-sm font-semibold text-purple-500 dark:text-purple-100 whitespace-nowrap">
                  Add ingredient
                </span>
              </button>
            </div>

            <button
              className="block px-5 py-3 mx-auto text-sm font-semibold text-white transition-colors border border-green-500 rounded-lg dark:transition-opacity bg-lime-500 hover:bg-lime-400 dark:text-green-100 dark:bg-green-700 dark:bg-opacity-30 dark:hover:bg-opacity-50 disabled:bg-slate-400 disabled:opacity-30 dark:disabled:bg-gray-700 disabled:text-white disabled:border-gray-400"
              type="submit"
              disabled={
                !isValid ||
                isSubmitting ||
                recipeMutation.isLoading ||
                fields.length === 0 ||
                !tokenSaved
              }
            >
              Let&apos;s get cooking!
            </button>
          </form>
        </section>
        <div className="flex flex-wrap justify-center max-w-4xl mx-auto mt-6 sm:w-full">
          <Transition
            show={!!text && !recipeMutation.isError}
            className="max-w-prose"
          >
            <Transition.Child
              className="flex items-center w-full mb-10 lg:mb-20 lg:flex-row-reverse"
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <hr className="border-none h-0.5 bg-slate-300 dark:bg-slate-100 rounded-md w-full" />
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
              <ReactMarkdown className="w-full px-6 mb-12 prose-sm prose bg-white shadow-md md:prose-lg dark:bg-transparent dark:shadow-none py-7 rounded-xl prose-headings:text-purple-500 dark:prose-p:text-slate-200 dark:prose-li:text-slate-300 dark:prose-strong:text-purple-500">
                {text ?? ""}
              </ReactMarkdown>
              <button
                onClick={() => {
                  event({
                    action: "clear_text",
                    category: "user_interaction",
                    label: "Clear recipe text",
                  });
                  setText("");
                }}
                className="flex items-center gap-2 px-4 py-1 mx-auto text-sm text-white transition-opacity border border-red-400 rounded-full lg:gap-0 bg-rose-600 dark:bg-red-600 dark:text-red-300 hover:gap-2 group w-fit dark:bg-opacity-30 dark:hover:bg-opacity-70 flex-nowrap"
              >
                <span className="w-auto lg:w-0 lg:opacity-0 overflow-hidden transition-all group-hover:w-[50px] group-hover:opacity-100">
                  Clear
                </span>{" "}
                <Cross className="w-3 h-3" />
              </button>
            </Transition.Child>
          </Transition>
        </div>
      </main>
    </div>
  );
};

export default Home;
