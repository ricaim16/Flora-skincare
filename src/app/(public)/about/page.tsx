import Header from "../../components/Header";
import Footer from "../../components/Footer";
import About from "../../components/About";

export const metadata = {
  title: "About Flora Skincare",
  description:
    "Meet Flora Skincare Clinic in Addis Ababa - tailored skin plans, clean clinical standards, and a warm, luxury studio experience.",
};

export default function AboutPage() {
  return (
    <div className="page-shell min-h-screen">
      <Header />
      <main>
        <About />
      </main>
      <Footer />
    </div>
  );
}
