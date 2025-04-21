import React from "react";
import "./testimonials.css";
import { FaStar, FaQuoteLeft } from "react-icons/fa";

const Testimonials = () => {
  const testimonialsData = [
    {
      id: 1,
      name: "Vignesh Chary",
      position: "3rd Year Student",
      message:
        "This platform helped me learn the best concepts in a short time, which helped me score good marks in my exams.",
      image:
        "https://th.bing.com/th?q=Current+Bachelor&w=120&h=120&c=1&rs=1&qlt=90&cb=1&dpr=1.3&pid=InlineBlock&mkt=en-IN&cc=IN&setlang=en&adlt=moderate&t=1&mw=247",
      rating: 5
    },
    {
      id: 2,
      name: "Nithish",
      position: "1st Year Student",
      message:
        "The inclusion of a chatbot makes my tasks simpler and helps me understand concepts more effectively.",
      image:
        "https://th.bing.com/th/id/OIP.GKAiW3oc2TWXVEeZAzrWOAHaJF?w=135&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7",
      rating: 4
    },
    {
      id: 3,
      name: "Naveen",
      position: "4th Year Student",
      message:
        "This platform helps me revise the main topics quickly and efficiently, making exam preparation easier.",
      image:
        "https://th.bing.com/th?q=Current+Bachelor&w=120&h=120&c=1&rs=1&qlt=90&cb=1&dpr=1.3&pid=InlineBlock&mkt=en-IN&cc=IN&setlang=en&adlt=moderate&t=1&mw=247",
      rating: 5
    },
    {
      id: 4,
      name: "Vasista",
      position: "2nd Year Student",
      message:
        "Interacting with teachers using the message chatbox helps me get my doubts clarified on time.",
      image:
        "https://th.bing.com/th/id/OIP.GKAiW3oc2TWXVEeZAzrWOAHaJF?w=135&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7",
      rating: 4
    },
  ];

  // Render star ratings
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <FaStar 
          key={i} 
          color={i < rating ? "#FFD700" : "#e4e5e9"} 
          size={18} 
          style={{ margin: "0 2px" }}
        />
      );
    }
    return stars;
  };

  return (
    <section className="testimonials">
      <h2>What Our Students Say</h2>
      <div className="testimonials-cards">
        {testimonialsData.map((testimonial) => (
          <div className="testimonial-card" key={testimonial.id}>
            <div className="student-image">
              <img src={testimonial.image} alt={testimonial.name} />
            </div>
            <div className="star-rating">
              {renderStars(testimonial.rating)}
            </div>
            <p className="message">
              <FaQuoteLeft 
                size={20} 
                style={{ 
                  color: "rgba(71, 118, 230, 0.3)", 
                  marginRight: "8px", 
                  marginBottom: "-2px" 
                }} 
              />
              {testimonial.message}
            </p>
            <div className="info">
              <p className="name">{testimonial.name}</p>
              <p className="position">{testimonial.position}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;