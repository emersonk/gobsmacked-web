// Pydantic model TODO match name
export interface StepIngredient {
    id: number;
    amount: string | null;
}

// Pydantic model TODO match name
export interface RecipeStep {
    id: number;
    action: string;
    options: string | null;
    parents: number[] | null;
    ingredients: StepIngredient[] | null;
}

// Pydantic model
export interface Ingredient {
    id: number;
    name: string;
    quantity: string | null;
    mise_en_place: string | null;
    options: string | null;
    notes: string | null;
}

// Domain model
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

// Domain model
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
    steps: RecipeStep[];
    stepPlacements?: StepPlacement[];
    ingredientPlacements?: IngredientPlacement[];
    createdAt: string;
    updatedAt: string;
}