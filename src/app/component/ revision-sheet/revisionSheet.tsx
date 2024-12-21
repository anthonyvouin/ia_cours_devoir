"use client"

import { useEffect, useState } from "react";
import { getRevisionBySlug } from "@/app/services/json-editor";
import { CoursRevision } from "@/interface/course.dto";

interface RevisionSheetProps {
  slug: string;
}



export default function RevisionSheet({ slug }: RevisionSheetProps) {
  const [courseRevision, setCourseRevision] = useState<CoursRevision | null>(null);

  useEffect(() => {
    const fetchCourseRevision = async () => {
      const data = await getRevisionBySlug(slug);
      setCourseRevision(data);
    };

    fetchCourseRevision();
  }, [slug]);

  if (!courseRevision) {
    return <div>Chargement...</div>;  
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
              <div key={index} className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                <h3 className="text-xl font-semibold mb-3 text-blue-600">{section.title}</h3>
                <p className="mb-4 text-gray-600">{section.summary}</p>
                <h4 className="font-medium text-gray-800 mb-2">Les points importants :</h4>
                <ul className="text-gray-600">
                  {section.key_points.map((point, idx) => (
                    <li key={idx} className="mb-2">{point}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
    );
  }