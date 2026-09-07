import "./CategoryCard.css";
import { getCategoryTheme } from "./categoryThemes";
import { getCategoryIcon } from "./CategoryIcons";

const CategoryCard = ({
  id,
  image,
  title,
  description,
  onViewWorks,
}) => {
  const theme = getCategoryTheme(id, title);
  const Icon = getCategoryIcon(id, title);

  return (
    <article
      className="category-card"
      style={{
        "--category-color": theme.color,
        "--category-light": theme.light,
      }}
      onClick={onViewWorks}
    >
      <div className="category-card-media">
        {image ? (
          <img src={image} alt={title} />
        ) : (
          <div className="category-card-placeholder" aria-hidden="true" />
        )}
      </div>

      <div className="category-card-icon" aria-hidden="true">
        <Icon />
      </div>

      <div className="category-card-body">
        <h3>{title}</h3>
        {description ? <p className="category-description">{description}</p> : null}

        <button
          type="button"
          className="category-view-btn"
        >
          VIEW WORKS
          <svg
            className="arrow-icon"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>

      <div className="category-card-deckle" aria-hidden="true" />
    </article>
  );
};

export default CategoryCard;
