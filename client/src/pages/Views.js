import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Views.css";
import pell from "../assets/fonts/pexels-ballet-1840427_1920.jpg";
import logo from "../assets/fonts/Echoes-img.png";
import heroBg from "../assets/fonts/Echoesbg.mp4";

const Views = () => {
    const [scrolled, setScrolled] = useState(false);

          useEffect(() => {
            const handleScroll = () => setScrolled(window.scrollY > 40)
            window.addEventListener("scroll", handleScroll)
            return () => window.removeEventListener("scroll", handleScroll)
          }, [])
  return (
    <div className="views-container">
      {/* Navbar */}
      <nav className={`landing-nav ${scrolled ? "scrolled" : ""}`}>
        <div className="landing-logo">
          <img src={logo} alt="Echoes" className="landing-logo-img" />
          ECHOES
        </div>
        <Link to="/auth" className="landing-login-btn">
          Login
        </Link>
      </nav>

      {/* Hero Section */}
      <div className="hero-section">
        <video className="hero-video" src={heroBg} autoPlay loop muted playsInline/>
                     <div className="hero-overlay" />
        {/* <div className="hero-images">
          <img
            src="https://images.unsplash.com/photo-1568849676085-51415703900f?q=80&w=687&auto=format&fit=crop"
            alt="memories"
            className="first"
          />
          <img
            src="https://images.unsplash.com/photo-1481841580057-e2b9927a05c6?w=800&auto=format&fit=crop"
            alt="couple"
            className="mid"
          />
          <img
            src="https://images.unsplash.com/photo-1615574147326-99d907ca408c?q=80&w=777&auto=format&fit=crop"
            alt="friends"
            className="end"
          />
        </div> */}
         <div className="hero-content">
        <div className="hero-text">
          <h1 className="hero-headline">FOR THE LOVERS AND THE FEELERS</h1>
          <p className="hero-sub">
            Your memories deserve more than a camera roll.
          </p>
          <Link to="/auth" className="hero-cta">
            Get Started — It's Free 🌸
          </Link>
        </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="features-section">
        <div className="feature-text">
          <div className="feature-block">
            <h3>📸 A private space for your people</h3>
            <p>
              You know that feeling when you're scrolling through your camera
              roll at 2am, stumbling on photos from a trip, a birthday, a random
              Tuesday that somehow became unforgettable? Those moments deserve
              more than sitting in a folder nobody looks at.
            </p>
          </div>

          <div className="feature-block">
            <h3>🔔 Stay connected in real time</h3>
            <p>
              Create a scrapbook, invite your partner, your family or your
              closest friends and start building something beautiful together.
              Every time someone adds a memory everyone gets notified instantly.
              No more missing moments.
            </p>
          </div>

          <div className="feature-block">
            <h3>📖 Print your memories</h3>
            <p>
              When your scrapbook is full of life — print it. Choose from 4
              beautiful styles:
              <strong> Polaroid, Magazine, Classic</strong> and{" "}
              <strong>Minimal</strong>. A personal dedication note, your own
              cover and your memories — shipped anywhere in the world.
            </p>
          </div>

          <div className="feature-block">
            <h3>⏳ Time Capsules & Letters to Future Self</h3>
            <p>
              Lock memories and set a date for when they unlock. Or write a
              letter to your future self — sealed today, delivered to your inbox
              on the date you choose.
            </p>
          </div>

          <p className="feature-tagline">
            No ads. No strangers. No algorithm. Just you and the people you
            love. 🌸
          </p>

          <p className="feature-closing">
            So take those pictures, upload those memories and let Echoes keep
            you and your loved ones connected.
          </p>

          <Link to="/auth" className="hero-cta">
            Start Your First Scrapbook
          </Link>
        </div>

        <div className="feature-img">
          <img
            src="https://images.unsplash.com/photo-1755976264282-dea1f8dd443d?q=80&w=687&auto=format&fit=crop"
            alt="scrapbook"
          />
        </div>
      </section>

      {/* Article Section */}
      <article className="article-section">
        <div className="article-left">
          <div className="article-img-row">
            <img className="bee" src={pell} alt="memory" />
            <div className="messy">
              <h2>
                WHAT IF THOSE DAILY MESSY UNEXCITING MOMENTS WERE WHAT REMIND
                YOU OF YOUR WORTH?
              </h2>
            </div>
          </div>
        </div>
        <div className="article-bottom">
          <div className="art-p">
            <p className="article-p">
              Memories are love letters we write to our future selves. They are
              the soft proof that we lived, that we felt deeply, that ordinary
              days once shimmered in golden light. A shared laugh, a quiet
              sunset, a random photo taken at the wrong angle — these are the
              little treasures that grow sweeter with time.
            </p>
            <p className="article-p">
              Some moments don't ask to be remembered — they just quietly become
              unforgettable. The way someone looked at you when you weren't
              paying attention. The laughter that echoed a little too long. The
              soft stillness of a day that felt ordinary but somehow perfect.
            </p>
            <p className="article-p">
              Echoes is a private shared scrapbook built for couples, families
              and friends who want to capture life's best moments together. 🌸
            </p>
          </div>
          <div className="art-img">
            <img
              className="cee"
              src="https://images.unsplash.com/photo-1603234924544-526ab57f77d9?q=80&w=687&auto=format&fit=crop"
              alt="polaroid"
            />
          </div>
        </div>
      </article>

      {/* Footer */}
      <footer>
        <div className="foot-deets">
          <img
            src="https://images.unsplash.com/photo-1755810114356-8bc11c67c409?q=80&w=1440&auto=format&fit=crop"
            alt=""
            className="foot-img"
          />
          <h2 className="footer-h">
            PERFECTLY IMPERFECT MEMORIES ARE THE ART OUR EXPERIENCES LEAVE
            BEHIND
          </h2>
          <img
            src="https://images.unsplash.com/photo-1584018344977-1785e2aab7fe?q=80&w=735&auto=format&fit=crop"
            alt=""
            className="foot-img-b"
          />
        </div>
      </footer>

      <div className="copyright">
        <p>
          © 2026 Echoes🌸 by Temitayo. All rights reserved.{" "}
          <a href="/privacy">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
};

export default Views;
