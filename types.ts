export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  password?: string;
  studentId: string;
  nationality: "Malaysian" | "International";
  university: string;
  faculty: string;
  yearOfStudy: string;
  monthlyBudget: number;
  dailyFoodBudget: number;
  hasRapidKlConcession: boolean;
  concessionExpiry: string;
  homeStation: string;
  campusStation: string;
  avatarColor: string;
  createdAt: string;
  subscriptionPlan?: "weekly" | "monthly" | "semester" | "yearly";
  subscriptionStatus?: "active" | "trial" | "expired";
  subscriptionRenewsAt?: string;
}

export interface ExpenseItem {
  id: string;
  title: string;
  amount: number;
  category: "Food" | "Commute" | "Campus" | "Utilities" | "Other";
  date: string;
  source: "eWallet" | "Manual";
}

export interface LoggedMealItem {
  id: string;
  mealType: "Breakfast" | "Lunch" | "Dinner" | "Snack" | "Late Night Study";
  name: string;
  description: string;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  sodiumMg: number;
  compositionBreakdown?: string;
  loggedAt: string;
  costMYR?: number;
}

export interface MalaysianUniversity {
  id: string;
  name: string;
  shortCode: string;
  campusStation: string;
}

export type ActiveTab = "home" | "commute" | "food" | "savings" | "account";
