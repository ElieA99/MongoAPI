import * as mongodb from "mongodb";

import { User } from "./users/user";

export const collections: {
    users?: mongodb.Collection<User>;
} = {};

export async function connectToDatabase(uri: string) {
    const client = new mongodb.MongoClient(uri);
    await client.connect();

    const db = client.db("AUTH");
    await applySchemaValidation_User(db);

    const usersCollection = db.collection<User>("users");

    collections.users = usersCollection;
}

async function applySchemaValidation_User(db: mongodb.Db) {
    const jsonSchema = {
        $jsonSchema: {
            bsonType: "object",
            required: ["email", "password", "role"],
            additionalProperties: false,
            properties: {
                _id: {},

                email: {
                    bsonType: "string",
                    description: "'email' is required and is a string",
                },
                password: {
                    bsonType: "string",
                    description: "'position' is required and is a string",
                    minLength: 5
                },
                role: {
                    bsonType: "string",
                    description: "'role' is required and is a string",
                },
            },
        },
    };

    // Try applying the modification to the collection, if the collection doesn't exist, create it
    await db.command({
        collMod: "users",
        validator: jsonSchema
    }).catch(async (error: mongodb.MongoServerError) => {
        if (error.codeName === 'NamespaceNotFound') {
            await db.createCollection("users", { validator: jsonSchema });
        }
    });
}