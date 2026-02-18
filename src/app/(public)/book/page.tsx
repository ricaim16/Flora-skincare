import Header from "../../components/Header";
import Footer from "../../components/Footer";
import BookingForm from "../../components/BookingForm";

export const metadata = {
  title: "Book Appointment - Flora Skincare",
};

export default function BookPage() {
  return (
    <>
      <Header />
      <main className="py-20 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-purple-900 text-center mb-4">
            Book Your Appointment
          </h1>
          <p className="text-center text-gray-600 text-purple-900 mb-10">
            Schedule your skincare treatment with Flora Skincare.
          </p>

          <BookingForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
