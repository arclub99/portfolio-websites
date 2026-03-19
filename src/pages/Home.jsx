import React, { useState } from "react";
import CourseCard from "../components/CourseCard";
// Thumbnails
import thumb1 from "../assets/Muenchen-Marathon-thumb.webp";
import thumb2 from "../assets/Ki-Keno-Kivabe-thumb.webp";
import thumb3 from "../assets/Services-Creativite-Quebec-thumb.webp";
import thumb4 from "../assets/Royal-moja-thumb.webp";
// Mockups
import mockup1 from "../assets/Munich-Marathon-mockup.webp";
import mockup2 from "../assets/Ki-Keno-Kivabe-Mockup.webp";
import mockup3 from "../assets/Services-Créativité-Québec-mockup.webp";
import mockup4 from "../assets/Royal-Moja-mockup.webp";
import "../CourseCard.css";

const Home = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const courses = [
    {
      id: 1,
      image: thumb1,
      hoverImage: mockup1,
      title: "Munich Marathon",
      link: "https://www.muenchenmarathon.de/",
      category: "Elementor",
    },
    {
      id: 2,
      image: thumb2,
      hoverImage: mockup2,
      title: "Kikenokivabe",
      link: "https://kikenokivabe.com/",
      category: "Elementor",
    },
    {
      id: 3,
      image: thumb2,
      hoverImage: mockup2,
      title: "Kikenokivabe",
      link: "https://kikenokivabe.com/",
      category: "Wp Backary",
    },
    {
      id: 4,
      image: thumb3,
      hoverImage: mockup3,
      title: "Services Créativité Québec",
      link: "https://services.creativite.quebec/",
      category: "DIVI",
    },
    {
      id: 5,
      image: thumb4,
      hoverImage: mockup4,
      title: "Royal Moja",
      link: "https://example.com/royal-moja",
      category: "Custom",
    },
  ];

  const categories = ["All", "Elementor", "Wp Backary", "DIVI", "Custom"];

  const filteredCourses =
    selectedCategory === "All"
      ? courses
      : courses.filter((course) => course.category === selectedCategory);

  return (
    <>
      <div id="Main-title">
        <h1> 
          Welcome to My Portfolio
        </h1>
        <p>
          Explore my collection of portfolio websites showcasing my work and
          projects.
        </p>
      </div>

      <div className="filter-tabs">
        {categories.map((category) => (
          <button
            key={category}
            className={`tab-button ${selectedCategory === category ? "active" : ""}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>
      
      <div className="course-grid">
        {filteredCourses.map((course) => (
          <CourseCard
            key={course.id}
            image={course.image}
            hoverImage={course.hoverImage}
            title={course.title}
            link={course.link}
            category={course.category}
          />
        ))}
      </div>
    </>
  );
};

export default Home;