// ScrollableCard.js

import React from "react";

const ScrollableCard = () => {
  // You can customize the content of each card here
  const dummyMessages = [
    "Card 1 Message",
    "Card 2 Message",
    "Card 3 Message",
    "Card 4 Message",
    "Card 5 Message",
    "Card 1 Message",
    "Card 2 Message",
    "Card 3 Message",
    "Card 4 Message",
    "Card 5 Message",
    "Card 1 Message",
    "Card 2 Message",
    "Card 3 Message",
    "Card 4 Message",
    "Card 5 Message",
  ];

  return (
    <div className="scrollable-card-container">
      <div className="scrollable-card-content">
        {dummyMessages.map((message, index) => (
          <div
            key={index}
            className="scrollable-card-item"
          >
            {message}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScrollableCard;
