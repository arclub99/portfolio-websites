import React, { useState } from "react";
import CourseCard from "../components/CourseCard";
import img1 from "../assets/Muenchen-Marathon-Website_-Mockup.webp";
import img2 from "../assets/Ki-Keno-Kivabe-Mockup.webp";
import img3 from "../assets/Services-Creativite-Quebec.webp";
import "../CourseCard.css";

const Home = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const courses = [
    {
      id: 1,
      image: img1,
      title: "Muenchpn Marathon",
      link: "https://www.muenchenmarathon.de/",
      category: "Elementor",
    },
    {
      id: 2,
      image: img2,
      title: "Kikenokivabe",
      link: "https://kikenokivabe.com/",
      category: "Elementor",
    },
    {
      id: 2,
      image: img2,
      title: "Kikenokivabe",
      link: "https://kikenokivabe.com/",
      category: "Wp Backary",
    },
    {
      id: 3,
      image: img3,
      title: "services.creativite.quebec",
      link: "https://services.creativite.quebec/",
      category: "DIVI",
    },
    {
      id: 4,
      image: img2,
      title: "Kikenokivabe",
      link: "https://kikenokivabe.com/",
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