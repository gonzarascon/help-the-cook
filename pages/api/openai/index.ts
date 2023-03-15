import { NextApiRequest, NextApiResponse } from "next";
import { Configuration, OpenAIApi } from "openai";

const systemConfig = `You are an experienced chef that wants to help people easily cook from their homes. You explain recipes with ease and without complicating them much so anyone can cook. You always format your recipes using Markdown so the users can read them easily.`;

const prompt = (
  listedItems: string
) => `I want to cook something with the ingredients in my house but I have no ideas. Based on the following ingredients and quantities, write a recipe for me to do, it does not necessarily need to include all of the ingredients listed but you can't add ingredients that I haven't listed.
Currently, I have:
${listedItems}
What can I make?`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const token = req.cookies.OPENAPI_TOKEN;

    const items = req.body.items as string[];

    const formattedItems = items.map((i) => `- ${i}`).join("\r\n");

    if (!token) {
      res.status(404);
      res.end();
    } else {
      const config = new Configuration({
        apiKey: token,
      });

      const openAI = new OpenAIApi(config);

      const response = await openAI.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: prompt(formattedItems),
          },
          {
            role: "system",
            content: systemConfig,
          },
        ],
        max_tokens: 500,
        temperature: 0.6,
      });
      return res.send(response.data.choices[0]?.message?.content);
    }
  } catch (err: any) {
    console.log({ err });
    return res.status(500).send(err);
  }
}
