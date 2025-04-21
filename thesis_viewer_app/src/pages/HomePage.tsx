import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/HomePage.css';
import { ShieldCheck, Glasses, ChartNoAxesCombined } from 'lucide-react';
import GoogleIcon from "@mui/icons-material/Google";
import { Footer } from "../components/Global/Footer";
import { motion } from "framer-motion";

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const cardVariants = {
    hidden: { opacity: 0, rotateY: -90 },
    visible: (i: number) => ({
      opacity: 1,
      rotateY: 0,
      transition: {
        delay: i * 0.3,
        duration: 0.9,
        ease: "easeOut"
      }
    })
  };  

  return (
    <motion.div
      className="homepage"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
    >
      <header className="navbar">
        <div className="logo">
          <img src="favicon.ico" alt="logo" className="favicon" />
          ThesisViewer
        </div>
      </header>

      <main className="content-wrapper">
        <section className="main-section">
          <motion.div
            className="text-section"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1.2 }}
          >
            <h1>
              Discover, Retrieve,<br />and Build Upon NEU's Academic Legacy
            </h1>
            <p>
              Thesis Viewer provides a smart, secure, and accessible platform for managing
              research, powered by knowledge and innovation.
            </p>
            <button className="get-started-btn" onClick={() => navigate('/login')}>
              <GoogleIcon className="google-icon" />
              Get Started with Google
            </button>
          </motion.div>

          <motion.div
            className="image-section"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1.2 }}
          >
            <img src="book-image.png" alt="Stack of thesis books" />
          </motion.div>
        </section>

        <motion.section
          className="features"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-20% 0px" }}
        >
          {[{
            icon: <ShieldCheck className="icon" />,
            title: "Secure Viewing",
            desc: "Access theses in a secure, read-only format. Downloads are disabled to protect research."
          }, {
            icon: <ChartNoAxesCombined className="icon" />,
            title: "Track & Bookmark",
            desc: "Bookmark theses, see view counts, and track popular research trends."
          }, {
            icon: <Glasses className="icon" />,
            title: "ThessaAI Assistant",
            desc: "Get thesis summaries, research suggestions, and ask questions through our AI chatbot."
          }].map((feature, index) => (
            <motion.div
              className="feature-card"
              key={feature.title}
              variants={cardVariants}
              custom={index}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-20% 0px" }}
            >
              {feature.icon}
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </motion.div>
          ))}
        </motion.section>
      </main>

      <Footer />
    </motion.div>
  );
};

export default HomePage;