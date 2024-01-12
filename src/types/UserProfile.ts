export type UserProfile = {
  _id: string;
  userId: string;
  name: string;
  governmentId: string;
  phone: string;
  address: string;
  role: "staff" | "patient";
};
