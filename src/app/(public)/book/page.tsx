import { CalendarDays, Sparkles } from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import BookingForm from "../../components/BookingForm";

export const metadata = {
  title: "Book Appointment - Flora Skincare",
};

export default function BookPage() {
  return (
    <div className="page-shell min-h-screen">
      <Header />
      <main className="px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mx-auto max-w-2xl text-center">
            <div className="section-kicker mx-auto">
              <CalendarDays className="h-4 w-4" />
              Appointment booking
            </div>
            <h1 className="section-heading mt-6 text-5xl text-purple-950 sm:text-6xl">
              Reserve your skincare session
            </h1>
            <p className="section-copy mt-5 text-lg">
              Choose your treatment and preferred time, and we&apos;ll prepare a polished clinic experience just for you.
            </p>
          </div>

          <div className="glass-panel mt-12 rounded-[2rem] p-6 sm:p-8">
            <div className="mb-8 flex items-center gap-3 rounded-[1.4rem] bg-purple-50/90 px-4 py-4 text-purple-900">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-100 to-purple-200">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-purple-500">
                  Flora booking
                </p>
                <p className="text-sm font-medium text-purple-900">
                  Complete the form below and we&apos;ll confirm your appointment details.
                </p>
              </div>
            </div>

            <BookingForm />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
