import React from "react";
import CourseCard from "../components/CourseCard";
import img1 from "../assets/img1.jpg";
import img2 from "../assets/img2.jpg";
import img3 from "../assets/img3.jpg";
import "../CourseCard.css";

const Home = () => {
  return (
    <div className="course-grid">
      <CourseCard
        image={img1}
        title="Muenchpn Marathon"
        link="https://www.muenchenmarathon.de/"
      />
      <CourseCard
        image={img2}
        title="Kikenokivabe"
        link="https://kikenokivabe.com/"
         
      />
      <CourseCard
        image={img3}
        title="services.creativite.quebec"
        link="https://services.creativite.quebec/"
      />
    </div>
  );
};

export default Home;