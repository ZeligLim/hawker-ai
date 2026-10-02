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

export function getDishCustomization(source: CustomizationSource | null | undefined): DishCustomization | null {
  if (!source) return null;

  let parsedOptions: CustomizationOption[] = [];
  let dishName = '';

  // Case 1: Object passed with real database customizations or spice level
  if (typeof source === 'object') {
    const rawCustoms = source.customizations;
    const spice = Number(source.spiceLevel ?? source.spice_level ?? 0);
    dishName = (source.name ?? '').trim();

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
    }

  // Fallback to legacy extras if no parsedOptions found
  if (parsedOptions.length === 0 && (dishName.includes('chicken rice') || dishName.includes('rice') || dishName.includes('noodle'))) {
    parsedOptions = [
      { id: 'large', label: 'Make it large', price: 2 },
      { id: 'egg', label: 'Add egg', price: 1.5 },
    ];
  }

  // Return null if neither spicy nor has options
  if (parsedOptions.length === 0) {
    return null;
  }

  const result: DishCustomization = {};
  
  if (parsedOptions.length > 0) {
    result.title = 'Select options & add-ons';
    result.options = parsedOptions;
    result.multiSelect = true;
  }
  
  

  return result;
}
