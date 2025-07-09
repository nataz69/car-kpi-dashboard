import Head from 'next/head'
import { useState, useEffect } from 'react'

export default function Home() {
  const [previewSrc, setPreviewSrc] = useState(null)
  const [boxVisible, setBoxVisible] = useState(false)
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null); // { type: "success" | "error", text: "..." }
  
  useEffect(() => {
    setTimeout(() => setBoxVisible(true), 400)
  }, [])

  // Nuvens animadas
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
        {/* Nuvens */}
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
                  plate: formData.get('plate'),
                  model: formData.get('model'),
                  responsible: formData.get('responsible'),
                  km: formData.get('km'),
                  obra: formData.get('obra'),
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
                <label htmlFor="plate">Placa</label>
                <input id="plate" name="plate" type="text" required placeholder="ABC-1234"/>
              </div>
              <div className="input-group">
                <label htmlFor="model">Veículo/Modelo</label>
                <input id="model" name="model" type="text" required placeholder="Ford Cargo"/>
              </div>
              <div className="input-group">
                <label htmlFor="obra">Obra</label>
                <input id="obra" name="obra" type="text" required placeholder="Ex: Elkem, Guarapuava, etc" />
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
        /* ...demais estilos... */
        .form-wrapper {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          z-index: 10;
          overflow: hidden;
        }
        .kpi-form {
          min-width: 355px;
          max-width: 370px;
          max-height: 80vh;
          overflow-y: auto;
          background: #fff;
          border-radius: 12px;
          padding: 2.2rem 2.1rem 2rem 2.1rem;
          box-shadow: 0 4px 18px #2222  ;
          display: flex; flex-direction: column; align-items: stretch;
          opacity: 0;
          transform: scale(.96) translateY(30px);
          transition: all .6s cubic-bezier(.77,0,.18,1);
          border: 1.5px solid #e7eaf0;
          position: relative;
          scrollbar-width: thin;
          scrollbar-color: #e60000 #eee;
        }
        .kpi-form::-webkit-scrollbar {
          width: 10px;
          background: #eee;
          border-radius: 8px;
        }
        .kpi-form::-webkit-scrollbar-thumb {
          background: #e60000;
          border-radius: 8px;
          border: 2px solid #eee;
        }
        @media (max-width: 600px) {
          .kpi-form { min-width: 0; width: 97vw; max-height: 94vh; }
          .kpi-form::-webkit-scrollbar { display: none; }
        }
        /* ...restante do seu CSS (sky, cloud, etc) permanece igual... */
      `}</style>
    </>
  )
}
