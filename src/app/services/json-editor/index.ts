"use server";
import fs from "fs/promises";
import path from "path";
import {Course, CourseList} from "@/interface/course.dto";
import {QcmDto, QcmQuestionDto} from "@/interface/qcm.dto";

export async function createJson(data: any, file_path: string = "courses.json") {
    try {
        if (data.is_censured) {
            return {
                success: false,
                error: "Le contenu du cours n'est pas approprié"
            };
        }

        const filePath: string = path.join(process.cwd(), "database", file_path);

        let courses = [];
        try {
            const fileContent = await fs.readFile(filePath, 'utf-8');
            courses = JSON.parse(fileContent);
        } catch (error) {
            console.log("File not found")
        }

        const newCourse = {
            id: courses.length + 1,
            ...data
        };
        courses.push(newCourse);

        await fs.writeFile(filePath, JSON.stringify(courses, null, 2));
        return {success: true, course: newCourse};
    } catch (error) {
        console.error("Erreur lors de la sauvegarde du fichier :", error);
        return {success: false, error};
    }
}

export async function getCourseData(): Promise<CourseList[] | undefined> {
    try {
        const filePath: string = path.join(process.cwd(), "database", "courses.json");
        const rawContent: string = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(rawContent);
    } catch (e) {
        console.log("File not found")
    }
}

export async function getCourseDataBySlug(slug: string) {
    const filePath: string = path.join(process.cwd(), "database", "courses.json");
    const rawContent: string = await fs.readFile(filePath, 'utf-8');
    const courses: Course[] = JSON.parse(rawContent);
    return courses.filter((course: Course): boolean => course.slug === slug)[0];
}

export async function getQCMBySlug(slug: string): Promise<QcmDto> {
    const filePath: string = path.join(process.cwd(), "database", "qcm.json");
    const rawContent: string = await fs.readFile(filePath, 'utf-8');
    const qcmList: QcmDto[] = JSON.parse(rawContent);
    return qcmList.filter((qcm: QcmDto): boolean => qcm.slug === slug)[0];
}

export async function deleteQcmDeleteQuestion(slug: string, id: number) {
    const filePath: string = path.join(process.cwd(), "database", "qcm.json");
    const rawContent: string = await fs.readFile(filePath, 'utf-8');
    const qcmList: QcmDto[] = JSON.parse(rawContent);
    const qcmIndex: number = qcmList.findIndex((element) => element.slug === slug);
    qcmList[qcmIndex].questions = qcmList[qcmIndex].questions.filter((element) => element.question.id !== id)
    await fs.writeFile(filePath, JSON.stringify(qcmList, null, 2));
    return qcmList[qcmIndex];
}

export async function addQuestions(slug: string, data: QcmQuestionDto[]) {
    const filePath: string = path.join(process.cwd(), "database", "qcm.json");
    const rawContent: string = await fs.readFile(filePath, 'utf-8');
    const qcmList: QcmDto[] = JSON.parse(rawContent);
    const qcmIndex: number = qcmList.findIndex((element) => element.slug === slug);
    qcmList[qcmIndex].questions.push(...data);
    await fs.writeFile(filePath, JSON.stringify(qcmList, null, 2));
    return qcmList[qcmIndex];
}