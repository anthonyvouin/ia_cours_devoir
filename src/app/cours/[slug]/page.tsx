"use client"

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Chip } from "primereact/chip";
import { getCoursData } from "@/app/services/json-editor";


export default function OneCoursePage() {
    const [course, setCourse] = useState<any>({})
    const params = useParams<{ slug: string; }>()

    useEffect(() => {
        const fetchData = async () => {
            const response = await getCoursData(params.slug)
            setCourse(response)
        }
        fetchData();
    }, [params.slug]);
    return (
        <section className="flex justify-center mt-6">
            <div className="w-5/6 text-black ">
                <div className="border-4 border-slate-900 w-fit p-6 mb-14">
                    <p className="mb-4 font-bold text-4xl">{course.name}</p>
                    <div className="flex items-center gap-5">
                        <div>
                            <Chip label={course.level} />
                        </div>
                        <div className="flex items-center">
                            <span className="pi pi-clock mr-2.5"></span>
                            <p>{course.duration} minutes</p>
                        </div>
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="text-3xl font-bold mb-2">Description du cours</h3>
                    <hr className="border-2 border-slate-900 my-5" />
                    <div dangerouslySetInnerHTML={{ __html: course.description }} />
                </div>

                <div className="pb-14">
                    <h3 className="text-3xl font-bold mb-2">Sommaire</h3>
                    <hr className="border-2 border-slate-900 my-5" />
                    <div className="grid grid-cols-2 gap-8">
                        {course.course_outline?.map((step: any, index: number) => (
                            <div key={index} className="p-4 border rounded">
                                <h4 className="text-lg font-semibold mb-2">{step.title}</h4>
                                <p className="mb-2">{step.abstract}</p>
                                <div className="flex items-center mb-2">
                                    <span className="pi pi-clock mr-2"></span>
                                    <p>{step.duration} minutes</p>
                                </div>
                                <div className="mb-2">
                                    <h5 className="font-medium">Objectifs pédagogiques :</h5>
                                    <p>{step.pedagogical_objectives}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="text-3xl font-bold mb-2">Contenu</h3>
                    <hr className="border-2 border-slate-900 my-5" />
                    <div className="flex flex-col gap-5">
                        {course.course_steps_content?.map((step: any, index: number) => (
                            <>
                                <div key={index} className="rounded">
                                    <h4 className="text-lg font-semibold mb-2">{step.title}</h4>
                                    <div>
                                        <div dangerouslySetInnerHTML={{ __html: step.content }} />
                                    </div>
                                </div>
                                <hr />
                            </>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}