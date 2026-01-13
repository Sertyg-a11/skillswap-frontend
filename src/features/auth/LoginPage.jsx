// src/features/auth/LoginPage.jsx
import Button from "../../shared/ui/Button";
import Card from "../../shared/ui/Card";
import { useAuth } from "./useAuth";

export default function LoginPage() {
  const { login } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 grid place-items-center px-4">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-xl font-semibold text-slate-900">SkillSwap</h1>
        <p className="mt-2 text-sm text-slate-600">
          Sign in to search skills, request exchanges, and chat.
        </p>
        <div className="mt-6">
          <Button onClick={login} className="w-full">Continue</Button>
        </div>
      </Card>
    </div>
  );
}
