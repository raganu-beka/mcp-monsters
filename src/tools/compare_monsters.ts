import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { sql } from "../db.ts";

type MonsterRow = {
  monster_id: number;
  name: string;
  monster_type: string;
  habitat: string;
  rarity: string;
  primary_power: string;
  category_name: string;
};

type Affinity = { target_name: string; modifier: number };

export function registerCompareMonsters(server: McpServer) {
  server.registerTool(
    "compare_monsters",
    {
      description:
        "Side-by-side comparison of two monsters in a single round-trip: categories, types, rarities, primary powers, and full augments/hindrances tables for both. Returns the structured data — assessment of who wins is left to the caller, since fuzzy type-matchup reasoning is something LLMs do well and a server doing substring matching does badly.",
      inputSchema: {
        name_a: z
          .string()
          .min(1)
          .describe("Name of the first monster (case-insensitive)."),
        name_b: z
          .string()
          .min(1)
          .describe("Name of the second monster (case-insensitive)."),
      },
    },
    async ({ name_a, name_b }) => {
      const rows = await sql<MonsterRow[]>`
        SELECT m.monster_id, m.name, m.monster_type, m.habitat, m.rarity,
               m.primary_power, c.category_name
        FROM monsters m
        JOIN subcategories s ON s.subcategory_id = m.subcategory_id
        JOIN categories c ON c.category_id = s.category_id
        WHERE LOWER(m.name) IN (LOWER(${name_a}), LOWER(${name_b}))
      `;

      const a = rows.find((r) => r.name.toLowerCase() === name_a.toLowerCase());
      const b = rows.find((r) => r.name.toLowerCase() === name_b.toLowerCase());

      if (!a || !b) {
        const missing = !a ? name_a : name_b;
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  error: `Monster "${missing}" not found.`,
                  source: "RAGmonsters DB · ragmonsters-server 3.4",
                  next: [`list_categories({})`],
                },
                null,
                2,
              ),
            },
          ],
        };
      }

      const [aAug, aHin, bAug, bHin] = await Promise.all([
        sql<
          Affinity[]
        >`SELECT target_name, modifier FROM augments WHERE monster_id = ${a.monster_id}`,
        sql<
          Affinity[]
        >`SELECT target_name, modifier FROM hindrances WHERE monster_id = ${a.monster_id}`,
        sql<
          Affinity[]
        >`SELECT target_name, modifier FROM augments WHERE monster_id = ${b.monster_id}`,
        sql<
          Affinity[]
        >`SELECT target_name, modifier FROM hindrances WHERE monster_id = ${b.monster_id}`,
      ]);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                comparison: {
                  [a.name]: {
                    category: a.category_name,
                    type: a.monster_type,
                    habitat: a.habitat,
                    rarity: a.rarity,
                    primary_power: a.primary_power,
                    augments: aAug,
                    hindrances: aHin,
                  },
                  [b.name]: {
                    category: b.category_name,
                    type: b.monster_type,
                    habitat: b.habitat,
                    rarity: b.rarity,
                    primary_power: b.primary_power,
                    augments: bAug,
                    hindrances: bHin,
                  },
                },
                summary: `${a.name} (${a.category_name}, type=${a.monster_type}) vs. ${b.name} (${b.category_name}, type=${b.monster_type}). Augments listed under each monster boost it against named targets; hindrances penalise it. Assess the matchup by reading both sides — including whether each monster's augment targets describe the *other* monster, and whether each monster's hindrances are triggered by the *other* monster's type.`,
                source: "RAGmonsters DB · mcp-monsters",
                next: [
                  `get_monster_details({ name: "${a.name}" })`,
                  `get_monster_details({ name: "${b.name}" })`,
                ],
              },
              null,
              2,
            ),
          },
        ],
      };
    },
  );
}
