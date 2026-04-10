import Header from "../components/Header";
import Hero from "../components/Hero";
import Services from "../components/Services";
import Footer from "../components/Footer";
import Contact from "../components/Contact";
import About from "../components/About";

export default function Home() {
  return (
    <div className="page-shell min-h-screen">
      <Header />

      <main>
        <Hero />
        <About />
        <Services />
        <Contact />
      </main>

      <Footer />
    </div>
  );
}
