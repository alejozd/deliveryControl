import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Dialog } from "primereact/dialog";
import { ListBox } from "primereact/listbox";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import ClientCreation from "../ClientCreation";
import "../../styles/quoter/search-dialog-listbox.css";

const CustomerSearchDialog = ({
  showDialogCustomer,
  setShowDialogCustomer,
  customers,
  onAcceptSelection,
  onCustomerCreated,
  user,
}) => {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [filter, setFilter] = useState("");
  const [showNewCustomerDialog, setShowNewCustomerDialog] = useState(false);

  useEffect(() => {
    if (!showDialogCustomer) {
      setSelectedCustomer(null);
      setFilter("");
    }
  }, [showDialogCustomer]);

  const filteredCustomers = useMemo(() => {
    const criteria = filter.trim().toLowerCase();
    if (!criteria) return customers;

    return customers.filter((cliente) =>
      [cliente?.nombrecliente, cliente?.identidad]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(criteria))
    );
  }, [customers, filter]);

  const handleAccept = useCallback(() => {
    if (!selectedCustomer) return;
    onAcceptSelection(selectedCustomer);
    setShowDialogCustomer(false);
  }, [onAcceptSelection, selectedCustomer, setShowDialogCustomer]);

  const handleCancel = useCallback(() => {
    setShowDialogCustomer(false);
  }, [setShowDialogCustomer]);

  const handleCustomerCreated = useCallback(
    (newCustomer) => {
      setSelectedCustomer(newCustomer);
      setShowNewCustomerDialog(false);
      onCustomerCreated(newCustomer);
    },
    [onCustomerCreated]
  );

  const itemTemplate = useCallback(
    (item) => (
      <div className="customer-dialog-item">
        <div className="customer-dialog-item__main">
          <span className="customer-dialog-item__name">{item.nombrecliente}</span>
          <small className="customer-dialog-item__id">{item.identidad}</small>
        </div>
      </div>
    ),
    []
  );

  const footerContent = (
    <div className="customer-dialog__footer">
      <Button
        label="Crear cliente"
        severity="secondary"
        outlined
        onClick={() => setShowNewCustomerDialog(true)}
        icon="pi pi-plus"
      />
      <div className="customer-dialog__footer-actions">
        <Button
          label="Cancelar"
          severity="secondary"
          text
          onClick={handleCancel}
          icon="pi pi-times"
        />
        <Button
          label="Seleccionar"
          severity="success"
          onClick={handleAccept}
          disabled={!selectedCustomer}
          icon="pi pi-check"
          autoFocus
        />
      </div>
    </div>
  );

  return (
    <Dialog
      visible={showDialogCustomer}
      onHide={handleCancel}
      header="Selecciona un cliente"
      footer={footerContent}
      closeOnEscape={false}
      className="customer-search-dialog"
      draggable={false}
    >
      <div className="customer-dialog__content">
        <div className="customer-dialog__search">
          <IconField iconPosition="left" className="customer-dialog__search-field">
            <InputIcon className="pi pi-search" />
            <InputText
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Buscar por nombre o identificación"
              aria-label="Filtrar clientes"
            />
          </IconField>
        </div>

        <div className="customer-dialog__meta">
          <small>{filteredCustomers.length} cliente(s) encontrado(s)</small>
        </div>

        <ListBox
          value={selectedCustomer}
          options={filteredCustomers}
          onChange={(e) => setSelectedCustomer(e.value)}
          optionLabel="nombrecliente"
          itemTemplate={itemTemplate}
          emptyMessage="No se encontraron clientes con ese criterio"
          className="customer-dialog__listbox"
          listStyle={{ maxHeight: "22rem" }}
        />
      </div>

      <ClientCreation
        visible={showNewCustomerDialog}
        onHide={() => setShowNewCustomerDialog(false)}
        onCustomerCreated={handleCustomerCreated}
        selectedCustomer={null}
        user={user}
      />
    </Dialog>
  );
};

export default CustomerSearchDialog;
