import { useState, useEffect, useRef, useCallback } from "react";
import { Dialog } from "primereact/dialog";
import { RadioButton } from "primereact/radiobutton";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import ComprobantePDF from "./ComprobantePDF";
import config from "../../Config";
import axios from "axios";

const WhatsAppDialog = ({ visible, onHide, selectedQuote }) => {
  const apiUrlContactos = `${config.apiUrl}/Datasnap/rest/TServerMethods1/DataContactosCliente`;
  const [phoneNumberOptions, setPhoneNumberOptions] = useState([]);
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState(null);
  const [autoGeneratePDF, setAutoGeneratePDF] = useState(false);
  const toast = useRef(null);

  const fetchContactsAndClient = useCallback(async () => {
    if (!selectedQuote?.cliente?.idcliente) {
      setPhoneNumberOptions([]);
      return;
    }

    try {
      const response = await axios.put(apiUrlContactos, {
        idcliente: selectedQuote.cliente.idcliente,
      });

      if (response?.data?.status === 200) {
        const cliente = response?.data?.cliente?.[0] || {};
        const contacts = response?.data?.contactos || [];

        const options = [
          {
            nombre: cliente.nombreclienteCa,
            key: cliente.idclienteCa,
            telefono: cliente.telmovilclienteCa,
          },
          ...contacts.map((contact) => ({
            nombre: contact.nombreCa,
            key: contact.idcontacto,
            telefono: contact.telmovilCa,
          })),
        ].filter((option) => option.telefono);

        setPhoneNumberOptions(options);
      } else {
        setPhoneNumberOptions([]);
        toast.current?.show({
          severity: "warn",
          summary: "Sin teléfonos",
          detail: "No se pudieron obtener teléfonos disponibles para este cliente.",
          life: 3000,
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setPhoneNumberOptions([]);
      toast.current?.show({
        severity: "error",
        summary: "Error de conexión",
        detail: "No fue posible cargar los teléfonos del cliente.",
        life: 3200,
      });
    }
  }, [apiUrlContactos, selectedQuote]);

  useEffect(() => {
    if (visible) {
      setSelectedPhoneNumber(null);
      setAutoGeneratePDF(false);
      fetchContactsAndClient();
    }
  }, [visible, fetchContactsAndClient]);

  const handleSendWhatsAppMessage = () => {
    if (!selectedPhoneNumber) {
      toast.current?.show({
        severity: "warn",
        summary: "Selecciona un número",
        detail: "Debes elegir un teléfono antes de continuar.",
        life: 2500,
      });
      return;
    }

    setAutoGeneratePDF(true);
    const whatsappURL = `https://wa.me/57${selectedPhoneNumber.telefono}`;
    window.open(whatsappURL, "_blank");
    onHide();
  };

  const header = (
    <div className="quoter-message-dialog__header">
      <span className="quoter-message-dialog__icon quoter-message-dialog__icon--whatsapp">
        <i className="pi pi-whatsapp" />
      </span>
      <div>
        <h3 className="quoter-message-dialog__title">Enviar por WhatsApp</h3>
        <p className="quoter-message-dialog__subtitle">Selecciona un teléfono y abre el chat con un clic.</p>
      </div>
    </div>
  );

  const footer = (
    <div className="quoter-message-dialog__footer">
      <Button label="Cancelar" icon="pi pi-times" outlined onClick={onHide} />
      <Button
        label="Abrir WhatsApp"
        icon="pi pi-send"
        severity="success"
        onClick={handleSendWhatsAppMessage}
        disabled={!selectedPhoneNumber}
      />
    </div>
  );

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        visible={visible}
        onHide={onHide}
        header={header}
        footer={footer}
        className="quoter-message-dialog"
        style={{ width: "34rem", maxWidth: "95vw" }}
      >
        <div className="quoter-message-dialog__list">
          {phoneNumberOptions.length > 0 ? (
            phoneNumberOptions.map((option) => (
              <label key={option.key} htmlFor={`telefono-${option.key}`} className="quoter-message-dialog__option">
                <RadioButton
                  inputId={`telefono-${option.key}`}
                  name="phoneNumber"
                  value={option}
                  onChange={() => setSelectedPhoneNumber(option)}
                  checked={selectedPhoneNumber?.key === option.key}
                />
                <span>
                  {option.nombre} <strong>{option.telefono}</strong>
                </span>
              </label>
            ))
          ) : (
            <p className="quoter-message-dialog__empty">No hay números de teléfono disponibles para este cliente.</p>
          )}
        </div>

        {autoGeneratePDF && <ComprobantePDF datos={selectedQuote} autoGenerate={autoGeneratePDF} />}
      </Dialog>
    </>
  );
};

export default WhatsAppDialog;
