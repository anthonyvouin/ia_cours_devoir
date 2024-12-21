export interface QcmDto {
    "id": number,
    "slug": string,
    "questions": QcmQuestionDto[]
}

export interface QcmQuestionDto {
    "question": QuestionDto,
    "responses": string[],
    "trueResponses": string[],
    "isUniqueResponse": true
}

export interface QuestionDto {
    name: string,
    id: number
}