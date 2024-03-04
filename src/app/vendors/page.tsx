// Events Page - lists all the events and allows user to create or update events

import { VendorsTable } from "./components/VendorsTable";

export default async function VendorsPage() {
  return (
    <main className="container">
      <h1>Vendors</h1>
      <VendorsTable />
    </main>
  );
}
