"use client"
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useRouter } from "next/navigation";
import { Menubar } from "primereact/menubar";

export default function MenuComponent() {
    const router: AppRouterInstance = useRouter();

    let items = [
        { label: 'Générer un cours', 
            icon: 'pi pi-plus',
            command: () => {goTo('')},
        },
        { label: 'Cours générés', 
            icon: 'pi pi-search', 
            command: () => {goTo('cours')},
        },
    ];

    const goTo = (name: string)=> {
        router.push(`/${name}`)

    }

    return (
        <div>
            <Menubar model={items} className="border h-full"/>
        </div>
           
      
    );
  }
  