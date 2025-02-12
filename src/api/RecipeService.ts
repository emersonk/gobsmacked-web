import { RecipeResponse } from "@/models/interfaces";

const loadRecipe = async (url: string) => {
    const response = await fetch('http://localhost:8000/load', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
};

const parseRecipe = async (recipe: RecipeResponse) => {
    const response = await fetch('http://localhost:8000/parse', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(recipe),
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
};

export const loadAndParseRecipe = async (url: string) => {
    try {
        // Step 1: Load the recipe from the URL
        const loadedRecipe: RecipeResponse = await loadRecipe(url);
        
        // Step 2: Parse the loaded recipe
        const parsedRecipe = await parseRecipe(loadedRecipe);
        
        return parsedRecipe;
    } catch (error) {
        console.error("Error in loadAndParseRecipe:", error);
        throw error;
    }
};