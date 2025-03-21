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
      // For combined options ("MCDC" or "BCWL") fetch all then filter locally.
      let queryType = type;
      if (type === "MCDC" || type === "BCWL") {
        queryType = "All";
      }
      const response = await fetch(
        `${getIp()}/getleadersreport?mun=${municipality}&brgy=${barangay}&year=${year}&type=${queryType}&category=${reportCategory}`
      );
      const data = await response.json();
      if (type === "MCDC") {
        setLeaders(data.filter((leader) => leader.type === 4 || leader.type === 3));
      } else if (type === "BCWL") {
        setLeaders(data.filter((leader) => leader.type === 2 || leader.type === 1));
      } else {
        setLeaders(data);
      }
    } catch (error) {
      console.error("Error generating report:", error);
    }
  };

  const groupedLeaders = orderedTypes.reduce((groups, t) => {
    groups[t] = leaders.filter((leader) => leader.type === t);
    return groups;
  }, {});

  // Groups data by municipality then by barangay.
  const getSummaryTotals = () => {
    return leaders.reduce((summary, leader) => {
      const munKey = leader.municipality || "Unknown";
      const brgyKey = leader.barangay || "Unknown";
      const tKey = Number(leader.type);

      if (!summary[munKey]) summary[munKey] = {};
      if (!summary[munKey][brgyKey]) summary[munKey][brgyKey] = {};
      if (!summary[munKey][brgyKey][tKey]) summary[munKey][brgyKey][tKey] = 0;

      summary[munKey][brgyKey][tKey]++;
      return summary;
    }, {});
  };

  const getTotalSummary = () => {
    return leaders.reduce((summary, leader) => {
      const tKey = Number(leader.type);
      if (!summary[tKey]) summary[tKey] = 0;
      summary[tKey]++;
      return summary;
    }, {});
  };

  const getCategoryLabel = () => {
    if (reportCategory === "laynes") return "[Laynes]";
    if (reportCategory === "cua-laynes") return "[Cua-Laynes]";
    return "";
  };

  // Helper function to get header HTML for summary columns (for print view)
  const getSummaryHeaderHTML = () => {
    if (type === "MCDC") {
      return `<th>MC & DC ${getCategoryLabel()}</th>`;
    } else if (type === "BCWL") {
      return `<th>BC & WL ${getCategoryLabel()}</th>`;
    } else if (type === "MC") {
      return `<th>MC ${getCategoryLabel()}</th>`;
    } else if (type === "DC") {
      return `<th>DC ${getCategoryLabel()}</th>`;
    } else if (type === "BC") {
      return `<th>BC ${getCategoryLabel()}</th>`;
    } else if (type === "WL") {
      return `<th>WL ${getCategoryLabel()}</th>`;
    } else {
      // "All" or any other value shows all columns
      return `<th>MC ${getCategoryLabel()}</th>
              <th>DC ${getCategoryLabel()}</th>
              <th>BC ${getCategoryLabel()}</th>
              <th>WL ${getCategoryLabel()}</th>`;
    }
  };

  // Helper function to get cell HTML (for print view) based on totals object
  const getSummaryCellHTML = (totals) => {
    if (type === "MCDC") {
      return `<td>${(totals[4] || 0) + (totals[3] || 0)}</td>`;
    } else if (type === "BCWL") {
      return `<td>${(totals[2] || 0) + (totals[1] || 0)}</td>`;
    } else if (type === "MC") {
      return `<td>${totals[4] || 0}</td>`;
    } else if (type === "DC") {
      return `<td>${totals[3] || 0}</td>`;
    } else if (type === "BC") {
      return `<td>${totals[2] || 0}</td>`;
    } else if (type === "WL") {
      return `<td>${totals[1] || 0}</td>`;
    } else {
      // "All"
      return `<td>${totals[4] || 0}</td>
              <td>${totals[3] || 0}</td>
              <td>${totals[2] || 0}</td>
              <td>${totals[1] || 0}</td>`;
    }
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      if (reportType === "summary") {
        const summary = getSummaryTotals();
        const totalSummary = getTotalSummary();
        let summaryHtml = "";
        if (!municipality) {
          // Province-wide summary view (no Barangay column)
          summaryHtml = `
            <h2>Leader Summary Report (Province-Wide)</h2>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Municipality</th>
                  ${getSummaryHeaderHTML()}
                </tr>
              </thead>
              <tbody>
                ${Object.keys(summary)
                  .map((mun, index) => {
                    const munData = summary[mun];
                    // Sum counts across all barangays in this municipality:
                    const totals = Object.values(munData).reduce((acc, brgyData) => {
                      Object.keys(brgyData).forEach((t) => {
                        acc[t] = (acc[t] || 0) + brgyData[t];
                      });
                      return acc;
                    }, {});
                    return `
                      <tr>
                        <td>${index + 1}</td>
                        <td>${mun}</td>
                        ${getSummaryCellHTML(totals)}
                      </tr>`;
                  })
                  .join("")}
                <tr>
                  ${
                    type === "MCDC"
                      ? `<td colspan="2">Total</td>
                         <td><strong>${(totalSummary[4] || 0) + (totalSummary[3] || 0)}</strong></td>`
                      : type === "BCWL"
                      ? `<td colspan="2">Total</td>
                         <td><strong>${(totalSummary[2] || 0) + (totalSummary[1] || 0)}</strong></td>`
                      : type === "MC"
                      ? `<td colspan="2">Total</td>
                         <td><strong>${totalSummary[4] || 0}</strong></td>`
                      : type === "DC"
                      ? `<td colspan="2">Total</td>
                         <td><strong>${totalSummary[3] || 0}</strong></td>`
                      : type === "BC"
                      ? `<td colspan="2">Total</td>
                         <td><strong>${totalSummary[2] || 0}</strong></td>`
                      : type === "WL"
                      ? `<td colspan="2">Total</td>
                         <td><strong>${totalSummary[1] || 0}</strong></td>`
                      : `<td colspan="2">Total</td>
                         <td><strong>${totalSummary[4] || 0}</strong></td>
                         <td><strong>${totalSummary[3] || 0}</strong></td>
                         <td><strong>${totalSummary[2] || 0}</strong></td>
                         <td><strong>${totalSummary[1] || 0}</strong></td>`
                  }
                </tr>
              </tbody>
            </table>
          `;
        } else {
          // Summary for a specific municipality (grouped by Barangay)
          const munData = summary[municipality] || {};
          summaryHtml = `
            <h2>Leader Summary Report for ${municipality}</h2>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Municipality</th>
                  <th>Barangay</th>
                  ${getSummaryHeaderHTML()}
                </tr>
              </thead>
              <tbody>
                ${Object.keys(munData)
                  .map((brgy, index) => {
                    const total = munData[brgy];
                    return `
                      <tr>
                        <td>${index + 1}</td>
                        <td>${municipality}</td>
                        <td>${brgy}</td>
                        ${getSummaryCellHTML(total)}
                      </tr>`;
                  })
                  .join("")}
              </tbody>
            </table>
          `;
        }

        printWindow.document.write(`
          <html>
            <head>
              <title>${
                !municipality ? "Province-wide" : municipality
              } ${barangay} ${year} Leaders</title>
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
        // List view remains unchanged.
        const groupedHtml = orderedTypes
          .map((t) => {
            const group = groupedLeaders[t];
            if (group.length === 0) return "";
            return `
              <h2>${typeLabels[t]} ${getCategoryLabel()}</h2>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Municipality</th>
                    <th>Barangay</th>
                    <th width='150px'>Signature</th>
                  </tr>
                </thead>
                <tbody>
                  ${group
                    .map(
                      (leader, index) => `
                      <tr>
                        <td>${index + 1}</td>
                        <td>${leader.v_lname}, ${leader.v_fname} ${leader.v_mname || ""}</td>
                        <td>${leader.municipality}</td>
                        <td>${leader.barangay}</td>
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
              <title>${
                !municipality ? "Province-wide" : municipality
              } ${barangay} ${year} Leaders</title>
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
              <h4>${
                !municipality ? "Province-wide Leaders" : municipality
              } ${barangay} ${year}</h4>
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
            <option value="cua-laynes">Cua-Laynes</option>
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
            <option value="All">Select Leader Type</option>
            <option value="MC">Municipal Coordinator</option>
            <option value="DC">District Coordinator</option>
            <option value="BC">Barangay Coordinator</option>
            <option value="WL">Ward Leader</option>
            {/* <option value="MCDC">Municipal &amp; District Coordinator</option> */}
            <option value="BCWL">Barangay &amp; Ward Leader(For List Only)</option>
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
            <option value="">Province-wide</option>
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
                <div className="mt-4">
                  {municipality ? (
                    // When a municipality is selected – group by Barangay.
                    <>
                      <h4>
                        Leader Summary Report for {municipality} {getCategoryLabel()}
                      </h4>
                      <Table striped bordered hover>
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Municipality</th>
                            <th>Barangay</th>
                            {type === "MCDC" ? (
                              <th>MC & DC {getCategoryLabel()}</th>
                            ) : type === "BCWL" ? (
                              <th>BC & WL {getCategoryLabel()}</th>
                            ) : type === "MC" ? (
                              <th>MC {getCategoryLabel()}</th>
                            ) : type === "DC" ? (
                              <th>DC {getCategoryLabel()}</th>
                            ) : type === "BC" ? (
                              <th>BC {getCategoryLabel()}</th>
                            ) : type === "WL" ? (
                              <th>WL {getCategoryLabel()}</th>
                            ) : (
                              <>
                                <th>MC {getCategoryLabel()}</th>
                                <th>DC {getCategoryLabel()}</th>
                                <th>BC {getCategoryLabel()}</th>
                                <th>WL {getCategoryLabel()}</th>
                              </>
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {getSummaryTotals()[municipality] &&
                            Object.keys(getSummaryTotals()[municipality]).map(
                              (brgy, index) => {
                                const total = getSummaryTotals()[municipality][brgy];
                                return (
                                  <tr key={brgy}>
                                    <td>{index + 1}</td>
                                    <td>{municipality}</td>
                                    <td>{brgy}</td>
                                    {type === "MCDC" ? (
                                      <td>
                                        {(total[4] || 0) + (total[3] || 0)}
                                      </td>
                                    ) : type === "BCWL" ? (
                                      <td>
                                        {(total[2] || 0) + (total[1] || 0)}
                                      </td>
                                    ) : type === "MC" ? (
                                      <td>{total[4] || 0}</td>
                                    ) : type === "DC" ? (
                                      <td>{total[3] || 0}</td>
                                    ) : type === "BC" ? (
                                      <td>{total[2] || 0}</td>
                                    ) : type === "WL" ? (
                                      <td>{total[1] || 0}</td>
                                    ) : (
                                      <>
                                        <td>{total[4] || 0}</td>
                                        <td>{total[3] || 0}</td>
                                        <td>{total[2] || 0}</td>
                                        <td>{total[1] || 0}</td>
                                      </>
                                    )}
                                  </tr>
                                );
                              }
                            )}
                          <tr key="total">
                            {type === "MCDC" ? (
                              <>
                                <td colSpan="3">Total</td>
                                <td>
                                  {(getTotalSummary()[4] || 0) +
                                    (getTotalSummary()[3] || 0)}
                                </td>
                              </>
                            ) : type === "BCWL" ? (
                              <>
                                <td colSpan="3">Total</td>
                                <td>
                                  {(getTotalSummary()[2] || 0) +
                                    (getTotalSummary()[1] || 0)}
                                </td>
                              </>
                            ) : type === "MC" ? (
                              <>
                                <td colSpan="3">Total</td>
                                <td>{getTotalSummary()[4] || 0}</td>
                              </>
                            ) : type === "DC" ? (
                              <>
                                <td colSpan="3">Total</td>
                                <td>{getTotalSummary()[3] || 0}</td>
                              </>
                            ) : type === "BC" ? (
                              <>
                                <td colSpan="3">Total</td>
                                <td>{getTotalSummary()[2] || 0}</td>
                              </>
                            ) : type === "WL" ? (
                              <>
                                <td colSpan="3">Total</td>
                                <td>{getTotalSummary()[1] || 0}</td>
                              </>
                            ) : (
                              <>
                                <td colSpan="3">Total</td>
                                <td>{getTotalSummary()[4] || 0}</td>
                                <td>{getTotalSummary()[3] || 0}</td>
                                <td>{getTotalSummary()[2] || 0}</td>
                                <td>{getTotalSummary()[1] || 0}</td>
                              </>
                            )}
                          </tr>
                        </tbody>
                      </Table>
                    </>
                  ) : (
                    // Province-wide summary – group by Municipality only (no Barangay column)
                    <>
                      <h4>
                        Leader Summary Report (Province-wide) {getCategoryLabel()}
                      </h4>
                      <Table striped bordered hover>
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Municipality</th>
                            {type === "MCDC" ? (
                              <th>MC & DC {getCategoryLabel()}</th>
                            ) : type === "BCWL" ? (
                              <th>BC & WL {getCategoryLabel()}</th>
                            ) : type === "MC" ? (
                              <th>MC {getCategoryLabel()}</th>
                            ) : type === "DC" ? (
                              <th>DC {getCategoryLabel()}</th>
                            ) : type === "BC" ? (
                              <th>BC {getCategoryLabel()}</th>
                            ) : type === "WL" ? (
                              <th>WL {getCategoryLabel()}</th>
                            ) : (
                              <>
                                <th>MC {getCategoryLabel()}</th>
                                <th>DC {getCategoryLabel()}</th>
                                <th>BC {getCategoryLabel()}</th>
                                <th>WL {getCategoryLabel()}</th>
                              </>
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {Object.keys(getSummaryTotals()).map((mun, index) => {
                            const munData = getSummaryTotals()[mun];
                            const totals = Object.values(munData).reduce(
                              (acc, brgyData) => {
                                Object.keys(brgyData).forEach((t) => {
                                  acc[t] = (acc[t] || 0) + brgyData[t];
                                });
                                return acc;
                              },
                              {}
                            );
                            return (
                              <tr key={mun}>
                                <td>{index + 1}</td>
                                <td>{mun}</td>
                                {type === "MCDC" ? (
                                  <td>
                                    {(totals[4] || 0) + (totals[3] || 0)}
                                  </td>
                                ) : type === "BCWL" ? (
                                  <td>
                                    {(totals[2] || 0) + (totals[1] || 0)}
                                  </td>
                                ) : type === "MC" ? (
                                  <td>{totals[4] || 0}</td>
                                ) : type === "DC" ? (
                                  <td>{totals[3] || 0}</td>
                                ) : type === "BC" ? (
                                  <td>{totals[2] || 0}</td>
                                ) : type === "WL" ? (
                                  <td>{totals[1] || 0}</td>
                                ) : (
                                  <>
                                    <td>{totals[4] || 0}</td>
                                    <td>{totals[3] || 0}</td>
                                    <td>{totals[2] || 0}</td>
                                    <td>{totals[1] || 0}</td>
                                  </>
                                )}
                              </tr>
                            );
                          })}
                          <tr key="total">
                            {type === "MCDC" ? (
                              <>
                                <td colSpan="2">Total</td>
                                <td>
                                  {(getTotalSummary()[4] || 0) +
                                    (getTotalSummary()[3] || 0)}
                                </td>
                              </>
                            ) : type === "BCWL" ? (
                              <>
                                <td colSpan="2">Total</td>
                                <td>
                                  {(getTotalSummary()[2] || 0) +
                                    (getTotalSummary()[1] || 0)}
                                </td>
                              </>
                            ) : type === "MC" ? (
                              <>
                                <td colSpan="2">Total</td>
                                <td>{getTotalSummary()[4] || 0}</td>
                              </>
                            ) : type === "DC" ? (
                              <>
                                <td colSpan="2">Total</td>
                                <td>{getTotalSummary()[3] || 0}</td>
                              </>
                            ) : type === "BC" ? (
                              <>
                                <td colSpan="2">Total</td>
                                <td>{getTotalSummary()[2] || 0}</td>
                              </>
                            ) : type === "WL" ? (
                              <>
                                <td colSpan="2">Total</td>
                                <td>{getTotalSummary()[1] || 0}</td>
                              </>
                            ) : (
                              <>
                                <td colSpan="2">Total</td>
                                <td>{getTotalSummary()[4] || 0}</td>
                                <td>{getTotalSummary()[3] || 0}</td>
                                <td>{getTotalSummary()[2] || 0}</td>
                                <td>{getTotalSummary()[1] || 0}</td>
                              </>
                            )}
                          </tr>
                        </tbody>
                      </Table>
                    </>
                  )}
                </div>
              ) : (
                // List view remains unchanged.
                <div className="mt-4">
                  {orderedTypes.map((t) => {
                    const group = groupedLeaders[t];
                    return group.length > 0 ? (
                      <div key={t}>
                        <h4>
                          {typeLabels[t]} {getCategoryLabel()}
                        </h4>
                        <Table striped bordered hover>
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Name</th>
                              <th>Municipality</th>
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
                                <td>{leader.municipality}</td>
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
