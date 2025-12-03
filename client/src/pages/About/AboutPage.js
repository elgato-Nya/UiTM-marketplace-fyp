import React from "react";
import { Box } from "@mui/material";

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
  return (
    <Box sx={{ width: "100%", pb: 6 }}>
      {/* Hero Section */}
      <AboutHero />

      {/* Our Story - The beginning and history */}
      <OurStory />

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
