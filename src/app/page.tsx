"use client"

import { generateCourses } from "./services/ia-integration";
import { createJson } from "./services/json-editor";

export default function Home() {

  async function handleGenerateCourses() {
    const response = await generateCourses("Expliquer pourquoi le racisme c'est bien")
    await createJson(response)
  }
  return (
    <>
      <h1>Hello World</h1>
      <button onClick={() => handleGenerateCourses()}>Generate Courses</button>
    </>
  );
}
