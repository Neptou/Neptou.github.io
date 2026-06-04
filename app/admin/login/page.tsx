import LoginForm from "@/components/LoginForm";

export const metadata = { title: "Admin Login — Neptou" };

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 mb-4 shadow-lg">
            <span className="text-2xl font-bold text-white">N</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Neptou Admin</h1>
          <p className="text-gray-400 text-sm mt-1">Sign in to manage places</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
