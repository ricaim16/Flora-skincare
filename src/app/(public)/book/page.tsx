import { Suspense } from "react";
import { CalendarDays, Sparkles } from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import BookingForm from "../../components/BookingForm";

export const metadata = {
  title: "Book Appointment - Flora Skincare",
  description:
    "Book your appointment at Flora Skincare Clinic - choose a treatment, pick a date and time, and we'll confirm your visit.",
};

export default function BookPage() {
  return (
    <div className="page-shell min-h-screen">
      <Header />
      <main className="px-4 py-8 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <div className="section-kicker mx-auto">
              <CalendarDays className="h-4 w-4" />
              Appointment booking
            </div>
            <h1 className="section-heading mt-6 text-4xl text-purple-950 sm:text-6xl">
              Book Appointment
            </h1>
            <p className="section-copy mt-5 text-lg">
              Pick your treatment, choose a date, and select a visit time between 9:00 AM and 7:00 PM.
            </p>
          </div>

          <div className="glass-panel mt-8 rounded-[2.2rem] p-5 sm:mt-12 sm:p-8">
            <div className="mb-8 flex items-center gap-3 rounded-[1.4rem] bg-purple-50/90 px-4 py-4 text-purple-900">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-100 to-purple-200">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-purple-500">
                  Flora booking
                </p>
                <p className="text-sm font-medium text-purple-900">
                  Complete the details below and we&apos;ll confirm your appointment.
                </p>
              </div>
            </div>

            <Suspense fallback={<div className="text-sm text-purple-600">Loading booking form...</div>}>
              <BookingForm />
            </Suspense>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
