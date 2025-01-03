"use client"

import {createJson, getCourseData, getCourseDataBySlug} from "@/app/services/json-editor";
import {Button} from "primereact/button";
import {Card} from "primereact/card";
import {Chip} from "primereact/chip";
import Link from "next/link";
import {useEffect, useState} from "react";
import {Course, CourseList} from "@/interface/course.dto";
import {generateFileRevision, generateQCM} from "@/app/services/ia-integration";

export default function CoursList() {

    const [coursList, setCoursList] = useState<CourseList[]>([]);
    useEffect(() => {
        const fetchData = async () => {
            const response: Course | CourseList[] | undefined = await getCourseData() as CourseList[]
            setCoursList(response)
        }
        fetchData();
    }, []);

    const getLevelColor = (level: string) => {
        switch (level.toLowerCase()) {
            case 'débutant':
                return 'debutant';
            case 'intermédiaire':
                return 'intermediaire'
            case 'avancé':
                return 'avancer'
            case 'expert':
                return 'expert'
        }
    }

    const getFlammeColor = (level: string) => {
        switch (level) {
            case 'Débutant':
                return '🔥';
            case 'Intermédiaire':
                return '🔥🔥'
            case 'Avancé':
                return '🔥🔥🔥'
            case 'Expert':
                return '🔥🔥🔥🔥'
        }
    }


    return (
        <div className="flex justify-center mt-6">
            {coursList && coursList.length>0?(
                <div className="w-5/6">
                    {coursList.map((cours: CourseList) => (
                        <Card title={cours.name}
                              key={cours.id}
                              className="mb-2.5">
                            <p> {cours.subject}</p>
                            <div className="flex items-center ">
                                <span className="pi pi-clock mr-2.5"></span>
                                <p>{cours.duration}</p>
                            </div>

                            <div>
                                <Chip className={getLevelColor(cours.level)} label={`${cours.level} ${getFlammeColor(cours.level)}`}/>
                            </div>

                            <div className="flex justify-center mt-6 gap-10">
                                <Link href={`/cours/${cours.slug}`}>
                                    <Button label="Voir le cours"/>
                                </Link>
                            </div>

                        </Card>

                    ))}
                </div>
            ):(
                <p>Pas de cours généré</p>
            )}

        </div>

    );
}