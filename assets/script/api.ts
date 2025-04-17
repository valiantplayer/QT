export async function fetchQuestions(subject?: string, level?: string) {
    const url = new URL("https://swintapai.com/api/get_questions");
    if (subject) url.searchParams.append("subject", subject);
    if (level) url.searchParams.append("education_level", level);
  
    const res = await fetch(url.toString());
    const data = await res.json();
  
    if (!Array.isArray(data)) {
      throw new Error("Unexpected response format");
    }
  
    return data; // 返回的是 Question[]
  }
  