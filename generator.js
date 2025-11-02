const fs = require("fs");

const gestures = ["still", "up_down", "left_right", "circle_cw", "circle_ccw"];
const samplesPerGesture = 300;
const sequenceLength = 200;

const randomNoise = (scale = 0.05) => (Math.random() * scale * 2 - scale);

const generateGestureData = () => {
  const data = [];

  for (const gesture of gestures) {
    for (let i = 0; i < samplesPerGesture; i++) {
      for (let t = 0; t < sequenceLength; t++) {
        let ax = 0, ay = 0, az = 1, gx = 0, gy = 0, gz = 0; 
        const phase = (Math.PI * 2 * t) / sequenceLength;

        switch (gesture) {
          case "still":
            ax += randomNoise(0.02);
            ay += randomNoise(0.02);
            az = 1 + randomNoise(0.02);
            break;

          case "up_down":
            ay = Math.sin(phase) * (0.8 + Math.random() * 0.3);
            az = 1 + randomNoise(0.05);
            break;

          case "left_right":
            ax = Math.sin(phase) * (0.8 + Math.random() * 0.3);
            az = 1 + randomNoise(0.05);
            break;

          case "circle_cw":
            ax = Math.cos(phase);
            ay = Math.sin(phase);
            gz = 1 + randomNoise(0.05);
            break;

          case "circle_ccw":
            ax = Math.cos(phase);
            ay = Math.sin(phase);
            gz = -1 + randomNoise(0.05);
            break;
        }

        data.push({
          ax, ay, az, gx, gy, gz, gesture
        });
      }
    }
  }
  return data;
};

const data = generateGestureData();

const csv = [
  "ax,ay,az,gx,gy,gz,gesture",
  ...data.map(d =>
    `${d.ax.toFixed(3)},${d.ay.toFixed(3)},${d.az.toFixed(3)},${d.gx.toFixed(3)},${d.gy.toFixed(3)},${d.gz.toFixed(3)},${d.gesture}`
  )
].join("\n");

fs.writeFileSync("gestures_dataset.csv", csv);
console.log("Dataset created: gestures_dataset.csv");
