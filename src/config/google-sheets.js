// Temporary static data while we implement proper Google Sheets integration
const mockData = [
  {
    name: "Яблоко",
    calories: 52,
    proteins: 0.3,
    fats: 0.2,
    carbs: 14
  },
  {
    name: "Банан",
    calories: 89,
    proteins: 1.1,
    fats: 0.3,
    carbs: 22.8
  },
  {
    name: "Курица (грудка)",
    calories: 165,
    proteins: 31,
    fats: 3.6,
    carbs: 0
  }
];

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQrQG3zWeCq5fZWIP4jI4oeyvbhPqKqhUEMcWFp7har4X4iTCc0263pIcR6xilbztIg0H99bPOQrmsW/pub?output=csv';

export const initGoogleSheets = async () => {
  return true; // No initialization needed for public CSV
};

export const fetchIngredients = async () => {
  try {
    const response = await fetch(SHEET_URL);
    const csvText = await response.text();
    
    // Parse CSV (skip header row)
    const rows = csvText.split('\n').slice(1);
    return rows.map(row => {
      const [name, calories, proteins, fats, carbs] = row.split(',');
      return {
        name: name?.trim(),
        calories: parseFloat(calories) || 0,
        proteins: parseFloat(proteins) || 0,
        fats: parseFloat(fats) || 0,
        carbs: parseFloat(carbs) || 0
      };
    }).filter(item => item.name); // Filter out empty rows
  } catch (error) {
    console.error('Error fetching ingredients:', error);
    // Return mock data as fallback in case of network issues
    return [
      {
        name: "Ржаная мука",
        calories: 298,
        proteins: 9,
        fats: 1.7,
        carbs: 61.5
      }
    ];
  }
};

// Add this function to post new ingredients
export const addIngredient = async (ingredient) => {
  try {
    const response = await fetch('https://script.google.com/macros/s/AKfycbzv9fHqG3Iep-KHllBu4viL1ejNZLG5rozKPHcItG1voGosV_OoU8nTsY1X3bCXx039lA/exec', {
      method: 'POST',
      body: JSON.stringify(ingredient)
    });
    
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to add ingredient');
    }
    
    return true;
  } catch (error) {
    console.error('Error adding ingredient:', error);
    throw error;
  }
}; 