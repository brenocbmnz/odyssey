import "@testing-library/jest-dom/vitest";
import { afterEach, beforeAll, afterAll } from "vitest";
import { cleanup, configure } from "@testing-library/react";
import { setupServer } from "msw/node";
import { handlers } from "../mocks/handlers";
export const server = setupServer(...handlers);
beforeAll(() => server.listen());
afterEach(() => {
  cleanup();
  server.resetHandlers();
  localStorage.clear();
});
afterAll(() => server.close());
Object.defineProperty(window, "scrollTo", {
  value: () => undefined,
  writable: true,
});

configure({ asyncUtilTimeout: 4000 });
