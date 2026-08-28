import Header from "../../components/Header";
import Footer from "../../components/Footer";
import About from "../../components/About";

export const metadata = {
  title: "About Flora Skincare",
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
