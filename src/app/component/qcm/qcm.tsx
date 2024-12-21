'use client'

import {useEffect, useState} from "react";
import {addQuestions, createJson, deleteQcmDeleteQuestion, getCourseDataBySlug, getQCMBySlug} from "@/app/services/json-editor";
import {QcmDto, QcmQuestionDto} from "@/interface/qcm.dto";
import {Card} from "primereact/card";
import {Button} from "primereact/button";
import {generateNewQuestions, generateQCM} from "@/app/services/ia-integration";
import {Course} from "@/interface/course.dto";
import Swal from "sweetalert2";

interface QcmProps {
    slug: string
}

export default function Qcm({slug}: QcmProps) {
    const [qcm, setQcm] = useState<QcmDto>();
    const [numberQuestion, setNumberQuestion] = useState<number>(0);
    const [visibleDialog, setVisibleDialog] = useState<boolean>(false);
    const [action, setAction] = useState<'add' | 'create' | undefined>(undefined);
    useEffect((): void => {
        const getQcm = async (): Promise<void> => {
            const findQcm: QcmDto | void = await getQCMBySlug(slug);
            if (findQcm) {
                setQcm(findQcm);
            }
        }

        getQcm()
    }, []);

    const openDialog = (actionOpenDialog: 'add' | 'create') => {
        setAction(actionOpenDialog);
        setVisibleDialog(true);
    }

    const generate = async (): Promise<void> => {
        const course: Course = await getCourseDataBySlug(slug)
        Swal.fire({
            title: 'Génération des questions en cours...',
            html: 'Cela peut prendre quelques minutes',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
        if (qcm && action === 'add') {
            const lastIdQcm = qcm.questions[qcm.questions.length - 1].question.id
            console.log(numberQuestion)
            const newQuestions = await generateNewQuestions(numberQuestion, course, lastIdQcm);
            await addQuestions(slug, newQuestions.questions).then((element) => {
                console.log(element)
                setQcm(element);
            });

        } else {
            const qcm = await generateQCM(numberQuestion, course)
            const newQcm: { success: boolean, generatedData?: [], error?: string | unknown } = await createJson(qcm, 'qcm.json');
            if (newQcm.generatedData) {
                // @ts-ignore
                setQcm(newQcm.generatedData)
            }

        }
        await Swal.fire({
            icon: 'success',
            title: 'Génération terminée !',
            text: '',
            timer: 2000,
            showConfirmButton: false
        });
        setAction(undefined);
        setVisibleDialog(false);
    }

    const handleDelete = async (id: number) => {
        const newQcm = await deleteQcmDeleteQuestion(slug, id);
        setQcm(newQcm)
    }

    return (
        <div className='relative h-[83vh]'>
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
                                    onClick={() => generate()}
                                    className='bg-black text-white p-2.5'
                            ></Button>
                        </div>
                    </div>
                </div>

            ) : ('')}

            {qcm ? (
                <div>
                    <div className=' flex flex-row-reverse  w-full mb-6 z-0'>
                        <Button label="REGENERER DES QUESTIONS" className='bg-black text-white p-2.5 z-0'
                                onClick={() => openDialog('add')}></Button>
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
                <Button label="Generer un QCM"
                        className="mr-2.5 bg-blue text-white p-2.5"
                        onClick={() => openDialog('create')}></Button>

            )}
        </div>
    )
}