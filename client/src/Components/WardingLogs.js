import React, { useState, useEffect } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import QProgressBar from "./ProgressBar";
import "../App.css";
import { useNavigate } from "react-router-dom";
import Alert from "react-bootstrap/Alert";
import { getIp } from "./Vars";
import { CardBody, CardHeader, Image } from "react-bootstrap";

const WardingLogs = () => {
  const navigate = useNavigate();
  if (sessionStorage.length === 0) {
    navigate("/login");
  }
  const [usersData, setUsersData] = useState([]);

  const [dateInWords, setDateInWords] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [showModalWarded, setShowModalWarded] = useState(false);

  const [modalContent, setModalContent] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [total, setTotal] = useState([]);
  const [pending, setPending] = useState(false);
  const [wardingPending, setWardingPending] = useState(false);

  const [wardingData, setWardingData] = useState([]);

  // Replace the current sorting function with this one:
  const sortedUsersData = usersData.slice().sort((a, b) => {
    const totalA = a.headhousehold + a.members;
    const totalB = b.headhousehold + b.members;
    return totalB - totalA; // Sort in descending order (highest first)
  });

  const handleClickCalendar = (event) => {
    try {
      setShowModal(true);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleTotalWardedClick = (event) => {
    var from = fromDate;
    var to = toDate;

    try {
      setWardingPending(true);
      setShowModalWarded(true);
      //gettotalwarded
      fetch(getIp() + "/totalwarding?from= " + from + "&to=" + to + "")
        .then((response) => response.json())
        .then((data) => [setWardingData(data), setWardingPending(false)])
        .catch((error) =>
          console.error("Error on loading warding data: " + error)
        );
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleClickSave = () => {
    // Handle saving of fromDate and toDate
    var from = fromDate;
    var to = toDate;

    fetch(getIp() + "/wardinglogs?from= " + from + "&to=" + to + "")
      .then((response) => response.json())
      .then((data) => [setTotal(data)])
      .catch((error) => console.error("Error on loading logs: " + error));

    fetch(getIp() + "/wardinguserlogs?from= " + from + "&to=" + to + "")
      .then((response) => response.json())
      .then((data) => [setPending(true), setUsersData(data)])
      .catch((error) => console.error("Error on loading logs: " + error));

    // fetch(getIp() + "/userTags?from= " + from + "&to=" + to + "")
    //   .then((response) => response.json())
    //   .then((data) => [])
    //   .catch((error) => console.error("Error on loading logs: " + error));

    const currentFrom = new Date(from);
    const currentTo = new Date(to);
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const day = currentFrom.getDate();
    const month = monthNames[currentFrom.getMonth()];
    const year = currentFrom.getFullYear();

    const dayto = currentTo.getDate();
    const monthto = monthNames[currentTo.getMonth()];
    const yearto = currentTo.getFullYear();

    setDateInWords(`${month} ${day}, ${year}-${monthto} ${dayto}, ${yearto}`);
  };

  useEffect(() => {
    fetch(getIp() + "/wardinglogs")
      .then((response) => response.json())
      .then((data) => [setTotal(data)])
      .catch((error) => console.error("Error on loading logs: " + error));

    fetch(getIp() + "/wardinguserlogs")
      .then((response) => response.json())
      .then((data) => [setPending(true), setUsersData(data)])
      .catch((error) => console.error("Error on loading logs: " + error));

    // fetch(getIp() + "/events")
    //   .then((response) => response.json())
    //   .then((data) => [setEvent(data)])
    //   .catch((error) => console.error("Error on loading logs: " + error));

    const currentDate = new Date();
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const day = currentDate.getDate();
    const month = monthNames[currentDate.getMonth()];
    const year = currentDate.getFullYear();
    setDateInWords(`${month} ${day}, ${year}`);
  }, []);

  return (
    <>
      <Container className="py-5 poppins-regular">
        <Row className="align-items-center justify-content-center">
          <Col lg={12}>
            <h2 className="poppins-bold">
              {dateInWords}
              <span style={{ paddingLeft: "10px" }}>
                <Button variant="dark" onClick={handleClickCalendar}>
                  <i className="bi bi-caret-down"></i>
                </Button>
              </span>
            </h2>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col xl={4} md={4} className="mb-3">
            <div
              class="card card-stats draggable"
              style={{ cursor: "pointer" }}
              onClick={() => handleTotalWardedClick()}
            >
              <div class="card-body">
                <div class="row">
                  <div class="col">
                    <h5 class="card-title text-uppercase text-muted mb-0">
                      Total Warded
                    </h5>
                    <span class="h2 font-weight-bold mb-0">
                      {total[0]?.headhousehold + total[0]?.members ?? 0}
                    </span>
                  </div>
                  <div class="col-auto">
                    <div class="icon icon-shape bg-orange text-white rounded-circle shadow">
                      <i class="fa fa-tag"></i>
                    </div>
                  </div>
                </div>
                <p class="mt-3 mb-0 text-sm">
                  {/* <span class="text-success mr-2">
                    <i class="fa fa-arrow-up"></i> 3.48%{" "}
                  </span>
                  <span class="text-nowrap">Since last day</span> */}
                </p>
              </div>
            </div>
          </Col>
          <Col xl={4} md={4} className="mb-3">
            <div class="card card-stats draggable">
              <div class="card-body">
                <div class="row">
                  <div class="col">
                    <h5 class="card-title text-uppercase text-muted mb-0">
                      Households
                    </h5>
                    <span class="h2 font-weight-bold mb-0">
                      {total[0]?.headhousehold}
                    </span>
                  </div>
                  <div class="col-auto">
                    <div class="icon icon-shape bg-orange text-white rounded-circle shadow">
                      <i class="bi bi-people"></i>
                    </div>
                  </div>
                </div>
                <p class="mt-3 mb-0 text-sm">
                  {/* <span class="text-success mr-2">
                    <i class="fa fa-arrow-up"></i> 3.48%{" "}
                  </span>
                  <span class="text-nowrap">Since last month</span> */}
                </p>
              </div>
            </div>
          </Col>
          <Col xl={4} md={4} className="mb-3">
            <div class="card card-stats draggable">
              <div class="card-body">
                <div class="row">
                  <div class="col">
                    <h5 class="card-title text-uppercase text-muted mb-0">
                      Members
                    </h5>
                    <span class="h2 font-weight-bold mb-0">
                      {total[0]?.members}
                    </span>
                  </div>
                  <div class="col-auto">
                    <div class="icon icon-shape bg-orange text-white rounded-circle shadow">
                      <i class="bi bi-person"></i>
                    </div>
                  </div>
                </div>
                <p class="mt-3 mb-0 text-sm">
                  {/* <span class="text-success mr-2">
                    <i class="fa fa-arrow-up"></i> 3.48%{" "}
                  </span>
                  <span class="text-nowrap">Since last month</span> */}
                </p>
              </div>
            </div>
          </Col>
        </Row>
        <Row>
          <Col lg={12}>
            <Row>
              {!pending ? (
                <Col lg={3} className="mb-3">
                  <Card>
                    <div style={{ padding: "15px" }}>
                      <div style={{ display: "inline-block" }}>
                        <Image
                          src={getIp() + `/userprofiles/k.jpg`} // Use createObjectURL to preview the selected file
                          rounded
                          width={35}
                          height={35}
                          style={{ display: "inline" }}
                        />
                        <p style={{ display: "inline", paddingLeft: "15px" }}>
                          <div
                            class="spinner-grow spinner-grow-sm"
                            role="status"
                          >
                            <span class="visually-hidden">Loading...</span>
                          </div>
                        </p>
                      </div>
                      <div className="mt-3">
                        <QProgressBar quota={0} />
                        <p style={{ fontSize: "12px", marginTop: "5px" }}>
                          voters scrapped <strong>{0}</strong>
                        </p>
                        <Row
                          style={{ fontSize: "12px" }}
                          className=" align-items-center"
                        >
                          <Col>
                            <i className="bi bi-person"></i> <strong>0</strong>
                          </Col>
                          <Col>
                            <i className="bi bi-people"></i> <strong>0</strong>
                          </Col>
                        </Row>
                      </div>
                    </div>
                  </Card>
                </Col>
              ) : (
                sortedUsersData.map((item, index) => {
                  var totalQ = item.headhousehold + item.members;
                  var img = "k.jpg";
                  if (item.img != null) {
                    img = item.img;
                  }
                  return (
                    <Col xl={3} md={4} className="mb-3">
                      <Card>
                        {/* {JSON.stringify(usersData)} */}
                        <div style={{ padding: "15px" }}>
                          <div style={{ display: "inline-block" }}>
                            <Image
                              src={getIp() + `/userprofiles/${img}`} // Use createObjectURL to preview the selected file
                              rounded
                              width={35}
                              height={35}
                              style={{ display: "inline" }}
                            />
                            <p
                              style={{ display: "inline", paddingLeft: "15px" }}
                            >
                              {item.fname}
                              {index + 1 === 1
                                ? " 👑"
                                : index + 1 === 2
                                ? " 🥇 "
                                : index + 1 === 3
                                ? " 🥈 "
                                : index + 1 === 4
                                ? " 🥉"
                                : ""}
                            </p>
                          </div>
                          <div className="mt-3">
                            <QProgressBar quota={totalQ} />
                            <p style={{ fontSize: "12px", marginTop: "5px" }}>
                              warded households <strong>{totalQ}</strong>
                            </p>
                            <Row
                              style={{ fontSize: "12px" }}
                              className=" align-items-center"
                            >
                              <Col>
                                <i className="bi bi-person"></i>{" "}
                                <strong>{item.headhousehold}</strong>
                              </Col>
                              <Col>
                                <i className="bi bi-people"></i>{" "}
                                <strong>{item.members}</strong>
                              </Col>
                            </Row>
                          </div>
                        </div>
                      </Card>
                    </Col>
                  );
                })
              )}
            </Row>
          </Col>
        </Row>
      </Container>

      {/* Modal component */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Body>
          <div style={{ padding: "20px" }}>
            <h3 className="mb-3">Pick Date...</h3>
            <InputGroup className="mb-3">
              <InputGroup.Text id="basic-addon">From</InputGroup.Text>
              <Form.Control
                type="date"
                placeholder="2024/01/01"
                aria-label="2024/01/01"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </InputGroup>
            <InputGroup className="mb-3">
              <InputGroup.Text id="basic-addon1">To</InputGroup.Text>
              <Form.Control
                type="date"
                placeholder="2024/01/31"
                aria-label="2024/01/31"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </InputGroup>
            <Button
              style={{ float: "right" }}
              className="mb-3"
              variant="dark"
              onClick={handleClickSave}
            >
              Go <i className="bi bi-arrow-right"></i>
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* Modal component */}
      <Modal
        show={showModalWarded}
        onHide={() => setShowModalWarded(false)}
        centered
        size="lg"
      >
        <Modal.Body>
          <div
            style={{ padding: "20px", maxHeight: "60vh" }}
            className="table-responsive"
          >
            <h3 className="mb-3">Warding Total</h3>
            {/* {wardingData || "No warding data.."} */}
            <Table className="table-bordered table-hovered">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Municipality</th>
                  <th>Barangay</th>
                  <th>Household</th>
                  <th>Members</th>
                </tr>
              </thead>
              <tbody>
                {!wardingPending ? (
                  <>
                    {wardingData.map((item, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{item.mun}</td>
                        <td>{item.brgy}</td>
                        <td className="text-center">{item.cnt}</td>
                        <td className="text-center">{item.total_members}</td>
                      </tr>
                    ))}
                  </>
                ) : (
                  <>
                    <tr>
                      <td colSpan={5}>Loading...</td>
                    </tr>
                  </>
                )}
              </tbody>
            </Table>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default WardingLogs;
