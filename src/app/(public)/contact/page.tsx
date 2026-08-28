import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Contact from "../../components/Contact";

export const metadata = {
  title: "Contact Flora Skincare",
  description:
    "Get in touch with Flora Skincare Clinic - find our Bole Road location, hours, and send us a message to plan your treatment.",
};

export default function ContactPage() {
  return (
    <div className="page-shell min-h-screen">
      <Header />
      <main>
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
