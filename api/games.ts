import type { IncomingMessage, ServerResponse } from "node:http";
import { handleRawg } from "../server/rawg.js";
export default function handler(req: IncomingMessage, res: ServerResponse) {
  return handleRawg(req, res);
}
