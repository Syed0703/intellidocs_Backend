import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FileText, Lock, Mail, Sparkles, User } from "lucide-react";

import { createUser } from "../api/users";

function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await createUser({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);

        setError(data?.message || "Unable to create account");

        return;
      }

      navigate("/login");
    } catch {
      setError("Unable to connect to the server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F6F2]">
      <div className="flex min-h-screen">
        {/* Left branding section */}
        <div className="hidden w-[42%] max-w-[720px] flex-col justify-between bg-[#123C32] p-10 text-white lg:flex xl:p-12">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/15 bg-white/10">
              <FileText size={27} strokeWidth={1.8} />
            </div>

            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                IntelliDocs
              </h1>

              <p className="text-sm text-white/60">
                Organizational knowledge, simplified.
              </p>
            </div>
          </div>

          {/* Main message */}
          <div className="max-w-md">
            <div className="mb-5 flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm text-white/80">
              <Sparkles size={15} />
              AI-powered knowledge
            </div>

            <h2 className="text-4xl font-semibold leading-tight tracking-tight xl:text-[42px]">
              Bring your organization's knowledge
              <span className="text-[#A8C9BD]">
                {" "}
                into one intelligent workspace.
              </span>
            </h2>

            <p className="mt-5 max-w-sm text-base leading-7 text-white/65">
              Create your IntelliDocs account and start turning organizational
              documents into searchable knowledge.
            </p>
          </div>

          <p className="text-sm text-white/40">IntelliDocs</p>
        </div>

        {/* Signup section */}
        <div className="flex flex-1 items-center justify-center px-6 py-6 sm:px-10 lg:h-screen xl:px-16">
          <div className="w-full max-w-[420px]">
            {/* Mobile/tablet brand */}
            <div className="mb-6 flex items-center gap-3 lg:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#123C32] text-white">
                <FileText size={24} />
              </div>

              <span className="text-xl font-semibold text-[#202422]">
                IntelliDocs
              </span>
            </div>

            {/* Heading */}
            <div className="mb-5">
              <p className="mb-1.5 text-sm font-medium text-[#285C4D]">
                Get started
              </p>

              <h2 className="text-3xl font-semibold tracking-tight text-[#202422]">
                Create your account
              </h2>

              <p className="mt-2 text-sm leading-5 text-[#707571]">
                Create an IntelliDocs account to access your organization's
                workspace.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-1.5 block text-sm font-medium text-[#303633]"
                >
                  Full name
                </label>

                <div className="relative">
                  <User
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#858A87]"
                  />

                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Your name"
                    autoComplete="name"
                    required
                    className="w-full rounded-xl border border-[#DCDDD8] bg-white py-2.5 pl-11 pr-4 text-sm text-[#202422] outline-none transition placeholder:text-[#A3A6A4] focus:border-[#285C4D] focus:ring-2 focus:ring-[#285C4D]/10"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-medium text-[#303633]"
                >
                  Email address
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#858A87]"
                  />

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@company.com"
                    autoComplete="email"
                    required
                    className="w-full rounded-xl border border-[#DCDDD8] bg-white py-2.5 pl-11 pr-4 text-sm text-[#202422] outline-none transition placeholder:text-[#A3A6A4] focus:border-[#285C4D] focus:ring-2 focus:ring-[#285C4D]/10"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-sm font-medium text-[#303633]"
                >
                  Password
                </label>

                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#858A87]"
                  />

                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Minimum 8 characters"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    className="w-full rounded-xl border border-[#DCDDD8] bg-white py-2.5 pl-11 pr-4 text-sm text-[#202422] outline-none transition placeholder:text-[#A3A6A4] focus:border-[#285C4D] focus:ring-2 focus:ring-[#285C4D]/10"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirm-password"
                  className="mb-1.5 block text-sm font-medium text-[#303633]"
                >
                  Confirm password
                </label>

                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#858A87]"
                  />

                  <input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Enter your password again"
                    autoComplete="new-password"
                    required
                    className="w-full rounded-xl border border-[#DCDDD8] bg-white py-2.5 pl-11 pr-4 text-sm text-[#202422] outline-none transition placeholder:text-[#A3A6A4] focus:border-[#285C4D] focus:ring-2 focus:ring-[#285C4D]/10"
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#285C4D] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#1F493D] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Creating account..." : "Create account"}
              </button>
            </form>

            {/* Login link */}
            <p className="mt-5 text-center text-sm text-[#707571]">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-[#285C4D] hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
