import { Link } from "react-router-dom";
import { useRef } from "react";
import { usePlaces } from "../../cms/usePlaces";
import { useAboutContent } from "../../cms/useAboutContent";
import { getPlaceCoverImage } from "../../cms/placeDefaults";
import { downloadCv } from "../../utils/downloadCv";
import { linkifyRediff } from "../../utils/linkifyRediff";
import { getTimelineLogo } from "../icons/BrandIcons";
import { getPlaceTheme } from "./placeThemes";
import PlacePictures from "./PlacePictures";
import "./About.css";

const PlaceIcon = ({ id, title }) => {
  const key = `${id || ""} ${title}`.toLowerCase();

  if (key.includes("drought")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4" />
      </svg>
    );
  }

  if (key.includes("election") || key.includes("political")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M5 21V4l8 3-8 3" />
        <path d="M12 21h7V8l-7 3" />
      </svg>
    );
  }

  if (key.includes("fashion")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="8" r="3" />
        <path d="M5 20c1.5-4 4-6 7-6s5.5 2 7 6" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 18l6-9 4 6 3-4 5 7H3z" />
      <path d="M14 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
    </svg>
  );
};

const PlaceCard = ({ place }) => {
  const cover = getPlaceCoverImage(place);
  const theme = getPlaceTheme(place.id, place.title);
  const galleryRef = useRef(null);
  const hasImages = (place.images?.length || 0) > 0;

  return (
    <article
      className="place-card"
      style={{ "--place-color": theme.color }}
    >
      <div className="place-card-inner">
        <button
          type="button"
          className="place-card-media"
          onClick={() => galleryRef.current?.open(0)}
          disabled={!hasImages}
          aria-label={
            hasImages
              ? `View photos from ${place.title}`
              : `${place.title} cover`
          }
        >
          {cover ? (
            <img src={cover} alt={place.title} loading="lazy" />
          ) : (
            <div className="place-card-media-placeholder" aria-hidden="true" />
          )}
        </button>

        <div className="place-card-body">
          <div className="place-card-heading">
            <span className="place-card-icon" aria-hidden="true">
              <PlaceIcon id={place.id} title={place.title} />
            </span>
            <h4>{place.title}</h4>
          </div>
          {place.description ? (
            <p className="place-card-description">{place.description}</p>
          ) : null}

          <PlacePictures
            ref={galleryRef}
            placeTitle={place.title}
            images={place.images || []}
          />
        </div>
      </div>

      <div className="place-card-deckle" aria-hidden="true" />
    </article>
  );
};

const About = () => {
  const { content, loading: aboutLoading } = useAboutContent();
  const { places, loading: placesLoading } = usePlaces();

  return (
    <section className="about" id="about">
      <div className="section-heading">
        <div className="line"></div>
        <h2>ABOUT</h2>
        <div className="line"></div>
      </div>

      {!aboutLoading && content ? (
        <>
          <div className="about-intro">
            <p className="about-eyebrow">Illustrator • Cartoonist • Designer • Photographer</p>
            {content.quote ? (
              <blockquote className="about-quote">“{content.quote}”</blockquote>
            ) : null}
            {content.bioParagraphs.map((paragraph, index) => (
              <p key={`bio-${index}`}>{linkifyRediff(paragraph)}</p>
            ))}

            <div className="about-cta-row">
              <Link to="/about" className="about-cta primary">
                Creative Journey
              </Link>
              <button type="button" className="about-cta secondary" onClick={downloadCv}>
                Download CV
              </button>
            </div>
          </div>

          {content.timeline.length > 0 ? (
            <div className="about-journey">
              <h3>My Journey</h3>
              <p className="about-journey-subtitle">
                Highlights from education to Rediff.com — explore the full CV for
                roles, collaborations, and creative expertise.
              </p>

              <div className="journey-timeline">
                {content.timeline.map((item, index) => {
                  const TimelineLogo = getTimelineLogo(item);

                  return (
                    <article key={item.id} className="journey-item">
                      <div className="journey-marker">
                        <span className="journey-dot" />
                        {index < content.timeline.length - 1 ? (
                          <span className="journey-line" />
                        ) : null}
                      </div>
                      <div className="journey-content">
                        <span className="journey-period">
                          {TimelineLogo ? (
                            <TimelineLogo className="journey-logo" size={22} />
                          ) : null}
                          {linkifyRediff(item.period)}
                        </span>
                        <h4>{linkifyRediff(item.title)}</h4>
                        <p>{linkifyRediff(item.description)}</p>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          ) : null}
        </>
      ) : null}

      <div className="about-places">
        <div className="about-places-header">
          <p className="about-places-eyebrow">Places Visited</p>
          <h3 className="about-places-title">
            DOCUMENTING STORIES.
            <br />
            PRESERVING PLACES.
          </h3>
          <p className="about-places-subtitle">
            Documentary assignments and photographic journeys — from tribal
            heartlands to election grounds, drought zones to fashion studios.
          </p>
        </div>

        <div className="places-grid">
          {placesLoading
            ? null
            : places.map((place) => (
                <PlaceCard key={place.id} place={place} />
              ))}
        </div>
      </div>
    </section>
  );
};

export default About;
