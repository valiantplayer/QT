import {setQuestions } from "./questionManager";
import {setUserDetails} from "./userManager"

export async function fetchQuestions(subject?: string, level?: string) {
    const url = new URL("https://swintapai.com/api/get_questions");
    if (subject) url.searchParams.append("subject", subject);
    if (level) url.searchParams.append("education_level", level);
  
    const res = await fetch(url.toString());
    const data = await res.json();
  
    if (!Array.isArray(data)) {
      throw new Error("Unexpected response format");
    }
    setQuestions(data);
  }
  export async function getAllUserDetails() {
    const url = new URL("https://swintapai.com/api/get_profile");
    const res = await fetch(url.toString());
    const data = await res.json();
    if (data.success) {
      setUserDetails(data.profile);
      //获取用户的数据
      console.log("用户的背景皮肤:"+data.profile.unlocked_backgrounds);
      console.log("用户的鱼皮肤:"+data.profile.unlocked_fish_skins);
      
    }
  }