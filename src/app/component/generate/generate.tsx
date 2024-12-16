"use client"

import { generateCourses } from "@/app/services/ia-integration";
import { createJson } from "@/app/services/json-editor";

export default function Generate() {
  
  async function handleGenerateCourses() {
    const response = await generateCourses("Création de site web avec Nuxt.js")
    await createJson(response)
  }

  return (
    <div>
      <button onClick={() => handleGenerateCourses()}>Generate Courses</button>
    </div>
  );
}
