import React, { useEffect, useState } from "react";
import { useLogin } from "../context/LoginContext";
import Banner from "../components/Banner";
import OurStatus from "../components/OurStatus";
import AboutUs from "../components/AboutUs";
import OurTeam from "../components/OurTeam";
import DedicatedDoctor from "../components/DedicatedDoctor";
const Home = () => {
  return (
    <div className="px-32">
      <Banner />
      <OurStatus />
      <AboutUs />
      <OurTeam />
      <DedicatedDoctor />
    </div>
  );
};

export default Home;
