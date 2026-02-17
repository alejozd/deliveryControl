import React from "react";
import logo from "../../resources/images/logo-metro.png";

const PrintQuote = ({ quoteData }) => {
  if (!quoteData) {
    return <div>Loading...</div>;
  }
  // Crear una nueva imagen
  const img = new Image();
  // Asignar la ruta de la imagen
  img.src = logo;
  // Escuchar el evento 'load' para asegurarse de que la imagen esté completamente cargada
  img.onload = () => {
    // Construir las notas con saltos de línea
    let notasHtml = "";
    quoteData.notas.split("\n").forEach((linea, index) => {
      notasHtml += `<label>${linea}</label>`;
      if (index !== quoteData.notas.split("\n").length - 1) {
        notasHtml += "<br>"; // Agregar un salto de línea después de cada línea, excepto la última
      }
    });
    const cantidadContent = quoteData.productos
      .map(
        (detalle) => `
        <tr>
        <td class="producto-content">${detalle.nombreproductos}</td>
        <td class="referencia-content">${detalle.referencia}</td>
        <td class="precio-content">${detalle.precio.toLocaleString("es-CO", {
          style: "currency",
          currency: "COP",
        })}</td> <!-- Formato de moneda para el precio -->
        <td class="cantidad-content">${detalle.cantidad.toFixed(
          2
        )}</td> <!-- Aplica toFixed(2) para la cantidad -->
        <td class="total-content">${detalle.total.toLocaleString("es-CO", {
          style: "currency",
          currency: "COP",
        })}</td> <!-- Formato de moneda para el total -->
        </tr>
`
      )
      .join("");

    const htmlString = `
    <html lang="es">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cotización - ${quoteData.numerocotizacion}</title>
    <style>
    body {
        font-family: 'Arial', sans-serif;
        margin: 20px;
        background-color: #f7f7f7;
        color: #333333;
      }
      .container {
        max-width: 800px;
        min-width: auto;
        margin: auto;
        background-color: #ffffff;
        box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
        padding: 20px;
        border-radius: 5px;
        border-color: black;
        border: 1px solid black;
      }
      .section {
        margin-bottom: 10px;
      }
      .header {
        display: flex;
        text-align: center;
        margin-bottom: 20px;
      }
      .header-column {
        flex: 1;
        text-align: center;
      }
      .customer-section {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 5px; /* Espacio entre las columnas */  
        width: 800px;      
      }
      .customer-section-l {                    
        grid-template-columns: repeat(1, 1fr);
        gap: 5px; /* Espacio entre las columnas */
        width: 450px;          
        
      }
      .customer-section-r {        
        grid-template-columns: repeat(1, 1fr);
        gap: 5px; /* Espacio entre las columnas */
        width: 345px;
                
      }
      .table-customer {
        border-collapse: collapse;        
        width: 100%;
        border: none; /* Establecer borde transparente para la tabla */        
        margin-bottom: 1px;
      }
      .customer-info {
        display: flex;
        align-items: start;
      }
      .label-l {
        font-weight: bold;
        font-size: small;
        min-width: 105px; /* Ancho mínimo para las etiquetas */
        max-width: 438px;
        width: 105px;
        text-align: left;
      }
      .label-r {
        font-weight: bold;
        font-size: small;
        min-width: 80px; /* Ancho mínimo para las etiquetas */
        width: 80px;
        text-align: left;
        overflow-wrap: break-word;
      }
      .data {
        font-size: small;
      }      
      .data-r {
        font-size: small;
      }
      h1 {
        color: #333333;
      }
      p {
        margin: 5px 0;
      }
      .table-product {
      width: 100%;
      border-collapse: collapse;
      border: black 1px solid;
      margin-top: 20px;
    }

    .table-product th, .table-product td {
      padding: 8px; /* Aumenta el padding para mejorar la apariencia */
      text-align: left;
      border: 1px solid #dddddd;      
    }

    .producto {
      width: 40%;
    }

    .referencia {
      width: 20%;
    }

    .precio, .cantidad, .total {
      width: 13%; /* Ajusta el ancho para que las columnas sean más uniformes */
    }             
      th.producto, th.referencia {        
        border: 1px solid #dddddd;
        padding: 8px; /* Reducido el padding para hacer las celdas más estrechas */
        text-align: left;
        background-color: #f5f5f5;
        border: black 1px solid;
      }      
      th.precio, th.cantidad, th.total, td.precio, td.cantidad, td.total {        
        border: 1px solid #dddddd;
        padding: 2px;        
        text-align: left;
        background-color: #f5f5f5;
        border: black 1px solid;
      }      
      td.producto-content, td.referencia-content, td.precio-content, td.cantidad-content, td.total-content {               
        border: black 1px solid;        
      }
      .notas {
        margin-top: 5px;
        border: black 1px solid; 
        height: 100px;        
      }                 
    </style>
  </head>
  <body>
    <div class="container">
      <div class="section">
        <!-- Sección A: Datos de la Empresa -->
        <div class="header">
          <div style="width: 200px;">
            <!-- Contenido para A1 aquí -->
            <img src="${logo}" alt="Logo de la empresa" />            
          </div>
          <div class="header-column">
            <!-- Contenido para A2 aquí -->
            <p>DISTRIBUIDORA METROCERAMICAS S.A.S.</p>
            <p>830.112.333-1</p>
            <p>AUTOPISTA NORTE 138 83, BOGOTÁ</p>
            <p>PBX 601 6192221</p>              
          </div>
          <div style="width: 180px; border: #333333 1px solid;">
            <!-- Contenido para A3 aquí -->
            <h4 style="border-bottom: #333333 1px solid;">COTIZACIÓN</h4>            
            <p style="font-weight: bold; font-size: 20px;"><span style="color: red;">N°</span> ${quoteData.numerocotizacion}</p>            
          </div>
        </div>
      </div>
      <div class="customer-section">
        <!-- Sección B: Datos del Cliente -->
        <div class="customer-section-l">
          <table class="table-customer">
              <tr>
                  <th class="label-l">FECHA Y HORA:</th>
                  <td class="data">${quoteData.fecha}</td>
              </tr>
              <tr>
                  <th class="label-l">NOMBRE:</th>
                  <td class="data">${quoteData.nombrecliente}</td>
              </tr>
              <tr>
                  <th class="label-l">NIT:</th>
                  <td class="data">${quoteData.identidad}</td>
              </tr>
              <tr>
                  <th class="label-l">DIRECCIÓN:</th>
                  <td class="data">${quoteData.direccion}</td>
              </tr>
          </table>
      </div>
      <!-- Sección B: Datos del Cliente -->
      <div class="customer-section-r">
          <table class="table-customer">              
              <tr>
                  <th class="label-r">TELÉFONO:</th>
                  <td class="data-r">${quoteData.telmovil}</td>
              </tr>
              <tr>
                  <th class="label-r">E-MAIL:</th>
                  <td class="data-r">${quoteData.email}</td>
              </tr>
          </table>
      </div>
      </div>      
      <table class="table-product">
        <thead>
          <tr>
            <th class="producto">Producto</th>
            <th class="referencia">Referencia</th>
            <th class="precio">Precio</th>
            <th class="cantidad">Cantidad</th>                        
            <th class="total">Total</th>
          </tr>
        </thead>
        <tbody>
          ${cantidadContent}
        </tbody>
      </table>
      <!-- Sección D: Notas -->
      <div class="notas">
        ${notasHtml} 
      </div>      
        <div class="footer">
          <p>¡Gracias por elegirnos!</p>
        </div>
      </div>
    </body>
    </html>
    `;

    // Abrir una nueva ventana con el documento HTML
    const printWindow = window.open("", "_blank");
    printWindow.document.write(htmlString);

    setTimeout(() => {
      // Enviar a imprimir
      printWindow.print();
      // Cerrar la ventana de impresión después de imprimir
      printWindow.close();
    }, 1000); // Cambia este valor según sea necesario
  };

  return null; // Siempre debes retornar algo en un componente de React
};

export default PrintQuote; // Exporta el componente PrintQuote para poder importarlo en otros archivos
