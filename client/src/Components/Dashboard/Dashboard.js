import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Button,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { getUserId, getIp } from "../Vars";
import { Chart } from "chart.js/auto";

const Dashboard = () => {
  const userId = getUserId();
  const navigate = useNavigate();
  const [voters, setVoters] = useState([]);
  const [ageGroup, setAgeGroup] = useState({});
  const [fb, setFB] = useState({});
  const chartRef = useRef(null);
  const ageChartRef = useRef(null);
  const fbChartRef = useRef(null);

  if (sessionStorage.length === 0) {
    navigate("/login");
  }

  useEffect(() => {
    // Fetch FB data
    fetch(getIp() + "/fbs")
      .then((response) => response.json())
      .then((data) => {
        setFB(data[0]);

        // Initialize the FB doughnut chart after data is fetched
        const fbCtx = fbChartRef.current.getContext("2d");
        new Chart(fbCtx, {
          type: "doughnut",
          data: {
            labels: ["With FB", "No FB", "Inactive", "Locked"],
            datasets: [
              {
                label: "Total: ",
                data: [
                  data[0].withfb,
                  data[0].nofb,
                  data[0].inactive,
                  data[0].locked,
                ],
                backgroundColor: [
                  "rgba(75, 192, 192, 0.2)",
                  "rgba(255, 99, 132, 0.2)",
                  "rgba(255, 206, 86, 0.2)",
                  "rgba(54, 162, 235, 0.2)",
                ],
                borderColor: [
                  "rgba(75, 192, 192, 1)",
                  "rgba(255, 99, 132, 1)",
                  "rgba(255, 206, 86, 1)",
                  "rgba(54, 162, 235, 1)",
                ],
                borderWidth: 1,
              },
            ],
          },
        });
      })
      .catch((error) => console.error("Error on loading FB data: " + error));

    // Fetch voters count
    fetch(getIp() + "/getVotersCount")
      .then((response) => response.json())
      .then((data) => {
        setVoters(data);

        // Initialize the bar chart after data is fetched
        const ctx = chartRef.current.getContext("2d");
        new Chart(ctx, {
          type: "bar",
          data: {
            labels: data.map((item) => item.v_municipality),
            datasets: [
              {
                label: "Number of Voters",
                data: data.map((item) => item.cnt),
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 1,
              },
            ],
          },
          options: {
            scales: {
              y: {
                beginAtZero: true,
              },
            },
            onClick: (e, elements) => {
              if (elements.length > 0) {
                const index = elements[0].index;
                const municipality = data[index].v_municipality;
                navigate(`/municipality/${municipality}`);
              }
            },
          },
        });
      })
      .catch((error) => console.error("Error on getdata: " + error));

    // Fetch age group data
    fetch(getIp() + "/getAgeGroups")
      .then((response) => response.json())
      .then((data) => {
        setAgeGroup(data[0]);

        // Initialize the doughnut chart after age group data is fetched
        const ageCtx = ageChartRef.current.getContext("2d");
        new Chart(ageCtx, {
          type: "doughnut",
          data: {
            labels: ["18-32", "33-59", "60UP", "NOBDAY"],
            datasets: [
              {
                label: "Age Groups",
                data: [
                  data[0]["18-32"],
                  data[0]["33-59"],
                  data[0]["60UP"],
                  data[0]["NOBDAY"],
                ],
                backgroundColor: [
                  "rgba(255, 99, 132, 0.2)",
                  "rgba(54, 162, 235, 0.2)",
                  "rgba(255, 206, 86, 0.2)",
                  "rgba(75, 192, 192, 0.2)",
                ],
                borderColor: [
                  "rgba(255, 99, 132, 1)",
                  "rgba(54, 162, 235, 1)",
                  "rgba(255, 206, 86, 1)",
                  "rgba(75, 192, 192, 1)",
                ],
                borderWidth: 1,
              },
            ],
          },
          options: {
            onClick: (e, elements) => {
              if (elements.length > 0) {
                const index = elements[0].index;
                const ageGroup = ["18-32", "33-59", "60UP", "NOBDAY"][index];
                navigate(`/agegroup/${ageGroup}`);
              }
            },
          },
        });
      })
      .catch((error) => console.error("Error on getdata: " + error));
  }, [navigate]);

  const totalVoters = voters.reduce((acc, voter) => acc + voter.cnt, 0);
  const totalFB = fb.withfb + fb.nofb + fb.inactive + fb.locked;

  return (
    <Container fluid className="poppins-regular">
      <Row className="justify-content-center mt-5">
        <Col md={3}>
          <Card className="mb-3">
            <CardBody>
              <h5>Total Voters</h5>
              <h2>{totalVoters.toLocaleString()}</h2>
            </CardBody>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="mb-3">
            <CardBody>
              <h5>Total FB Data</h5>
              <h2>{totalFB.toLocaleString()}</h2>
            </CardBody>
          </Card>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md={6}>
          <Card>
            <h5 className="p-3">Voters</h5>
            <CardBody>
              <Row className="align-items-center">
                <Col>
                  <canvas ref={chartRef}></canvas>
                </Col>
              </Row>
            </CardBody>
            <CardFooter>Total {totalVoters.toLocaleString()}</CardFooter>
          </Card>
        </Col>
        <Col md={3}>
          <Card>
            <h5 className="p-3">Age Group</h5>
            <CardBody>
              <Row className="align-items-center">
                <Col>
                  <canvas ref={ageChartRef}></canvas>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </Col>
        <Col md={3}>
          <Card>
            <h5 className="p-3">Facebook</h5>
            <CardBody>
              <Row className="align-items-center">
                <Col>
                  <canvas ref={fbChartRef}></canvas>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
