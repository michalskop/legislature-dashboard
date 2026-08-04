"use client";

// Thin client-side wrapper around @legislature/ui's SortableMpTable.
//
// Server Components can't pass function props across the server/client RSC
// boundary (Next.js serializes props — functions aren't serializable unless
// marked "use server"). The upstream component takes a `getMpHref(slug)`
// callback for exactly this reason it needs city+lang context it doesn't
// otherwise have. Rather than construct that closure in a Server Component
// and hand it across the boundary (which fails at build time — see A2 commit
// history for the exact error this wrapper fixes), this wrapper is itself a
// Client Component: it receives a plain, serializable `basePath` string from
// its (Server Component) caller and builds the closure locally, entirely on
// the client side of the boundary.
import { SortableMpTable as BaseSortableMpTable } from "@legislature/ui";
import type { SortableMpTableProps } from "@legislature/ui";

interface Props extends Omit<SortableMpTableProps, "getMpHref"> {
  /** City base path, e.g. "/praha" or "/en/praha". */
  basePath: string;
}

export function SortableMpTable({ basePath, ...rest }: Props) {
  return <BaseSortableMpTable {...rest} getMpHref={(slug) => `${basePath}/member/${slug}`} />;
}

export type { SortableMpTableProps };
