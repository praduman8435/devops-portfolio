import { NextResponse } from "next/server";

import { isOwner } from "@/lib/radar/auth";
import { getUpworkAccessToken, upworkGraphql } from "@/lib/radar/upwork";

/**
 * Diagnostic (owner-only): introspects Upwork's live GraphQL schema around job search,
 * so the search query in lib/radar/sources.ts can be matched to it exactly.
 * Open /api/radar/upwork/schema while signed in and connected.
 */
interface TypeRef {
  name: string | null;
  kind: string;
  ofType?: TypeRef | null;
}
interface Field {
  name: string;
  type: TypeRef;
  args?: Array<{ name: string; type: TypeRef }>;
}

const TYPE_REF = "name kind ofType { name kind ofType { name kind ofType { name kind } } }";
const unwrap = (t: TypeRef | null | undefined): string | null => (t ? (t.name ?? unwrap(t.ofType)) : null);

export async function GET() {
  if (!(await isOwner())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const token = await getUpworkAccessToken();
  if (!token) return NextResponse.json({ error: "Connect Upwork first" }, { status: 400 });

  try {
    const q = await upworkGraphql<{ __schema: { queryType: { fields: Field[] } } }>(
      token,
      `{ __schema { queryType { fields { name args { name type { ${TYPE_REF} } } type { ${TYPE_REF} } } } } }`,
    );
    const jobFields = q.__schema.queryType.fields.filter((f) => /job/i.test(f.name));

    const describe = async (name: string | null) => {
      if (!name) return null;
      const t = await upworkGraphql<{ __type: { name: string; fields: Field[] | null; inputFields: Field[] | null; enumValues: Array<{ name: string }> | null } | null }>(
        token,
        `query T($n: String!) { __type(name: $n) { name fields { name type { ${TYPE_REF} } } inputFields { name type { ${TYPE_REF} } } enumValues { name } } }`,
        { n: name },
      );
      const x = t.__type;
      return x && {
        name: x.name,
        fields: x.fields?.map((f) => `${f.name}: ${unwrap(f.type)}`),
        inputFields: x.inputFields?.map((f) => `${f.name}: ${unwrap(f.type)}`),
        enumValues: x.enumValues?.map((e) => e.name),
      };
    };

    const search = jobFields.find((f) => f.name === "marketplaceJobPostingsSearch");
    const resultType = await describe(unwrap(search?.type));
    const edgeType = await describe(resultType?.fields?.find((f) => f.startsWith("edges:"))?.split(": ")[1] ?? null);
    const nodeType = await describe(edgeType?.fields?.find((f) => f.startsWith("node:"))?.split(": ")[1] ?? null);
    const filterType = await describe(unwrap(search?.args?.find((a) => /filter/i.test(a.name))?.type));

    return NextResponse.json(
      {
        jobQueryFields: jobFields.map((f) => ({ name: f.name, args: f.args?.map((a) => `${a.name}: ${unwrap(a.type)}`), returns: unwrap(f.type) })),
        resultType,
        edgeType,
        nodeType,
        filterType,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Introspection failed" }, { status: 502 });
  }
}
