import { Client, Databases, ID, Query } from "appwrite";
import { Recipe } from "@/models/interfaces";

export class DatabaseService {
    private static instance: DatabaseService;
    private databases: Databases;
    private readonly databaseId: string;
    private readonly collectionId: string;

    private constructor() {
        // Initialize Appwrite client
        const client = new Client()
            .setEndpoint('https://cloud.appwrite.io/v1')
            .setProject(import.meta.env.PUBLIC_APPWRITE_PROJECT_ID);

        this.databases = new Databases(client);
        this.databaseId = import.meta.env.PUBLIC_APPWRITE_DATABASE_ID;
        this.collectionId = import.meta.env.PUBLIC_APPWRITE_COLLECTION_ID;
    }

    /**
     * Get the RecipeService instance
     * @returns RecipeService instance
     */
    public static getInstance(): DatabaseService {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService();
        }
        return DatabaseService.instance;
    }

    /**
     * Fetch all recipes from the database
     * @returns Promise<Recipe[]>
     * @throws Error if the database operation fails
     */
    async getAllRecipes(): Promise<Recipe[]> {
        try {
            const response = await this.databases.listDocuments(
                this.databaseId,
                this.collectionId
            );
            return response.documents as Recipe[];
        } catch (error) {
            throw this.handleError(error, 'Failed to fetch recipes');
        }
    }

    /**
     * Find a recipe by its URL
     * @param recipeUrl - The URL of the recipe to find
     * @returns Promise<Recipe | null>
     * @throws Error if the database operation fails
     */
    async findRecipeByUrl(recipeUrl: string): Promise<Recipe | null> {
        try {
            const response = await this.databases.listDocuments(
                this.databaseId,
                this.collectionId,
                [Query.equal("OriginalURL", recipeUrl)]
            );

            return response.documents.length > 0
                ? { ...response.documents[0], id: response.documents[0].$id } as Recipe
                : null;
        } catch (error) {
            throw this.handleError(error, 'Failed to find recipe by URL');
        }
    }

    /**
     * Find a recipe by its slug
     * @param slug - The slug of the recipe to find
     * @returns Promise<Recipe | null>
     * @throws Error if the database operation fails
     */
    async findRecipeBySlug(slug: string): Promise<Recipe | null> {
        try {
            const response = await this.databases.listDocuments(
                this.databaseId,
                this.collectionId,
                [Query.equal("Slug", slug)]
            );

            return response.documents.length > 0
                ? { ...response.documents[0], id: response.documents[0].$id } as Recipe
                : null;
        } catch (error) {
            throw this.handleError(error, 'Failed to find recipe by slug');
        }
    }

    /**
     * Create a new recipe
     * @param data - The recipe data to create
     * @returns Promise<Recipe>
     * @throws Error if the database operation fails or validation fails
     */
    async createRecipe(data: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>): Promise<Recipe> {
        try {
            this.validateRecipeData(data);

            const response = await this.databases.createDocument(
                this.databaseId,
                this.collectionId,
                ID.unique(),
                {
                    ...data,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            );

            return { ...response, id: response.$id } as Recipe;
        } catch (error) {
            throw this.handleError(error, 'Failed to create recipe');
        }
    }

    /**
     * Update an existing recipe
     * @param recipeId - The ID of the recipe to update
     * @param data - The recipe data to update
     * @returns Promise<Recipe>
     * @throws Error if the database operation fails or validation fails
     */
    async updateRecipe(recipeId: string, data: Partial<Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Recipe> {
        try {
            const response = await this.databases.updateDocument(
                this.databaseId,
                this.collectionId,
                recipeId,
                {
                    ...data,
                    updatedAt: new Date().toISOString()
                }
            );

            return { ...response, id: response.$id } as Recipe;
        } catch (error) {
            throw this.handleError(error, 'Failed to update recipe');
        }
    }

    /**
     * Delete a recipe
     * @param recipeId - The ID of the recipe to delete
     * @returns Promise<void>
     * @throws Error if the database operation fails
     */
    async deleteRecipe(recipeId: string): Promise<void> {
        try {
            await this.databases.deleteDocument(
                this.databaseId,
                this.collectionId,
                recipeId
            );
        } catch (error) {
            throw this.handleError(error, 'Failed to delete recipe');
        }
    }

    /**
     * Validate recipe data before creation or update
     * @param data - The recipe data to validate
     * @throws Error if validation fails
     */
    private validateRecipeData(data: Partial<Recipe>): void {
        if (!data.title) {
            throw new Error('Recipe title is required');
        }

        if (data.ingredients && !Array.isArray(data.ingredients)) {
            throw new Error('Ingredients must be an array');
        }

        if (data.steps && !Array.isArray(data.steps)) {
            throw new Error('Steps must be an array');
        }
    }

    /**
     * Handle errors from database operations
     * @param error - The error to handle
     * @param message - Custom error message
     * @returns Error with appropriate message
     */
    private handleError(error: unknown, message: string): Error {
        if (error instanceof Error) {
            return new Error(`${message}: ${error.message}`);
        }
        return new Error(message);
    }
}

// Export a singleton instance
export const databaseService = DatabaseService.getInstance();