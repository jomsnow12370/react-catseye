import React, { useState, useRef } from "react";
import { Row, Col, Form, Container, Button, Table } from "react-bootstrap";
import { getIp } from "./Vars";
import GetType from "./GetLeaderType";

const LiquidationIncReport = () => {
  const [leaders, setLeaders] = useState([]);
  const [municipality, setMunicipality] = useState("");
  const [barangays, setBarangays] = useState([]);
  const [barangay, setBarangay] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [timeFrom, setTimeFrom] = useState("00:00:00");
  const [timeTo, setTimeTo] = useState("24:59:59");
  const [filterType, setFilterType] = useState("");
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
        `${getIp()}/getleadersincliquidation?mun=${municipality}&brgy=${barangay}&date=${selectedDate}&timeFrom=${timeFrom}&timeTo=${timeTo}&type=${filterType}`
      );
      const data = await response.json();
      setLeaders(data);
    } catch (error) {
      console.error("Error generating report:", error);
    }
  };

  function getCategoryLabel(id) {
    const categoryMap = {
      683: "INC 2025",
      684: "BNS 2025",
      685: "BHW 2025",
      686: "BPSO 2025",
      687: "KAG 2025",
      688: "PB 2025",
      689: "SKC 2025",
      690: "SEC 2025",
      691: "TREAS 2025",
    };
    return categoryMap[id] || "";
  }
  const handlePrint = () => {
    window.print();
  };
  
  return (
    <Container className="mt-5">
      <h1>Liquidation Report</h1>

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
        <Col md={4}>
          <Form.Label>Category</Form.Label>
          <Form.Select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">All Types</option>
            {[683, 684, 685, 686, 687, 688, 689, 690, 691].map((id) => (
              <option key={id} value={id}>
                {getCategoryLabel(id)}
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

      <div ref={reportRef} id="printable-content" className="mt-3">
  <Row>
    <Col>
      <h2 className="text-center">Liquidation Report</h2>
      <h3 className="text-center">
        {getCategoryLabel(Number(filterType))} {barangay} {municipality}{" "}
        <br />
        <small style={{ fontSize: "60%" }}>{selectedDate}</small>
      </h3>
      <Table bordered text-dark className="table">
        <thead>
          <tr>
            <th>No.</th>
            <th>Name</th>
            <th className="text-center">Barangay</th>
            <th className="text-center">Category</th>
            <th className="text-center">Signature</th>
          </tr>
        </thead>
        <tbody>
          {leaders.length > 0 ? (
            leaders.map((leader, index) => {
              const signatureUrl = `${getIp()}/profiles/${leader.v_id}/${leader.imgname}`;
              return (
                <tr key={leader.id}>
                  <td className="text-center">{index + 1}</td>
                  <td>
                    {leader.v_lname}, {leader.v_fname} {leader.v_mname}
                  </td>
                  <td className="text-center">{leader.barangay}</td>
                  <td className="text-center">{leader.remarks_txt}</td>
                  <td className="text-center">
                    {leader.imgname ? (
                      <img
                        src={signatureUrl}
                        alt="Signature"
                        style={{
                          width: "100px",
                          height: "100px",
                          objectFit: "contain",
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
              <td colSpan="5" className="text-center">
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

export default LiquidationIncReport;
