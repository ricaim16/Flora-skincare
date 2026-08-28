import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Services from "../../components/Services";

export const metadata = {
  title: "Services - Flora Skincare",
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
