import { Client, Databases, ID } from "appwrite";

export const client = new Client();
export const databases = new Databases(client);

client
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject(import.meta.env.PUBLIC_APPWRITE_PROJECT_ID);