import React, { useState } from "react";
import { Row, Col, Form, Container, Button, Table } from "react-bootstrap";
import { getIp } from "./Vars";

const LeaderReport = () => {
  const [leaders, setLeaders] = useState([]);
  const [municipality, setMunicipality] = useState("");
  const [year, setYear] = useState("");
  const [type, setType] = useState("All");
  const [barangays, setBarangays] = useState([]);
  const [barangay, setBarangay] = useState("");
  const [reportType, setReportType] = useState("list"); // 'list' or 'summary'
  const [reportCategory, setReportCategory] = useState("cua");

  const typeLabels = {
    4: "Municipal Coordinator",
    3: "District Coordinator",
    2: "Barangay Coordinator",
    1: "Ward Leader",
  };

  const orderedTypes = [4, 3, 2, 1];

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
        `${getIp()}/getleadersreport?mun=${municipality}&brgy=${barangay}&year=${year}&type=${type}`
      );
      const data = await response.json();
      setLeaders(data);
    } catch (error) {
      console.error("Error generating report:", error);
    }
  };

  const groupedLeaders = orderedTypes.reduce((groups, type) => {
    groups[type] = leaders.filter((leader) => leader.type === type);
    return groups;
  }, {});

  const getSummaryTotals = () => {
    return leaders.reduce((summary, leader) => {
      const barangayKey = leader.barangay || "Unknown"; // In case barangay is not available
      if (!summary[barangayKey]) summary[barangayKey] = {};

      if (!summary[barangayKey][leader.type]) {
        summary[barangayKey][leader.type] = 0;
      }
      summary[barangayKey][leader.type]++;

      return summary;
    }, {});
  };

  const getTotalSummary = () => {
    return leaders.reduce((summary, leader) => {
      if (!summary[leader.type]) summary[leader.type] = 0;
      summary[leader.type]++;
      return summary;
    }, {});
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      if (reportType === "summary") {
        const summary = getSummaryTotals();
        let summaryHtml;

        if (barangay === "") {
          // Merge all barangays into one table if no barangay is selected
          summaryHtml = `
            <h2>Leader Summary Report (All Barangays)</h2>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Barangay</th>
                  <th>MC</th>
                  <th>DC</th>
                  <th>BC</th>
                  <th>WL</th>
                </tr>
              </thead>
              <tbody>
                ${Object.keys(summary)
                  .map((barangay, index) => {
                    const total = summary[barangay];
                    return `
                      <tr>
                        <td>${index + 1}</td>
                        <td>${barangay}</td>
                        <td>${total[4] || 0}</td>
                        <td>${total[3] || 0}</td>
                        <td>${total[2] || 0}</td>
                        <td>${total[1] || 0}</td>
                      </tr>`;
                  })
                  .join("")}
                <tr>
                  <td colspan="2">Total</td>
                  <td><strong>${getTotalSummary()[4] || 0}</strong></td>
                  <td><strong>${getTotalSummary()[3] || 0}</strong></td>
                  <td><strong>${getTotalSummary()[2] || 0}</strong></td>
                  <td><strong>${getTotalSummary()[1] || 0}</strong></td>
                </tr>
              </tbody>
            </table>
          `;
        } else {
          // Display separate tables for each barangay
          summaryHtml = Object.keys(summary)
            .map((barangay) => {
              const total = summary[barangay];
              return `
                <h2>Leader Summary Report by Barangay: ${barangay}</h2>
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Barangay</th>
                      <th>MC</th>
                      <th>DC</th>
                      <th>BC</th>
                      <th>WL</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>#</td>
                      <td>${barangay}</td>
                      <td>${total[4] || 0}</td>
                      <td>${total[3] || 0}</td>
                      <td>${total[2] || 0}</td>
                      <td>${total[1] || 0}</td>
                    </tr>
                    <tr>
                      <td colspan="2">Total</td>
                      <td>${total[4] || 0}</td>
                      <td>${total[3] || 0}</td>
                      <td>${total[2] || 0}</td>
                      <td>${total[1] || 0}</td>
                    </tr>
                  </tbody>
                </table>
              `;
            })
            .join("");
        }

        printWindow.document.write(`
          <html>
          <head>
                       <title>${barangay} ${year} Leaders</title>
            <style>
              body {
                font-family: 'Poppins', sans-serif;
                margin: 20px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
              }
              th, td {
                border: 1px solid black;
                padding: 8px;
                text-align: left;
              }
              th {
                background-color: #f2f2f2;
              }
              h2 {
                text-align: center;
              }
            </style>
            <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap" rel="stylesheet">
          </head>
          <body>
            ${summaryHtml}
          </body>
          </html>
        `);
      } else {
        // Print List
        const groupedHtml = orderedTypes
          .map((type) => {
            const group = groupedLeaders[type];
            if (group.length === 0) return ""; // Skip empty groups
            return `
              <h2>${typeLabels[type]}</h2>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Barangay</th>
                     <th>Position</th>
                        <th>Contact #</th>
                            <th>Signature</th>
                  </tr>
                </thead>
                <tbody>
                  ${group
                    .map(
                      (leader, index) => `
                    <tr>
                      <td>${index + 1}</td>
                      <td>${leader.v_lname}, ${leader.v_fname} ${
                        leader.v_mname || ""
                      }</td>
                      <td>${leader.barangay}</td>
      <td></td>
      <td></td>
       <td></td>
                    </tr>`
                    )
                    .join("")}
                </tbody>
              </table>`;
          })
          .join("");

        printWindow.document.write(`
          <html>
          <head>
            <title>${barangay} ${year} Leaders</title>
            <style>
              body {
                font-family: 'Poppins', sans-serif;
                margin: 20px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
              }
              th, td {
                border: 1px solid black;
                padding: 8px;
                text-align: left;
              }
              th {
                background-color: #f2f2f2;
              }
              h4 {
                text-align: center;
              }
            </style>
            <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap" rel="stylesheet">
          </head>
          <body>
            <h4>${barangay} ${year}</h4>
            ${groupedHtml || "<p>No data available for this selection.</p>"}
          </body>
          </html>
        `);
      }
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <Container className="mt-5">
      <h1>Leader Report</h1>
      <Row>
      <Col md={2}>
          <Form.Select
            value={reportCategory}
            onChange={(e) => setReportCategory(e.target.value)}
            className="mb-3"
          >
            <option value="laynes_cua">Laynes-Cua</option>
            <option value="cua">Cua</option>
            <option value="laynes">Laynes</option>
          </Form.Select>
        </Col>
        <Col md={2}>
          <Form.Select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="mb-3"
          >
            <option value="list">List</option>
            <option value="summary">Summary</option>
          </Form.Select>
        </Col>
        <Col md={2}>
          <Form.Select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="mb-3"
          >
            <option value="All">All</option>
            {Object.entries(typeLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </Form.Select>
        </Col>
        <Col md={2}>
          <Form.Select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="mb-3"
          >
            <option value="">Select Year</option>
            {["2019", "2022", "2025"].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </Form.Select>
        </Col>
        <Col md={3}>
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
        <Col md={3}>
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
        <Col md={6}>
          <Button
            variant="primary"
            onClick={handleGenerateReport}
            style={{ marginRight: "10px" }}
          >
            Generate Report
          </Button>
          <Button variant="success" onClick={handlePrint}>
            Print Report
          </Button>
        </Col>
        <Col xl={12}>
          {leaders.length > 0 && (
            <>
              {reportType === "summary" ? (
                // Single summary table for all barangays
                <div className="mt-4">
                  <h4>Leader Summary Report (All Barangays)</h4>
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Barangay</th>
                        <th>MC</th>
                        <th>DC</th>
                        <th>BC</th>
                        <th>WL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.keys(getSummaryTotals())
                        .map((barangay, index) => {
                          const total = getSummaryTotals()[barangay];
                          return (
                            <tr key={barangay}>
                              <td>{index + 1}</td>
                              <td>{barangay}</td>
                              <td>{total[4] || 0}</td>
                              <td>{total[3] || 0}</td>
                              <td>{total[2] || 0}</td>
                              <td>{total[1] || 0}</td>
                            </tr>
                          );
                        })
                        .concat(
                          <tr key="total">
                            <td colSpan="2">Total</td>
                            <td>{getTotalSummary()[4] || 0}</td>
                            <td>{getTotalSummary()[3] || 0}</td>
                            <td>{getTotalSummary()[2] || 0}</td>
                            <td>{getTotalSummary()[1] || 0}</td>
                          </tr>
                        )}
                    </tbody>
                  </Table>
                </div>
              ) : (
                // Display report in list format
                <div className="mt-4">
                  {orderedTypes.map((type) => {
                    const group = groupedLeaders[type];
                    return group.length > 0 ? (
                      <div key={type}>
                        <h4>{typeLabels[type]}</h4>
                        <Table striped bordered hover>
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Name</th>
                              <th>Barangay</th>
                              <th>Type</th>
                            </tr>
                          </thead>
                          <tbody>
                            {group.map((leader, index) => (
                              <tr key={leader.v_id}>
                                <td>{index + 1}</td>
                                <td>
                                  {leader.v_lname}, {leader.v_fname}{" "}
                                  {leader.v_mname || ""}
                                </td>
                                <td>{leader.barangay}</td>
                                <td>{typeLabels[leader.type]}</td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                    ) : null;
                  })}
                </div>
              )}
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default LeaderReport;
