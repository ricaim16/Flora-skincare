import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Services from "../../components/Services";

export const metadata = {
  title: "Services - Flora Skincare",
  description:
    "Explore Flora Skincare's signature treatments, including facials, chemical peels, microneedling, and dermaplaning in Addis Ababa.",
};

export default function ServicesPage() {
  return (
    <div className="page-shell min-h-screen">
      <Header />
      <main>
        <Services />
      </main>
      <Footer />
    </div>
  );
}
