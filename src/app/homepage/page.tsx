import React from 'react';
import Footer from '@/components/layout/Footer';

const Homepage = () => {
  return (
    <div className="homepage-container min-h-screen flex flex-col">
      <header className="hero-section">
        <h1 className="hero-title">Welcome to FifthDraft</h1>
        <p className="hero-description">
          Unlock the power of AI to transform your ideas into actionable insights.
        </p>
      </header>

      <section className="features-section">
        <h2 className="section-title">Features</h2>
        <ul className="features-list">
          <li>AI-powered brainstorming for creative solutions</li>
          <li>Structured meeting notes with action items</li>
          <li>Professional tools for creators and teams</li>
          <li>Real-time transcription and audio recording</li>
          <li>Secure storage and data retention</li>
        </ul>
      </section>

      <section className="benefits-section">
        <h2 className="section-title">What You Get</h2>
        <p>
          FifthDraft empowers you to streamline your workflow, enhance collaboration, and bring your ideas to life with cutting-edge AI technology.
        </p>
      </section>

      <section className="idea-studio-section">
        <h2 className="section-title">Idea Studio</h2>
        <p>
          Dive into the Idea Studio to brainstorm, expand on core ideas, and explore creative solutions with the help of AI-powered tools. Whether you're tackling a project or refining your next big idea, the Idea Studio is your partner in innovation.
        </p>
      </section>

      <Footer />
    </div>
  );
};

export default Homepage;