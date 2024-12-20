"use server";

import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || ""
});

export async function generateCourses(course_name: string, level: string) {
    try {

        const prompt = `Voici la thématique du cours : ${course_name} et voici le niveau souhaité : ${level}. 
        Créez un cours détaillé avec les informations les plus précises et récentes possibles, qui contient les éléments suivants :
            - Un titre commercial et clair
            - Un slug basé sur le nom du cours
            - Le sujet principal
            - Un niveau de difficulté (débutant, intermédiaire, avancé ou expert), que je te passe plus haut
            - Une durée estimée en minutes
            - Une description générale du cours en HTML (utilisez <p>, <ul>, <li>, <strong>, <em>)
            - Un plan de cours détaillé avec les principales sections
            - Pour chaque étape, le contenu doit être détaillé et le plus pédagogique possible et extrêmement complet, de plus, il doit contenir au moins 1000 mots et il doit être en HTML avec :
                * Des paragraphes (<p>)
                * Des listes (<ul>, <li>)
                * Du texte en gras (<strong>) pour les points importants
                * Des exemples de code avec <pre><code>
                * Des ressources supplémentaires pour approfondir les sujets abordés qui doivent s'ouvrir dans un nouvel onglet avec un (<a target="_blank">)
        
        Le format doit être structuré, pédagogique et engageant. Assurez-vous que le contenu est adapté au niveau de difficulté spécifié et qu'il couvre tous les aspects nécessaires pour une compréhension complète du sujet. Et n'hésite pas à être sympathique et faire des blagues pour rendre le cours plus agréable à suivre.`;

        const response_format = {
            type: "json_schema" as const,
            json_schema: {
                name: "course",
                schema: {
                    type: "object",
                    properties: {
                        is_censured: { type: "boolean" },
                        name: { type: "string" },
                        slug: { type: "string" },
                        subject: { type: "string" },
                        level: { type: "string" },
                        duration: { type: "integer" },
                        description: { type: "string" },
                        course_outline: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    title: { type: "string" },
                                    abstract: { type: "string" },
                                    duration: { type: "integer" },
                                    pedagogical_objectives: { type: "string" },
                                }
                            }
                        },
                        course_steps_content: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    title: { type: "string" },
                                    content: { type: "string", minLength: 1000 },
                                    resources: { type: "string" },
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