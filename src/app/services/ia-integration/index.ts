"use server";

import OpenAI from "openai";
import {Course, CourseList} from "@/interface/course.dto";
import {createJson} from "@/app/services/json-editor";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || ""
});

export async function generateCourses(course_name: string, level: string) {
    try {
        const prompt: string = `Voici la thématique du cours : ${course_name} et voici le niveau souhaité : ${level}. 
        Créez un cours extrêmement détaillé et approfondi, similaire aux cours OpenClassrooms, avec :

        1. Structure générale (obligatoire) :
            - Un titre commercial et clair qui donne envie d'apprendre avec le niveau : ${level}
            - Un slug basé sur le nom du cours (en minuscules, avec des tirets à la place des espaces)
            - Le sujet principal clairement défini
            - Le niveau de difficulté exactement comme fourni : ${level}
            - Une durée estimée en minutes (minimum 60 minutes)
            - Une description générale complète en HTML qui :
                * Présente le cours et ses objectifs
                * Explique ce qu'on va apprendre
                * Précise les prérequis nécessaires
                * Décrit les compétences acquises �� la fin

        2. Pour CHAQUE section du cours (minimum 3 sections) :
            A. Dans le sommaire (course_outline) :
                - Un titre clair et descriptif
                - Un résumé concis mais informatif
                - Une durée estimée en minutes
                - Des objectifs pédagogiques précis et mesurables

            B. Dans le contenu détaillé (course_steps_content) :
                - Le même titre que dans le sommaire
                - Au moins 3 parties (parts) par section, chacune avec :
                    * Un sous-titre explicite et descriptif
                    * Un contenu HTML détaillé et structuré d'au moins 5000 caractères incluant :
                        > Des explications théoriques approfondies
                        > Des exemples concrets et détaillés
                        > Des cas pratiques avec solutions
                        > Du code source commenté si pertinent
                        > Des schémas ou illustrations décrits en HTML
                - Une section "À retenir" (to_remember) qui résume les points clés
                - Des ressources (resources) UNIQUEMENT si vous avez des liens directs et vérifiés vers :
                    * Documentation officielle
                    * Tutoriels reconnus
                    * GitHub de projets mentionnés
                    * Outils spécifiques utilisés
                Ne pas inclure de ressources si vous n'avez pas de liens précis.
                Format obligatoire : <a href="lien" target="_blank" rel="noopener noreferrer">texte</a>

        3. Format HTML et style :
            - Structure hiérarchique claire avec h1, h2, h3, h4
            - Paragraphes bien délimités avec <p>
            - Listes à puces avec <ul> et <li>
            - Points importants en <strong>
            - Exemples de code dans <pre><code>
            - Utilisation de <br> pour l'aération du texte
            - Citations ou notes importantes dans des <blockquote>

        Assurez-vous que :
        - Chaque élément de course_outline correspond à une section détaillée
        - Le contenu est adapté au niveau demandé
        - La progression est logique et pédagogique
        - Le contenu est exhaustif et pratique
        - Tous les exemples sont concrets et applicables
        - Le HTML est correctement formaté et lisible`;

        const response_format = {
            type: "json_schema" as const,
            json_schema: {
                name: "course",
                schema: {
                    type: "object",
                    properties: {
                        is_censured: {type: "boolean"},
                        name: {type: "string"},
                        slug: {type: "string"},
                        subject: {type: "string"},
                        level: {type: "string"},
                        duration: {type: "integer"},
                        description: {type: "string"},
                        course_outline: {
                            type: "array",
                            items: {
                                type: "object",
                                required: ["title", "abstract", "duration", "pedagogical_objectives"],
                                properties: {
                                    title: {type: "string"},
                                    abstract: {type: "string"},
                                    duration: {type: "integer"},
                                    pedagogical_objectives: {type: "string"}
                                },
                                additionalProperties: false
                            },
                            minItems: 3
                        },
                        course_steps_content: {
                            type: "array",
                            items: {
                                type: "object",
                                required: ["title", "parts", "to_remember"],
                                properties: {
                                    title: {type: "string"},
                                    parts: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            required: ["subtitle", "content"],
                                            properties: {
                                                subtitle: {type: "string"},
                                                content: {
                                                    type: "string",
                                                }
                                            },
                                        },
                                        minItems: 1,
                                    },
                                    to_remember: {type: "string"},
                                    resources: {type: "string"}
                                },
                            },
                            minItems: 1
                        }
                    },
                    required: [
                        "is_censured",
                        "name",
                        "slug",
                        "subject",
                        "level",
                        "duration",
                        "description",
                        "course_outline",
                        "course_steps_content"
                    ],
                    additionalProperties: false
                }
            }
        };

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `Vous êtes un expert en pédagogie et en création de cours, spécialisé dans la création de contenus de type OpenClassrooms.
                    Vos cours doivent être :
                    - Très structurés avec une progression logique
                    - Remplis d'exemples concrets et de cas pratiques
                    - Accompagnés de ressources complémentaires pertinentes`
                },
                {
                    role: "user",
                    content: "Tout ce qui est raciste est illégal et doit être évité. Pour cela, tu devras mettre is_censured à true si le cours contient du racisme, du sexisme, de l'antisémitisme, des idées révolutionnaires, des idées qui pourrait être considérées comme haineuse ou des thématiques à caractère sexuel qui n'ont pas de lien avec des cours."
                },
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: prompt
                        },
                    ]
                },
            ],
            response_format: response_format
        });

        const responseContent = response.choices[0].message.content;

        if (!responseContent) {
            throw new Error("La réponse de l'API est vide");
        }

        const parsedResponse = JSON.parse(responseContent);

        return parsedResponse;

    } catch (error) {
        console.error('Erreur lors de l\'analyse de l\'image :', error);
        throw error;
    }
}

export async function generateQCM(numberQuestion: number, course: Course): Promise<any> {
    try {
        const prompt: string = `Voici la thématique du cours : ${course.name} et voici le niveau souhaité : ${course.level}.
        Créez un QCM de ${numberQuestion} questions basé sur le cours suivant : ${course.course_steps_content.join(',')}. 
        Chaque question peut avoir 4 propositions.
        Il doit y avoir des questions à réponse unique et d'autres à réponses multiples :
        
        1. Structure générale (obligatoire) :
            - le slug doit etre égale à ${course.slug}
            - question de type string
            - isUniqueResponse de type boolean
        
        2. Pour CHAQUE question :
            A. un tableau de 4 réponses (responses)
            B. un tableau de bonnes réponses (trueResponses).
            Répondez uniquement avec un objet, sans texte supplémentaire.
            `;

        const response_format = {
            type: "json_schema" as const,
            json_schema: {
                name: "qcm",
                schema: {
                    type: "object",
                    properties: {
                        slug: {type: 'string'},
                        questions: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    question: {type: "string"},
                                    responses: {
                                        type: "array",
                                        items: {type: "string"},
                                        minItems: 4,
                                        maxItems: 4
                                    },
                                    trueResponses: {
                                        type: "array",
                                        items: {type: "string"},
                                        minItems: 1
                                    },
                                    isUniqueResponse: {type: "boolean"}
                                },
                                required: ["question", "responses", "trueResponses", "isUniqueResponse"]
                            }
                        },
                    },
                    required: ["questions", 'slug']
                }
            }
        }


        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `Vous êtes un expert en pédagogie et en création de cours, spécialisé dans la création de contenus de type OpenClassrooms. Vous créez des QCM basés sur les cours.`
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            response_format
        });

        const responseContent = response.choices[0].message.content;

        if (!responseContent) {
            throw new Error("La réponse de l'API est vide");
        }

        const parsedResponse = JSON.parse(responseContent);

        console.log(parsedResponse);
        return parsedResponse;

    } catch (error) {
        console.error("Erreur dans la génération du QCM :", error);
        throw error;
    }
}



export async function generateFileRevision(course: Course) {
    try {
       
        const prompt = `Voici la thématique du cours : ${course.name}.
        Créez une fiche de révision textuelle **très détaillée** et **structurée** pour permettre à un étudiant de réviser efficacement. 
        
        1. **Structure attendue** :
            - Chaque section doit avoir un **titre clair et engageant**.
            - Un **résumé détaillé** expliquant les concepts clés de la section.
            - Une liste des **points essentiels** à retenir (liste à puces) pour chaque section.
        
        2. **Format attendu** :
            - Chaque section doit être présentée sous la forme suivante :
                <h2>[Titre de la section]</h2>
                <p>[Résumé détaillé de la section]</p>
                <h3>Points clés</h3>
                <ul>
                    <li>[Point clé 1]</li>
                    <li>[Point clé 2]</li>
                    <li>[Point clé 3]</li>
                </ul>
            - Évitez les détails inutiles tout en restant complet.
            - Respectez une progression logique et claire dans les sections.
        
        3. **Exigences supplémentaires** :
            - Le slug du cours doit être égal à : ${course.slug}.
            - La fiche doit être entièrement lisible et structurée de manière à faciliter la révision.`;
               


            const response_format = {
                type: "json_schema" as const,
                json_schema: {
                    name: "revision_file",
                    schema: {
                        type: "object",
                        properties: {
                            id: { type: "integer" },
                            slug: { type: "string" },
                            sections: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        title: { type: "string" },
                                        summary: { type: "string" },
                                        key_points: {
                                            type: "array",
                                            items: { type: "string" }
                                        }
                                    },
                                    required: ["title", "summary", "key_points"]
                                }
                            }
                        },
                        required: ["id", "slug", "sections"]
                    }
                }
            };
            


        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `Vous êtes un expert en pédagogie et en création de contenus pédagogiques. Vous créez des fiches de révision basées sur les cours générés, adaptées au niveau de difficulté demandé.`
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            response_format
        });

        const responseContent = response.choices[0].message.content;

        if (!responseContent) {
            throw new Error("La réponse de l'API est vide");
        }

        const parsedResponse = JSON.parse(responseContent);

        const fileRevisionData = parsedResponse;

        const createJsonResult = await createJson(fileRevisionData, "fileRevision.json");

        console.log(createJsonResult);

        return createJsonResult;

    } catch (error) {
        console.error("Erreur dans la génération de la fiche de révision :", error);
        throw error;
    }
}

 
