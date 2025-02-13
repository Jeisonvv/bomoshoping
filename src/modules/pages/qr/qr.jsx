import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";

const Qr = () => {
  const [qr, setQr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQrCode = async () => {
      setLoading(true);
      try {
        const url = import.meta.env.VITE_BACKEND_URL;
        const response = await fetch(`${url}/whatsapp/qr`);

        if (!response.ok) {
          throw new Error("Error al obtener el QR");
        }

        const data = await response.json();
        setQr(data.qrCode); // Ajusta según la respuesta de tu backend
      } catch (error) {
        console.error("Error al obtener el código QR:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQrCode();
  }, []);

  return (
    <div className="flex justify-center items-center min-h-screen">
      {loading ? (
        <p>Cargando QR...</p>
      ) : qr ? (
        <div style={{ background: "#fff" }}>
          <QRCodeSVG value={qr} size={256} style={{ padding: "20px" }} />
        </div>
      ) : (
        <p>No se pudo cargar el QR.</p>
      )}
      
    </div>
  );
};

export default Qr;
