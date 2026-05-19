import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { registerSearchMonstersByCategory } from "./tools/search_monsters_by_category.ts";
import { registerGetMonsterDetails } from "./tools/get_monster_details.ts";
import { registerListCategories } from "./tools/list_categories.ts";
import { registerSchemaResource } from "./resources/schema.ts";
import { registerMonstersCategoriesResource } from "./resources/monsters_categories.ts";
import { registerAnalyzeMonsterPrompt } from "./prompts/analyze_monster.ts";

const server = new McpServer({
  name: "mcp-monsters",
  version: "0.1.0",
});

registerSearchMonstersByCategory(server);
registerGetMonsterDetails(server);
registerListCategories(server);

registerMonstersCategoriesResource(server);
registerSchemaResource(server);

registerAnalyzeMonsterPrompt(server);

const transport = new StdioServerTransport();
await server.connect(transport);

console.error("[mcp-monsters] connected, ready");
