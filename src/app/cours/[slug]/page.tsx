"use client"

import {useEffect, useState} from "react";
import {useParams, useRouter} from "next/navigation";
import {getCourseData, getCourseDataBySlug} from "@/app/services/json-editor";
import {ProgressSpinner} from 'primereact/progressspinner';
import {TabPanel, TabView} from "primereact/tabview";
import {Course} from "@/interface/course.dto";
import DetailCourse from "@/app/component/detailCourse/DetailCourse";
import {AppRouterInstance} from "next/dist/shared/lib/app-router-context.shared-runtime";


export default function OneCoursePage() {
    const [course, setCourse] = useState<Course>({} as Course);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const params:{slug: string} = useParams<{ slug: string; }>();
    const router:AppRouterInstance = useRouter();

    useEffect((): void => {
        const fetchData = async (): Promise<void> => {
            try {
                setLoading(true);
                setError(null);
                const response = await getCourseDataBySlug(params.slug);

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
        <TabView>
            <TabPanel header="Cours">
                <DetailCourse course={course}></DetailCourse>
            </TabPanel>

            <TabPanel header="QCM">

            </TabPanel>

            <TabPanel header="Fiche de révision">

            </TabPanel>
        </TabView>
    );
}