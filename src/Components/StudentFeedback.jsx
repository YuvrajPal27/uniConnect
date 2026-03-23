// src/components/StudentFeedback.jsx
import React, { useEffect, useState } from "react";
import { useFirestore } from "../Hooks/useFirestore";

const StudentFeedback = () => {
  const { fetchData } = useFirestore("studentFeedback");
  const [feedback, setFeedback] = useState([]);

  useEffect(() => {
    const getData = async () => {
      const data = await fetchData();
      setFeedback(data);
    };
    getData();
  }, []);

  return (
      <div className="bg-gray-700">
      <div className="banner-container">
        <div className="banner">
          <div className="women">
            <img src="/images/logo.png" alt="Logo" />
          </div>
          <div className="content">
            <span>WELCOME TO</span>
            <h3>UNIVERSITY CONNECT UTTARAKHAND (UCU)</h3>
            <p>RAJ BHAWAN UTTARAKHAND</p>
          </div>
        </div>
      </div>

      <h1>Student Feedback</h1>

      <div id="card-container" className="bg-gray-800">
        {feedback.length > 0 ? (
          feedback.map((item) => (
            <div className="card" key={item.id}>
              <p>{item.nameOfInstitute || "No institute provided"}</p>
              <p>{item.suggestion || "No suggestion provided"}</p>
              <p className="timestamp">
                {item.timestamp?.seconds 
                  ? new Date(item.timestamp.seconds * 1000).toLocaleString() 
                  : "No timestamp"}
              </p>
            </div>
          ))
        ) : (
          <p>Loading feedback...</p>
        )}
      </div>
    </div>
  );
};

export default StudentFeedback;