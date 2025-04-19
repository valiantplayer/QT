export interface UserProfile {
    name: string;
    role: string;
    gender: string;
    age: number;
    level: string;
    unlocked_backgrounds: boolean[];
    unlocked_fish_skins: boolean[];
  }
  let user_details: UserProfile;
  export function setUserDetails(data: UserProfile) {
    user_details = data;
  }
  
  export function getUserDetails(): UserProfile {
    return user_details;//拿到当前的用户数据
  }