import { 
    RecipeStep, 
    Ingredient, 
    StepPlacement, 
    IngredientPlacement 
} from '../models/interfaces';

export class RecipeGridCalculator {
    private steps: RecipeStep[];
    private ingredients: Ingredient[];
    private gridPlacementSteps: Record<number, StepPlacement> = {};
    private gridPlacementIngredients: Record<number, IngredientPlacement> = {};
    private columnEndPointer = 5;
    private numIngredientsCounter = 0;
    private colorSteps: string[];
    private lastStepColor: string;
    private lastColorClass: string;

    constructor(steps: RecipeStep[], ingredients: Ingredient[]) {
        this.steps = steps;
        this.ingredients = ingredients;

        // Initialize with default values
        this.lastStepColor = 'FFF'
        this.lastColorClass = this.generateColorClassName();
        this.colorSteps = this.generateMonochromaticPalette(this.steps.length);
    }

    calculate(): [number, Record<number, StepPlacement>, Record<number, IngredientPlacement>] {
        const sortedSteps = this.topologicalSort();
        this.processSteps(sortedSteps);
        return [this.columnEndPointer - 1, this.gridPlacementSteps, this.gridPlacementIngredients];
    }

    private processSteps(sortedSteps: RecipeStep[]): void {
        let currentGridRowStart = 1;
        let currentGridColumnStart = 4;

        sortedSteps.forEach((step, index) => {
            const placement = this.calculatePlacement(
                step,
                currentGridRowStart,
                currentGridColumnStart,
                index,
                sortedSteps
            );

            this.gridPlacementSteps[step.id] = placement;

            // Update positions for next iteration
            currentGridRowStart = placement.nextGridRowStart;
            if (step.parents?.length ?? 0 >= 1) {
                this.columnEndPointer++;
            }

            // Store the colors for next iteration if new ingredients were added
            if (step.ingredients?.length ?? 0 > 0) {
                this.lastStepColor = placement.backgroundColor;
                this.lastColorClass = placement.colorClass;
            }
        });
    }

    private calculatePlacement(
        step: RecipeStep,
        currentGridRowStart: number,
        currentGridColumnStart: number,
        index: number,
        sortedSteps: RecipeStep[]
    ): StepPlacement {
        // Only generate new colors if there are new ingredients
        const hasNewIngredients = step.ingredients?.length ?? 0 > 0;
        const stepColor = hasNewIngredients ? this.colorSteps[index] : this.lastStepColor;
        const colorClass = hasNewIngredients ? this.generateColorClassName() : this.lastColorClass;

        const numOfIngredientsAddedInStep = this.processStepIngredients(step, stepColor, colorClass);
        const numParents = step.parents?.length ?? 0;

        const gridPosition = this.calculateGridPosition(
            step,
            numOfIngredientsAddedInStep,
            numParents,
            currentGridRowStart,
            currentGridColumnStart
        );

        return {
            ...gridPosition,
            borderRadius: this.calculateBorderRadius(index, sortedSteps),
            alignItems: numOfIngredientsAddedInStep === 1 ? "end" : "center",
            backgroundColor: stepColor,
            colorClass: colorClass
        };
    }

    private processStepIngredients(step: RecipeStep, stepColor: string, colorClass: string): number {
        const stepIngredients = step.ingredients ?? [];
        stepIngredients.forEach(ingredient => {
            const fullIngredient = this.ingredients.find(x => x.id === ingredient.id);
            if (fullIngredient) {
                this.gridPlacementIngredients[this.numIngredientsCounter] = {
                    currentGridRowStart: this.numIngredientsCounter + 1,
                    quantity: fullIngredient.quantity,
                    ingredient: fullIngredient.name,
                    amount: ingredient.amount,
                    miseEnPlace: fullIngredient.mise_en_place,
                    backgroundColor: stepColor,
                    colorClass: colorClass
                };
                this.numIngredientsCounter++;
            }
        });
        return stepIngredients.length;
    }

    /**
     * Generates a monochromatic hex color palette.
     * @param steps - The number of color steps to generate.
     * @returns An array of hex colors ordered from lightest to darkest.
     */
    private generateMonochromaticPalette(steps: number): string[] {
        const baseColor = '#aa5903'

        // Helper function to convert hex to RGB
        const hexToRgb = (hex: string): [number, number, number] => {
            hex = hex.replace("#", "");
            const bigint = parseInt(hex, 16);
            return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
        };

        // Helper function to convert RGB to hex
        const rgbToHex = (r: number, g: number, b: number): string => {
            const toHex = (value: number) => value.toString(16).padStart(2, "0");
            return `${toHex(r)}${toHex(g)}${toHex(b)}`;
        };

        // Ensure valid input
        if (!/^#([0-9a-fA-F]{6})$/.test(baseColor)) {
            throw new Error("Invalid hex color format. Use #RRGGBB.");
        }
        if (steps < 2) {
            throw new Error("Number of steps must be at least 2.");
        }

        // Convert the base color to RGB
        const [baseR, baseG, baseB] = hexToRgb(baseColor);

        // Create a palette by interpolating between light and the base color
        const palette: string[] = [];
        for (let i = 0; i < steps; i++) {
            const factor = i / (steps - 1); // 0 for lightest, 1 for darkest
            const r = Math.round(baseR + (255 - baseR) * (1 - factor));
            const g = Math.round(baseG + (255 - baseG) * (1 - factor));
            const b = Math.round(baseB + (255 - baseB) * (1 - factor));
            palette.push(rgbToHex(r, g, b));
        }

        return palette;
    }

    private generateColorClassName(): string {
        return `c${Math.random().toString(36).substring(2, 10)}`;
    }

    private calculateGridPosition(
        step: RecipeStep,
        numOfIngredientsAddedInStep: number,
        numParents: number,
        currentGridRowStart: number,
        currentGridColumnStart: number
    ): Pick<StepPlacement, 'currentGridRowStart' | 'currentGridColumnStart' | 'nextGridRowStart' | 'nextGridColumnStart'> {
        if (numParents === 0 && numOfIngredientsAddedInStep >= 1) {
            return this.calculatePositionForNewIngredients(
                currentGridRowStart,
                numOfIngredientsAddedInStep
            );
        }

        if (numParents >= 1) {
            return this.calculatePositionWithParents(
                step,
                numOfIngredientsAddedInStep
            );
        }

        return {
            currentGridRowStart,
            currentGridColumnStart,
            nextGridRowStart: currentGridRowStart + numOfIngredientsAddedInStep,
            nextGridColumnStart: this.columnEndPointer
        };
    }

    private calculatePositionForNewIngredients(
        currentGridRowStart: number,
        numOfIngredientsAdded: number
    ): Pick<StepPlacement, 'currentGridRowStart' | 'currentGridColumnStart' | 'nextGridRowStart' | 'nextGridColumnStart'> {
        return {
            currentGridRowStart,
            currentGridColumnStart: 4,
            nextGridRowStart: currentGridRowStart + numOfIngredientsAdded,
            nextGridColumnStart: this.columnEndPointer
        };
    }

    private calculatePositionWithParents(
        step: RecipeStep,
        numOfIngredientsAdded: number
    ): Pick<StepPlacement, 'currentGridRowStart' | 'currentGridColumnStart' | 'nextGridRowStart' | 'nextGridColumnStart'> {
        const parentPlacements = step.parents
            ?.map(parentId => this.gridPlacementSteps[parentId])
            .filter(Boolean) ?? [];

        if (numOfIngredientsAdded === 0) {
            return {
                currentGridRowStart: Math.min(...parentPlacements.map(p => p.currentGridRowStart)),
                currentGridColumnStart: Math.max(...parentPlacements.map(p => p.nextGridColumnStart)),
                nextGridRowStart: Math.max(...parentPlacements.map(p => p.nextGridRowStart)),
                nextGridColumnStart: Math.max(...parentPlacements.map(p => p.nextGridColumnStart)) + 1
            };
        }

        return {
            currentGridRowStart: 1,
            currentGridColumnStart: 4,
            nextGridRowStart: Math.max(...parentPlacements.map(p => p.nextGridRowStart)) + numOfIngredientsAdded,
            nextGridColumnStart: Math.max(...parentPlacements.map(p => p.nextGridColumnStart)) + 1
        };
    }

    private calculateBorderRadius(index: number, sortedSteps: RecipeStep[]): number {
        // If ingredients are added in the next step, border should be rounded
        if (index + 1 < sortedSteps.length) {
            return (sortedSteps[index + 1].ingredients?.length ?? 0) >= 1 ? 20 : 0;
        }
        return 0;
    }

    private topologicalSort(): RecipeStep[] {
        const graph = new Map<number, RecipeStep>();
        const visited = new Set<number>();
        const sortedSteps: RecipeStep[] = [];

        this.steps.forEach(step => graph.set(step.id, step));

        const visit = (step: RecipeStep): void => {
            if (visited.has(step.id)) return;
            visited.add(step.id);

            step.parents?.forEach(parentId => {
                const parent = graph.get(parentId);
                if (parent && !visited.has(parentId)) {
                    visit(parent);
                }
            });

            sortedSteps.push(step);
        };

        this.steps.forEach(step => {
            if (!visited.has(step.id)) {
                visit(step);
            }
        });

        return sortedSteps;
    }
}