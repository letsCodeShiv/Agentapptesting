import React from "react";
import { Modal, Container, Row, Col } from "react-bootstrap";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AgentAnalysisModal = ({ show, handleClose, analysisData }) => {
  // Function to format chart data
  const formatChartData = (data, label) => {
    if (!data) return { labels: [], datasets: [] };

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const previousDate = new Date(currentDate);
    previousDate.setMonth(currentMonth - 1);
    const previousMonth = previousDate.getMonth();
    const previousYear = previousDate.getFullYear();

    const dates = Object.keys(data);
    const labels = [];
    const totalValues = [];
    const groupDatasets = {};

    dates.forEach((date) => {
      const dateObj = new Date(date);
      if (
        (dateObj.getFullYear() === currentYear &&
          dateObj.getMonth() === currentMonth) ||
        (dateObj.getFullYear() === previousYear &&
          dateObj.getMonth() === previousMonth)
      ) {
        let label;
        if (
          dateObj.getFullYear() === currentYear &&
          dateObj.getMonth() === currentMonth
        ) {
          label = "This Month";
        } else if (
          dateObj.getFullYear() === previousYear &&
          dateObj.getMonth() === previousMonth
        ) {
          label = "Previous Month";
        }

        labels.push(label);

        const totalValue = data[date].total_value?.value || 0;
        totalValues.push(totalValue);

        const groupValues = data[date].group_values || {};
        Object.keys(groupValues).forEach((group) => {
          if (group === "period" || group === "msg") return;

          if (!groupDatasets[group]) {
            groupDatasets[group] = {
              label: group,
              data: Array(labels.length - 1).fill(0),
              backgroundColor: `rgba(${Math.floor(
                Math.random() * 256
              )}, ${Math.floor(Math.random() * 256)}, ${Math.floor(
                Math.random() * 256
              )}, 0.6)`, // Random color generator
            };
          }
          groupDatasets[group].data.push(groupValues[group][0] || 0);
        });

        // Fill missing groups with zero for alignment
        Object.keys(groupDatasets).forEach((group) => {
          if (groupDatasets[group].data.length < labels.length) {
            groupDatasets[group].data.push(0);
          }
        });
      }
    });

    return {
      labels,
      datasets: [
        {
          label,
          data: totalValues,
          backgroundColor: `rgba(${Math.floor(
            Math.random() * 256
          )}, ${Math.floor(Math.random() * 256)}, ${Math.floor(
            Math.random() * 256
          )}, 0.6)`, // Random color generator
        },
        ...Object.values(groupDatasets),
      ],
    };
  };
  
  // Check if chart data has no total values for current and previous month
  const hasNoTotalValues = (data) => {
    if (!data) return true;

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const previousDate = new Date(currentDate);
    previousDate.setMonth(currentMonth - 1);
    const previousMonth = previousDate.getMonth();
    const previousYear = previousDate.getFullYear();

    return !Object.keys(data).some((date) => {
      const dateObj = new Date(date);
      const isCurrentOrPreviousMonth =
        (dateObj.getFullYear() === currentYear &&
          dateObj.getMonth() === currentMonth) ||
        (dateObj.getFullYear() === previousYear &&
          dateObj.getMonth() === previousMonth);

      return isCurrentOrPreviousMonth && data[date].total_value?.value;
    });
  };

  // Format data for each KPI
  const { ticketsData, csrData, nrrData } = analysisData;
  const ticketsChartData = formatChartData(ticketsData, "Total Tickets Solved");
  const csrChartData = formatChartData(
    csrData,
    "Customer Satisfaction Rate (mean)"
  );
  const nrrChartData = formatChartData(
    nrrData,
    "Negative Response Rate(NRR) (mean)"
  );

  // Common chart options
  const chartOptions = {
    responsive: true,
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        grid: {
          display: true,
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: "bottom", // Move legend below the chart
      },
    },
    elements: {
      bar: {
        borderWidth: 0, // Remove bar border
        maxBarThickness: 40, // Maximum bar thickness
      },
    },
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Agent Performance Analysis</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Container fluid>
          <Row className="mb-4">
            <Col xs={12}>
              <h5>Total Tickets Solved</h5>
              {hasNoTotalValues(ticketsData) ? (
                <div className="no-data">No Data Available</div>
              ) : (
                <Bar data={ticketsChartData} options={chartOptions} />
              )}
            </Col>
          </Row>
          <Row className="mb-4">
            <Col xs={12}>
              <h5>Customer Satisfaction Rate</h5>
              {hasNoTotalValues(csrData) ? (
                <div className="no-data">No Data Available</div>
              ) : (
                <Bar data={csrChartData} options={chartOptions} />
              )}
            </Col>
          </Row>
          <Row className="mb-4">
            <Col xs={12}>
              <h5>Negative Response Rate</h5>
              {hasNoTotalValues(nrrData) ? (
                <div className="no-data">No Data Available</div>
              ) : (
                <Bar data={nrrChartData} options={chartOptions} />
              )}
            </Col>
          </Row>
        </Container>
      </Modal.Body>
    </Modal>
  );
};

export default AgentAnalysisModal;

