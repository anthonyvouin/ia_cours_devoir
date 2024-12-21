export interface ContentPart {
    subtitle: string;
    content: string;
}

export interface CourseStep {
    title: string;
    content: ContentPart[];
    to_remember: string;
    resources: string;
    parts?: { subtitle: string, content: string }[];
}

export interface CourseOutline {
    title: string;
    abstract: string;
    duration: number;
    pedagogical_objectives: string;
}

export interface Course {
    name: string;
    id: number;
    level: string;
    duration: number;
    slug: string;
    description: string;
    course_outline: CourseOutline[];
    course_steps_content: CourseStep[];
    is_censured: boolean;
}


export interface CourseList {
    name: string,
    id: number,
    subject: string,
    duration: number,
    level: string,
    slug: string
}