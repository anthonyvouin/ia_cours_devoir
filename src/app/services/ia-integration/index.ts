"use server";

import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || ""
});

export async function generateCourses(course_name: string, level: string) {
    try {

        const prompt = `Voici la thématique du cours : ${course_name} et voici le niveau souhaité : ${level}. 
        Créez un cours détaillé avec les éléments suivants :
            - Un titre clair et descriptif
            - Le sujet principal
            - Un niveau de difficulté (débutant, intermédiaire, avancé ou expert), que je te passe plus haut
            - Une durée estimée en minutes
            - Une description générale du cours en HTML (utilisez <p>, <ul>, <li>, <strong>, <em>)
            - Un plan de cours détaillé avec les principales sections
            - Pour chaque étapes, le contenu doit être détaillé et le plus pédagogue possible et extrêmement complet, il doit être en HTML avec :
                * Des paragraphes (<p>)
                * Des listes (<ul>, <li>)
                * Du texte en gras (<strong>) pour les points importants
                * Des exemples de code avec <pre><code>
        
        Le format doit être structuré et pédagogique.`

        const response_format = {
            type: "json_schema" as const,
            json_schema: {
                name: "course",
                schema: {
                    type: "object",
                    properties: {
                        is_censured: { type: "boolean" },
                        name: { type: "string" },
                        subject: { type: "string" },
                        level: { type: "string" },
                        duration: { type: "integer" },
                        description: { type: "string" },
                        course_steps: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    title: { type: "string" },
                                    abstract: { type: "string" },
                                    duration: { type: "integer" },
                                    pedagogical_objectives: { type: "string" },
                                    content: { type: "string" }
                                }
                            }
                        },
                    }
                }
            }
        }

        const response = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: "Vous êtes un expert en pédagogie et en création de cours. Vous créez des cours pédagogiques et accessibles en fonction du niveau de difficulté."
                    },
                    {
                        role: "user",
                        content: "Tout ce qui est raciste est illégal et doit être évité. Pour cela, tu devras mettre is_censured à true si le cours contient du racisme, du sexisme, de l'antisémitisme, des idées révolutionnaires, des idées qui pourrait être considérées comme haineuse ou des thématiques à caractère sexuel qui n'ont pas de lien avec des cours."
                    },
                    {
                        role: "user",
                        content: [
                            { type: "text", text: prompt },
                        ]
                    },
                ],
                response_format: response_format
            });

            const responseContent = response.choices[0].message.content;

            const parsedResponse = JSON.parse(responseContent);

            return parsedResponse;

        } catch (error) {
            console.error('Erreur lors de l\'analyse de l\'image :', error);
            throw error;
        }
    }