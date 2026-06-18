import React from "react";
import {
  Box,
  Button,
  Chip,
  Container,
  Divider,
  IconButton,
  Typography,
} from "@mui/material";
import {
  ArrowForward,
  Code,
  GitHub,
  Launch,
  LinkedIn,
  Security,
  EmojiEvents,
  WorkOutline,
} from "@mui/icons-material";
import { useTheme } from "../../hooks/useTheme";

const profileLinks = [
  {
    label: "GitHub",
    href: "https://github.com/elgato-nya",
    icon: GitHub,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/afiq-sharifuzan",
    icon: LinkedIn,
  },
  {
    label: "View MarKet Repo",
    href: "https://github.com/elgato-Nya/UiTM-marketplace-fyp",
    icon: Launch,
  },
];

const focusAreas = [
  { label: "Full-stack development", tone: "violet" },
  { label: "Backend APIs", tone: "blue" },
  { label: "Cloud deployment", tone: "amber" },
  { label: "Security-minded engineering", tone: "emerald" },
];

const stats = [
  { value: "3.95", label: "Latest GPA" },
  { value: "3.76", label: "CGPA" },
  { value: "6", label: "Dean's List every semester" },
];

const experienceHighlights = [
  "Enhanced Node.js and TypeScript microservices plus Laravel platforms with client-specific business rules, validation fixes, and production-related feature improvements.",
  "Integrated third-party courier and fulfillment APIs covering OAuth2 authentication, webhook handling, HMAC verification, order creation, tracking writeback, and fulfillment status updates.",
  "Resolved frontend and backend issues involving premature data persistence, PDF preview, search, and email notification triggers across local and staging environments.",
  "Supported deployment and testing workflows through Nginx configuration checks, feature branches, pull requests, and ticket-based Git collaboration.",
];

const projects = [
  {
    title: "MarKet - Campus Marketplace",
    href: "https://github.com/elgato-Nya/UiTM-marketplace-fyp",
    tech: [
      "React",
      "Node.js",
      "Express.js",
      "MongoDB",
      "Redux Toolkit",
      "Material UI",
      "Tailwind CSS",
      "AWS EC2",
      "AWS S3",
      "AWS SES",
      "Route 53",
      "GitHub Actions",
      "Jest",
      "Supertest",
      "Socket.IO",
    ],
    description:
      "Production-style full-stack marketplace for campus communities with buyer, seller, and admin workflows, secure transactions, real-time communication, merchant dashboards, and cloud deployment.",
    bullets: [
      "Built marketplace workflows including checkout, order tracking, merchant dashboards, wishlist, and role-based access control.",
      "Implemented real-time chat and notifications using Socket.IO with background jobs for analytics and alerts.",
      "Deployed on AWS EC2 with S3 media storage, SES email flows, Route 53 domain setup, and GitHub Actions CI/CD.",
      "Improved production security using rate limiting, CORS, Helmet, JWT auth, and OWASP ZAP active, manual, and AJAX spider testing.",
    ],
  },
  {
    title: "Secure Banking Transaction API",
    href: "https://github.com/elgato-Nya/secure-banking-transaction-api",
    tech: [
      "Java 21",
      "Spring Boot",
      "Spring Data JPA",
      "PostgreSQL",
      "Flyway",
      "Hibernate",
      "JUnit",
      "Mockito",
      "Swagger",
      "GitHub Actions",
    ],
    description:
      "Backend API simulating secure banking transactions with focus on transaction integrity, SQL persistence, auditability, and production-style error handling.",
    bullets: [
      "Designed account and transaction modules using layered Spring Boot architecture with controller, service, repository, DTO, and entity separation.",
      "Implemented transactional money transfer flow using @Transactional to prevent inconsistent balance updates.",
      "Added validation for insufficient balance, invalid accounts, frozen or closed accounts, and invalid transfer amounts.",
      "Built audit logging, global exception handling, Flyway database migrations, and unit tests for core transfer scenarios.",
    ],
  },
  {
    title: "School Attendance System",
    href: "https://github.com/elgato-Nya/school-attendance-system",
    tech: [
      "React",
      "TypeScript",
      "Vite",
      "Firebase Auth",
      "Firestore",
      "Cloud Functions",
      "Tailwind CSS",
      "shadcn/ui",
      "Zustand",
    ],
    description:
      "Role-based attendance platform for admins and teachers with attendance tracking, calendar views, filtered history, day reports, and CSV export.",
    bullets: [
      "Built a role-based attendance platform for admins and teachers with attendance tracking, calendar views, filtered history, day reports, and CSV export.",
      "Used Firebase Auth, Firestore, and Cloud Functions to support real-time data management, serverless automation, and cloud-hosted deployment.",
    ],
  },
];

const achievements = [
  {
    title: "Dean's List Award, UiTM",
    meta: "6 total semesters",
    description:
      "Earned Dean's List recognition in every semester and is on track to receive the Vice Chancellor Award.",
    tone: "amber",
    featured: true,
  },
  {
    title: "New Business Venture Analysis (NeBuVA)",
    meta: "January 2026",
    description:
      "Placed 4th overall for innovation in a university-level entrepreneurial pitching competition.",
    tone: "violet",
  },
  {
    title: "Research Colloquium in Computer Science (ReCCoS 1.0)",
    meta: "February 2026",
    description:
      "Selected as 2nd runner-up for final-year project presentation and defense.",
    tone: "blue",
  },
  {
    title: "International Competitive Programming & Multimedia Competition (C-PROM)",
    meta: "2023 and 2025",
    description:
      "Participated in an international programming competition focused on problem-solving.",
    tone: "emerald",
  },
];

const skillGroups = [
  {
    title: "Languages",
    items: ["JavaScript", "TypeScript", "Java", "SQL", "PHP"],
  },
  {
    title: "Frontend",
    items: [
      "React",
      "Redux Toolkit",
      "Tailwind CSS",
      "Material UI",
      "shadcn/ui",
      "Responsive UI",
    ],
  },
  {
    title: "Backend",
    items: ["Node.js", "Express.js", "Spring Boot", "Laravel", "REST APIs"],
  },
  {
    title: "Databases",
    items: ["MongoDB", "PostgreSQL", "MySQL", "Firebase Firestore"],
  },
  {
    title: "Cloud & DevOps",
    items: [
      "AWS EC2",
      "AWS S3",
      "AWS SES",
      "Route 53",
      "Firebase Hosting",
      "GitHub Actions",
      "Nginx",
    ],
  },
  {
    title: "Testing & Security",
    items: [
      "Jest",
      "Supertest",
      "JUnit",
      "Mockito",
      "OWASP ZAP",
      "Helmet",
      "RBAC",
    ],
  },
  {
    title: "Tools",
    items: ["Git", "GitHub", "Postman", "Linux", "CLI", "Agile workflow"],
  },
];

const toneStyles = {
  violet: {
    bg: "rgba(167, 139, 250, 0.18)",
    border: "rgba(196, 181, 253, 0.32)",
    color: "#f5f3ff",
  },
  blue: {
    bg: "rgba(96, 165, 250, 0.18)",
    border: "rgba(147, 197, 253, 0.3)",
    color: "#eff6ff",
  },
  amber: {
    bg: "rgba(251, 191, 36, 0.18)",
    border: "rgba(253, 230, 138, 0.34)",
    color: "#fffbeb",
  },
  emerald: {
    bg: "rgba(52, 211, 153, 0.18)",
    border: "rgba(110, 231, 183, 0.3)",
    color: "#ecfdf5",
  },
};

const chipToneOrder = ["violet", "blue", "amber", "emerald"];

function SectionHeading({ eyebrow, title, body }) {
  const { theme } = useTheme();

  return (
    <Box sx={{ textAlign: "center", mb: { xs: 4, md: 6 } }}>
      <Typography
        variant="overline"
        sx={{
          color: theme.palette.primary.main,
          fontWeight: 700,
          letterSpacing: 2.4,
        }}
      >
        {eyebrow}
      </Typography>
      <Typography
        variant="h4"
        component="h2"
        sx={{
          mt: 1,
          mb: 1.75,
          fontWeight: 800,
          lineHeight: 1.12,
          letterSpacing: "-0.03em",
          fontSize: { xs: "2.1rem", md: "3.25rem" },
          textWrap: "balance",
        }}
      >
        {title}
      </Typography>
      {body ? (
        <Typography
          variant="body1"
          sx={{
            maxWidth: 760,
            mx: "auto",
            color: theme.palette.text.secondary,
            lineHeight: 1.85,
            fontSize: { xs: "1.05rem", md: "1.15rem" },
          }}
        >
          {body}
        </Typography>
      ) : null}
    </Box>
  );
}

function ExternalLinkButton({
  href,
  label,
  icon: IconComponent,
  variant = "contained",
}) {
  const { theme } = useTheme();

  return (
    <Button
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      variant={variant}
      endIcon={<IconComponent />}
      sx={{
        px: 3,
        py: 1.35,
        fontWeight: 700,
        borderRadius: 999,
        borderColor:
          variant === "outlined" ? "rgba(255,255,255,0.45)" : "transparent",
        color: variant === "outlined" ? "white" : theme.palette.primary.dark,
        bgcolor: variant === "contained" ? "white" : "rgba(255,255,255,0.08)",
        boxShadow:
          variant === "contained" ? "0 18px 40px rgba(15, 23, 42, 0.24)" : "none",
        "&:hover": {
          borderColor:
            variant === "outlined" ? "rgba(255,255,255,0.7)" : "transparent",
          bgcolor:
            variant === "contained"
              ? "rgba(255,255,255,0.92)"
              : "rgba(255,255,255,0.16)",
        },
      }}
    >
      {label}
    </Button>
  );
}

function NekodezPage() {
  const { theme } = useTheme();

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      <Box
        sx={{
          background:
            "linear-gradient(135deg, #25124a 0%, #6d28d9 48%, #2563eb 100%)",
          color: "white",
          py: { xs: 8, md: 12 },
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at top right, rgba(251,191,36,0.22), transparent 22%), radial-gradient(circle at bottom left, rgba(255,255,255,0.12), transparent 34%), linear-gradient(180deg, rgba(15,23,42,0.04), rgba(15,23,42,0.22))",
          }}
        />
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "minmax(0, 1.35fr) minmax(280px, 0.9fr)",
              },
              gap: { xs: 4, md: 5 },
              alignItems: "center",
            }}
          >
            <Box>
              <Typography
                variant="overline"
                sx={{ letterSpacing: 2.6, fontWeight: 700, opacity: 0.95 }}
              >
                ABOUT AFIQ SHARIFUZAN
              </Typography>
              <Typography
                variant="h1"
                component="h1"
                sx={{
                  mt: 1.5,
                  mb: 2.5,
                  fontWeight: 900,
                  fontSize: { xs: "2.2rem", md: "3.7rem", lg: "4.1rem" },
                  lineHeight: { xs: 1.08, md: 1.04 },
                  letterSpacing: "-0.04em",
                  textWrap: "balance",
                  textShadow: "0 10px 30px rgba(15, 23, 42, 0.28)",
                }}
              >
                Final-year Computer Science student building practical,
                production-style software.
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  maxWidth: 760,
                  color: "rgba(255,255,255,0.9)",
                  fontWeight: 400,
                  lineHeight: 1.75,
                  fontSize: { xs: "1rem", md: "1.18rem" },
                }}
              >
                Software Engineer Intern and full-stack developer focused on
                backend APIs, cloud deployment, and security-minded
                engineering.
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1.25,
                  mt: 3,
                }}
              >
                {focusAreas.map((item) => (
                  <Chip
                    key={item.label}
                    label={item.label}
                    sx={{
                      bgcolor: toneStyles[item.tone].bg,
                      color: toneStyles[item.tone].color,
                      border: `1px solid ${toneStyles[item.tone].border}`,
                      backdropFilter: "blur(6px)",
                      fontWeight: 700,
                      fontSize: "0.92rem",
                      px: 0.5,
                      "& .MuiChip-label": {
                        px: 1.2,
                      },
                    }}
                  />
                ))}
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 2,
                  mt: 3.25,
                }}
              >
                <ExternalLinkButton
                  href={profileLinks[0].href}
                  label={profileLinks[0].label}
                  icon={profileLinks[0].icon}
                />
                <ExternalLinkButton
                  href={profileLinks[1].href}
                  label={profileLinks[1].label}
                  icon={profileLinks[1].icon}
                  variant="outlined"
                />
                <ExternalLinkButton
                  href={profileLinks[2].href}
                  label={profileLinks[2].label}
                  icon={ArrowForward}
                  variant="outlined"
                />
              </Box>
            </Box>

            <Box
              sx={{
                p: { xs: 3, md: 4 },
                borderRadius: 4,
                bgcolor: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.14)",
                boxShadow: "0 24px 60px rgba(15, 23, 42, 0.22)",
                backdropFilter: "blur(14px)",
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 2.5 }}>
                Current Snapshot
              </Typography>
              <Box sx={{ display: "grid", gap: 2 }}>
                <Box>
                  <Typography
                    sx={{ opacity: 0.78, mb: 0.75, fontSize: "1rem" }}
                  >
                    Education
                  </Typography>
                  <Typography sx={{ fontWeight: 800, fontSize: "1.05rem" }}>
                    Bachelor of Computer Science (Hons.) Netcentric Computing
                  </Typography>
                  <Typography
                    sx={{ color: "rgba(255,255,255,0.9)", fontSize: "1rem" }}
                  >
                    Universiti Teknologi MARA (UiTM), Arau, Perlis
                  </Typography>
                </Box>
                <Divider sx={{ borderColor: "rgba(255,255,255,0.12)" }} />
                <Box>
                  <Typography
                    sx={{ opacity: 0.78, mb: 0.75, fontSize: "1rem" }}
                  >
                    Professional Experience
                  </Typography>
                  <Typography sx={{ fontWeight: 800, fontSize: "1.05rem" }}>
                    Software Engineer Intern at Xenber
                  </Typography>
                  <Typography
                    sx={{ color: "rgba(255,255,255,0.9)", fontSize: "1rem" }}
                  >
                    March 2026 - July 2026
                  </Typography>
                </Box>
                <Divider sx={{ borderColor: "rgba(255,255,255,0.12)" }} />
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                    gap: 1.5,
                  }}
                >
                  {stats.map((stat) => (
                    <Box
                      key={stat.label}
                      sx={{
                        p: 1.75,
                        borderRadius: 3,
                        bgcolor: "rgba(255,255,255,0.12)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        textAlign: "center",
                      }}
                    >
                      <Typography variant="h4" sx={{ fontWeight: 900 }}>
                        {stat.value}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "0.88rem",
                          lineHeight: 1.45,
                          color: "rgba(255,255,255,0.84)",
                        }}
                      >
                        {stat.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <SectionHeading
          eyebrow="About"
          title="Engineering useful systems with a backend-first mindset"
          body="Afiq builds practical production-style applications using React, Node.js, Laravel, Spring Boot, PostgreSQL, MongoDB, AWS, and GitHub Actions. His work centers on full-stack engineering, backend systems, API design, deployment, and secure software practices."
        />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "minmax(0, 1.15fr) minmax(280px, 0.85fr)",
            },
            gap: 3,
          }}
        >
          <Box
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: 3,
              bgcolor: "background.paper",
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: "0 18px 40px rgba(15, 23, 42, 0.12)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
              <Code sx={{ color: theme.palette.primary.main }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                What I Build
              </Typography>
            </Box>
            <Typography
              sx={{
                color: "text.secondary",
                lineHeight: 1.9,
                fontSize: { xs: "1.02rem", md: "1.08rem" },
              }}
            >
              From coursework to internship projects, the focus stays
              consistent: build software that feels production-ready, solves a
              clear problem, and is maintainable under real constraints. That
              includes thoughtful validation, reliable API behavior, clean
              deployment workflows, and secure defaults across the stack.
            </Typography>
          </Box>

          <Box
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: 3,
              bgcolor: "background.paper",
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: "0 18px 40px rgba(15, 23, 42, 0.12)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
              <Security sx={{ color: theme.palette.primary.main }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                How I Approach It
              </Typography>
            </Box>
            <Typography
              sx={{
                color: "text.secondary",
                lineHeight: 1.9,
                fontSize: { xs: "1.02rem", md: "1.08rem" },
              }}
            >
              I care about data integrity, defensive engineering, and keeping
              systems understandable for the next person who works on them. That
              means pairing product thinking with implementation details like
              RBAC, authentication flows, testing, migrations, observability,
              and stable rollout practices.
            </Typography>
          </Box>
        </Box>
      </Container>

      <Box sx={{ bgcolor: "background.paper", py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <SectionHeading
            eyebrow="Experience"
            title="Software Engineer Intern at Xenber"
            body="March 2026 - July 2026"
          />

          <Box
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              background: `linear-gradient(180deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
              boxShadow: "0 18px 44px rgba(15, 23, 42, 0.1)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
              <WorkOutline sx={{ color: theme.palette.primary.main }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Production-facing engineering work across backend,
                integrations, and delivery
              </Typography>
            </Box>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
                gap: 2,
              }}
            >
              {experienceHighlights.map((item) => (
                <Box
                  key={item}
                  sx={{
                    p: 2.5,
                    borderRadius: 2.5,
                    bgcolor: "background.paper",
                    border: `1px solid ${theme.palette.divider}`,
                    boxShadow: "0 8px 22px rgba(15, 23, 42, 0.08)",
                  }}
                >
                  <Typography
                    sx={{
                      color: "text.secondary",
                      lineHeight: 1.85,
                      fontSize: { xs: "1rem", md: "1.08rem" },
                    }}
                  >
                    {item}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <SectionHeading
          eyebrow="Featured Projects"
          title="Selected work across web platforms and backend systems"
          body="A mix of full-stack products and backend-heavy projects that reflect practical engineering, deployment ownership, and secure implementation habits."
        />

        <Box sx={{ display: "grid", gap: 3 }}>
          {projects.map((project) => (
            <Box
              key={project.title}
              sx={{
                p: { xs: 3, md: 4 },
                borderRadius: 3,
                bgcolor: "background.paper",
                border: `1px solid ${theme.palette.divider}`,
                boxShadow: "0 18px 44px rgba(15, 23, 42, 0.1)",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: { xs: "flex-start", md: "center" },
                  flexDirection: { xs: "column", md: "row" },
                  gap: 2,
                  mb: 2,
                }}
              >
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.75 }}>
                    {project.title}
                  </Typography>
                  <Typography
                    sx={{
                      color: "text.secondary",
                      lineHeight: 1.85,
                      fontSize: { xs: "1rem", md: "1.08rem" },
                    }}
                  >
                    {project.description}
                  </Typography>
                </Box>
                <Button
                  href={project.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outlined"
                  endIcon={<Launch />}
                  sx={{
                    fontWeight: 700,
                    borderRadius: 999,
                    flexShrink: 0,
                  }}
                >
                  Repository
                </Button>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,
                  mb: 2.5,
                }}
              >
                {project.tech.map((item, index) => {
                  const tone = toneStyles[chipToneOrder[index % chipToneOrder.length]];

                  return (
                    <Chip
                      key={item}
                      label={item}
                      variant="outlined"
                      sx={{
                        color: tone.color,
                        bgcolor: tone.bg,
                        borderColor: tone.border,
                        fontWeight: 600,
                      }}
                    />
                  );
                })}
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
                  gap: 2,
                }}
              >
                {project.bullets.map((item) => (
                  <Box
                    key={item}
                    sx={{
                      p: 2.25,
                      borderRadius: 2.5,
                      bgcolor: "background.default",
                      border: `1px solid ${theme.palette.divider}`,
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.02)",
                    }}
                  >
                    <Typography
                      sx={{
                        color: "text.secondary",
                        lineHeight: 1.85,
                        fontSize: { xs: "1rem", md: "1.05rem" },
                      }}
                    >
                      {item}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      </Container>

      <Box sx={{ bgcolor: "background.paper", py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <SectionHeading
            eyebrow="Skills"
            title="Tools and technologies used across the stack"
            body="Grouped by the areas where I spend the most time: product frontend, application backends, infrastructure, and secure testing practices."
          />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                lg: "repeat(3, 1fr)",
              },
              gap: 3,
            }}
          >
            {skillGroups.map((group) => (
              <Box
                key={group.title}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  bgcolor: "background.default",
                  border: `1px solid ${theme.palette.divider}`,
                  boxShadow: "0 14px 34px rgba(15, 23, 42, 0.08)",
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  {group.title}
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {group.items.map((item, index) => {
                    const tone =
                      toneStyles[chipToneOrder[index % chipToneOrder.length]];

                    return (
                      <Chip
                        key={item}
                        label={item}
                        sx={{
                          fontWeight: 700,
                          bgcolor: tone.bg,
                          color: tone.color,
                          border: `1px solid ${tone.border}`,
                        }}
                      />
                    );
                  })}
                </Box>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Box
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 3,
            bgcolor: "background.paper",
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: "0 18px 40px rgba(15, 23, 42, 0.1)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              mb: 1.5,
            }}
          >
            <EmojiEvents sx={{ color: theme.palette.primary.main }} />
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              Achievements
            </Typography>
          </Box>
          <Typography
            sx={{
              color: "text.secondary",
              lineHeight: 1.8,
              mb: 3,
              maxWidth: 760,
              fontSize: { xs: "1rem", md: "1.08rem" },
            }}
          >
            Recognition across academics, pitching, and project presentation that
            shows consistency as well as range.
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1.15fr 0.85fr" },
              gap: 2.5,
            }}
          >
            {achievements.map((item) => {
              const tone = toneStyles[item.tone];

              return (
                <Box
                  key={item.title}
                  sx={{
                    p: item.featured ? { xs: 3, md: 3.5 } : 2.5,
                    borderRadius: 3,
                    bgcolor: item.featured ? tone.bg : "background.default",
                    border: `1px solid ${
                      item.featured ? tone.border : theme.palette.divider
                    }`,
                    boxShadow: item.featured
                      ? "0 14px 34px rgba(15, 23, 42, 0.14)"
                      : "0 8px 22px rgba(15, 23, 42, 0.06)",
                    gridColumn: item.featured ? { xs: "span 1", md: "span 2" } : "auto",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: { xs: "flex-start", sm: "center" },
                      flexDirection: { xs: "column", sm: "row" },
                      gap: 1,
                      mb: 1.25,
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight: 800,
                        color: item.featured ? tone.color : "text.primary",
                        fontSize: item.featured
                          ? { xs: "1.18rem", md: "1.35rem" }
                          : { xs: "1.02rem", md: "1.08rem" },
                      }}
                    >
                      {item.title}
                    </Typography>
                    <Chip
                      label={item.meta}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        bgcolor: item.featured
                          ? "rgba(255,255,255,0.14)"
                          : tone.bg,
                        color: item.featured ? tone.color : tone.color,
                        border: `1px solid ${
                          item.featured ? "rgba(255,255,255,0.16)" : tone.border
                        }`,
                      }}
                    />
                  </Box>
                  <Typography
                    sx={{
                      color: item.featured ? tone.color : "text.secondary",
                      opacity: item.featured ? 0.96 : 1,
                      lineHeight: 1.85,
                      fontSize: item.featured
                        ? { xs: "1.02rem", md: "1.08rem" }
                        : { xs: "1rem", md: "1.03rem" },
                    }}
                  >
                    {item.description}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Container>

      <Box
        sx={{
          background:
            "linear-gradient(135deg, #1d4ed8 0%, #6d28d9 58%, #f59e0b 132%)",
          color: "white",
          py: { xs: 6, md: 8 },
        }}
      >
        <Container maxWidth="md" sx={{ textAlign: "center" }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              mb: 1.75,
              lineHeight: 1.15,
              fontSize: { xs: "2rem", md: "3rem" },
            }}
          >
            Open to meaningful engineering opportunities
          </Typography>
          <Typography
            sx={{
              maxWidth: 720,
              mx: "auto",
              color: "rgba(255,255,255,0.9)",
              lineHeight: 1.85,
              fontSize: { xs: "1.02rem", md: "1.12rem" },
              mb: 4,
            }}
          >
            Connect with Afiq to talk about software engineering internships,
            backend development, cloud deployment, or the MarKet project.
          </Typography>

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: 1,
              mb: 3,
            }}
          >
            {profileLinks.map((link) => (
              <IconButton
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.label}
                sx={{
                  color: "white",
                  border: "1px solid rgba(255,255,255,0.26)",
                  bgcolor: "rgba(255,255,255,0.12)",
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.2)",
                  },
                }}
              >
                <link.icon />
              </IconButton>
            ))}
          </Box>

          <ExternalLinkButton
            href="https://www.linkedin.com/in/afiq-sharifuzan"
            label="Let's connect on LinkedIn"
            icon={ArrowForward}
            variant="outlined"
          />
        </Container>
      </Box>
    </Box>
  );
}

export default NekodezPage;
