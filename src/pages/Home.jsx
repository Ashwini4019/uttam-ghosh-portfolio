import { useEffect } from "react";
import Navbar from "../components/Navbar/Navbar";
import Hero from "../components/Hero/Hero";
import BrowseCategory from "../components/BrowseCategory";
import About from "../components/About/About";
import Contact from "../components/Contact/Contact";

const Home = () => {
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (!hash) return;

    const section = document.getElementById(hash);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  return (
    <div className="site-page" id="top">
      <Navbar />
      <Hero />
      <BrowseCategory />
      <About />
      <Contact />
      <footer className="home-footer">
        <p>&copy; {new Date().getFullYear()} Uttam Ghosh</p>
      </footer>
    </div>
  );
};

export default Home;
