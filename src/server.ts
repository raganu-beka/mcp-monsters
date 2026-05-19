import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { registerSearchMonstersByCategory } from "./tools/search_monsters_by_category.ts";
import { registerGetMonsterDetails } from "./tools/get_monster_details.ts";
import { registerListCategories } from "./tools/list_categories.ts";
import { registerSchemaResource } from "./resources/schema.ts";
import { registerMonstersCategoriesResource } from "./resources/monsters_categories.ts";
import { registerAnalyzeMonsterPrompt } from "./prompts/analyze_monster.ts";
import { registerCompareMonsters } from "./tools/compare_monsters.ts";

import { initializeCache } from "./cache.ts";

const server = new McpServer(
  {
    name: "mcp-monsters",
    version: "0.1.0",
  },
  {
    instructions: [
      "This server exposes a small catalogue of fictional monsters (the RAGmonsters dataset).",
      "",
      "Before using any Tool for the first time in a conversation, read the `monsters://schema` Resource. It describes the domain (six monster categories, what each Tool does, what is deliberately not exposed) and will save you from guessing category names or Tool semantics.",
      "",
      "Quick map:",
      "- `monsters://schema` — hand-written domain overview. Read first.",
      "- `monsters://categories` — the six valid category names with descriptions.",
      "- Tools: `search_monsters_by_category`, `get_monster_details`, `list_categories`.",
    ].join("\n"),
  },
);

registerSearchMonstersByCategory(server);
registerGetMonsterDetails(server);
registerListCategories(server);
registerCompareMonsters(server);

registerMonstersCategoriesResource(server);
registerSchemaResource(server);

registerAnalyzeMonsterPrompt(server);

await initializeCache();

const transport = new StdioServerTransport();
await server.connect(transport);

console.error("[mcp-monsters] connected, ready");
