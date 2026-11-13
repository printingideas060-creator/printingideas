import { Package } from "lucide-react";
import PriceTable from "./PriceTable";

export default function SuppliesPriceTable({ items, onSave }) {
  return <PriceTable title="Supplies Price List" items={items} onSave={onSave} icon={Package} />;
}
