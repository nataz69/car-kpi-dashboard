import Head from 'next/head'
import { useState, useEffect } from 'react'

export default function Home() {
  const [previewSrc, setPreviewSrc] = useState(null)
  const [boxVisible, setBoxVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [statusMsg, setStatusMsg] = useState(null)

  useEffect(() => {
    setTimeout(() => setBoxVisible(true), 400)
  }, [])

  // clouds (padrão)
  const clouds = [
    { top: '12%', left: '-150px', dur: '37s', z: 1 },
    { top: '26%', left: '-600px', dur: '48s', z: 1 },
    { top: '6%',  left: '-1100px', dur: '42s', z: 1 },
    { top: '32%', left: '-1700px', dur: '53s', z: 1 },
    { top: '18%', left: '-2100px', dur: '57s', z: 1 },
    { top: '22%', left: '-900px', dur: '43s', z: 2 },
    { top: '10%', left: '-250px', dur: '51s', z: 2 },
    { top: '30%', left: '-1300px', dur: '41s', z: 2 },
    { top: '16%', left: '-1900px', dur: '49s', z: 2 },
    { top: '8%',  left: '-2300px', dur: '55s', z: 2 },
    { top: '25%', left: '-700px', dur: '59s', z: 1 },
    { top: '20%', left: '-300px', dur: '46s', z: 2 },
  ]

  return (
    <>
      <Head>
        <title>Car KPI Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="app">
        <div className="sky" />
        {clouds.map((c, i) => (
          <div
            key={i}
            className={`cloud cloud${i}`}
            style={{
              top: c.top,
              left: c.left,
              animationDuration: c.dur,
              zIndex: c.z,
              opacity: c.z === 1 ? 0.85 : 0.7 + (i % 3) * 0.08,
              filter: c.z === 2 ? 'blur(1px)' : undefined,
            }}
          />
        ))}
        <img src="/logo-mse.png" alt="Logo MSE" className="logo-cloud" />
        <div className="ground" />
        <div className="workers" style={{ bottom: 70 }}>
          {[1,2,3,4,5].map(i => (
            <img
              key={i}
              src={`/trabalhador_${i}-removebg-preview.png`}
              alt={`Trabalhador ${i}`}
              className="worker pixel-art"
            />
          ))}
          <img
            src="/trator-pixel.png"
            alt="Máquina"
            className="machine pixel-art"
            style={{ width: 125 }}
          />
        </div>
        <img
          src="/car-pixel.png"
          alt="Carro Pixel"
          className="car pixel-art"
          style={{ bottom: 69 }}
        />

        <div className="form-wrapper">
          <form
            className={`kpi-form ${boxVisible ? 'kpi-in' : ''}`}
            autoComplete="off"
            onSubmit={async (e) => {
              e.preventDefault();
              setLoading(true);
              setStatusMsg(null);

              const formData = new FormData(e.target);
              const file = formData.get('photo');
              let base64Data = "";
              let photoType = "";
              let photoName = "";

              // Só gera base64 se houver foto
              if (file && file.size > 0) {
                const toBase64 = file => new Promise((resolve, reject) => {
                  const reader = new FileReader();
                  reader.readAsDataURL(file);
                  reader.onload = () => resolve(reader.result);
                  reader.onerror = reject;
                });
                const base64 = await toBase64(file);
                base64Data = base64.split(',')[1];
                photoType = file.type;
                photoName = file.name || "painel.jpg";
              }

              const res = await fetch("/api/enviar-kpi", {
                method: "POST",
                body: JSON.stringify({
                  obra: formData.get('obra'),
                  model: formData.get('model'),
                  plate: formData.get('plate'),
                  responsible: formData.get('responsible'),
                  km: formData.get('km'),
                  observacao: formData.get('observacao'),
                  photoBase64: base64Data,
                  photoType,
                  photoName
                }),
                headers: {
                  "Content-Type": "application/json"
                }
              });
              const result = await res.json();
              setLoading(false);
              if (result.success) {
                setStatusMsg({ type: "success", text: "Enviado com sucesso! Dados registrados." });
                e.target.reset();
                setPreviewSrc(null);
              } else {
                setStatusMsg({ type: "error", text: "Erro ao enviar: " + result.error });
              }
            }}
          >
            <h1 className="form-title">
              Envio de <span className="red-detail">KPI de KM</span>
            </h1>
            <div className="fields">
              <div className="input-group">
                <label htmlFor="obra">Obra</label>
                <input id="obra" name="obra" type="text" required placeholder="Ex: Elkem, Guarapuava, etc" />
              </div>
              <div className="input-group">
                <label htmlFor="model">Veículo/Modelo</label>
                <input id="model" name="model" type="text" required placeholder="Ford Cargo"/>
              </div>
              <div className="input-group">
                <label htmlFor="plate">Placa</label>
                <input id="plate" name="plate" type="text" required placeholder="ABC-1234"/>
              </div>
              <div className="input-group">
                <label htmlFor="responsible">Responsável</label>
                <input id="responsible" name="responsible" type="text" required placeholder="Nome"/>
              </div>
              <div className="input-group">
                <label htmlFor="km">Quilometragem (km)</label>
                <input id="km" name="km" type="number" min="0" required placeholder="0"/>
              </div>
              <div className="input-group">
                <label htmlFor="observacao">Observação</label>
                <textarea id="observacao" name="observacao" rows={2} placeholder="Opcional"></textarea>
              </div>
              <div className="input-group">
                <label htmlFor="photo">Foto do Painel (opcional)</label>
                <input
                  id="photo"
                  name="photo"
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    const f = e.target.files[0]
                    setPreviewSrc(f ? URL.createObjectURL(f) : null)
                  }}
                />
              </div>
              {previewSrc && (
                <div className="preview-wrap">
                  <img
                    src={previewSrc}
                    alt="Pré-visualização"
                    className="preview"
                  />
                </div>
              )}
            </div>
            <button type="submit">
              <span role="img" aria-label="car">🚗</span> Enviar KPI
            </button>
          </form>
          {(loading || statusMsg) && (
            <div className="modal-overlay">
              <div className={`status-modal${loading ? " loading" : ""}${statusMsg ? " " + statusMsg.type : ""}`}>
                {loading
                  ? (<><span className="loader"></span> Enviando, aguarde...</>)
                  : statusMsg?.text
                }
              </div>
            </div>
          )}
        </div>
        <iframe name="hiddenFrame" style={{ display: 'none' }} />
      </div>
      <style jsx>{`
        .modal-overlay {
          position: fixed;
          z-index: 9999;
          top: 0; left: 0; right: 0; bottom: 0;
          width: 100vw; height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(30,30,30,0.18);
          transition: background 0.22s;
          pointer-events: all;
        }
        .status-modal {
          background: #fff;
          border-radius: 14px;
          padding: 2.2rem 2.3rem;
          box-shadow: 0 8px 24px #0002;
          font-size: 1.13rem;
          font-weight: 700;
          min-width: 230px;
          max-width: 96vw;
          text-align: center;
          border: 2.2px solid #e60000;
          color: #194579;
          animation: pop .22s;
        }
        .status-modal.success { border: 2.2px solid #3bb233; color: #217a26; }
        .status-modal.error   { border: 2.2px solid #e60000; color: #e60000; }
        .status-modal.loading { border: 2.2px dashed #194579; color: #194579; }
        .loader {
          border: 3.2px solid #e6e6e6;
          border-top: 3.2px solid #e60000;
          border-radius: 50%;
          width: 28px; height: 28px;
          display: inline-block;
          margin-bottom: 0.3rem;
          margin-right: 0.6rem;
          vertical-align: middle;
          animation: spin 0.75s linear infinite;
        }
        @keyframes spin {
          0%   { transform: rotate(0deg);}
          100% { transform: rotate(360deg);}
        }
        @media (max-width: 600px) {
          .status-modal {
            padding: 1.1rem 0.8rem;
            font-size: 1.07rem;
            min-width: 0;
            width: 98vw;
          }
        }
      `}
      </style>
    </>
  )
}
