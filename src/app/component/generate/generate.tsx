"use client"

import { generateCourses } from "@/app/services/ia-integration";
import { createJson } from "@/app/services/json-editor";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { useState } from "react";
import { SelectButton } from "primereact/selectbutton";

export default function Generate() {
  const [courseName, setCourseName] = useState("");
  const [level, setLevel] = useState("beginner");

  async function handleGenerateCourses(e: React.FormEvent) {
    e.preventDefault();
    const response = await generateCourses(courseName, level);
    await createJson(response);
    setCourseName("");
  }

  const levelsTab = [
    { name: "Débutant 🔥", value: "Débutant" },
    { name: "Intermédiaire 🔥🔥", value: "Intermédiaire" },
    { name: "Avancé 🔥🔥🔥", value: "Avancé" },
    { name: "Expert 🔥🔥🔥🔥", value: "Expert" },
  ]

  return (
    <div className="h-[85vh] flex justify-center items-center">
      <form onSubmit={handleGenerateCourses} className="flex flex-col gap-5 shadow-lg w-1/2 h-[33rem] p-14">
        <h1 className="text-black text-2xl font-bold uppercase">Créer un cours</h1>
        <div className="flex flex-col gap-2">
          <label htmlFor="courseName" className="text-black text-sm font-normal uppercase">Nom du cours</label>
          <InputText
            value={courseName}
            className="border-2 border-gray-300 rounded-md p-2"
            onChange={(e) => setCourseName(e.target.value)}
            placeholder="Ex: Création de site web avec Next.js"
            required
          />
        </div>
        <hr />
        <div className="flex flex-col gap-2">
          <label htmlFor="level" className="text-black text-sm font-normal uppercase">Niveau</label>
          <SelectButton
            value={level}
            onChange={(e) => setLevel(e.value)}
            itemTemplate={item => <div className="flex flex-row items-center gap-2">{item.name}</div>}
            optionLabel="name"
            className="grid grid-cols-2 gap-2"
            options={levelsTab}
            required
            pt={{
              button: {
                className: 'border-2 border-gray-300 !rounded-md',
              }
            }}
          />
        </div>
        <hr />
        <Button 
          type="submit"
          label="Générer le cours" 
          className="bg-black text-white p-2 w-1/3 h-10" 
        />
      </form>
    </div>
  );
}
