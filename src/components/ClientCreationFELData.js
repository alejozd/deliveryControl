import React, { useMemo } from "react";
import { Dropdown } from "primereact/dropdown";
import "../styles/modules/client-creation-sections.css";

const ClientCreationFELData = ({
  regimenFiscalList,
  selectedRegimenFiscal,
  setSelectedRegimenFiscal,
  responsabilidadTributariaList,
  selectedResponsabilidadTributaria,
  setSelectedResponsabilidadTributaria,
}) => {
  const fields = useMemo(
    () => [
      {
        id: "idregfiscal",
        label: "Régimen Fiscal",
        value: selectedRegimenFiscal,
        onChange: setSelectedRegimenFiscal,
        options: regimenFiscalList,
        placeholder: "Seleccionar Régimen Fiscal",
      },
      {
        id: "idresptri",
        label: "Responsabilidad Tributaria",
        value: selectedResponsabilidadTributaria,
        onChange: setSelectedResponsabilidadTributaria,
        options: responsabilidadTributariaList,
        placeholder: "Seleccionar Responsabilidad Tributaria",
      },
    ],
    [
      regimenFiscalList,
      responsabilidadTributariaList,
      selectedRegimenFiscal,
      selectedResponsabilidadTributaria,
      setSelectedRegimenFiscal,
      setSelectedResponsabilidadTributaria,
    ]
  );

  return (
    <div className="client-creation-section">
      <small className="client-creation-section__hint">
        Define los datos fiscales requeridos para facturación electrónica.
      </small>

      <div className="client-creation-section__grid client-creation-section__grid--compact">
        {fields.map((field) => (
          <div className="labelinput" key={field.id}>
            <label htmlFor={field.id}>{field.label}</label>
            <Dropdown
              className="inputtext"
              id={field.id}
              value={field.value}
              onChange={(e) => field.onChange(e.value)}
              options={field.options}
              optionLabel="label"
              placeholder={field.placeholder}
              aria-label={field.label}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(ClientCreationFELData);
