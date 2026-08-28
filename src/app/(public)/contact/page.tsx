import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Contact from "../../components/Contact";

export const metadata = {
  title: "Contact Flora Skincare",
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
