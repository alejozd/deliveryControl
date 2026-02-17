// mockData.js

export const segments = [
  { id: 1, label: "Persona Natural", value: "persona_natural" },
  { id: 2, label: "Persona Jurídica", value: "persona_juridica" },
  { id: 3, label: "Constructora", value: "constructora" },
  { id: 4, label: "Distribuidor/Depósito", value: "distribuidor_deposito" },
  { id: 5, label: "Maestro/Contratista", value: "maestro_contratista" },
  { id: 6, label: "Arq/Diseñador", value: "arq_disenador" },
  { id: 7, label: "Consorcio", value: "consorcio" },
];

// Datos de ventas por segmento
export const salesData = [
  { segment: "persona_natural", amount: 50000, count: 10 },
  { segment: "persona_juridica", amount: 120000, count: 20 },
  { segment: "constructora", amount: 200000, count: 15 },
  { segment: "distribuidor_deposito", amount: 180000, count: 12 },
  { segment: "maestro_contratista", amount: 75000, count: 8 },
  { segment: "arq_disenador", amount: 60000, count: 5 },
  { segment: "consorcio", amount: 90000, count: 9 },
];

export const salesDataByProduct = [
  { segment: "persona_natural", product: "Cemento", amount: 25000 },
  { segment: "persona_natural", product: "Ladrillos", amount: 20000 },
  { segment: "persona_natural", product: "Pintura", amount: 15000 },
  { segment: "persona_natural", product: "Yeso", amount: 10000 },
  { segment: "persona_natural", product: "Pegante", amount: 12000 },

  { segment: "persona_juridica", product: "Hierro", amount: 50000 },
  { segment: "persona_juridica", product: "Madera", amount: 40000 },
  { segment: "persona_juridica", product: "Tubería PVC", amount: 30000 },
  { segment: "persona_juridica", product: "Ventanas Aluminio", amount: 35000 },
  { segment: "persona_juridica", product: "Adoquines", amount: 25000 },

  { segment: "constructora", product: "Concreto", amount: 100000 },
  { segment: "constructora", product: "Acero Corrugado", amount: 80000 },
  { segment: "constructora", product: "Tejas", amount: 60000 },
  { segment: "constructora", product: "Puertas Metálicas", amount: 70000 },
  { segment: "constructora", product: "Mortero", amount: 50000 },

  {
    segment: "distribuidor_deposito",
    product: "Bloques de Cemento",
    amount: 45000,
  },
  { segment: "distribuidor_deposito", product: "Arena", amount: 30000 },
  { segment: "distribuidor_deposito", product: "Cal", amount: 25000 },
  { segment: "distribuidor_deposito", product: "Grava", amount: 35000 },
  { segment: "distribuidor_deposito", product: "Varilla", amount: 50000 },

  { segment: "maestro_contratista", product: "Plomería", amount: 60000 },
  { segment: "maestro_contratista", product: "Electricidad", amount: 55000 },
  { segment: "maestro_contratista", product: "Pisos Cerámicos", amount: 50000 },
  {
    segment: "maestro_contratista",
    product: "Accesorios de Baño",
    amount: 45000,
  },
  {
    segment: "maestro_contratista",
    product: "Impermeabilizante",
    amount: 40000,
  },

  { segment: "arq_disenador", product: "Revestimientos", amount: 50000 },
  { segment: "arq_disenador", product: "Papel Tapiz", amount: 30000 },
  { segment: "arq_disenador", product: "Iluminación LED", amount: 40000 },
  { segment: "arq_disenador", product: "Mobiliario", amount: 60000 },
  { segment: "arq_disenador", product: "Persianas", amount: 25000 },

  { segment: "consorcio", product: "Tubería de Acero", amount: 90000 },
  { segment: "consorcio", product: "Cables Industriales", amount: 85000 },
  { segment: "consorcio", product: "Señalización Vial", amount: 70000 },
  { segment: "consorcio", product: "Andamios", amount: 95000 },
  { segment: "consorcio", product: "Puentes Modulares", amount: 120000 },
];

// Datos de ejemplo para los KPIs
export const kpis = [
  {
    title: "Ventas Totales",
    value: "$10,000",
    icon: "pi-dollar",
    iconBgColor: "#4CAF50",
  },
  {
    title: "Clientes Activos",
    value: "150",
    icon: "pi-users",
    iconBgColor: "#FF9800",
  },
  {
    title: "Pedidos Pendientes",
    value: "25",
    icon: "pi-shopping-cart",
    iconBgColor: "#F44336",
  },
];

export const clients = [
  {
    id: 1,
    name: "Juan Pérez",
    segment: "PERSONA NATURAL",
    totalSales: 5000000,
    lastSale: "2024-02-10",
    sales: [
      { invoiceNumber: "FAC-001", date: "2023-08-10", amount: 1000000 },
      { invoiceNumber: "FAC-002", date: "2023-09-15", amount: 4000000 },
      { invoiceNumber: "FAC-003", date: "2023-10-20", amount: 2000000 },
      { invoiceNumber: "FAC-004", date: "2023-11-25", amount: 3000000 },
    ],
    purchases: [
      { product: "Cemento", quantity: 50, amount: 500000 },
      { product: "Ladrillos", quantity: 200, amount: 1000000 },
      { product: "Pintura", quantity: 10, amount: 300000 },
      { product: "Yeso", quantity: 30, amount: 200000 },
    ],
  },
  {
    id: 2,
    name: "Construcciones Modernas S.A.S.",
    segment: "CONSTRUCTORA",
    totalSales: 12000000,
    lastSale: "2024-02-15",
    sales: [
      { invoiceNumber: "FAC-005", date: "2023-07-25", amount: 5000000 },
      { invoiceNumber: "FAC-006", date: "2023-09-20", amount: 7000000 },
      { invoiceNumber: "FAC-007", date: "2023-10-10", amount: 3000000 },
      { invoiceNumber: "FAC-008", date: "2023-12-05", amount: 4000000 },
    ],
    purchases: [
      { product: "Hierro", quantity: 100, amount: 2000000 },
      { product: "Madera", quantity: 50, amount: 1500000 },
      { product: "Tubería PVC", quantity: 200, amount: 1000000 },
      { product: "Ventanas Aluminio", quantity: 10, amount: 500000 },
    ],
  },
  {
    id: 3,
    name: "Distribuidora El Sol Ltda.",
    segment: "DISTRIBUIDOR/DEPOSITO",
    totalSales: 7500000,
    lastSale: "2024-02-12",
    sales: [
      { invoiceNumber: "FAC-009", date: "2023-07-12", amount: 3000000 },
      { invoiceNumber: "FAC-010", date: "2023-09-22", amount: 4500000 },
      { invoiceNumber: "FAC-011", date: "2023-11-15", amount: 2000000 },
      { invoiceNumber: "FAC-012", date: "2023-12-30", amount: 1500000 },
    ],
    purchases: [
      { product: "Adoquines", quantity: 300, amount: 1500000 },
      { product: "Concreto", quantity: 50, amount: 2000000 },
      { product: "Acero Corrugado", quantity: 20, amount: 1000000 },
      { product: "Tejas", quantity: 100, amount: 500000 },
    ],
  },
  {
    id: 4,
    name: "María López",
    segment: "PERSONA NATURAL",
    totalSales: 3000000,
    lastSale: "2024-01-20",
    sales: [
      { invoiceNumber: "FAC-013", date: "2023-06-05", amount: 1000000 },
      { invoiceNumber: "FAC-014", date: "2023-12-10", amount: 2000000 },
      { invoiceNumber: "FAC-015", date: "2023-08-15", amount: 1500000 },
      { invoiceNumber: "FAC-016", date: "2023-09-30", amount: 1000000 },
    ],
    purchases: [
      { product: "Puertas Metálicas", quantity: 5, amount: 500000 },
      { product: "Mortero", quantity: 20, amount: 300000 },
      { product: "Arena", quantity: 100, amount: 200000 },
      { product: "Cal", quantity: 50, amount: 100000 },
    ],
  },
  {
    id: 5,
    name: "Constructora Futuro S.A.",
    segment: "CONSTRUCTORA",
    totalSales: 20000000,
    lastSale: "2024-02-05",
    sales: [
      { invoiceNumber: "FAC-017", date: "2023-05-15", amount: 8000000 },
      { invoiceNumber: "FAC-018", date: "2023-11-25", amount: 12000000 },
      { invoiceNumber: "FAC-019", date: "2023-07-01", amount: 5000000 },
      { invoiceNumber: "FAC-020", date: "2023-10-15", amount: 7000000 },
    ],
    purchases: [
      { product: "Grava", quantity: 200, amount: 1000000 },
      { product: "Plomería", quantity: 10, amount: 500000 },
      { product: "Electricidad", quantity: 15, amount: 750000 },
      { product: "Pisos Cerámicos", quantity: 50, amount: 250000 },
    ],
  },
  {
    id: 6,
    name: "Depósito Central Ltda.",
    segment: "DISTRIBUIDOR/DEPOSITO",
    totalSales: 10000000,
    lastSale: "2024-01-30",
    sales: [
      { invoiceNumber: "FAC-021", date: "2023-08-01", amount: 4000000 },
      { invoiceNumber: "FAC-022", date: "2023-10-15", amount: 6000000 },
      { invoiceNumber: "FAC-023", date: "2023-09-05", amount: 3000000 },
      { invoiceNumber: "FAC-024", date: "2023-12-20", amount: 2000000 },
    ],
    purchases: [
      { product: "Cemento", quantity: 100, amount: 1000000 },
      { product: "Ladrillos", quantity: 300, amount: 1500000 },
      { product: "Pintura", quantity: 20, amount: 600000 },
      { product: "Yeso", quantity: 50, amount: 250000 },
    ],
  },
  {
    id: 7,
    name: "Carlos Ramírez",
    segment: "PERSONA NATURAL",
    totalSales: 2500000,
    lastSale: "2024-02-01",
    sales: [
      { invoiceNumber: "FAC-025", date: "2023-09-01", amount: 1000000 },
      { invoiceNumber: "FAC-026", date: "2023-12-15", amount: 1500000 },
      { invoiceNumber: "FAC-027", date: "2023-07-20", amount: 1000000 },
      { invoiceNumber: "FAC-028", date: "2023-11-10", amount: 1000000 },
    ],
    purchases: [
      { product: "Grava", quantity: 200, amount: 1000000 },
      { product: "Plomería", quantity: 10, amount: 500000 },
      { product: "Electricidad", quantity: 15, amount: 750000 },
      { product: "Pisos Cerámicos", quantity: 50, amount: 250000 },
    ],
  },
  {
    id: 8,
    name: "Inmobiliaria Los Andes S.A.",
    segment: "CONSTRUCTORA",
    totalSales: 15000000,
    lastSale: "2024-02-18",
    sales: [
      { invoiceNumber: "FAC-029", date: "2023-07-10", amount: 6000000 },
      { invoiceNumber: "FAC-030", date: "2023-11-05", amount: 9000000 },
      { invoiceNumber: "FAC-031", date: "2023-08-25", amount: 5000000 },
      { invoiceNumber: "FAC-032", date: "2023-10-30", amount: 7000000 },
    ],
    purchases: [
      { product: "Puertas Metálicas", quantity: 5, amount: 500000 },
      { product: "Mortero", quantity: 20, amount: 300000 },
      { product: "Arena", quantity: 100, amount: 200000 },
      { product: "Cal", quantity: 50, amount: 100000 },
    ],
  },
  {
    id: 9,
    name: "Distribuidora Norte Ltda.",
    segment: "DISTRIBUIDOR/DEPOSITO",
    totalSales: 8000000,
    lastSale: "2024-02-14",
    sales: [
      { invoiceNumber: "FAC-033", date: "2023-06-20", amount: 3000000 },
      { invoiceNumber: "FAC-034", date: "2023-10-30", amount: 5000000 },
      { invoiceNumber: "FAC-035", date: "2023-09-10", amount: 2000000 },
      { invoiceNumber: "FAC-036", date: "2023-12-01", amount: 3000000 },
    ],
    purchases: [
      { product: "Puertas Metálicas", quantity: 5, amount: 500000 },
      { product: "Mortero", quantity: 20, amount: 300000 },
      { product: "Arena", quantity: 100, amount: 200000 },
      { product: "Cal", quantity: 50, amount: 100000 },
    ],
  },
  {
    id: 10,
    name: "Laura Gómez",
    segment: "PERSONA NATURAL",
    totalSales: 4000000,
    lastSale: "2024-01-25",
    sales: [
      { invoiceNumber: "FAC-037", date: "2023-08-15", amount: 2000000 },
      { invoiceNumber: "FAC-038", date: "2023-12-01", amount: 2000000 },
      { invoiceNumber: "FAC-039", date: "2023-07-05", amount: 1500000 },
      { invoiceNumber: "FAC-040", date: "2023-11-20", amount: 2500000 },
    ],
    purchases: [
      { product: "Cemento", quantity: 50, amount: 500000 },
      { product: "Ladrillos", quantity: 200, amount: 1000000 },
      { product: "Pintura", quantity: 10, amount: 300000 },
      { product: "Yeso", quantity: 30, amount: 200000 },
    ],
  },
  {
    id: 11,
    name: "Comercializadora Sur Ltda.",
    segment: "DISTRIBUIDOR/DEPOSITO",
    totalSales: 6000000,
    lastSale: "2024-02-20",
    sales: [
      { invoiceNumber: "FAC-041", date: "2023-09-15", amount: 2000000 },
      { invoiceNumber: "FAC-042", date: "2023-11-10", amount: 4000000 },
      { invoiceNumber: "FAC-043", date: "2023-08-05", amount: 3000000 },
      { invoiceNumber: "FAC-044", date: "2023-12-25", amount: 3000000 },
    ],
    purchases: [
      { product: "Puertas Metálicas", quantity: 5, amount: 500000 },
      { product: "Mortero", quantity: 20, amount: 300000 },
      { product: "Arena", quantity: 100, amount: 200000 },
      { product: "Cal", quantity: 50, amount: 100000 },
    ],
  },
  {
    id: 12,
    name: "Constructora Alfa S.A.",
    segment: "CONSTRUCTORA",
    totalSales: 18000000,
    lastSale: "2024-02-25",
    sales: [
      { invoiceNumber: "FAC-045", date: "2023-06-15", amount: 7000000 },
      { invoiceNumber: "FAC-046", date: "2023-10-20", amount: 11000000 },
      { invoiceNumber: "FAC-047", date: "2023-09-01", amount: 5000000 },
      { invoiceNumber: "FAC-048", date: "2023-12-10", amount: 6000000 },
    ],
    purchases: [
      { product: "Puertas Metálicas", quantity: 6, amount: 500000 },
      { product: "Mortero", quantity: 23, amount: 300000 },
      { product: "Arena", quantity: 150, amount: 200000 },
      { product: "Cal", quantity: 54, amount: 100000 },
    ],
  },
];

export const productsData = {
  labels: ["Cemento", "Piso", "Sanitario", "Lavamanos"],
  datasets: [
    {
      data: [40, 30, 20, 10],
      backgroundColor: ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"],
      hoverBackgroundColor: ["#64B5F6", "#81C784", "#FFB74D", "#FFA07A"],
    },
  ],
};
