import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Calendar, Users, Ticket, ArrowRight, Sparkles, MapPin, Star } from "lucide-react"

const highlights = [
  "Live music nights",
  "City food pop-ups",
  "Creative workshops",
]

const features = [
  {
    icon: Calendar,
    title: "Curated experiences",
    text: "Discover thoughtful events that match your mood, city, and schedule.",
  },
  {
    icon: Ticket,
    title: "Fast booking",
    text: "Reserve your spot in a few clicks without the usual friction.",
  },
  {
    icon: Users,
    title: "Built for communities",
    text: "Create memorable moments for guests, organizers, and local creators.",
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col text-stone-900">
      <main className="flex-1 pb-16">
        <section className="relative overflow-hidden py-14 md:py-20">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="relative z-10">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white/70 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-stone-600 shadow-sm backdrop-blur-sm">
                  <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                  curated local moments
                </div>

                <h1 className="max-w-xl text-5xl font-semibold tracking-[-0.08em] text-stone-900 md:text-6xl">
                  Find your next
                  <span className="block text-stone-600">great night out.</span>
                </h1>

                <p className="mt-6 max-w-lg text-lg leading-8 text-stone-600">
                  Explore handpicked events, book tickets in seconds, and bring people together around experiences that actually feel worth showing up for.
                </p>

                <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row">
                  <Button size="lg" asChild className="rounded-full bg-stone-900 px-6 text-white hover:bg-stone-800">
                    <Link href="/explore/events" className="inline-flex items-center gap-2">
                      Browse events
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild className="rounded-full border-stone-300 bg-white/70 px-6 hover:bg-stone-100">
                    <Link href="/register">Create account</Link>
                  </Button>
                </div>

                <div className="mt-8 flex flex-wrap gap-2 text-sm text-stone-600">
                  {highlights.map((item) => (
                    <span key={item} className="rounded-full border border-stone-200 bg-white/60 px-3 py-1.5">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="absolute -left-8 top-10 h-52 w-52 rounded-full bg-amber-200/50 blur-3xl" />
                <div className="absolute -right-6 bottom-4 h-52 w-52 rounded-full bg-orange-200/50 blur-3xl" />

                <div className="relative overflow-hidden rounded-[2rem] border border-stone-200 bg-white/80 p-4 shadow-[0_30px_80px_rgba(80,60,38,0.12)] backdrop-blur-md">
                  <div className="overflow-hidden rounded-[1.5rem] bg-stone-200">
                    <div className="h-56 bg-[linear-gradient(135deg,#2a241f_0%,#7d6252_40%,#d7c0a6_100%)] p-5 text-white">
                      <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-white/75">
                        <span>Weekend pick</span>
                        <span className="rounded-full border border-white/20 bg-white/10 px-2 py-1">Live</span>
                      </div>

                      <div className="mt-16 space-y-2">
                        <p className="text-2xl font-semibold tracking-[-0.06em]">Sunset Sessions</p>
                        <div className="flex items-center gap-2 text-sm text-white/80">
                          <MapPin className="h-4 w-4" />
                          Riverside Deck, Bengaluru
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Tickets</p>
                      <p className="mt-2 text-2xl font-semibold tracking-[-0.06em]">₹899</p>
                    </div>
                    <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Rating</p>
                      <div className="mt-2 flex items-center gap-2 text-2xl font-semibold tracking-[-0.06em]">
                        4.9
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-16">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-stone-500">Why Gatherly</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.06em] text-stone-900 md:text-4xl">
                Thoughtful planning for better nights.
              </h2>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {features.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-[1.75rem] border border-stone-200 bg-white/70 p-6 shadow-[0_18px_50px_rgba(80,60,38,0.04)]">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-900 text-stone-50">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-semibold tracking-[-0.04em] text-stone-900">{title}</h3>
                <p className="mt-3 text-base leading-7 text-stone-600">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-16">
          <div className="rounded-[2rem] border border-stone-200 bg-stone-900 px-6 py-8 text-stone-50 md:px-10 md:py-10">
            <div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-center">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-stone-300">For hosts & guests</p>
                <h3 className="mt-3 text-3xl font-semibold tracking-[-0.06em] md:text-4xl">
                  Build a memorable event experience from first click to last dance.
                </h3>
              </div>

              <div className="space-y-3 text-stone-200">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Simple discovery, better ticketing, and cleaner event management.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Designed for real people, not just dashboards and templates.</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-stone-200/80 py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 text-sm text-stone-600 md:px-6">
          <p>Gatherly</p>
          <p>Made for memorable moments.</p>
        </div>
      </footer>
    </div>
  )
}