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

export function getDishCustomization(dishName: string): DishCustomization | null {
  const name = dishName.toLowerCase();

  if (name.includes('curry mee') || name.includes('laksa')) {
    return {
      title: 'Choose your spice level',
      options: [
        { id: 'mild', label: 'Mild', price: 0 },
        { id: 'medium', label: 'Medium', price: 0 },
        { id: 'spicy', label: 'Spicy', price: 0 },
        { id: 'extra-spicy', label: 'Extra spicy', price: 0.5 },
      ],
    };
  }

  if (name.includes('chicken rice') || name.includes('nasi lemak') || name.includes('mee goreng')) {
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
