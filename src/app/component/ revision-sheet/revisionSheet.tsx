"use client";

import { useEffect, useState } from "react";
import { getRevisionBySlug, getCourseDataBySlug } from "@/app/services/json-editor";
import { CoursRevision } from "@/interface/course.dto";
import jsPDF from "jspdf";
import "jspdf-autotable";
import {Button} from "primereact/button";
import Swal from "sweetalert2";
import {generateFileRevision} from "@/app/services/ia-integration";


interface RevisionSheetProps {
    slug: string;
}

export default function RevisionSheet({ slug }: RevisionSheetProps) {
  const [courseRevision, setCourseRevision] = useState<CoursRevision | null>(null);

    useEffect((): void => {
        const fetchCourseRevision = async (): Promise<void> => {
            const data = await getRevisionBySlug(slug);
            setCourseRevision(data);
        };

        fetchCourseRevision();
    }, [slug]);

  const generatePDF = () => {
    if (!courseRevision) return;

    const doc = new jsPDF();

    doc.setFontSize(13);
    doc.text(`Fiche de Révision : ${courseRevision.slug}`, 10, 10);

    let yOffset = 20;

    courseRevision.sections.forEach((section, index) => {
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 255);
      doc.text(`Section ${index + 1}: ${section.title}`, 10, yOffset);
      yOffset += 10;

      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text(doc.splitTextToSize(section.summary, 190), 10, yOffset);
      yOffset += 20;

      doc.setFontSize(11);
      doc.text("Les points importants :", 10,  yOffset + 5);
      yOffset += 15;

      section.key_points.forEach((point, pointIndex) => {
        doc.setFontSize(10);
        doc.text(`- ${point}`, 15, yOffset);
        yOffset += 8;

        if (yOffset > 270) {
          doc.addPage();
          yOffset = 10;
        }
      });

      yOffset += 10;

      if (yOffset > 270) {
        doc.addPage();
        yOffset = 10;
      }
    });

    doc.save(`${courseRevision.slug}_revision.pdf`);
  };

  if (!courseRevision) {
    return <div>Chargement...</div>;
  }
    const handleGenerateFileRevision = async (): Promise<void> => {
        Swal.fire({
            title: 'Génération de la fiche de révision en cours...',
            html: 'Cela peut prendre quelques minutes',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
        const findCours: Course = await getCourseDataBySlug(slug)
        if (findCours !== undefined) {
            const newCourseRevision: { success: boolean, generatedData?: [], error?: string | unknown } = await generateFileRevision(findCours)
            if (newCourseRevision.generatedData) {
                // @ts-ignore
                setCourseRevision(newCourseRevision.generatedData)
            }
            await Swal.fire({
                icon: 'success',
                title: 'Génération terminée !',
                text: '',
                timer: 2000,
                showConfirmButton: false
            });
        }
    }

    if (!courseRevision) {
        return (<Button label="Generer une fiche de révision"
                        className="mr-2.5 bg-grey text-white p-2.5"
                        onClick={() => handleGenerateFileRevision()}></Button>)

    }

    return (
        <section className="flex justify-center mt-6 mb-14">
            <div className="w-5/6 text-black">
                <div className="border-4 border-slate-900 w-fit p-6 mb-14">
                    <h1 className="mb-4 text-2xl font-bold">
                        Fiche de Révision : {courseRevision.slug}
                    </h1>
                </div>

        <div className="bg-white p-8 rounded-lg shadow-lg mb-14">
          <h2 className="text-3xl font-bold mb-2">Sections</h2>
          <hr className="border-2 border-slate-900 my-5" />
          <div className="grid grid-cols-2 gap-8">
            {courseRevision.sections.map((section, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
              >
                <h3 className="text-xl font-semibold mb-3 text-blue-600">
                  {section.title}
                </h3>
                <p className="mb-4 text-gray-600">{section.summary}</p>
                <h4 className="font-medium text-gray-800 mb-2">Les points importants :</h4>
                <ul className="text-gray-600">
                  {section.key_points.map((point, idx) => (
                    <li key={idx} className="mb-2">
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <button
            onClick={generatePDF}
            className="bg-black text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition-colors mt-12"
          >
            Télécharger au format PDF
          </button>
        </div>
      </div>
    </section>
  );
}
