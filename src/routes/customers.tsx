import { createFileRoute } from "@tanstack/react-router";
import { Customer360View } from "@/pages/customers";

export const Route = createFileRoute("/customers")({
  component: CustomersPage,
});

function CustomersPage() {
  return <Customer360View />;
}
