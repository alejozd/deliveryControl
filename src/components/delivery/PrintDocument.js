import logo from "../../resources/images/logo-metro.png";

const formatSafe = (value) => String(value ?? "");

const buildNotasHtml = (notas = "") =>
  formatSafe(notas)
    .split("\n")
    .map((line) => `<label>${line}</label>`)
    .join("<br>");

const buildDetalleRows = (detalle = [], isConfirmationModal) =>
  detalle
    .map(
      (item) => `
  <tr>
    <td class="producto-content">${formatSafe(item.nombreproductos)}</td>
    <td class="cantidad-content">${Number(item.cantfacturada || 0).toFixed(2)}</td>
    <td class="cantidad-content">${
      isConfirmationModal
        ? Number(item.cantidad_entregar || 0).toFixed(2)
        : Number(item.cant_entregada || 0).toFixed(2)
    }</td>
  </tr>
  `
    )
    .join("");

const buildHtml = ({ factura, isConfirmationModal }) => {
  const cantidadHeader = isConfirmationModal
    ? "Cant. a Entregar"
    : "Cant. Entregada";

  return `
  <html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Entrega de Mercancía - ${formatSafe(factura.numeroentrega)}</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 20px; color: #1f2937; }
      .container { max-width: 820px; margin: auto; border: 1px solid #111; padding: 14px; }
      .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
      .title { text-align: center; font-weight: 700; font-size: 20px; }
      table { border-collapse: collapse; width: 100%; }
      .meta td, .meta th, .table-product td, .table-product th { border: 1px solid #111; padding: 6px; font-size: 12px; }
      .meta th { text-align: left; width: 160px; background: #f8fafc; }
      .table-product th { background: #f8fafc; text-align: left; }
      .notas { border: 1px solid #111; min-height: 80px; padding: 6px; margin-top: 8px; font-size: 12px; }
      .firmas { margin-top: 10px; }
      .firmas td { border: 1px solid #111; height: 56px; text-align: center; font-size: 11px; }
      .footer { text-align: center; margin-top: 8px; font-size: 12px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <img src="${logo}" alt="Logo" width="105" height="55" />
        <div class="title">Entrega de Mercancía</div>
        <div><strong># ${formatSafe(factura.numeroentrega)}</strong></div>
      </div>

      <table class="meta">
        <tr><th>NÚMERO FACTURA</th><td>${formatSafe(factura.numfactura)}</td></tr>
        <tr><th>FECHA FACTURA</th><td>${formatSafe(factura.fechafactura)}</td></tr>
        <tr><th>FECHA ENTREGA</th><td>${formatSafe(factura.fechaEntrega)}</td></tr>
        <tr><th>CLIENTE</th><td>${formatSafe(factura.nombrecliente)}</td></tr>
        <tr><th>IDENTIFICACIÓN</th><td>${formatSafe(factura.nit)}</td></tr>
        <tr><th>DIRECCIÓN</th><td>${formatSafe(factura.direccion)}</td></tr>
        <tr><th>CELULAR</th><td>${formatSafe(factura.telmovil)}</td></tr>
        <tr><th>ASESOR COMERCIAL</th><td>${formatSafe(factura.vendedor)}</td></tr>
      </table>

      <table class="table-product" style="margin-top:8px;">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Cant. Facturada</th>
            <th>${cantidadHeader}</th>
          </tr>
        </thead>
        <tbody>${buildDetalleRows(factura.detalle, isConfirmationModal)}</tbody>
      </table>

      <div class="notas">${buildNotasHtml(factura.notas)}</div>

      <table class="firmas">
        <tr><td></td><td></td><td></td></tr>
        <tr><td>RECIBIDO POR</td><td>TRANSPORTADO POR</td><td>DESPACHADO POR</td></tr>
      </table>

      <div class="footer">¡Gracias por elegirnos!</div>
    </div>
  </body>
  </html>`;
};

export const PrintDocument = ({ factura, isConfirmationModal }) =>
  new Promise((resolve, reject) => {
    if (!factura) {
      reject(new Error("No se puede imprimir: datos de entrega no válidos."));
      return;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      reject(new Error("El navegador bloqueó la ventana de impresión."));
      return;
    }

    printWindow.document.open();
    printWindow.document.write(buildHtml({ factura, isConfirmationModal }));
    printWindow.document.close();

    const tryPrint = () => {
      try {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
        resolve(true);
      } catch (error) {
        reject(error);
      }
    };

    setTimeout(tryPrint, 350);
  });
