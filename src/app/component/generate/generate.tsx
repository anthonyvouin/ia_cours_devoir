"use client"

import { generateCourses } from "@/app/services/ia-integration";
import { createJson } from "@/app/services/json-editor";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { useState } from "react";
import { SelectButton } from "primereact/selectbutton";
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';

export default function Generate() {
  const [courseName, setCourseName] = useState("");
  const [level, setLevel] = useState("Débutant");
  const router = useRouter();

  async function handleGenerateCourses(e: React.FormEvent) {
    e.preventDefault();

    try {
      Swal.fire({
        title: 'Génération du cours en cours...',
        html: 'Cela peut prendre quelques minutes',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const response = await generateCourses(courseName, level);

      if (response.is_censured) {
        await Swal.fire({
          icon: 'error',
          title: 'Contenu non autorisé',
          text: 'Le contenu demandé ne peut pas être généré car il contient des éléments inappropriés.',
          confirmButtonText: 'Compris',
          confirmButtonColor: '#000'
        });
        setCourseName("");
        return;
      }

      await createJson(response);

      await Swal.fire({
        icon: 'success',
        title: 'Cours généré avec succès !',
        text: 'Vous allez être redirigé vers le cours.',
        timer: 2000,
        showConfirmButton: false
      });

      setCourseName("");
      router.push(`/cours/${response.slug}`);

    } catch (error) {
      const result = await Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Une erreur est survenue lors de la génération du cours.',
        showCancelButton: true,
        confirmButtonText: 'Réessayer',
        cancelButtonText: 'Annuler',
        confirmButtonColor: '#000',
        cancelButtonColor: '#6B7280'
      });

    }
  }

  const levelsTab = [
    { name: "Débutant 🔥", value: "Débutant" },
    { name: "Intermédiaire 🔥🔥", value: "Intermédiaire" },
    { name: "Avancé 🔥🔥🔥", value: "Avancé" },
    { name: "Expert 🔥🔥🔥🔥", value: "Expert" },
  ];

  return (
    <div className="h-[85vh] flex justify-center items-center">
      <form onSubmit={handleGenerateCourses} className="flex flex-col gap-5 shadow-lg w-1/2 h-[33rem] p-14 bg-white rounded-lg">
        <h1 className="text-black text-2xl font-bold uppercase">Créer un cours</h1>
        <div className="flex flex-col gap-2">
          <label htmlFor="courseName" className="text-black text-sm font-normal uppercase">
            Nom du cours
          </label>
          <InputText
            id="courseName"
            value={courseName}
            className="border-2 border-gray-300 rounded-md p-2"
            onChange={(e) => setCourseName(e.target.value)}
            placeholder="Ex: Création de site web avec Next.js"
            required
          />
        </div>
        <hr />
        <div className="flex flex-col gap-2">
          <label htmlFor="level" className="text-black text-sm font-normal uppercase">
            Niveau
          </label>
          <SelectButton
            id="level"
            value={level}
            onChange={(e) => setLevel(e.value)}
            itemTemplate={item => (
              <div className="flex flex-row items-center gap-2">{item.name}</div>
            )}
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
          className="bg-black text-white p-2 w-1/3 h-10 disabled:opacity-50 disabled:bg-slate-700"
          disabled={!courseName.trim() || !level}
        />
      </form>
    </div>
  );
}
