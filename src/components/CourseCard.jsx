import React, { useRef, useEffect } from "react";

const CourseCard = ({ image, hoverImage, title, link }) => {
  const cardRef = useRef(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card || !hoverImage) return;

    const longImage = card.querySelector(".preview-image");
    if (!longImage) return;

    const setScrollValues = () => {
      const popupHeight = 560;
      const imageHeight = longImage.offsetHeight;
      const overflow = Math.max(0, imageHeight - popupHeight);

      card.style.setProperty("--scroll-distance", `${overflow}px`);

      const duration = overflow > 0 ? Math.max(2.8, Math.min(7, overflow / 150)) : 0;
      card.style.setProperty("--scroll-duration", `${duration}s`);
    };

    if (longImage.complete) {
      setScrollValues();
    } else {
      longImage.addEventListener("load", setScrollValues, { once: true });
    }

    window.addEventListener("resize", setScrollValues);
    return () => window.removeEventListener("resize", setScrollValues);
  }, [hoverImage]);

  return (
    <article className="project-card" ref={cardRef}>
      <a href={link} target="_blank" rel="noopener noreferrer" className="project-link">
        <div className="preview-slot">
          <div className="preview-frame">
            {hoverImage && (
              <img className="preview-image" src={hoverImage} alt={title + " preview"} />
            )}
            <div className="preview-thumb">
              <img src={image} alt={title} />
            </div>
          </div>
        </div>

        <div className="project-content">
          <h3 className="project-title">{title}</h3>
        </div>
      </a>
    </article>
  );
};

export default CourseCard;