import { Tooltip } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AIAssistant() {
  const navigate = useNavigate();
  const [leftPosition, setLeftPosition] = useState("20px");
  const [isWalking, setIsWalking] = useState(true);
  const [goingRight, setGoingRight] = useState(true);
  const imageWidth = 100; // px

  useEffect(() => {
    let moveTimeout: NodeJS.Timeout;
    let pauseTimeout: NodeJS.Timeout;

    const startMovement = () => {
      setIsWalking(true);

      const windowWidth = window.innerWidth;
      const padding = 20; // margin from the edge

      const rightStop = `${windowWidth - imageWidth - padding}px`;
      const leftStop = `${padding}px`;

      setLeftPosition(goingRight ? rightStop : leftStop);

      moveTimeout = setTimeout(() => {
        setIsWalking(false);
        pauseTimeout = setTimeout(() => {
          setGoingRight((prev) => !prev);
          startMovement();
        }, 60000); // pause duration
      }, 10000); // walking duration
    };

    startMovement();

    return () => {
      clearTimeout(moveTimeout);
      clearTimeout(pauseTimeout);
    };
  }, [goingRight]);

  const imageSrc = isWalking ? "/walking-girl.gif" : "/standing-girl.png";

  return (
    <Tooltip title="Need Help? Ask ThessaAI" placement="left">
      <div
        style={{
          position: "fixed",
          bottom: 32,
          left: leftPosition,
          transition: isWalking ? "left 10s linear" : "none",
          zIndex: 9999,
          cursor: "pointer"
        }}
        onClick={() => navigate("/thessaAI")}
      >
        <img
          src={imageSrc}
          alt={isWalking ? "Walking person" : "Standing person"}
          style={{
            height: isWalking ? 200 : 230,
            transform: goingRight ? "scaleX(1)" : "scaleX(-1)",
            transition: "transform 0.3s ease-in-out",
          }}
        />
      </div>
    </Tooltip>
  );
}
