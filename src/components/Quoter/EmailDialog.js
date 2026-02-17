import { useState, useEffect, useRef, useCallback } from "react";
import { Dialog } from "primereact/dialog";
import { RadioButton } from "primereact/radiobutton";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import ComprobantePDF from "./ComprobantePDF";
import config from "../../Config";
import axios from "axios";

const EmailDialog = ({ visible, onHide, selectedQuote }) => {
  const apiUrlContactos = `${config.apiUrl}/Datasnap/rest/TServerMethods1/DataContactosCliente`;
  const apiSendEmail = `${config.apiUrl}/Datasnap/rest/TServerMethods1/SendEmail`;
  const [emailOptions, setEmailOptions] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useRef(null);

  const fetchContactsAndClient = useCallback(async () => {
    if (!selectedQuote?.cliente?.idcliente) {
      setEmailOptions([]);
      return;
    }

    try {
      const response = await axios.put(apiUrlContactos, {
        idcliente: selectedQuote.cliente.idcliente,
      });

      if (response?.data?.status === 200) {
        const cliente = response?.data?.cliente?.[0] || {};
        const contacts = response?.data?.contactos || [];

        const listacorreos = [
          {
            nombre: cliente.nombreclienteCa,
            key: cliente.idclienteCa,
            email: cliente.emailclienteCa,
          },
          ...contacts.map((contact) => ({
            nombre: contact.nombreCa,
            key: contact.idcontacto,
            email: contact.emailCa,
          })),
        ].filter((option) => option.email);

        setEmailOptions(listacorreos);
      } else {
        setEmailOptions([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setEmailOptions([]);
      toast.current?.show({
        severity: "error",
        summary: "Error de conexión",
        detail: "No fue posible cargar los correos del cliente.",
        life: 3200,
      });
    }
  }, [apiUrlContactos, selectedQuote]);

  useEffect(() => {
    if (visible) {
      setSelectedEmail(null);
      fetchContactsAndClient();
    }
  }, [visible, fetchContactsAndClient]);

  const handleSendEmail = async (pdfBlob) => {
    if (!selectedEmail) {
      toast.current?.show({
        severity: "warn",
        summary: "Selecciona un correo",
        detail: "Debes elegir un correo antes de enviar.",
        life: 2600,
      });
      setGeneratingPDF(false);
      return;
    }

    setLoading(true);

    try {
      const base64data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(pdfBlob);
        reader.onloadend = () => resolve(reader.result.split(",")[1]);
        reader.onerror = reject;
      });

      const jsonPayload = JSON.stringify({
        to: selectedEmail.email,
        pdf: base64data,
      });

      const response = await axios.post(apiSendEmail, jsonPayload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response?.data?.status === 200) {
        toast.current?.show({
          severity: "success",
          summary: "Correo enviado",
          detail: "El correo fue enviado correctamente al cliente.",
          life: 3200,
        });
      } else {
        toast.current?.show({
          severity: "error",
          summary: "No se pudo enviar",
          detail: "No fue posible enviar el correo. Intenta nuevamente.",
          life: 3200,
        });
      }
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error enviando correo",
        detail: "Ocurrió un problema al enviar el correo electrónico.",
        life: 3200,
      });
      console.error("Error enviando correo:", error);
    } finally {
      setLoading(false);
      setGeneratingPDF(false);
      onHide();
    }
  };

  const handleGenerateAndSendPDF = () => {
    setGeneratingPDF(true);
  };

  const handlePDFGenerated = (pdfBlob) => {
    handleSendEmail(pdfBlob);
  };

  const header = (
    <div className="quoter-message-dialog__header">
      <span className="quoter-message-dialog__icon quoter-message-dialog__icon--email">
        <i className="pi pi-envelope" />
      </span>
      <div>
        <h3 className="quoter-message-dialog__title">Enviar por correo</h3>
        <p className="quoter-message-dialog__subtitle">Selecciona el destinatario y envia la cotización con PDF adjunto.</p>
      </div>
    </div>
  );

  const footer = (
    <div className="quoter-message-dialog__footer">
      <Button label="Cancelar" icon="pi pi-times" outlined onClick={onHide} />
      <Button
        label="Enviar correo"
        icon="pi pi-send"
        severity="success"
        loading={loading}
        onClick={handleGenerateAndSendPDF}
        disabled={!selectedEmail || generatingPDF}
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
          {emailOptions.length > 0 ? (
            emailOptions.map((option) => (
              <label key={option.key} htmlFor={`email-${option.key}`} className="quoter-message-dialog__option">
                <RadioButton
                  inputId={`email-${option.key}`}
                  name="email"
                  value={option}
                  onChange={() => setSelectedEmail(option)}
                  checked={selectedEmail?.key === option.key}
                />
                <span>
                  {option.nombre} <strong>{option.email}</strong>
                </span>
              </label>
            ))
          ) : (
            <p className="quoter-message-dialog__empty">No hay correos electrónicos disponibles para este cliente.</p>
          )}
        </div>

        {generatingPDF && (
          <ComprobantePDF datos={selectedQuote} autoGenerate={true} onPDFGenerated={handlePDFGenerated} />
        )}
      </Dialog>
    </>
  );
};

export default EmailDialog;
