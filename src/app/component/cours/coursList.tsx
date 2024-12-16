"use client"

import { getCoursData } from "@/app/services/json-editor";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Chip } from "primereact/chip";
import { useEffect, useState } from "react";

export default function CoursList() {

  const [coursList, setCoursList] = useState([]);
  useEffect(() => {
      const fetchData = async () => {
        const response = await getCoursData()
        console.log (response)
        setCoursList(response)
      }
      fetchData();
  }, []);

  const getLevelColor = (level: string) => {
    switch(level){
      case 'Débutant':
        return 'debutant';
      case 'Intermédiaire':
        return 'intermediaire'
        case 'Avancé' : 
        return 'avancer'
      case 'Expert':
        return 'expert'
    }
  }


  const getFlammeColor = (level: string) => {
    switch(level){
      case 'Débutant':
        return '🔥';
      case 'Intermédiaire':
        return '🔥🔥'
        case 'Avancé' : 
        return '🔥🔥🔥'
      case 'Expert':
        return '🔥🔥🔥🔥'
    }
  }


    return (
      <div className="flex justify-center mt-6">
        <div className="w-5/6">
        { coursList.map((cours, index) => (
         <Card title={cours.name}
         key={cours.id}
         className="mb-2.5">
              <p> {cours.subject}</p>
              <div className="flex items-center ">
                <span className="pi pi-clock mr-2.5"></span>
                <p>{cours.duration}</p>
              </div>
             
             <div>
             <Chip className={getLevelColor(cours.level)} label={`${cours.level} ${getFlammeColor(cours.level)}`}  />
             </div>
            
              <div className="flex justify-center mt-6">
              <Button label="Generer une fiche de révision" 
              className="mr-2.5 bg-grey text-white p-2.5"></Button>
              <Button label="Generer un QCM"
              className="mr-2.5 bg-blue text-white p-2.5"></Button>
              </div>
            
          </Card>
       
          ))}
        </div>
  
      </div>
       
    );
  }