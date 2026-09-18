export type CustomizationOption = {
  id: string;
  label: string;
  price: number;
};

export type DishCustomization = {
  title: string;
  options: CustomizationOption[];
  multiSelect?: boolean;
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

  // Case 1: Object passed with real database customizations or spice level
  if (typeof source === 'object') {
    const rawCustoms = source.customizations;
    const spice = Number(source.spiceLevel ?? source.spice_level ?? 0);
    const dishName = (source.name ?? '').trim();

    // Check if the dish is spicy by spice level or by culinary keywords
    const isSpicy =
      spice > 0 ||
      /curry|laksa|sambal|chili|chilli|spicy|pedas|tomyum|tom yum|mala|nasi lemak|mee goreng|pan mee|kway teow|char kway|rendang|hot/i.test(
        dishName
      );

    if (isSpicy) {
      const spiceOptions: CustomizationOption[] = [
        { id: 'spice-0', label: 'Level 0 · Mild / No chili', price: 0 },
        { id: 'spice-1', label: 'Level 1 · Light spice', price: 0 },
        { id: 'spice-2', label: 'Level 2 · Medium spice', price: 0 },
        { id: 'spice-3', label: 'Level 3 · Extra hot', price: 0.5 },
      ];
      return {
        title: 'Choose your spice level',
        options: spiceOptions,
        multiSelect: false,
      };
    }

    if (Array.isArray(rawCustoms) && rawCustoms.length > 0) {
      const parsedOptions: CustomizationOption[] = rawCustoms
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

      if (parsedOptions.length > 0) {
        return {
          title: 'Select options & add-ons',
          options: parsedOptions,
          multiSelect: true,
        };
      }
    }

    // Fall back to dish name checks for legacy/demo dishes
    if (dishName) {
      return getDishCustomization(dishName);
    }

    return null;
  }

  // Case 2: String dish name passed (legacy fallback)
  const name = source.toLowerCase().trim();

  const isSpicy =
    /curry|laksa|sambal|chili|chilli|spicy|pedas|tomyum|tom yum|mala|nasi lemak|mee goreng|pan mee|kway teow|char kway|rendang|hot/i.test(
      name
    );

  if (isSpicy) {
    return {
      title: 'Choose your spice level',
      options: [
        { id: 'spice-0', label: 'Level 0 · Mild / No chili', price: 0 },
        { id: 'spice-1', label: 'Level 1 · Light spice', price: 0 },
        { id: 'spice-2', label: 'Level 2 · Medium spice', price: 0 },
        { id: 'spice-3', label: 'Level 3 · Extra hot', price: 0.5 },
      ],
      multiSelect: false,
    };
  }

  if (name.includes('chicken rice') || name.includes('rice') || name.includes('noodle')) {
    return {
      title: 'Add extras',
      options: [
        { id: 'large', label: 'Make it large', price: 2 },
        { id: 'egg', label: 'Add egg', price: 1.5 },
      ],
      multiSelect: true,
    };
  }

  return null;
}
