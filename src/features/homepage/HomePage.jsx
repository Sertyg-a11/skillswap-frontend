import { Link } from "react-router-dom";
import Button from "../../shared/ui/Button";
import Card from "../../shared/ui/Card";
import Badge from "../../shared/ui/Badge";
import { useAuth } from "../auth/useAuth";

export default function HomePage() {
  const { authenticated, login } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <Link
            to="/"
            className="font-semibold text-slate-900 tracking-tight text-lg"
          >
            SkillSwap
          </Link>

          <div className="flex items-center gap-2">
            {authenticated ? (
              <Link to="/app">
                <Button>Open app</Button>
              </Link>
            ) : (
              <>
                <Button variant="secondary" onClick={login}>
                  Sign in
                </Button>
                <Button onClick={login}>Get started</Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-6xl px-4 py-20">
        {/* Hero */}
        <section className="max-w-3xl">
          <div className="flex items-center gap-2">
            <Badge>Skill exchange</Badge>
            <Badge>Chat-first</Badge>
            <Badge>Privacy-aware</Badge>
          </div>

          <h1 className="mt-6 text-5xl font-semibold tracking-tight text-slate-900">
            Learn by exchanging skills.
          </h1>

          <div className="mt-4 h-1 w-24 rounded-full bg-gradient-to-r from-slate-900 to-slate-500" />

          <p className="mt-6 text-lg text-slate-600 leading-relaxed">
            SkillSwap is a focused platform for people who want to learn from each other.
            You list what you can offer, find others with complementary skills, and agree
            on an exchange before starting a conversation.
          </p>

          {!authenticated && (
            <div className="mt-10">
              <Button size="lg" onClick={login}>
                Get started
              </Button>
            </div>
          )}
        </section>

        {/* Core features */}
        <section className="mt-20 grid gap-6 md:grid-cols-3">
          <Card className="p-7 border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-slate-900 text-white grid place-items-center text-sm font-semibold">
                01
              </div>
              <div className="text-base font-semibold text-slate-900">
                Create an account with your skills
              </div>
            </div>

            <p className="mt-4 text-sm text-slate-600 leading-relaxed">
              Build a simple profile that clearly describes what you can teach and what
              you want to learn. No social feed, no noise — just skills.
            </p>
          </Card>

          <Card className="p-7 border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-slate-900 text-white grid place-items-center text-sm font-semibold">
                02
              </div>
              <div className="text-base font-semibold text-slate-900">
                Swap skills with other users
              </div>
            </div>

            <p className="mt-4 text-sm text-slate-600 leading-relaxed">
              Discover people whose skills match your interests and propose a skill
              exchange. Once both sides agree, a private chat is opened to coordinate.
            </p>
          </Card>

          <Card className="p-7 border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-slate-900 text-white grid place-items-center text-sm font-semibold">
                03
              </div>
              <div className="text-base font-semibold text-slate-900">
                Full data transparency
              </div>
            </div>

            <p className="mt-4 text-sm text-slate-600 leading-relaxed">
              You stay in control of your data. View, export, or delete your information
              at any time through built-in privacy tools.
            </p>
          </Card>
        </section>

        {/* Footer */}
        <footer className="mt-24 border-t border-slate-200 pt-8 text-sm text-slate-500 flex items-center justify-between">
          <div>© {new Date().getFullYear()} SkillSwap</div>
          <Link className="hover:text-slate-700" to="/app/privacy">
            Privacy
          </Link>
        </footer>
      </main>
    </div>
  );
}
