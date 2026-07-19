import {
  Armchair,
  Baby,
  Boxes,
  Briefcase,
  Building2,
  Car,
  Dumbbell,
  Footprints,
  Gift,
  HardHat,
  Home,
  Laptop,
  type LucideIcon,
  Palette,
  PawPrint,
  Refrigerator,
  Shirt,
  Smartphone,
  Sprout,
  Tag,
  Tractor,
  Wrench,
} from "lucide-react";

const ICONS_BY_SLUG: Record<string, LucideIcon> = {
  nedvizhimost: Home,
  avtomobili: Car,
  rabota: Briefcase,
  uslugi: Wrench,
  telefony: Smartphone,
  kompyutery: Laptop,
  elektronika: Laptop,
  "bytovaya-tehnika": Refrigerator,
  odezhda: Shirt,
  obuv: Footprints,
  "dlya-detey": Baby,
  "dom-i-sad": Sprout,
  zhivotnye: PawPrint,
  "selskoe-hozyaystvo": Tractor,
  stroymaterialy: HardHat,
  mebel: Armchair,
  hobbi: Palette,
  sport: Dumbbell,
  biznes: Building2,
  "otdam-darom": Gift,
  raznoe: Boxes,
};

export function CategoryIcon({ slug, className }: { slug: string; className?: string }) {
  const Icon = ICONS_BY_SLUG[slug] ?? Tag;
  return <Icon className={className} strokeWidth={1.8} />;
}
