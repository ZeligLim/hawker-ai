export type CustomizationOption = {
  id: string;
  label: string;
  price: number;
};

export type DishCustomization = {
  // Extras / Add-ons
  title?: string;
  options?: CustomizationOption[];
  multiSelect?: boolean;
  
  // Spice Level
  spiceOptions?: CustomizationOption[];
};

export type CustomizationSource =
  | string
  | {
      name?: string;
      customizations?: any;
      spiceLevel?: number;
      spice_level?: number;
    };

const SPICE_OPTIONS: CustomizationOption[] = [
  { id: 'spice-0', label: 'Level 0 · Mild / No chili', price: 0 },
  { id: 'spice-1', label: 'Level 1 · Light spice', price: 0 },
  { id: 'spice-2', label: 'Level 2 · Medium spice', price: 0 },
  { id: 'spice-3', label: 'Level 3 · Extra hot', price: 0.5 },
];

export function getDishCustomization(source: CustomizationSource | null | undefined): DishCustomization | null {
  if (!source) return null;

  let isSpicy = false;
  let parsedOptions: CustomizationOption[] = [];
  let dishName = '';

  // Case 1: Object passed with real database customizations or spice level
  if (typeof source === 'object') {
    const rawCustoms = source.customizations;
    const spice = Number(source.spiceLevel ?? source.spice_level ?? 0);
    dishName = (source.name ?? '').trim();

    isSpicy = spice > 0 || /curry|laksa|sambal|chili|chilli|spicy|pedas|tomyum|tom yum|mala|nasi lemak|mee goreng|pan mee|kway teow|char kway|rendang|hot/i.test(dishName);

    if (Array.isArray(rawCustoms) && rawCustoms.length > 0) {
      parsedOptions = rawCustoms
        .map((item, index) => {
          if (!item) return null;
          if (typeof item === 'string') {
            const trimmed = item.trim();
            if (!trimmed) return null;
            return { id: `opt-${index}`, label: trimmed, price: 0 };
          }
          if (typeof item === 'object') {
            const label = (item.label ?? item.name ?? '').trim();
            if (!label) return null;
            const price = Number(item.price ?? 0);
            return {
              id: `opt-${index}-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
              label,
              price: isNaN(price) ? 0 : price,
            };
          }
          return null;
        })
        .filter((opt): opt is CustomizationOption => opt !== null);
    }
  } else {
    // Case 2: String dish name passed (legacy fallback)
    dishName = source.toLowerCase().trim();
    isSpicy = /curry|laksa|sambal|chili|chilli|spicy|pedas|tomyum|tom yum|mala|nasi lemak|mee goreng|pan mee|kway teow|char kway|rendang|hot/i.test(dishName);
  }

  // Fallback to legacy extras if no parsedOptions found
  if (parsedOptions.length === 0 && (dishName.includes('chicken rice') || dishName.includes('rice') || dishName.includes('noodle'))) {
    parsedOptions = [
      { id: 'large', label: 'Make it large', price: 2 },
      { id: 'egg', label: 'Add egg', price: 1.5 },
    ];
  }

  // Return null if neither spicy nor has options
  if (!isSpicy && parsedOptions.length === 0) {
    return null;
  }

  const result: DishCustomization = {};
  
  if (parsedOptions.length > 0) {
    result.title = 'Select options & add-ons';
    result.options = parsedOptions;
    result.multiSelect = true;
  }
  
  if (isSpicy) {
    result.spiceOptions = SPICE_OPTIONS;
  }

  return result;
}
