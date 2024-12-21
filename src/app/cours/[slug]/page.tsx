"use client"

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Chip } from "primereact/chip";
import { getCoursData } from "@/app/services/json-editor";
import { ProgressSpinner } from 'primereact/progressspinner';

interface ContentPart {
    subtitle: string;
    content: string;
}

interface CourseStep {
    title: string;
    content: ContentPart[];
    to_remember: string;
    resources: string;
}

interface CourseOutline {
    title: string;
    abstract: string;
    duration: number;
    pedagogical_objectives: string;
}

interface Course {
    name: string;
    level: string;
    duration: number;
    description: string;
    course_outline: CourseOutline[];
    course_steps_content: CourseStep[];
    is_censured: boolean;
}

export default function OneCoursePage() {
    const [course, setCourse] = useState<Course>({} as Course);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const params = useParams<{ slug: string; }>();
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await getCoursData(params.slug);
                
                if (response.is_censured) {
                    setError("Ce contenu n'est pas disponible car il contient des éléments inappropriés.");
                    setTimeout(() => {
                        router.push('/cours');
                    }, 3000);
                    return;
                }
                
                setCourse(response);
            } catch (err) {
                setError("Une erreur est survenue lors du chargement du cours.");
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [params.slug, router]);

    if (loading) {
        return (
            <div className="h-[80vh] flex flex-col items-center justify-center">
                <ProgressSpinner 
                    style={{width: '50px', height: '50px'}} 
                    strokeWidth="8" 
                    fill="var(--surface-ground)" 
                    animationDuration=".5s"
                />
                <p className="mt-4 text-gray-600">Chargement du cours...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-[80vh] flex flex-col items-center justify-center">
                <div className="bg-red-50 border-l-4 border-red-500 p-8 rounded-lg max-w-2xl">
                    <div className="flex items-center mb-4">
                        <span className="pi pi-exclamation-triangle text-red-500 mr-3 text-2xl"></span>
                        <h2 className="text-xl font-semibold text-red-700">Contenu non disponible</h2>
                    </div>
                    <p className="text-red-600">{error}</p>
                    <p className="text-gray-600 mt-4">Redirection vers la liste des cours...</p>
                </div>
            </div>
        );
    }

    return (
        <section className="flex justify-center mt-6 mb-14">
            <div className="w-5/6 text-black">
                <div className="border-4 border-slate-900 w-fit p-6 mb-14">
                    <h1 className="mb-4 font-bold text-4xl">{course.name}</h1>
                    <div className="flex items-center gap-5">
                        <Chip label={course.level} className="bg-blue-600 text-white" />
                        <div className="flex items-center">
                            <span className="pi pi-clock mr-2.5"></span>
                            <p>{course.duration} minutes</p>
                        </div>
                    </div>
                </div>

                <div className="mb-14 bg-white p-8 rounded-lg shadow-lg">
                    <h2 className="text-3xl font-bold mb-2">Description du cours</h2>
                    <hr className="border-2 border-slate-900 my-5" />
                    <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: course.description }} />
                </div>

                <div className="pb-14">
                    <h2 className="text-3xl font-bold mb-2">Sommaire</h2>
                    <hr className="border-2 border-slate-900 my-5" />
                    <div className="grid grid-cols-2 gap-8">
                        {course.course_outline?.map((step, index) => (
                            <div key={index} className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                                <h3 className="text-xl font-semibold mb-3 text-blue-600">{step.title}</h3>
                                <p className="mb-4 text-gray-600">{step.abstract}</p>
                                <div className="flex items-center mb-4 text-gray-500">
                                    <span className="pi pi-clock mr-2"></span>
                                    <p>{step.duration} minutes</p>
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-800 mb-2">Objectifs pédagogiques :</h4>
                                    <p className="text-gray-600">{step.pedagogical_objectives}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h2 className="text-3xl font-bold mb-2">Contenu</h2>
                    <hr className="border-2 border-slate-900 my-5" />
                    <div className="flex flex-col gap-8">
                        {course.course_steps_content?.map((step, stepIndex) => (
                            <div key={stepIndex} className="bg-white rounded-lg shadow-lg p-8">
                                <h3 className="text-2xl font-semibold mb-6 text-blue-600">{step.title}</h3>
                                
                                {step.parts ? (
                                    <div className="space-y-8">
                                        {step.parts.map((part, partIndex) => (
                                            <div key={partIndex}>
                                                <h4 className="text-xl font-semibold mb-4 text-gray-800 underline decoration-2 underline-offset-4">
                                                    {part.subtitle}
                                                </h4>
                                                <div className="prose max-w-none mb-6" 
                                                     dangerouslySetInnerHTML={{ __html: part.content }} />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="prose max-w-none mb-6" 
                                         dangerouslySetInnerHTML={{ __html: step.content }} />
                                )}
                                
                                {step.to_remember && (
                                    <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mt-8">
                                        <h4 className="text-lg font-semibold mb-3">À retenir</h4>
                                        <div dangerouslySetInnerHTML={{ __html: step.to_remember }} />
                                    </div>
                                )}

                                {step.resources && (
                                    <div className="bg-gray-50 p-6 rounded-lg mt-8">
                                        <h4 className="text-lg font-semibold mb-3 flex items-center">
                                            <span className="pi pi-book mr-2"></span>
                                            Ressources complémentaires
                                        </h4>
                                        <div dangerouslySetInnerHTML={{ __html: step.resources }} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}