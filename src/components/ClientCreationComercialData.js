import React, { useMemo } from "react";
import { Dropdown } from "primereact/dropdown";
import { Checkbox } from "primereact/checkbox";
import "../styles/modules/client-creation-sections.css";

const ClientCreationComercialData = ({
  regimenList,
  selectedRegimen,
  setSelectedRegimen,
  formaPagoList,
  selectedFormaPago,
  setSelectedFormaPago,
  listapreciosList,
  selectedlistaprecios,
  setSelectedlistaprecios,
  selectedareaIca,
  setSelectedareaIca,
  selectedaplicaReteFte,
  setSelectedAplicaReteFte,
  selectedaplicaBaseretefte,
  setSelectedAplicaBaseretefte,
  selectedaplicaBasereteIVA,
  setSelectedAplicaBasereteIVA,
  selectedaplicaBasereteICA,
  setSelectedAplicaBasereteICA,
}) => {
  const commercialFields = useMemo(
    () => [
      {
        id: "idregimen",
        label: "Régimen",
        value: selectedRegimen,
        onChange: setSelectedRegimen,
        options: regimenList,
        placeholder: "Seleccionar Régimen",
      },
      {
        id: "idformadepago",
        label: "Forma de pago",
        value: selectedFormaPago,
        onChange: setSelectedFormaPago,
        options: formaPagoList,
        placeholder: "Seleccionar Forma de pago",
      },
      {
        id: "idlistaprecios",
        label: "Lista de Precios",
        value: selectedlistaprecios,
        onChange: setSelectedlistaprecios,
        options: listapreciosList,
        placeholder: "Seleccionar Lista de Precios",
      },
    ],
    [
      formaPagoList,
      listapreciosList,
      regimenList,
      selectedFormaPago,
      selectedRegimen,
      selectedlistaprecios,
      setSelectedFormaPago,
      setSelectedRegimen,
      setSelectedlistaprecios,
    ]
  );

  const checkboxes = useMemo(
    () => [
      {
        id: "idareaica",
        label: "Área ICA",
        checked: selectedareaIca,
        onChange: setSelectedareaIca,
      },
      {
        id: "idaplicaretefte",
        label: "Aplica retención en la fuente",
        checked: selectedaplicaReteFte,
        onChange: setSelectedAplicaReteFte,
      },
      {
        id: "idaplicabaseretefte",
        label: "Aplica base de retención en la fuente",
        checked: selectedaplicaBaseretefte,
        onChange: setSelectedAplicaBaseretefte,
      },
      {
        id: "idaplicabasereteIVA",
        label: "Aplica base en retención de IVA",
        checked: selectedaplicaBasereteIVA,
        onChange: setSelectedAplicaBasereteIVA,
      },
      {
        id: "idaplicabasereteICA",
        label: "Aplica base en retención de ICA",
        checked: selectedaplicaBasereteICA,
        onChange: setSelectedAplicaBasereteICA,
      },
    ],
    [
      selectedaplicaBasereteICA,
      selectedaplicaBasereteIVA,
      selectedaplicaBaseretefte,
      selectedaplicaReteFte,
      selectedareaIca,
      setSelectedAplicaBasereteICA,
      setSelectedAplicaBasereteIVA,
      setSelectedAplicaBaseretefte,
      setSelectedAplicaReteFte,
      setSelectedareaIca,
    ]
  );

  return (
    <div className="client-creation-section">
      <small className="client-creation-section__hint">
        Configura las condiciones comerciales y retenciones aplicables.
      </small>

      <div className="client-creation-section__grid">
        {commercialFields.map((field) => (
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

      <div className="client-creation-section__checks">
        {checkboxes.map((item) => (
          <div className="client-creation-section__check-item" key={item.id}>
            <Checkbox
              inputId={item.id}
              onChange={(e) => item.onChange(e.checked)}
              checked={item.checked}
              aria-label={item.label}
            />
            <label htmlFor={item.id}>{item.label}</label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(ClientCreationComercialData);
