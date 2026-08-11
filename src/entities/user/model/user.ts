export interface User {
  id: number;
  name: string;
  email: string;
  sex: string;
  status: string;
  roles: string[];
  major: string | null;
  description: string | null;
  nickname: string | null;
  specialty: string | null;
  status_expires_at: string | null;
  status_message: string | null;
  student_number: string | null;
  student_role: string | null;
  account_description: string | null;
  github_id: string | null;
  profile_image_url: string | null;
}
