import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Dialog } from "primereact/dialog";
import { ListBox } from "primereact/listbox";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import ContactCreation from "../ContactCreation";
import { Toolbar } from "primereact/toolbar";
import { Toast } from "primereact/toast";
import config from "../../Config";
import "../../styles/quoter/search-dialog-listbox.css";

const ContactSearchDialog = ({
  showDialogContact,
  setShowDialogContact,
  onAcceptSelection,
  onContactCreated,
  idCliente,
}) => {
  const [selectedContact, setSelectedContact] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [showNewContactsDialog, setShowNewCustomerDialog] = useState(false);
  const toast = useRef(null);

  const apiUrlAddContact = `${config.apiUrl}/Datasnap/rest/TServerMethods1/ListaContactos`;

  // Reiniciar los productos seleccionados cada vez que showDialogContact cambie
  useEffect(() => {
    if (!showDialogContact) {
      setSelectedContact([]);
    }
  }, [showDialogContact]);

  // Fetch contacts when the dialog is shown

  useEffect(() => {
    fetchContacts();
  }, [showDialogContact]);

  const fetchContacts = async () => {
    if (showDialogContact) {
      setLoading(true);
      console.log("Fetching contacts...");
      try {
        const response = await axios.put(apiUrlAddContact, {
          criterio: "",
        });
        console.log("ContactSearchDialog: ", response.data);
        if (response.data.status === 200 && Array.isArray(response.data.data)) {
          setContacts(response.data.data); // Aquí accedemos a response.data.data
          setFilteredContacts(response.data.data); // También en filteredContacts
        } else {
          console.error(
            "Error fetching contacts or invalid data format:",
            response.data.message
          );
          setContacts([]); // Asegúrate de que contacts sea un array
          setFilteredContacts([]);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error al realizar la solicitud:", error.message);
        setContacts([]); // Manejo de error: asegúrate de que contacts no sea undefined
        setFilteredContacts([]);
        setLoading(false);
      }
    }
  };

  // Esto asegura que siempre tengas un array en contacts para evitar el error al filtrar
  useEffect(() => {
    const lowerCaseFilter = filter.toLowerCase();
    const filtered = contacts?.filter(
      (contacto) =>
        contacto.nombreCa.toLowerCase().includes(lowerCaseFilter) ||
        contacto.identificacionCa.toLowerCase().includes(lowerCaseFilter)
    );
    setFilteredContacts(filtered);
  }, [filter, contacts]);

  const handleAccept = () => {
    const selectedContactData = selectedContact;
    // console.log("Contact-selectedContact", selectedContactData);
    onAcceptSelection(selectedContactData);
    setShowDialogContact(false);
  };

  const handleCancel = () => {
    setShowDialogContact(false);
  };

  const refreshContacts = (message, severity) => {
    fetchContacts(); // Actualiza la lista de contactos después de crear o actualizar un contacto
    toast.current.show({
      severity: severity,
      summary: message,
      //   detail: response.data.result,
      life: 3000,
    });
  };

  const footerContent = (
    <div style={{ marginTop: "1em" }}>
      <Toolbar
        start={
          <Button
            label="Crear Contacto Nuevo"
            severity="primary"
            onClick={() => setShowNewCustomerDialog(true)}
            size="small"
            icon="pi pi-plus"
          />
        }
        end={
          <React.Fragment>
            <Button
              label="Aceptar"
              severity="success"
              onClick={handleAccept}
              autoFocus
              size="small"
              icon="pi pi-check"
            />
            <Button
              label="Cancelar"
              severity="danger"
              onClick={handleCancel}
              text
              raised
              size="small"
              icon="pi pi-times"
            />
          </React.Fragment>
        }
      />
    </div>
  );

  const itemTemplate = (item) => {
    return (
      <div className="item">
        <span className="item-name">{item.nombreCa}</span>
        <span className="item-reference">{item.identificacionCa}</span>
      </div>
    );
  };

  const onFilterChange = (e) => {
    setFilter(e.target.value);
  };

  return (
    <Dialog
      visible={showDialogContact}
      onHide={() => setShowDialogContact(false)}
      header="Contactos Encontrados"
      footer={footerContent}
    >
      <div>
        <Toast ref={toast} />
        <div className="sticky-input">
          <IconField iconPosition="right">
            <InputIcon className="pi pi-search" />
            <InputText
              type="text"
              value={filter}
              onChange={onFilterChange}
              placeholder="Buscar contacto por nombre o identidad..."
              aria-label="Filtrar contactos"
              className="p-inputtext p-component"
              style={{ width: "100%" }}
            />
          </IconField>
        </div>
        {loading ? (
          <p>Cargando contactos...</p>
        ) : (
          <ListBox
            value={selectedContact}
            options={filteredContacts}
            // onChange={(e) => setSelectedContact(e.value)}
            onChange={(e) =>
              setSelectedContact(e.value === selectedContact ? null : e.value)
            }
            optionLabel="nombreCa"
            itemTemplate={itemTemplate}
            emptyMessage="No hay registros para mostrar en la lista"
          />
        )}
      </div>
      <ContactCreation
        visible={showNewContactsDialog}
        onHide={() => setShowNewCustomerDialog(false)}
        // idCliente={idCliente ? idCliente : null}
        idCliente={0}
        selectedContact={selectedContact}
        refreshContacts={refreshContacts}
      />
    </Dialog>
  );
};

export default ContactSearchDialog;
