import React, { useMemo, useState } from "react";
import axios from "axios";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Message } from "primereact/message";
import { Divider } from "primereact/divider";
import config from "./Config";
import "./Login.css";

const INITIAL_FORM = {
  nombre: "",
  clave: "",
};

const getFieldError = (name, value) => {
  const cleaned = value.trim();

  if (name === "nombre" && !cleaned) {
    return "El usuario es obligatorio.";
  }

  if (name === "clave" && !cleaned) {
    return "La contraseña es obligatoria.";
  }

  return "";
};

const getFriendlyLoginError = (error, fallbackMessage) => {
  if (fallbackMessage) return fallbackMessage;

  const rawMessage = String(error?.message || "");

  if (
    rawMessage.includes("Network Error") ||
    rawMessage.includes("Failed to fetch")
  ) {
    return "No se pudo conectar al servidor. Verifica tu conexión e inténtalo nuevamente.";
  }

  return "No fue posible iniciar sesión. Valida tus credenciales e inténtalo de nuevo.";
};

const Login = ({ onLoginSuccess }) => {
  const apiUrl = useMemo(
    () => `${config.apiUrl}/Datasnap/rest/TServerMethods1/Login`,
    []
  );

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formValues, setFormValues] = useState(INITIAL_FORM);
  const [touched, setTouched] = useState({ nombre: false, clave: false });

  const fieldErrors = useMemo(
    () => ({
      nombre: getFieldError("nombre", formValues.nombre),
      clave: getFieldError("clave", formValues.clave),
    }),
    [formValues]
  );

  const isFormInvalid = Boolean(fieldErrors.nombre || fieldErrors.clave);

  const updateField = (name, value) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
    setErrorMessage("");
  };

  const handleBlur = (name) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setTouched({ nombre: true, clave: true });
    if (isFormInvalid) return;

    try {
      setLoading(true);
      const payload = {
        nombre: formValues.nombre.trim(),
        clave: formValues.clave,
      };

      const response = await axios.post(apiUrl, payload);

      if (response?.data?.status === 200) {
        onLoginSuccess({
          name: response.data.nombre,
          codigo: response.data.codigo,
          modvencli: response.data.modvencli,
        });
        return;
      }

      setErrorMessage(
        getFriendlyLoginError(null, response?.data?.error || response?.data?.message)
      );
    } catch (error) {
      setErrorMessage(getFriendlyLoginError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <Card className="login-card">
        <div className="login-card__brand">
          <h1>Control de Entregas</h1>
          <p>Accede con tu usuario para continuar.</p>
        </div>

        <Divider />

        <form onSubmit={handleSubmit} noValidate>
          <div className="login-field">
            <label htmlFor="nombre">Usuario</label>
            <span className="p-input-icon-left">
              <i className="pi pi-user" />
              <InputText
                id="nombre"
                name="nombre"
                autoComplete="username"
                placeholder="Ingresa tu usuario"
                value={formValues.nombre}
                onChange={(e) => updateField("nombre", e.target.value)}
                onBlur={() => handleBlur("nombre")}
                className={touched.nombre && fieldErrors.nombre ? "p-invalid" : ""}
              />
            </span>
            {touched.nombre && fieldErrors.nombre && (
              <small className="login-field__error">{fieldErrors.nombre}</small>
            )}
          </div>

          <div className="login-field">
            <label htmlFor="clave">Contraseña</label>
            <div className="login-password-row">
              <span className="p-input-icon-left login-password-input">
                <i className="pi pi-lock" />
                <InputText
                  id="clave"
                  name="clave"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Ingresa tu contraseña"
                  value={formValues.clave}
                  onChange={(e) => updateField("clave", e.target.value)}
                  onBlur={() => handleBlur("clave")}
                  className={touched.clave && fieldErrors.clave ? "p-invalid" : ""}
                />
              </span>

              <Button
                type="button"
                icon={showPassword ? "pi pi-eye-slash" : "pi pi-eye"}
                text
                rounded
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                onClick={() => setShowPassword((prev) => !prev)}
              />
            </div>

            {touched.clave && fieldErrors.clave && (
              <small className="login-field__error">{fieldErrors.clave}</small>
            )}
          </div>

          {errorMessage && (
            <Message severity="error" text={errorMessage} className="login-message" />
          )}

          <Button
            type="submit"
            label="Iniciar sesión"
            icon="pi pi-sign-in"
            className="login-submit"
            loading={loading}
            disabled={loading || isFormInvalid}
          />
        </form>
      </Card>
    </div>
  );
};

export default React.memo(Login);
