import {
  ArrowUpRight,
  Mail,
  MapPin,
  MessageCircle,
  Send,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="rento-footer-new">
      <div className="footer-top-line" />

      <div className="page-container">
        {/* MAIN FOOTER */}
        <div className="footer-main-new">
          {/* BRAND */}
          <div className="footer-brand-new">
            <Link to="/" className="footer-logo-new">
              <span className="footer-logo-mark">R</span>
              {/* <span>RENTO</span> */}
            </Link>

            <p>
              A modern property marketplace built to make discovery,
              listing and connection feel simpler.
            </p>

            <div className="footer-contact-new">
              <a href="mailto:hello@rento.ng">
                <Mail size={15} />
                hello@rento.ng
              </a>

              <div>
                <MapPin size={15} />
                Nigeria
              </div>
            </div>
          </div>

          {/* LINKS */}
          <div className="footer-links-new">
            <div className="footer-link-group">
              <span>EXPLORE</span>

              <Link to="/buy">Buy property</Link>
              <Link to="/rent">Rent property</Link>
              <Link to="/land">Land</Link>
              <Link to="/agents">Agents</Link>
            </div>

            <div className="footer-link-group">
              <span>RENTO</span>

              <Link to="/about">About us</Link>
              <Link to="/contact">Contact</Link>
              <Link to="/favorites">Favorites</Link>
              <Link to="/sign-in">Sign in</Link>
            </div>

            <div className="footer-link-group">
              <span>OWNERS</span>

              <Link to="/list-property">List a property</Link>
              <Link to="/contact">Help center</Link>
              <Link to="/about">How it works</Link>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="footer-cta-new">
          <div className="footer-cta-copy">
            <span className="gold-eyebrow">
              <Sparkles size={12} />
              YOUR NEXT MOVE STARTS HERE
            </span>

            <h2>
              Let's find
              <br />
              <span>what's next.</span>
            </h2>
          </div>

          <Link to="/buy" className="footer-cta-button">
            Explore RENTO
            <ArrowUpRight size={18} />
          </Link>
        </div>

        {/* BOTTOM */}
        <div className="footer-bottom-new">
          <span className="footer-copyright">
            © 2026 RENTO. All rights reserved.
          </span>

          <div className="footer-social">
            <a href="mailto:hello@rento.ng" aria-label="Email">
              <Mail size={15} />
            </a>

            <a href="/contact" aria-label="Contact">
              <MessageCircle size={15} />
            </a>

            <a href="/contact" aria-label="Send message">
              <Send size={15} />
            </a>
          </div>

          <div className="footer-legal">
            <Link to="/about">Privacy</Link>
            <Link to="/about">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;