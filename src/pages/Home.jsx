import React from "react";
import CourseCard from "../components/CourseCard";
import img1 from "../assets/Muenchen-Marathon-Website_-Mockup.webp";
import img2 from "../assets/Ki-Keno-Kivabe-Mockup.webp";
import img3 from "../assets/Services-Creativite-Quebec.webp";
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
      <CourseCard
        image={img2}
        title="Kikenokivabe"
        link="https://kikenokivabe.com/"
      />
    </div>
  );
};

export default Home;