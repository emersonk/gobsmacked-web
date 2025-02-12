// Pydantic models
// **************************************
export interface IngredientReference {
    id: number;
    amount: string | null;
}

export interface Step {
    id: number;
    action: string;
    options: string | null;
    parents: number[] | null;
    ingredients: IngredientReference[] | null;
}

export interface Ingredient {
    id: number;
    name: string;
    quantity: string | null;
    mise_en_place: string | null;
    options: string | null;
    notes: string | null;
}

export interface RecipeResponse {
    title: string; // Title of the recipe
    ingredients: string[]; // List of ingredients
    instructions: string[]; // Step-by-step instructions
    total_time?: number; // Total time required
    yields?: string; // Servings or yield amount
    image?: string; // URL of the recipe image
}

// Domain models
// **************************************
export interface StepPlacement {
    currentGridRowStart: number;
    currentGridColumnStart: number;
    nextGridRowStart: number;
    nextGridColumnStart: number;
    borderRadius: number;
    alignItems: string;
    backgroundColor: string;
    colorClass: string;
}

export interface IngredientPlacement {
    currentGridRowStart: number;
    quantity: string | null;
    ingredient: string;
    amount: string | null;
    miseEnPlace: string | null;
    backgroundColor: string;
    colorClass: string;
}

// TODO database DTO object
// **************************************
export interface Recipe {
    id: string;
    OriginalURL?: string;
    Slug?: string;
    title: string;
    description?: string;
    servings?: number;
    prepTime?: string;
    cookTime?: string;
    totalTime?: string;
    ingredients: Ingredient[];
    steps: Step[];
    stepPlacements?: StepPlacement[];
    ingredientPlacements?: IngredientPlacement[];
    createdAt: string;
    updatedAt: string;
}