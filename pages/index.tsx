import { Input } from "@/components/ui/input";
import type { NextPage } from "next";
import Head from "next/head";
import { useFieldArray, useForm } from "react-hook-form";
import PlusCircleSolid from "@/public/icons/plus-circle-solid.svg";
import { cn } from "@/lib/cn";
import TokenDialog from "@/components/tokenDialog";
import { useMutation } from "@tanstack/react-query";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import ReactMarkdown from "react-markdown";
import { Transition } from "@headlessui/react";
import Cross from "@/public/icons/close-outline.svg";

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
      }).then((res) => res.text()),
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

      <main className="w-full px-20 py-28 min-h-screen">
        <div className="absolute top-5 right-5">
          <TokenDialog mutate={tokenMutation.mutate} />
        </div>
        <section className="min-h-[65vh] flex flex-col justify-center">
          <h1 className="text-6xl font-bold dark:text-purple-500">
            Help the cook 🧑‍🍳
          </h1>

          <p className="mt-3 text-2xl dark:text-slate-100">
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
                className="flex items-center self-start gap-3 p-5 transition-opacity bg-purple-600 bg-opacity-30 border border-purple-500 rounded-lg group hover:bg-opacity-50"
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
              className="px-5 py-3 font-bold text-green-100 bg-green-700 border border-green-500 bg-opacity-30 hover:bg-opacity-50 transition-opacity rounded-lg disabled:bg-gray-700 disabled:text-white disabled:border-gray-400 block mx-auto"
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
        <div className="flex flex-wrap items-center justify-around max-w-4xl mt-6 sm:w-full">
          <Transition show={recipeMutation.isSuccess}>
            <Transition.Child
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <hr className="mb-20 border-none h-0.5 dark:bg-slate-100 rounded-md" />
            </Transition.Child>
            <Transition.Child
              enter="transition ease-in-out duration-300 transform"
              enterFrom="scale-0 opacity-0"
              enterTo="scale-100 opacity-100"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-y-0 scale-100"
              leaveTo="-translate-y-full scale-0"
            >
              <ReactMarkdown className="prose xl:prose-xl dark:prose-headings:text-purple-500 dark:prose-p:text-slate-200 dark:prose-li:text-slate-300 mb-12">
                {recipeMutation.data ?? ""}
              </ReactMarkdown>
              <button
                onClick={recipeMutation.reset}
                className="w-fit px-4 py-1 bg-red-600 bg-opacity-30 text-red-300 hover:bg-opacity-70 border border-red-400 rounded-full transition-opacity mx-auto flex flex-nowrap items-center gap-2"
              >
                Clear <Cross className="h-3 w-3" />
              </button>
            </Transition.Child>
          </Transition>
        </div>
      </main>
    </div>
  );
};

export default Home;
