import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import axios from "axios";
import { Dialog } from "primereact/dialog";
import { ListBox } from "primereact/listbox";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { Toast } from "primereact/toast";
import ContactCreation from "../ContactCreation";
import config from "../../Config";
import "../../styles/quoter/search-dialog-listbox.css";

const ContactSearchDialog = ({
  showDialogContact,
  setShowDialogContact,
  onAcceptSelection,
  onContactCreated,
  idCliente,
}) => {
  const [selectedContact, setSelectedContact] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [showNewContactsDialog, setShowNewContactsDialog] = useState(false);
  const toast = useRef(null);

  const apiUrlListaContactos = `${config.apiUrl}/Datasnap/rest/TServerMethods1/ListaContactos`;

  useEffect(() => {
    if (!showDialogContact) {
      setSelectedContact(null);
      setFilter("");
      return;
    }

    const fetchContacts = async () => {
      setLoading(true);
      try {
        const response = await axios.put(apiUrlListaContactos, { criterio: "" });
        if (response?.data?.status === 200 && Array.isArray(response?.data?.data)) {
          setContacts(response.data.data);
          return;
        }

        setContacts([]);
        toast.current?.show({
          severity: "warn",
          summary: "Sin resultados",
          detail: response?.data?.message || "No se pudieron cargar los contactos.",
          life: 2800,
        });
      } catch (error) {
        setContacts([]);
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: error?.message || "Error al consultar contactos.",
          life: 3200,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, [apiUrlListaContactos, showDialogContact]);

  const filteredContacts = useMemo(() => {
    const criteria = filter.trim().toLowerCase();
    if (!criteria) return contacts;

    return contacts.filter((contacto) =>
      [contacto?.nombreCa, contacto?.identificacionCa]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(criteria))
    );
  }, [contacts, filter]);

  const refreshContacts = useCallback(
    async (message, severity) => {
      try {
        const response = await axios.put(apiUrlListaContactos, { criterio: "" });
        if (response?.data?.status === 200 && Array.isArray(response?.data?.data)) {
          setContacts(response.data.data);
        }
      } catch {
        // silent refresh failure
      }

      toast.current?.show({
        severity,
        summary: message,
        life: 2600,
      });
    },
    [apiUrlListaContactos]
  );

  const handleAccept = useCallback(() => {
    if (!selectedContact) return;
    onAcceptSelection(selectedContact);
    setShowDialogContact(false);
  }, [onAcceptSelection, selectedContact, setShowDialogContact]);

  const handleCancel = useCallback(() => {
    setShowDialogContact(false);
  }, [setShowDialogContact]);

  const itemTemplate = useCallback(
    (item) => (
      <div className="contact-dialog-item">
        <div className="contact-dialog-item__main">
          <span className="contact-dialog-item__name">{item.nombreCa}</span>
          <small className="contact-dialog-item__id">{item.identificacionCa}</small>
        </div>
      </div>
    ),
    []
  );

  const footerContent = (
    <div className="contact-dialog__footer">
      <Button
        label="Crear contacto"
        severity="secondary"
        outlined
        onClick={() => setShowNewContactsDialog(true)}
        icon="pi pi-plus"
      />
      <div className="contact-dialog__footer-actions">
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
          disabled={!selectedContact}
          icon="pi pi-check"
          autoFocus
        />
      </div>
    </div>
  );

  return (
    <Dialog
      visible={showDialogContact}
      onHide={handleCancel}
      header="Selecciona un contacto"
      footer={footerContent}
      closeOnEscape={false}
      className="contact-search-dialog"
      draggable={false}
    >
      <Toast ref={toast} />

      <div className="contact-dialog__content">
        <div className="contact-dialog__search">
          <IconField iconPosition="left" className="contact-dialog__search-field">
            <InputIcon className="pi pi-search" />
            <InputText
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Buscar por nombre o identificación"
              aria-label="Filtrar contactos"
            />
          </IconField>
        </div>

        <div className="contact-dialog__meta">
          <small>{filteredContacts.length} contacto(s) encontrado(s)</small>
        </div>

        <ListBox
          value={selectedContact}
          options={filteredContacts}
          onChange={(e) => setSelectedContact(e.value)}
          optionLabel="nombreCa"
          itemTemplate={itemTemplate}
          emptyMessage={loading ? "Cargando contactos..." : "No se encontraron contactos"}
          className="contact-dialog__listbox"
        />
      </div>

      <ContactCreation
        visible={showNewContactsDialog}
        onHide={() => setShowNewContactsDialog(false)}
        idCliente={idCliente || 0}
        selectedContact={null}
        refreshContacts={refreshContacts}
      />
    </Dialog>
  );
};

export default ContactSearchDialog;
