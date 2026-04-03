import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: " SignUp Page | QCPandawara ",
  description: "This is  SignUp Page QCPandawara Dashboard Template",
  // other metadata
};

export default function SignUp() {
  return <SignUpForm />;
}
