import { useState } from "react";
import "./BrowseCategory.css";
import CategoryCard from "./CategoryCard/CategoryCard";
import CategoryWorksViewer from "./CategoryWorks/CategoryWorksViewer";
import {
  getCoverDescription,
  getCoverImage,
  getImagesForView,
  hasSubcategories,
} from "../cms/categoryUtils";
import { useCategories } from "../cms/useCategories";

const BrowseCategory = () => {
  const { categories, loading } = useCategories();
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState(null);
  const [viewerOpen, setViewerOpen] = useState(false);

  const selectedCategory = categories.find(
    (category) => category.id === selectedCategoryId
  );
  const selectedSubcategory = selectedCategory?.subcategories?.find(
    (sub) => sub.id === selectedSubcategoryId
  );

  const openCategory = (category) => {
    setSelectedCategoryId(category.id);
    setSelectedSubcategoryId(null);
    setViewerOpen(true);
  };

  const openSubcategory = (subcategory) => {
    setSelectedSubcategoryId(subcategory.id);
  };

  const closeViewer = () => {
    setViewerOpen(false);
    setSelectedCategoryId(null);
    setSelectedSubcategoryId(null);
  };

  const backToSubcategories = () => {
    setSelectedSubcategoryId(null);
  };

  const viewerTitle = selectedSubcategory
    ? `${selectedCategory?.title} — ${selectedSubcategory.title}`
    : selectedCategory?.title || "";

  const viewerSubtitle = selectedSubcategory
    ? selectedSubcategory.description
    : selectedCategory?.description;

  const viewerImages = selectedCategory
    ? getImagesForView(selectedCategory, selectedSubcategoryId)
    : [];

  const showSubcategoryPicker =
    selectedCategory &&
    hasSubcategories(selectedCategory) &&
    !selectedSubcategoryId;

  return (
    <section className="browse" id="work">
      <div className="browse-decor browse-decor-left" aria-hidden="true" />
      <div className="browse-decor browse-decor-right" aria-hidden="true" />

      <div className="browse-header">
        <p className="browse-eyebrow">My Content</p>
        <h2 className="browse-title">BROWSE BY CATEGORY</h2>
        <p className="browse-subtitle">
          A selection across illustration, photography, design, and painting —
          each work telling its own story.
        </p>
      </div>

      <div className="category-grid">
        {loading
          ? null
          : categories.map((category) => {
              const coverDescription = getCoverDescription(category);
              return (
                <CategoryCard
                  key={category.id}
                  id={category.id}
                  image={getCoverImage(category)}
                  title={category.title}
                  description={coverDescription || category.description}
                  onViewWorks={() => openCategory(category)}
                />
              );
            })}
      </div>

      <CategoryWorksViewer
        open={viewerOpen}
        title={viewerTitle}
        subtitle={viewerSubtitle}
        images={viewerImages}
        subcategories={
          showSubcategoryPicker ? selectedCategory.subcategories : null
        }
        onSelectSubcategory={openSubcategory}
        onClose={closeViewer}
        onBack={
          selectedSubcategoryId ? backToSubcategories : null
        }
        showBack={Boolean(selectedSubcategoryId)}
      />

      <div className="browse-edge" aria-hidden="true">
        <div className="browse-edge-rule">
          <span className="browse-edge-diamond" />
        </div>
        <svg
          className="browse-edge-art"
          viewBox="0 0 1440 72"
          preserveAspectRatio="none"
        >
          <path
            className="browse-edge-fill"
            d="M0 28 C80 8 140 52 220 32 C300 10 360 58 440 34 C520 8 600 56 700 30 C800 6 880 54 980 28 C1080 6 1180 50 1280 26 C1340 14 1400 36 1440 22 L1440 72 L0 72 Z"
          />
          <path
            className="browse-edge-ink"
            d="M0 30 C90 6 150 54 230 30 C310 8 370 56 450 32 C530 10 610 54 710 28 C800 8 880 52 980 26 C1080 8 1180 48 1280 24 C1350 12 1400 34 1440 20"
          />
        </svg>
      </div>
    </section>
  );
};

export default BrowseCategory;
