export interface RecipeData {
    original_recipe: {
        title: string;
        total_time: number;
        yields: string;
        image?: string;
    };
    ingredients: string;
    steps: string;
}

export interface ProcessedIngredient {
    amount: string;
    unit: string;
    ingredient: string;
}

export interface ProcessedSteps {
    steps: string[];
}

export const processRecipeData = (data: RecipeData) => {
    const ingredientsData = JSON.parse(data.ingredients) as { ingredients: ProcessedIngredient[] };
    const stepsData = JSON.parse(data.steps) as ProcessedSteps;

    return {
        ingredients: ingredientsData,
        steps: stepsData
    };
};

export const formatIngredients = (ingredients: ProcessedIngredient[]) => {
    return ingredients
        .map(ing => `• ${ing.amount} ${ing.unit} ${ing.ingredient}`)
        .join('\n');
};

export const formatSteps = (steps: string[]) => {
    return steps
        .map((step, index) => `${index + 1}. ${step}`)
        .join('\n');
};