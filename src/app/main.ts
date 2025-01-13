import { RecipeGridCalculator } from './recipeGridCalculator';
import { RecipeGridRenderer } from './recipeGridRenderer';
import { 
    RecipeStep,
    Ingredient
} from '../models/interfaces';

// Usage function
export function renderRecipeGrid(stepsJson: string, ingredientsJson: string): void {
    const recipeSteps: RecipeStep[] = JSON.parse(stepsJson).steps;
    const ingredients: Ingredient[] = JSON.parse(ingredientsJson).ingredients;

    const gridContainer = generateRecipeGrid(recipeSteps, ingredients);

    const parentDiv = document.querySelector(".parent");
    if (parentDiv) {
        parentDiv.append(...gridContainer.children);
    }
}

function generateRecipeGrid(recipeSteps: RecipeStep[], ingredients: Ingredient[]): HTMLDivElement {
    const calculator = new RecipeGridCalculator(recipeSteps, ingredients);
    const [numberOfColumns, gridPlacementSteps, gridPlacementIngredients] = calculator.calculate();

    const renderer = new RecipeGridRenderer(
        numberOfColumns,
        gridPlacementSteps,
        gridPlacementIngredients,
        recipeSteps
    );

    return renderer.render();
}