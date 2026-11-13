import { Sliders } from "lucide-react";
import PriceTable from "./PriceTable";

export default function ServicesPriceTable({ items, onSave }) {
  return <PriceTable title="Services Price List" items={items} onSave={onSave} icon={Sliders} />;
}
