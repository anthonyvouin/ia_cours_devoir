"use server";
import fs from "fs/promises";
import path from "path";

export async function createJson(data: any, file_path: string = "courses.json") {
    try {
        if (data.is_censured) {
            return { 
                success: false, 
                error: "Le contenu du cours n'est pas approprié" 
            };
        }

        const filePath = path.join(process.cwd(), "database", file_path);
        
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
        return { success: true, course: newCourse };
    } catch (error) {
        console.error("Erreur lors de la sauvegarde du fichier :", error);
        return { success: false, error };
    }
}

export async function getCoursData() {
    try {
        const filePath = path.join(process.cwd(), "public", "courses.json");
        const fileContent = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(fileContent);
    }catch(e){
        console.log("File not found")
    }
}