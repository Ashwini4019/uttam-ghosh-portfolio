import { Link } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import {
  CV_COLLABORATIONS,
  CV_EXPERIENCE,
  CV_EXPERTISE,
  CV_INTERESTS,
  CV_PROFILE,
  CV_TEACHING,
  CV_TECHNICAL,
} from "../cms/cvContent";
import { downloadCv } from "../utils/downloadCv";
import { linkifyRediff } from "../utils/linkifyRediff";
import "./CreativeJourney.css";

const CreativeJourney = () => {
  return (
    <div className="site-page creative-journey-page">
      <Navbar />

      <main className="creative-journey">
        <header className="cj-hero">
          <p className="cj-eyebrow">Curriculum Vitae</p>
          <h1>{CV_PROFILE.name}</h1>
          <p className="cj-roles">{CV_PROFILE.roles}</p>
          <blockquote className="cj-philosophy">
            “{CV_PROFILE.philosophy}”
          </blockquote>
          <div className="cj-actions">
            <button type="button" className="cj-btn primary" onClick={downloadCv}>
              Download CV
            </button>
            <Link to="/#about" className="cj-btn secondary">
              Back to About
            </Link>
          </div>
        </header>

        <section className="cj-section" aria-labelledby="cj-personal">
          <h2 id="cj-personal">Personal Details</h2>
          <dl className="cj-details">
            <div>
              <dt>Date of Birth</dt>
              <dd>{CV_PROFILE.personal.dateOfBirth}</dd>
            </div>
            <div>
              <dt>Academic Qualification</dt>
              <dd>{CV_PROFILE.personal.qualification}</dd>
            </div>
            <div>
              <dt>Institution</dt>
              <dd>{CV_PROFILE.personal.institution}</dd>
            </div>
            <div>
              <dt>Year of Graduation</dt>
              <dd>{CV_PROFILE.personal.graduationYear}</dd>
            </div>
            <div>
              <dt>Area of Specialisation</dt>
              <dd>{CV_PROFILE.personal.specialisation}</dd>
            </div>
          </dl>
        </section>

        <section className="cj-section" aria-labelledby="cj-experience">
          <h2 id="cj-experience">Professional Experience</h2>
          <div className="cj-jobs">
            {CV_EXPERIENCE.map((job) => (
              <article key={job.id} className="cj-job">
                <div className="cj-job-header">
                  <h3>
                    {job.title} — {linkifyRediff(job.organisation)}
                  </h3>
                  <p className="cj-job-period">
                    {job.period}
                    {job.duration ? ` | ${job.duration}` : ""}
                  </p>
                </div>
                <p className="cj-job-summary">{linkifyRediff(job.summary)}</p>
                <h4>Key Responsibilities</h4>
                <ul>
                  {job.responsibilities.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                {job.highlight ? (
                  <div className="cj-highlight">
                    <h4>{job.highlight.title}</h4>
                    <p>{job.highlight.body}</p>
                    <p className="cj-highlight-label">Contributions</p>
                    <ul>
                      {job.highlight.contributions.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        <section className="cj-section" aria-labelledby="cj-teaching">
          <h2 id="cj-teaching">Teaching &amp; Academic Contributions</h2>
          <div className="cj-jobs">
            {CV_TEACHING.map((item) => (
              <article key={item.id} className="cj-job">
                <div className="cj-job-header">
                  <h3>
                    {item.title} — {item.organisation}
                  </h3>
                </div>
                <p className="cj-job-summary">{item.summary}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="cj-section" aria-labelledby="cj-collab">
          <h2 id="cj-collab">Additional Professional Collaborations</h2>
          <ul className="cj-collab-list">
            {CV_COLLABORATIONS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="cj-section" aria-labelledby="cj-expertise">
          <h2 id="cj-expertise">Creative Expertise</h2>
          <div className="cj-chips">
            {CV_EXPERTISE.map((item) => (
              <span key={item} className="cj-chip">
                {item}
              </span>
            ))}
          </div>
        </section>

        <section className="cj-section" aria-labelledby="cj-technical">
          <h2 id="cj-technical">Technical Skills</h2>
          <div className="cj-chips">
            {CV_TECHNICAL.map((item) => (
              <span key={item} className="cj-chip">
                {item}
              </span>
            ))}
          </div>
        </section>

        <section className="cj-section" aria-labelledby="cj-interests">
          <h2 id="cj-interests">Areas of Interest</h2>
          <div className="cj-chips">
            {CV_INTERESTS.map((item) => (
              <span key={item} className="cj-chip">
                {item}
              </span>
            ))}
          </div>
        </section>

        <footer className="cj-footer">
          <button type="button" className="cj-btn primary" onClick={downloadCv}>
            Download CV
          </button>
          <Link to="/#contact" className="cj-btn secondary">
            Get in Touch
          </Link>
        </footer>
      </main>
    </div>
  );
};

export default CreativeJourney;
