import { 
    RecipeStep,
    StepPlacement, 
    IngredientPlacement 
} from '../models/interfaces';

export class RecipeGridRenderer {
    private numberOfColumns: number;
    private gridPlacementSteps: Record<number, StepPlacement>;
    private gridPlacementIngredients: Record<number, IngredientPlacement>;
    private steps: RecipeStep[];

    constructor(
        numberOfColumns: number,
        gridPlacementSteps: Record<number, StepPlacement>,
        gridPlacementIngredients: Record<number, IngredientPlacement>,
        steps: RecipeStep[]
    ) {
        this.numberOfColumns = numberOfColumns;
        this.gridPlacementSteps = gridPlacementSteps;
        this.gridPlacementIngredients = gridPlacementIngredients;
        this.steps = steps;
    }

    render(): HTMLDivElement {
        const container = document.createElement("div");
        container.innerHTML = this.generateHTML();

        const styleElement = document.createElement("style");
        styleElement.textContent = this.generateCSS();
        container.appendChild(styleElement);

        return container;
    }

    private generateCSS(): string {
        let css = `
        .parent {
          grid-template-columns: repeat(${this.numberOfColumns}, 1fr);
          grid-template-rows: repeat(${this.steps.length}, 1fr);
        }`;

        // Calculate the highest z-index needed 
        // Adding 10 to make sure we have some buffer room
        const maxZIndex = this.steps.length + 10;

        // Step styles
        Object.entries(this.gridPlacementSteps).forEach(([id, placement]) => {
            const stepNumber = parseInt(id);
            // Calculate z-index: first step gets highest value
            const zIndex = maxZIndex - stepNumber;

            css += `
          .step-${id} {
            grid-area: ${placement.currentGridRowStart} / ${placement.currentGridColumnStart} / ${placement.nextGridRowStart} / ${placement.nextGridColumnStart};
            align-items: ${placement.alignItems};
            border-bottom-right-radius: ${placement.borderRadius}px;
            z-index: ${zIndex};
            position: relative;
          }        
          .${placement.colorClass} {
            background-color: #${placement.backgroundColor};
          }`;
        });

        // Ingredient styles
        Object.entries(this.gridPlacementIngredients).forEach(([key, value]) => {
            css += `
          .quantity-${key} {
            grid-area: ${value.currentGridRowStart} / 1 / ${value.currentGridRowStart + 1} / 2;
            position: relative;
            z-index: ${maxZIndex}; /* Ingredients should appear on top */
          }
          .name-${key} {
            grid-area: ${value.currentGridRowStart} / 2 / ${value.currentGridRowStart + 1} / 3;
            position: relative;
            z-index: ${maxZIndex};
          }
          .mep-${key} {
            grid-area: ${value.currentGridRowStart} / 3 / ${value.currentGridRowStart + 1} / 4;
            position: relative;
            z-index: ${maxZIndex};
          }
          .${value.colorClass} {
            background-color: #${value.backgroundColor};
          }`;
        });

        return css;
    }

    private generateHTML(): string {
        const ingredientHTML = Object.entries(this.gridPlacementIngredients)
            .map(([key, value]) => `
          <div class="items-center ${value.colorClass} quantity-${key}">${value.quantity ?? ""}</div>
          <div class="items-center ${value.colorClass} name-${key}">${value.ingredient ?? ""}</div>
          <div class="items-center ${value.colorClass} mep-${key}">${value.miseEnPlace ?? value.amount ?? ""}</div>
        `)
            .join("");

        const stepsHTML = this.steps
            .map(step => `<div class="items-center ${this.gridPlacementSteps[step.id].colorClass} step-${step.id}">${step.action}</div>`)
            .join("");

        return ingredientHTML + stepsHTML;
    }
}