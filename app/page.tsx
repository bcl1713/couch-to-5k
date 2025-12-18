import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";

export default async function Home() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-600 to-indigo-800 text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
          Couch to 5K
        </h1>
        <p className="text-xl mb-8">
          Your personal running coach. Transform from couch potato to 5K runner
          in just 9 weeks with guided workouts and real-time coaching.
        </p>

        <div className="space-y-4">
          <Link
            href="/signup"
            className="block bg-white text-indigo-600 py-3 px-6 rounded-lg font-semibold text-lg hover:bg-indigo-50 transition min-h-[44px] flex items-center justify-center"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="block bg-indigo-700 text-white py-3 px-6 rounded-lg font-semibold text-lg hover:bg-indigo-800 transition min-h-[44px] flex items-center justify-center"
          >
            Log In
          </Link>
        </div>

        <div className="mt-12 text-left space-y-4">
          <h2 className="text-2xl font-semibold mb-4">Features:</h2>
          <ul className="space-y-2">
            <li>✓ 9-week progressive training program</li>
            <li>✓ Real-time timer with audio cues</li>
            <li>✓ Track your progress and history</li>
            <li>✓ Flexible workout scheduling</li>
            <li>✓ Mobile-optimized interface</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
