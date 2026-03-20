import React, { useEffect, useState } from "react";
import CourseCard from "../components/CourseCard";
import "../CourseCard.css";

import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

const Home = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "portfolio"));

        const portfolioData = querySnapshot.docs.map((doc) => {
          const data = doc.data();

          return {
            id: doc.id,
            image: data.thumb || "",
            hoverImage: data.hoverImg || "",
            title: data.title || "No Title",
            link: data.link || "#",
            category: data.category || "Uncategorized",
          };
        });

        setCourses(portfolioData);
      } catch (err) {
        console.error("Error fetching portfolio data:", err);
        setError("Failed to load portfolio data.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const categories = [
    "All",
    ...new Set(courses.map((course) => course.category).filter(Boolean)),
  ];

  const filteredCourses =
    selectedCategory === "All"
      ? courses
      : courses.filter((course) => course.category === selectedCategory);

  return (
    <>
      <div id="Main-title">
        <h1>Welcome to My Portfolio</h1>
        <p>
          Explore my collection of portfolio websites showcasing my work and
          projects.
        </p>
      </div>

      <div className="filter-tabs">
        {categories.map((category) => (
          <button
            key={category}
            className={`tab-button ${
              selectedCategory === category ? "active" : ""
            }`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {loading && <p style={{ textAlign: "center" }}>Loading projects...</p>}

      {error && (
        <p style={{ textAlign: "center", color: "red" }}>
          {error}
        </p>
      )}

      {!loading && !error && filteredCourses.length === 0 && (
        <p style={{ textAlign: "center" }}>No projects found.</p>
      )}

      <div className="course-grid">
        {!loading &&
          !error &&
          filteredCourses.map((course) => (
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