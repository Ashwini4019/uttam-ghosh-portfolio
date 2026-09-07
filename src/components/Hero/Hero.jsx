import "./Hero.css";
import heroImg from "../../assets/images/uttam-ghosh-face.jpeg";
import { linkifyRediff } from "../../utils/linkifyRediff";

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-left">
        <div className="hero-content">
          <p className="welcome">WELCOME TO MY WORLD</p>

          <h1>
            Hi, I&apos;m
            <span>Uttam Ghosh</span>
          </h1>

          <p className="hero-roles">
            Artist · Cartoonist · Editorial photographer
          </p>

          <p className="hero-bio">
            An artist, cartoonist, and editorial photographer with a passion for
            storytelling through{" "}
            <span className="hero-highlight">ink, light, and design</span>. With
            over <span className="hero-highlight">three decades</span> of
            experience, I&apos;ve had the privilege of working with platforms like{" "}
            {linkifyRediff("Rediff.com")} and{" "}
            <span className="hero-highlight">The Sunday Observer</span>, shaping
            visual narratives that inform, engage, and inspire.
          </p>

          <p className="hero-bio">
            My work blends creativity with observation, capturing moments, ideas,
            and expressions across photography, illustration, and design. I
            continue to explore new ways to tell stories—
            <span className="hero-highlight">frame by frame, stroke by stroke</span>
            —while contributing to the ever-evolving world of visual art.
          </p>

          <button className="hero-btn" type="button">
            Explore Gallery
          </button>
        </div>
      </div>

      <div className="hero-right">
        <img src={heroImg} alt="Uttam Ghosh" />
      </div>

      <div className="hero-edge" aria-hidden="true">
        <div className="hero-edge-rule">
          <span className="hero-edge-diamond" />
        </div>
        <div className="hero-edge-deckle" />
      </div>
    </section>
  );
};

export default Hero;
