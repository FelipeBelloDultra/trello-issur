import { base } from "@trello-issur/eslint-config/base";
import { react } from "@trello-issur/eslint-config/react";
import { defineConfig } from "eslint/config";

export default defineConfig([...base, ...react]);
