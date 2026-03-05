import React from "react";

const CourseCard = ({ image, title, link }) => {
  return (
    <div className="course-card">
      <a href={link} target="_blank" rel="noopener noreferrer">
        <img src={image} alt={title} />
        <h2>{title}</h2>
      </a>
    </div>
  );
};

export default CourseCard;