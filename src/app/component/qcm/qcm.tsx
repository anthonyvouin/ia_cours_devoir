'use client'

import {useEffect, useState} from "react";
import {addQuestions, deleteQcmDeleteQuestion, getCourseDataBySlug, getQCMBySlug} from "@/app/services/json-editor";
import {QcmDto, QcmQuestionDto} from "@/interface/qcm.dto";
import {Card} from "primereact/card";
import {Button} from "primereact/button";
import {generateNewQuestions} from "@/app/services/ia-integration";
import {Dialog} from "primereact/dialog";

interface QcmProps {
    slug: string
}

export default function Qcm({slug}: QcmProps) {
    const [qcm, setQcm] = useState<QcmDto>();
    const [numberQuestion, setNumberQuestion] = useState<number>(0);
    const [visibleDialog, setVisibleDialog] = useState<boolean>(false);
    useEffect((): void => {
        const getQcm = async (): Promise<void> => {
            const findQcm: QcmDto = await getQCMBySlug(slug);
            setQcm(findQcm);
        }

        getQcm()
    }, []);

    const validate = async (): Promise<void> => {
        const course = await getCourseDataBySlug(slug)
        if (qcm) {
            const lastIdQcm = qcm.questions[qcm.questions.length - 1].question.id
            console.log(numberQuestion)
            const newQuestions = await generateNewQuestions(numberQuestion, course, lastIdQcm);
            const updatedQcm: QcmDto = await addQuestions(slug, newQuestions.questions);
            setQcm(updatedQcm);
            setVisibleDialog(false);
        }
    }

    const handleDelete = async (id: number) => {
        const newQcm = await deleteQcmDeleteQuestion(slug, id);
        setQcm(newQcm)
    }

    return (
        <div>
            {qcm ? (
                <div className={`relative`}>

                    {visibleDialog ? (
                        <div>
                            <div className='absolute top-0 bottom-0 left-0 right-0 bg-black opacity-20 h-full w-full z-40'>

                            </div>
                            <div className='absolute top-1/2 left-1/2 transform-center bg-white opacity-100 z-50 w-[600px] p-8'>
                                <h2>Combien ? </h2>
                                <input type='number'
                                       className='border p-2.5 mt-2.5 mb 2.5'
                                       onChange={(e) => setNumberQuestion(Number(e.target.value))}/>
                                <div className='flex justify-between w-full mt-8'>
                                    <Button label="Annuler" className='border p-2.5'
                                            onClick={() => setVisibleDialog(false)}></Button>
                                    <Button label='Valider'
                                            onClick={() => validate()}
                                            className='bg-black text-white p-2.5'
                                    ></Button>
                                </div>
                            </div>
                        </div>

                    ) : ('')}

                    <div className=' flex flex-row-reverse  w-full mb-6 z-0'>
                        <Button label="Regénerer des questions" className='bg-black text-white p-2.5 z-0'
                                onClick={() => setVisibleDialog(true)}></Button>
                    </div>

                    {qcm.questions.map((question: QcmQuestionDto, index: number) => (
                        <Card key={question.question.id}
                              className='mb-2.5'>
                            <div className='flex justify-between'>
                                <div>
                                    <h2 className='text-xl font-bold mb-5 text-black'>{`Question ${index + 1}`}</h2>
                                    <h3 className='text-lg font-bold mb-2.5 text-black'>{question.question.name}</h3>
                                    <ol className='list-decimal ml-8'>
                                        {question.responses.map((response: string) => (
                                            <li key={response}>
                                                {response}
                                            </li>
                                        ))}
                                    </ol>
                                    <p className='text-green-500 mt-2.5'>Réponses: {question.trueResponses.join(", ")}</p>
                                </div>
                                <div>
                                    <Button tooltip='Supprimer'
                                            tooltipOptions={{position: 'bottom'}}
                                            className='w-7'
                                            onClick={() => handleDelete(question.question.id)}>
                                        <span className='pi pi-trash text-red-700 text-lg'></span>
                                    </Button>
                                </div>
                            </div>


                        </Card>
                    ))}
                </div>
            ) : (
                <div>Pas de qcm trouvé</div>
            )}
        </div>
    )
}