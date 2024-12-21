'use client'
import {Course, CourseStep} from "@/interface/course.dto";
import {Chip} from "primereact/chip";

interface CourseProps{
    course: Course
}

export default function DetailCourse({course}: CourseProps) {
return (
    <section className="flex justify-center mt-6 mb-14">
        <div className="w-5/6 text-black">
            <div className="border-4 border-slate-900 w-fit p-6 mb-14">
                <h1 className="mb-4 font-bold text-4xl">{course.name}</h1>
                <div className="flex items-center gap-5">
                    <Chip label={course.level} className="bg-blue-600 text-white"/>
                    <div className="flex items-center">
                        <span className="pi pi-clock mr-2.5"></span>
                        <p>{course.duration} minutes</p>
                    </div>
                </div>
            </div>

            <div className="mb-14 bg-white p-8 rounded-lg shadow-lg">
                <h2 className="text-3xl font-bold mb-2">Description du cours</h2>
                <hr className="border-2 border-slate-900 my-5"/>
                <div className="prose max-w-none" dangerouslySetInnerHTML={{__html: course.description}}/>
            </div>

            <div className="pb-14">
                <h2 className="text-3xl font-bold mb-2">Sommaire</h2>
                <hr className="border-2 border-slate-900 my-5"/>
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
                <hr className="border-2 border-slate-900 my-5"/>
                <div className="flex flex-col gap-8">
                    {course.course_steps_content?.map((step: CourseStep, stepIndex: number) => (
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
                                                 dangerouslySetInnerHTML={{__html: part.content}}/>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="prose max-w-none mb-6"
                                     dangerouslySetInnerHTML={{__html: step.content}}/>
                            )}

                            {step.to_remember && (
                                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mt-8">
                                    <h4 className="text-lg font-semibold mb-3">À retenir</h4>
                                    <div dangerouslySetInnerHTML={{__html: step.to_remember}}/>
                                </div>
                            )}

                            {step.resources && (
                                <div className="bg-gray-50 p-6 rounded-lg mt-8">
                                    <h4 className="text-lg font-semibold mb-3 flex items-center">
                                        <span className="pi pi-book mr-2"></span>
                                        Ressources complémentaires
                                    </h4>
                                    <div dangerouslySetInnerHTML={{__html: step.resources}}/>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </section>
)
}