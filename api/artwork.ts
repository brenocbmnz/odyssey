import type { IncomingMessage, ServerResponse } from "node:http";
import { handleArtwork } from "../server/artwork.js";
export default function handler(req: IncomingMessage, res: ServerResponse) {
  return handleArtwork(req, res);
}
