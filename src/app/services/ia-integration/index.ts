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
        Créez une fiche de révision textuelle, **très détaillée**, **complète** et **structurée**, permettant à un étudiant de réviser de manière approfondie et efficace tout le contenu du cours. La fiche doit couvrir chaque aspect du cours de manière exhaustive, avec une présentation claire et une progression logique.

      1. **Structure générale (obligatoire)** :
    - Un **résumé détaillé** et complet de chaque section du cours, avec une **progression logique**.
    - Des **explications approfondies et pédagogiques** des concepts clés, tirées directement du cours.
    - Une **liste des points essentiels** à retenir pour chaque section, présentée sous forme de **listes à puces** (ul/li) pour une meilleure lisibilité.
    - Le **slug** doit être égal à ${course.slug}.
    - **Durée estimée de révision** par section (en minutes) pour aider à la gestion du temps de révision.
    - **Niveau de difficulté** de chaque section, avec des précisions sur les concepts plus complexes à maîtriser.

     2. **Pour CHAQUE section du cours** :
    A. Fournir un **titre clair, descriptif et engageant** pour chaque section.
    B. Inclure un **résumé détaillé** de chaque section, avec des explications pédagogiques qui abordent tous les aspects importants du sujet.
    C. Ajouter une sous-section **"À retenir"** avec les points clés à retenir sous forme de **listes à puces** (ul/li), mais en incluant des explications supplémentaires sur l'importance de chaque point.
    D. **Exemples pratiques détaillés** ou **études de cas** mentionnées dans le cours, résumées en quelques phrases, en expliquant comment appliquer les concepts théoriques dans des situations réelles.
    E. **Schémas et illustrations** en HTML, décrits et intégrés, pour rendre les concepts plus concrets et visuels.
    F. **Exercices pratiques ou cas d'étude supplémentaires** pour renforcer la compréhension du contenu. Par exemple, des problèmes pratiques à résoudre ou des questions pour tester la compréhension.
    G. **Conseils pratiques** pour mieux comprendre les concepts et les appliquer dans des situations réelles.

     3. **Ressources** :
    - Fournir des liens directs vers des **ressources complémentaires** utiles :
      * Documentation officielle
      * Tutoriels vidéo reconnus
      * Projets GitHub pertinents
      * Outils et logiciels recommandés
    Format : <a href="lien" target="_blank" rel="noopener noreferrer">texte</a>.

        4. **Format et style** :
            - Utiliser une hiérarchie claire avec des titres (h1, h2, h3) pour structurer la fiche.
            - Présenter les points importants en utilisant des listes à puces (<ul><li>).
            - Les sections doivent être bien séparées et lisibles.
            - Éviter les détails inutiles, mais conserver les explications nécessaires à la compréhension.

        Exemple de structure pour une section :
        <h2>Section : [Titre de la section]</h2>
        <p>[Résumé détaillé de la section]</p>
        <h3>À retenir</h3>
        <ul>
            <li>[Point clé 1]</li>
            <li>[Point clé 2]</li>
            <li>[Point clé 3]</li>
        </ul>
        <h3>Exemple pratique</h3>
        <p>[Exemple détaillé]</p>
        <h3>Ressources supplémentaires</h3>
        <ul>
            <li><a href="lien" target="_blank" rel="noopener noreferrer">[Nom de la ressource]</a></li>
        </ul>

        Assurez-vous que :
        - Toutes les sections du cours sont couvertes.
        - La progression logique et pédagogique est respectée.
        - Le format HTML est bien structuré et lisible.
        - Des exemples concrets et des cas pratiques sont inclus dans chaque section pour une meilleure compréhension.`;

        const response_format = {
            type: "json_schema" as const,
            json_schema: {
                name: "revision_file",
                schema: {
                    type: "object",
                    properties: {
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
                                    },
                                    examples: { type: "string" },
                                    resources: {
                                        type: "array",
                                        items: { type: "string" }
                                    }
                                },
                                required: ["title", "summary", "key_points"],
                                additionalProperties: false
                            }
                        }
                    },
                    required: [ "slug", "sections"]
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

 
