import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Accelerometer, Gyroscope } from 'expo-sensors';

export default function App() {
  const [accData, setAccData] = useState({ x: 0, y: 0, z: 0 });
  const [gyroData, setGyroData] = useState({ x: 0, y: 0, z: 0 });
  const [gesture, setGesture] = useState("Waiting for motion...");
  const [probs, setProbs] = useState({});

  const gestureNames = {
    still: "Still",
    up_down: "Vertical",
    left_right: "Horizontal",
    circle_cw: "Clockwise",
    circle_ccw: "Counter-clockwise"
  };

  const accBuffer = useRef([]);
  const gyroBuffer = useRef([]);

  useEffect(() => {
  const accSub = Accelerometer.addListener(data => {
    accBuffer.current.push(data);
    setAccData(data);
    if (accBuffer.current.length > 10) accBuffer.current.shift();
  });

  const gyroSub = Gyroscope.addListener(data => {
    gyroBuffer.current.push(data);
    setGyroData(data);
    if (gyroBuffer.current.length > 10) gyroBuffer.current.shift();
  });

  Accelerometer.setUpdateInterval(50);
  Gyroscope.setUpdateInterval(50);

  const interval = setInterval(() => {
    if (accBuffer.current.length === 10 && gyroBuffer.current.length === 10) {
      sendAveragedData();
    }
  }, 500);

  return () => {
    accSub.remove();
    gyroSub.remove();
    clearInterval(interval);
  };
}, []);

  const sendAveragedData = async () => {
  const avg = (arr, key) =>
    arr.reduce((s, v) => s + v[key], 0) / arr.length || 0;

  const payload = {
    ax: avg(accBuffer.current, 'x'),
    ay: avg(accBuffer.current, 'y'),
    az: avg(accBuffer.current, 'z'),
    gx: avg(gyroBuffer.current, 'x'),
    gy: avg(gyroBuffer.current, 'y'),
    gz: avg(gyroBuffer.current, 'z')
  };

  try {
    const res = await fetch("http://***:8000/predict", { // use uour device api 
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    setProbs(data.probs);
    updateGestureText(data.prediction);

    accBuffer.current = [];
    gyroBuffer.current = [];

  } catch (err) {
    console.log("Network error:", err);
  }
};

  const updateGestureText = (g) => {
    if (g === 'still') setGesture('Phone still');
    else if (g === 'up_down') setGesture('Vertical movement');
    else if (g === 'left_right') setGesture('Horizontal movement');
    else if (g === 'circle_cw') setGesture('Clockwise rotation');
    else if (g === 'circle_ccw') setGesture('Counter-clockwise rotation');
    else setGesture('Unknown motion');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gesture Classifier</Text>

      <View style={styles.box}>
        <Text style={styles.coords}>Accel: x={accData.x.toFixed(2)} y={accData.y.toFixed(2)} z={accData.z.toFixed(2)}</Text>
        <Text style={styles.coords}>Gyro:  x={gyroData.x.toFixed(2)} y={gyroData.y.toFixed(2)} z={gyroData.z.toFixed(2)}</Text>
      </View>

      <View style={styles.gestureBox}>
        <Text style={styles.result}>{gesture}</Text>
      </View>

      <View style={{ marginTop: 15 }}>
      {Object.entries(probs).map(([cls, p]) => {
        const label = gestureNames[cls] || cls;
        const percent = (p * 100).toFixed(1);
        const color = p > 0.7 ? "#00ff7f" : p > 0.3 ? "#ffd700" : "#ff6347";

        return (
          <View key={cls} style={[styles.chanceContainer, {backgroundColor: color}]}>
            <Text  style={{fontWeight:'bold'}}>
              {label}: 
            </Text>
            <Text>
              {percent}%
            </Text>
          </View>
        );
      })}
    </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#3a3c45', padding: 20 },
  title: { fontSize: 24, color: 'white', fontWeight: 'bold', marginBottom: 20 },
  coords: { color: 'white', fontWeight: 'bold' },
  box: { backgroundColor: '#30cf92', padding: 12, borderRadius: 10, marginBottom: 20 },
  gestureBox: { backgroundColor: '#528feb', padding: 20, borderRadius: 10, marginTop: 10 },
  result: { fontSize: 20, color: 'white', fontWeight: 'bold' },
  chanceContainer: {backgroundColor:'white', display:'flex', flexDirection:'row', alignItems:'center', justifyContent:'space-between', width:'80%', marginTop:10, padding:10, borderRadius:15}
});
