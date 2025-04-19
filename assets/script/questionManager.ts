// questionManager.ts
let questions: any[] = [];

export function setQuestions(data: any[]) {
  questions = data;
}

export function getAllQuestions() {
  return questions;
}

export function getRandomQuestions(count: number) {
  const all = getAllQuestions();
  const shuffled = all.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function getQuestionByIndex(index: number) {
  return questions[index] || null;
}