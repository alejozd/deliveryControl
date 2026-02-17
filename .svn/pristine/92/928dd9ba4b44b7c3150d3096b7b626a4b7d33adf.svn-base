import { useRef } from "react";
import { saveAs } from "file-saver";

const useExcelExport = (defaultFileName = "data") => {
  const toast = useRef(null);

  const exportToExcel = async (data, columns, options = {}) => {
    try {
      const {
        fileName = defaultFileName,
        exportAllColumns = false,
        columnTitles = {},
        hiddenColumns = [],
      } = options;

      const { utils, write } = await import("xlsx");

      // Filtrar columnas visibles
      let dataToExport = data;
      if (!exportAllColumns && columns) {
        const visibleColumns = columns.filter(
          (col) => !col.hidden && !hiddenColumns.includes(col.field)
        );

        dataToExport = data.map((row) => {
          const filteredRow = {};
          visibleColumns.forEach((col) => {
            filteredRow[col.field] = row[col.field];
          });
          return filteredRow;
        });
      }

      // Si no hay datos, no exportar
      if (dataToExport.length === 0) return;

      // Mapear encabezados personalizados
      const customData = [];
      const keys = Object.keys(dataToExport[0]);
      const headers = keys.map((key) => columnTitles[key] || key);
      customData.push(headers); // Primera fila como encabezado
      dataToExport.forEach((row) => {
        customData.push(keys.map((key) => row[key]));
      });

      // Crear worksheet desde array (no json_to_sheet)
      const worksheet = utils.aoa_to_sheet(customData);

      // Definir anchos automáticos
      const colWidths = keys.map((key, index) => {
        const headerLength = headers[index].length;
        const maxContentLength = Math.max(
          headerLength,
          ...dataToExport.map((row) => String(row[keys[index]] || "").length)
        );
        return { wch: Math.min(Math.max(maxContentLength, 10), 50) };
      });
      worksheet["!cols"] = colWidths;

      // Definir estilos (opcional, para compatibilidad futura)
      worksheet["!styles"] = [
        {}, // Índice 0: estilo por defecto
        {
          font: { bold: true },
          fill: { fgColor: { rgb: "D3D3D3" } },
          alignment: { horizontal: "center", vertical: "center" },
        }, // Índice 1: estilo de encabezado
        {
          alignment: { vertical: "center" },
        }, // Índice 2: estilo de contenido
      ];

      // Aplicar estilo a encabezado
      const range = utils.decode_range(worksheet["!ref"]);
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell = worksheet[utils.encode_cell({ r: 0, c: C })];
        if (cell) {
          cell.s = 1; // Asignar índice del estilo definido en !styles
        }
      }

      // Aplicar estilo al contenido (opcional)
      for (let R = 1; R <= range.e.r; ++R) {
        for (let C = 0; C <= range.e.c; ++C) {
          const cell = worksheet[utils.encode_cell({ r: R, c: C })];
          if (cell) {
            cell.s = 2;
          }
        }
      }

      const workbook = {
        Sheets: { data: worksheet },
        SheetNames: ["data"],
      };

      const excelBuffer = write(workbook, {
        bookType: "xlsx",
        type: "array",
      });

      const EXCEL_TYPE =
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
      const EXCEL_EXTENSION = ".xlsx";
      const blob = new Blob([excelBuffer], { type: EXCEL_TYPE });

      saveAs(
        blob,
        `${fileName}_export_${new Date().getTime()}${EXCEL_EXTENSION}`
      );

      return true;
    } catch (error) {
      console.error("Error al exportar a Excel:", error);
      if (toast.current) {
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: "No se pudo exportar el archivo Excel",
          life: 3000,
        });
      }
      return false;
    }
  };

  return { exportToExcel, toast };
};

export default useExcelExport;
