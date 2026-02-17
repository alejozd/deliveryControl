import React, { useState } from "react";
import { Dropdown } from "primereact/dropdown";

const ClientCreationFELData = ({
  regimenFiscalList,
  selectedRegimenFiscal,
  setSelectedRegimenFiscal,
  responsabilidadTributariaList,
  selectedResponsabilidadTributaria,
  setSelectedResponsabilidadTributaria,
}) => {
  const [error, setError] = useState(null);

  const handleDropdownChange = (setter) => (e) => {
    if (e.value) {
      setter(e.value);
      setError(null); // Clear error on valid selection
    } else {
      setError("Debe seleccionar una opción válida.");
    }
  };

  return (
    <div className="flex flex-column">
      {error && <div className="error-message">{error}</div>}
      <div className="labelinput">
        <label htmlFor="idregfiscal">Régimen Fiscal</label>
        <Dropdown
          className="inputtext"
          id="idregfiscal"
          value={selectedRegimenFiscal}
          onChange={handleDropdownChange(setSelectedRegimenFiscal)}
          options={regimenFiscalList}
          optionLabel="label"
          placeholder="Seleccionar Régimen Fiscal"
          aria-label="Seleccionar Régimen Fiscal"
        />
      </div>
      <div className="labelinput">
        <label htmlFor="idresptri">Responsabilidad Tributaria</label>
        <Dropdown
          className="inputtext"
          id="idresptri"
          value={selectedResponsabilidadTributaria}
          onChange={handleDropdownChange(setSelectedResponsabilidadTributaria)}
          options={responsabilidadTributariaList}
          optionLabel="label"
          placeholder="Seleccionar Responsabilidad Tributaria"
          aria-label="Seleccionar Responsabilidad Tributaria"
        />
      </div>
    </div>
  );
};

export default React.memo(ClientCreationFELData);
