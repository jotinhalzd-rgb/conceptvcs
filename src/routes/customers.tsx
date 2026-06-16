import { createFileRoute } from "@tanstack/react-router";
import { Customer360View } from "@/pages/customers";

type CustomersSearch = { contact?: string };

export const Route = createFileRoute("/customers")({
  validateSearch: (search: Record<string, unknown>): CustomersSearch => ({
    contact: typeof search.contact === "string" ? search.contact : undefined,
  }),
  component: CustomersPage,
});

function CustomersPage() {
  const { contact } = Route.useSearch();
  return <Customer360View initialContactId={contact} />;
}
