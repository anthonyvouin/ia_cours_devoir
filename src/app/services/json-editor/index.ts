"use server";
import fs from "fs/promises";
import path from "path";
import {Course, CourseList, CoursRevision} from "@/interface/course.dto";

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

export async function getQCMBySlug(slug: string) {
    const filePath: string = path.join(process.cwd(), "database", "qcm.json");
    const rawContent: string = await fs.readFile(filePath, 'utf-8');
    const courses: Course[] = JSON.parse(rawContent);
    return courses.filter((course: Course): boolean => course.slug === slug)[0];
}

export async function getRevisionBySlug(slug: string) {
    const filePath: string = path.join(process.cwd(), "database", "fileRevision.json");
    const rawContent: string = await fs.readFile(filePath, 'utf-8');
    const courses: CoursRevision[] = JSON.parse(rawContent);
    return courses.filter((course: CoursRevision): boolean => course.slug === slug)[0];
}