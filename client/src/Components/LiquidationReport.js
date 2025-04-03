import React, { useState, useRef } from "react";
import { Row, Col, Form, Container, Button, Table } from "react-bootstrap";
import { getIp } from "./Vars";
import GetType from "./GetLeaderType";

const LiquidationReport = () => {
  const [leaders, setLeaders] = useState([]);
  const [municipality, setMunicipality] = useState("");
  const [barangays, setBarangays] = useState([]);
  const [barangay, setBarangay] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [timeFrom, setTimeFrom] = useState("00:00:00");
  const [timeTo, setTimeTo] = useState("23:59:59");
  const reportRef = useRef(null);

  const fetchBarangays = async (municipality) => {
    if (!municipality) {
      setBarangays([]);
      return;
    }
    try {
      const response = await fetch(
        `${getIp()}/getBarangay?municipality=${municipality}`
      );
      const data = await response.json();
      setBarangays(data);
    } catch (error) {
      console.error("Error fetching barangays:", error);
    }
  };

  const handleGenerateReport = async () => {
    try {
      const response = await fetch(
        `${getIp()}/getleadersliquidation?mun=${municipality}&brgy=${barangay}&date=${selectedDate}&timeFrom=${timeFrom}&timeTo=${timeTo}`
      );
      const data = await response.json();
      setLeaders(data);
    } catch (error) {
      console.error("Error generating report:", error);
    }
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "0.8rem",
  };

  const cellStyle = {
    border: "1px solid black",
    padding: "2px",
    verticalAlign: "middle",
  };

  const handlePrint = () => {
    const printContent = reportRef.current.innerHTML;
    const originalContent = document.body.innerHTML;
    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  return (
    <Container className="mt-5">
      <h1 className="">Liquidation Report</h1>
      <Row>
        <Col md={4}>
          <Form.Group>
            <Form.Label>Date</Form.Label>
            <Form.Control
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>Time From</Form.Label>
            <Form.Control
              type="text"
              placeholder="11:00:00"
              value={timeFrom}
              onChange={(e) => setTimeFrom(e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>Time To</Form.Label>
            <Form.Control
              type="text"
              placeholder="12:00:00"
              value={timeTo}
              onChange={(e) => setTimeTo(e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Label>Municipality</Form.Label>
          <Form.Select
            value={municipality}
            onChange={(e) => {
              const selected = e.target.value;
              setMunicipality(selected);
              fetchBarangays(selected);
            }}
            className="mb-3"
          >
            <option value="">Select Municipality</option>
            {[
              "BAGAMANOC",
              "BARAS",
              "BATO",
              "CARAMORAN",
              "GIGMOTO",
              "PANDAN",
              "PANGANIBAN",
              "SAN ANDRES",
              "SAN MIGUEL",
              "VIGA",
              "VIRAC",
            ].map((mun) => (
              <option key={mun} value={mun}>
                {mun}
              </option>
            ))}
          </Form.Select>
        </Col>
        <Col md={4}>
          <Form.Label>Barangay</Form.Label>
          <Form.Select
            value={barangay}
            onChange={(e) => setBarangay(e.target.value)}
            className="mb-3"
          >
            <option value="">Select Barangay</option>
            {barangays.map((brgy, index) => (
              <option key={index} value={brgy.barangay}>
                {brgy.barangay}
              </option>
            ))}
          </Form.Select>
        </Col>
        <Col md={12}>
          <Button
            variant="primary"
            onClick={handleGenerateReport}
            style={{ marginRight: "10px" }}
          >
            Generate Report
          </Button>
          <Button variant="secondary" onClick={handlePrint}>
            Print Report
          </Button>
        </Col>
      </Row>

      <div ref={reportRef} className="mt-3">
        <Row>
          <Col>
            <h2 className="text-center">Liquidation Report </h2>
            <h3 className="text-center">{barangay} {municipality} <br></br><small style={{fontSize: "60%"}}>{selectedDate}</small></h3>
            <Table bordered text-dark className="table">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Name</th>
                  <th className="text-center">Type</th>
                  <th className="text-center">Position</th>
                  <th className="text-center">Signature</th>
                </tr>
              </thead>
              <tbody>
                {leaders.length > 0 ? (
                  leaders.map((leader, index) => {
                    const signatureUrl = `${getIp()}/profiles/${leader.v_id}/${
                      leader.imgname
                    }`;
                    return (
                      <tr key={leader.id}  style={{verticalAlign: "center"}}>
                        <td className="text-center"  style={{ padding: "0px!important", }}>
                          {index + 1}
                        </td>
                        <td style={{verticalAlign: "center"}} >
                          <div style={{marginLeft: "20px"}}>{leader.v_lname}, {leader.v_fname} {leader.v_mname}</div>
                        </td>
                        <td className="text-center ">
                          {GetType(leader.type)}
                        </td>
                        <td className="text-center ">
                          {leader.pos}
                        </td>
                        <td
                          style={{ textAlign: "center", verticalAlign: "center"}}
                          className="text-center"
                          width={100}
                          
                        >
                          {leader.imgname ? (
                            <img
                              src={signatureUrl}
                              alt="Signature"
                         
                              style={{
                                objectFit: "contain",
                                // maxWidth: "250px",
                                // maxHeight: "90px",
                                width: "100px",
                                height: "100px",
                                 transform: "rotate(270deg)",
                       
                              }}
                            />
                          ) : (
                            "No Signature"
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center">
                      No attendance records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Col>
        </Row>
      </div>
    </Container>
  );
};

export default LiquidationReport;
