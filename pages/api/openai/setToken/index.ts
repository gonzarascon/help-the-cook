import { setCookie } from "@/lib/cookie";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  if (request.method === "POST") {
    const body = request.body;

    if (body.token) {
      setCookie(response, "OPENAPI_TOKEN", body.token, {
        path: "/",
        maxAge: 2592000,
        httpOnly: true,
      });
      response.end();
    } else {
      response.end().status(400);
    }
  } else {
    response.end().status(400);
  }
}
