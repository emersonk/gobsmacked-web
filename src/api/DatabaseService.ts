import { Client, Databases, ID, Query } from "appwrite";

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
     * Get the DatabaseService instance
     * @returns DatabaseService instance
     */
    public static getInstance(): DatabaseService {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService();
        }
        return DatabaseService.instance;
    }

    /**
     * Fetch all recipes from the database
     * @returns Promise<any[]>
     * @throws Error if the database operation fails
     */
    async getAllRecipes(): Promise<any[]> {
        try {
            const response = await this.databases.listDocuments(
                this.databaseId,
                this.collectionId
            );
            return response.documents;
        } catch (error) {
            throw this.handleError(error, 'Failed to fetch recipes');
        }
    }

    /**
     * Find a recipe by its URL
     * @param recipeUrl - The URL of the recipe to find
     * @returns Promise<any | null>
     * @throws Error if the database operation fails
     */
    // TODO 'OriginalURL' should come from a database object
    async findRecipeByUrl(recipeUrl: string): Promise<{ documents: any[] }> {
        try {
            const response = await this.databases.listDocuments(
                this.databaseId,
                this.collectionId,
                [Query.equal("OriginalURL", recipeUrl)]
            );

            // Ensure we return a predictable structure, even if no documents are found
            return { documents: response.documents };
        } catch (error) {
            throw this.handleError(error, 'Failed to find recipe by URL');
        }
    }

    /**
     * Find a recipe by its slug
     * @param slug - The slug of the recipe to find
     * @returns Promise<any | null>
     * @throws Error if the database operation fails
     */
    async findRecipeBySlug(slug: string): Promise<any | null> {
        try {
            const response = await this.databases.listDocuments(
                this.databaseId,
                this.collectionId,
                [Query.equal("Slug", slug)]
            );

            return response.documents.length > 0
                ? { ...response.documents[0], id: response.documents[0].$id }
                : null;
        } catch (error) {
            throw this.handleError(error, 'Failed to find recipe by slug');
        }
    }

    /**
     * Create a new recipe
     * @param data - The recipe data to create
     * @returns Promise<any>
     * @throws Error if the database operation fails or validation fails
     */
    async createRecipe(data: Omit<any, 'id' | 'createdAt' | 'updatedAt'>): Promise<any> {
        try {
            // Convert Ingredients and Steps to strings
            const formattedData = {
                ...data,
                Ingredients: JSON.stringify(data.Ingredients),
                Steps: JSON.stringify(data.Steps),
            };

            const response = await this.databases.createDocument(
                this.databaseId,
                this.collectionId,
                ID.unique(),
                formattedData
            );

            return { ...response, id: response.$id };
        } catch (error) {
            throw this.handleError(error, 'Failed to create recipe');
        }
    }

    /**
     * Validate recipe data before creation or update
     * @param data - The recipe data to validate
     * @throws Error if validation fails
     */
    private validateRecipeData(data: Partial<any>): void {
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
