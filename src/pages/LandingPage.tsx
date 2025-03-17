import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/landing.css';

const LandingPage: React.FC = () => {
  return (
    <div className="page-wrap">
      <main id="butter" className="main">
        <header className="header">
          <div className="header-absolute" style={{opacity: 1, transform: 'none'}}>
            <div className="content">
              <div className="header__columns">
                <div className="header__col">
                  <Link to="/" className="header__logo w-inline-block">
                    <img src="https://cdn.prod.website-files.com/67d6b5c042fc281ac04054f3/67d6b5c042fc281ac0405563_logo.svg" loading="eager" alt="Growly Logo" className="logo-img"/>
                  </Link>
                </div>
                <div className="header__col col--2">
                  <nav className="header__nav">
                    <a href="#features" data-anim="link" className="header__nav-link">Features</a>
                    <a href="#grows" data-anim="link" className="header__nav-link">Grows</a>
                    <a href="#about" data-anim="link" className="header__nav-link">About</a>
                    <a href="#pricing" data-anim="link" className="header__nav-link">Pricing</a>
                  </nav>
                </div>
                <div className="header__col col--3">
                  <Link to="/login" className="header__login">Login</Link>
                  <Link to="/signup" className="btn btn--slim w-button">Sign Up</Link>
                </div>
              </div>
            </div>
          </div>
        </header>

        <section id="features" className="section section--hero">
          <div className="content">
            <div className="hero__content">
              <div className="hero__over-heading" style={{opacity: 1, transform: 'none'}}>Plant Management System</div>
              <h1 className="hero__heading">
                <span className="hero__h1-span1" style={{opacity: 1, transform: 'none'}}>Grow</span>
                <br/>
                <span className="hero__h1-span2">Smarter</span>
                <br/>
                <span className="hero__h1-span3">Together</span>
              </h1>
              <div className="hero__btn-wrap" style={{opacity: 1, transform: 'none'}}>
                <Link to="/signup" className="btn btn--hero w-button">
                  <span>Start Growing Today</span>
                  <span className="btn__ico"></span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section id="grows" className="section">
          <div className="content">
            <div className="visit__content">
              <h2 style={{opacity: 1}}>Manage Your<br/>Grows</h2>
              <div className="visit__cards">
                <div className="visit__card mod--first" style={{opacity: 1}}>
                  <div className="visit__card-title-over">Track & Monitor</div>
                  <div className="visit__card-play-wrap">
                    <div>Plant Growth</div>
                  </div>
                  <div className="visit__card-desc">Monitor your plants' progress with detailed growth metrics</div>
                </div>
                <div className="visit__card" style={{opacity: 1}}>
                  <div className="visit__card-label">Real-time</div>
                  <div className="visit__card-title">24/7<br/>Monitoring</div>
                  <div className="visit__card-desc">Track environmental data and plant health continuously</div>
                </div>
                <div className="visit__card" style={{opacity: 1}}>
                  <div className="visit__card-label mod--blue">Pro</div>
                  <div className="visit__card-title">Smart<br/>Analytics</div>
                  <div className="visit__card-desc">Advanced insights and growth optimization</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="section section--media">
          <div className="content">
            <div className="media__content">
              <div className="media__border"></div>
              <h2 className="heading--size-98">
                <span className="heading__span mod--1">Smart</span>
                <br/>
                <span className="heading__span mod--2">Growing</span>
                <br/>
                <span className="heading__span mod--1">Platform</span>
              </h2>
              <div className="media__desc-wrap">
                <p className="media__desc">Track your plants' growth, manage tasks, and optimize your growing environment with our comprehensive management system. Perfect for both hobbyist and commercial growers.</p>
                <Link to="/signup" className="btn btn--slim w-button">Learn More</Link>
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="section">
          <div className="content">
            <div className="pricing__content">
              <h2>Choose Your Plan</h2>
              <div className="pricing__cards">
                <div className="pricing__card">
                  <h3>Basic</h3>
                  <p className="price">Free</p>
                  <ul>
                    <li>Basic growth tracking</li>
                    <li>Task management</li>
                    <li>Community support</li>
                  </ul>
                  <Link to="/signup" className="btn btn--slim w-button">Get Started</Link>
                </div>
                <div className="pricing__card featured">
                  <h3>Pro</h3>
                  <p className="price">$9.99/mo</p>
                  <ul>
                    <li>Advanced analytics</li>
                    <li>Environmental monitoring</li>
                    <li>Smart notifications</li>
                    <li>Priority support</li>
                  </ul>
                  <Link to="/signup" className="btn btn--slim w-button">Try Pro</Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="content mod--footer">
          <div className="footer__columns">
            <div className="footer__col col--1">
              <Link to="/" className="footer__logo w-inline-block">
                <img src="https://cdn.prod.website-files.com/67d6b5c042fc281ac04054f3/67d6b5c042fc281ac0405563_logo.svg" loading="eager" alt="Growly Logo" className="logo-img"/>
              </Link>
              <div className="footer__desc">Grow Smarter.<br/>Grow Better.<br/>Grow Together.</div>
            </div>
            <div className="footer__col col--2">
              <nav className="footer__nav">
                <a href="#features" data-anim="link" className="footer__nav-link">Features</a>
                <a href="#grows" data-anim="link" className="footer__nav-link">Grows</a>
                <a href="#about" data-anim="link" className="footer__nav-link">About</a>
                <a href="#pricing" data-anim="link" className="footer__nav-link">Pricing</a>
              </nav>
            </div>
            <div className="footer__col col--3">
              <div className="footer__form-title">Stay updated with<br/>Growly news</div>
              <div className="form-block mod--footer w-form">
                <form id="wf-form-footer" name="wf-form-footer" data-name="footer" method="get" className="form">
                  <input className="input w-input" maxLength={256} name="email" data-name="Email" placeholder="E-MAIL" type="email" id="email" required/>
                  <div className="form__btn-wrap">
                    <input type="submit" className="btn btn--slim w-button" value="Subscribe"/>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 