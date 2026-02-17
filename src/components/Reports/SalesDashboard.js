import { useMemo, useState, useRef } from "react";
import { MultiSelect } from "primereact/multiselect";
import { Card } from "primereact/card";
import { Dropdown } from "primereact/dropdown";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Chart } from "primereact/chart";
import { Toast } from "primereact/toast";
import CardDashboard from "./CardDashboard";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Dialog } from "primereact/dialog";
import "./SalesDashboard.css";
import { segments, clients, salesData, salesDataByProduct } from "./mockData";

const formatCurrency = (value = 0) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);

const PRODUCT_COLORS = [
  "#FF6384",
  "#36A2EB",
  "#FFCE56",
  "#4BC0C0",
  "#9966FF",
  "#FF9F40",
  "#C9CBCF",
  "#FF5733",
  "#33FF57",
  "#5733FF",
];

const SEGMENT_COLORS = [
  "rgba(255, 99, 132, 0.5)",
  "rgba(54, 162, 235, 0.5)",
  "rgba(255, 206, 86, 0.5)",
  "rgba(75, 192, 192, 0.5)",
  "rgba(153, 102, 255, 0.5)",
  "rgba(255, 159, 64, 0.5)",
];

const SEGMENT_BORDER_COLORS = [
  "rgba(255, 99, 132, 1)",
  "rgba(54, 162, 235, 1)",
  "rgba(255, 206, 86, 1)",
  "rgba(75, 192, 192, 1)",
  "rgba(153, 102, 255, 1)",
  "rgba(255, 159, 64, 1)",
];

const SalesDashboard = () => {
  const toast = useRef(null);
  const [selectedSegments, setSelectedSegments] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [topProductsCount, setTopProductsCount] = useState(5);

  const filteredSales = useMemo(() => {
    if (!selectedSegments.length) {
      return salesData;
    }

    return salesData.filter((sale) =>
      selectedSegments.some((seg) => String(seg) === String(sale.segment))
    );
  }, [selectedSegments]);

  const filteredClients = useMemo(() => {
    if (!selectedSegments.length) {
      return clients;
    }

    return clients.filter((client) => {
      const normalizedClientSegment = client.segment
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "_");

      return selectedSegments.some((seg) => seg === normalizedClientSegment);
    });
  }, [selectedSegments]);

  const totalSales = useMemo(
    () => filteredSales.reduce((acc, sale) => acc + sale.amount, 0),
    [filteredSales]
  );

  const totalSalesCount = useMemo(
    () => filteredSales.reduce((acc, sale) => acc + sale.count, 0),
    [filteredSales]
  );

  const dynamicKpis = useMemo(
    () => [
      {
        title: "Ventas Totales",
        value: formatCurrency(totalSales),
        icon: "pi-dollar",
        iconBgColor: "#4CAF50",
        borderColor: "#4CAF50",
      },
      {
        title: "Clientes Activos",
        value: filteredClients.length,
        icon: "pi-users",
        iconBgColor: "#FF9800",
        borderColor: "#FF9800",
      },
      {
        title: "Cantidad de Ventas",
        value: totalSalesCount,
        icon: "pi-shopping-cart",
        iconBgColor: "#2196F3",
        borderColor: "#2196F3",
      },
    ],
    [filteredClients.length, totalSales, totalSalesCount]
  );

  const salesBySegmentData = useMemo(() => {
    const salesBySegmentMap = filteredSales.reduce((acc, sale) => {
      acc[sale.segment] = (acc[sale.segment] || 0) + sale.amount;
      return acc;
    }, {});

    const labels = Object.keys(salesBySegmentMap);
    const values = Object.values(salesBySegmentMap);

    return {
      labels,
      datasets: [
        {
          label: "Ventas",
          data: values,
          backgroundColor: labels.map(
            (_, index) => SEGMENT_COLORS[index % SEGMENT_COLORS.length]
          ),
          borderColor: labels.map(
            (_, index) => SEGMENT_BORDER_COLORS[index % SEGMENT_BORDER_COLORS.length]
          ),
          borderWidth: 1,
        },
      ],
    };
  }, [filteredSales]);

  const pieChartData = useMemo(() => {
    const filteredSegmentSales = selectedSegments.length
      ? salesDataByProduct.filter((sale) =>
          selectedSegments.some((segment) => String(segment) === String(sale.segment))
        )
      : salesDataByProduct;

    const salesByProduct = filteredSegmentSales.reduce((acc, sale) => {
      acc[sale.product] = (acc[sale.product] || 0) + sale.amount;
      return acc;
    }, {});

    const sortedProducts = Object.entries(salesByProduct)
      .sort((a, b) => b[1] - a[1])
      .slice(0, topProductsCount);

    return {
      labels: sortedProducts.map(([product]) => product),
      datasets: [
        {
          data: sortedProducts.map(([, value]) => value),
          backgroundColor: PRODUCT_COLORS,
        },
      ],
    };
  }, [selectedSegments, topProductsCount]);

  const topProductsData = useMemo(() => {
    if (!selectedClient || !Array.isArray(selectedClient.purchases)) {
      return [];
    }

    const purchasesByProduct = selectedClient.purchases.reduce((acc, purchase) => {
      acc[purchase.product] = (acc[purchase.product] || 0) + purchase.amount;
      return acc;
    }, {});

    return Object.entries(purchasesByProduct)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [selectedClient]);

  const barChartData = useMemo(
    () => ({
      labels: topProductsData.map(([product]) => product),
      datasets: [
        {
          label: "Total Comprado",
          data: topProductsData.map(([, amount]) => amount),
          backgroundColor: [
            "rgba(255, 99, 132, 0.6)",
            "rgba(54, 162, 235, 0.6)",
            "rgba(255, 206, 86, 0.6)",
            "rgba(75, 192, 192, 0.6)",
            "rgba(153, 102, 255, 0.6)",
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(153, 102, 255, 1)",
          ],
          borderWidth: 1,
        },
      ],
    }),
    [topProductsData]
  );

  const segmentChartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      aspectRatio: 0.8,
      scales: {
        y: {
          ticks: {
            callback: (value) => formatCurrency(value),
          },
        },
      },
    }),
    []
  );

  const pieChartOptions = useMemo(
    () => ({
      responsive: true,
      aspectRatio: 1,
      plugins: {
        datalabels: {
          display: true,
          formatter: (value) => formatCurrency(value),
          color: "#000",
          font: { size: 12, weight: "bold" },
        },
      },
    }),
    []
  );

  const barChartOptions = useMemo(
    () => ({
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      aspectRatio: 0.9,
      plugins: {
        datalabels: {
          display: true,
          color: "#111827",
          formatter: (value) => formatCurrency(value),
        },
      },
      scales: {
        x: {
          ticks: {
            callback: (value) => {
              if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
              if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
              return value;
            },
            maxRotation: 0,
            autoSkip: true,
          },
        },
      },
    }),
    []
  );

  const openModal = (client) => {
    setSelectedClient(client);
    setShowModal(true);
    toast.current?.show({
      severity: "info",
      summary: "Cliente seleccionado",
      detail: client.name,
      life: 1800,
    });
  };

  const renderClientName = (rowData) => (
    <button
      type="button"
      className="sales-dashboard__link-btn"
      onClick={() => openModal(rowData)}
    >
      {rowData.name}
    </button>
  );

  return (
    <div className="sales-dashboard">
      <div className="sales-dashboard__header">
        <h2 className="sales-dashboard__title">Dashboard de Ventas</h2>
      </div>
      <Toast ref={toast} />

      <Card className="sales-dashboard__filters-card">
        <div className="sales-dashboard__filters">
          <MultiSelect
            value={selectedSegments}
            options={segments}
            onChange={(e) => setSelectedSegments(e.value)}
            optionLabel="label"
            placeholder="Selecciona segmento(s)"
            display="chip"
            className="sales-dashboard__segments"
          />

          <Dropdown
            value={topProductsCount}
            options={[
              { label: "Top 3", value: 3 },
              { label: "Top 5", value: 5 },
              { label: "Top 10", value: 10 },
            ]}
            onChange={(e) => setTopProductsCount(e.value)}
            className="sales-dashboard__dropdown"
          />
        </div>
      </Card>

      <Card className="mb-2">
        <div className="section kpi-section">
          {dynamicKpis.map((kpi, index) => (
            <CardDashboard key={index} {...kpi} />
          ))}
        </div>
      </Card>

      <div className="section datatable-section">
        <Card title="Clientes del Segmento">
          <DataTable value={filteredClients} paginator rows={5} className="mt-3" responsiveLayout="scroll">
            <Column field="segment" header="Segmento" sortable />
            <Column field="name" header="Cliente" sortable body={renderClientName} />
            <Column
              field="totalSales"
              header="Total de Ventas"
              body={(rowData) => formatCurrency(rowData.totalSales)}
              sortable
            />
            <Column field="lastSale" header="Última Venta" sortable />
          </DataTable>
        </Card>
      </div>

      <div className="section charts-section">
        <div className="chart-container">
          <Card title="Ventas por Segmento">
            <div className="sales-dashboard__chart-wrap">
              <Chart type="bar" data={salesBySegmentData} options={segmentChartOptions} />
            </div>
          </Card>
        </div>

        <div className="chart-container">
          <Card title="Productos Más Vendidos">
            <div className="sales-dashboard__chart-wrap">
              <Chart
                type="pie"
                data={pieChartData}
                options={pieChartOptions}
                plugins={[ChartDataLabels]}
              />
            </div>
          </Card>
        </div>
      </div>

      <Dialog
        visible={showModal && !!selectedClient}
        onHide={() => setShowModal(false)}
        header={`Cliente: ${selectedClient?.name}`}
        style={{ width: "70vw" }}
        className="custom-modal"
      >
        {selectedClient ? (
          <div>
            <div className="mb-4 sales-dashboard__client-meta">
              <p>
                <strong>Total Compras:</strong> {formatCurrency(selectedClient.totalSales)}
              </p>
              <p>
                <strong>Última Compra:</strong> {selectedClient.lastSale}
              </p>
            </div>

            <DataTable value={selectedClient.sales || []} className="p-datatable-sm" responsiveLayout="scroll">
              <Column field="invoiceNumber" header="Factura" style={{ width: "20%" }} />
              <Column field="date" header="Fecha" style={{ width: "20%" }} />
              <Column
                field="amount"
                header="Valor"
                body={(rowData) => formatCurrency(rowData.amount)}
                style={{ width: "20%" }}
              />
            </DataTable>

            <h3 className="sales-dashboard__subtitle">Top 5 Productos Más Comprados</h3>
            <div className="sales-dashboard__chart-wrap sales-dashboard__chart-wrap--modal">
              <Chart
                type="bar"
                data={barChartData}
                options={barChartOptions}
                plugins={[ChartDataLabels]}
              />
            </div>
          </div>
        ) : null}
      </Dialog>
    </div>
  );
};

export default SalesDashboard;
