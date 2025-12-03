import React, { useEffect } from "react";
import { Box } from "@mui/material";
import { useLocation } from "react-router-dom";

// Import about components
import AboutHero from "../../components/about/AboutHero";
import OurStory from "../../components/about/OurStory";
import OurVision from "../../components/about/OurVision";
import CoreValues from "../../components/about/CoreValues";
import PlatformFeatures from "../../components/about/PlatformFeatures";
import OurCommitment from "../../components/about/OurCommitment";
import TechnologyStack from "../../components/about/TechnologyStack";
import AcademicProject from "../../components/about/AcademicProject";
import CallToAction from "../../components/about/CallToAction";

function AboutPage() {
  const location = useLocation();

  // Handle smooth scrolling to hash sections
  useEffect(() => {
    if (location.hash) {
      const element = document.querySelector(location.hash);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [location]);

  return (
    <Box sx={{ width: "100%", pb: 6 }}>
      {/* Hero Section */}
      <Box id="about">
        <AboutHero />
      </Box>

      {/* Our Story - The beginning and history */}
      <Box id="history">
        <OurStory />
      </Box>

      {/* Our Vision - Future goals */}
      <OurVision />

      {/* Core Values - Guiding principles */}
      <CoreValues />

      {/* Platform Features */}
      <PlatformFeatures />

      {/* Our Commitment */}
      <OurCommitment />

      {/* Technology Stack */}
      <TechnologyStack />

      {/* Academic Project Recognition */}
      <AcademicProject />

      {/* Call to Action */}
      <CallToAction />
    </Box>
  );
}

export default AboutPage;
