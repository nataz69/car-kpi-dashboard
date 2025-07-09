// pages/index.js
import Head from 'next/head'
import { useState, useEffect, useRef } from 'react'

export default function Home() {
  const [previewSrc, setPreviewSrc] = useState(null)
  const [boxVisible, setBoxVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [statusMsg, setStatusMsg] = useState(null)
  const fileInputRef = useRef()
  const [fileName, setFileName] = useState('Nenhum arquivo selecionado')

  useEffect(() => {
    setTimeout(() => setBoxVisible(true), 200)
  }, [])

  // Gera entre 16 e 32 nuvens
  const clouds = Array.from({ length: 22 }).map((_, i) => ({
    top: `${8 + (i % 9) * 7}%`,
    left: `${-240 + (i * 110)}px`,
    dur: `${35 + (i % 6) * 7 + Math.random() * 8}s`,
    z: (i % 5 === 0 ? 2 : 1)
  }))

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
            className="cloud"
            style={{
              top: c.top,
              left: c.left,
              animationDuration: c.dur,
              zIndex: c.z,
              opacity: c.z === 2 ? 0.75 : 0.92,
              filter: c.z === 2 ? 'blur(0.8px)' : undefined,
              animationDelay: `${i * 2.7}s`,
            }}
          />
        ))}
        <img src="/logo-mse.png" alt="Logo MSE" className="logo-cloud" />
        <div className="ground" />
        <div className="workers">
          {[1,2,3,4,5].map(i => (
            <img
              key={i}
              src={`/trabalhador_${i}-removebg-preview.png`}
              alt={`Trabalhador ${i}`}
              className="worker pixel-art"
              style={{ height: '62px', marginBottom: '-2px' }}
            />
          ))}
          <img src="/trator-pixel.png" alt="Máquina" className="machine pixel-art" style={{ height: '104px' }} />
        </div>
        <img src="/car-pixel.png" alt="Carro Pixel" className="car pixel-art" style={{ height: '72px' }} />

        {/* FORMULÁRIO MAIS COMPACTO, UPLOAD BONITO */}
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

              // Use o endpoint que você passou!
              const res = await fetch("https://script.google.com/macros/s/AKfycbyEiNs6ttPbr6XPggLIHBqtNCHkgjjITw8-HOI6IpUck8359HWkq4AW8QZgA1sTbDZq/exec", {
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
                headers: { "Content-Type": "application/json" }
              });
              const result = await res.json();
              setLoading(false);
              if (result.success) {
                setStatusMsg({ type: "success", text: "Enviado com sucesso! Dados registrados." });
                e.target.reset();
                setPreviewSrc(null);
                setFileName('Nenhum arquivo selecionado')
              } else {
                setStatusMsg({ type: "error", text: "Erro ao enviar: " + result.error });
              }
            }}
          >
            <h1>
              <span style={{ color: "#111", fontWeight: 900 }}>Envio de</span> <span className="red-detail">KPI de KM</span>
            </h1>
            <div className="fields">
              <div className="input-group">
                <label htmlFor="plate">Placa</label>
                <input id="plate" name="plate" type="text" required placeholder="ABC-1234" />
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
                <div className="custom-upload">
                  <button type="button" className="upload-btn" onClick={() => fileInputRef.current.click()}>Escolher Arquivo</button>
                  <span className="file-label">{fileName}</span>
                  <input
                    id="photo"
                    name="photo"
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={e => {
                      const f = e.target.files[0]
                      setPreviewSrc(f ? URL.createObjectURL(f) : null)
                      setFileName(f ? f.name : 'Nenhum arquivo selecionado')
                    }}
                    style={{ display: 'none' }}
                  />
                </div>
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
            <button type="submit" className="submit-btn">
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
      </div>
      <style jsx>{`
        html, body, #__next, .app { height: 100%; width: 100%; }
        .app {
          position: relative;
          width: 100vw; height: 100vh;
          overflow: hidden;
          font-family: 'Inter', Arial, sans-serif;
        }
        .pixel-art { image-rendering: pixelated; }
        .sky { position: absolute; inset: 0;
          background: linear-gradient(180deg, #2e7dd8 0%, #72c3fc 55%, #ffffff 100%);
          z-index: 0;
        }
        .cloud {
          position: absolute; width: 180px; height: 100px; background: url('/cloud-pixel.png') no-repeat center; background-size: contain;
          animation: cloudsMove linear infinite, cloudFadeOut 1s linear forwards;
          z-index: 1;
          transition: opacity 0.7s linear;
        }
        @keyframes cloudsMove { from { transform: translateX(0); opacity: 1;} to { transform: translateX(120vw); opacity: 0; } }
        @keyframes cloudFadeOut { from{ opacity: 1;} to { opacity: 0;}}
        .logo-cloud { position: absolute; width: 108px; left: 8vw; top: 10%; z-index: 2;}
        .ground { position: absolute; bottom: 0; left: 0; width: 200%; height: 88px; background: url('/chao-pixel.png') repeat-x bottom; background-size: auto 88px; animation: groundScroll 13s linear infinite; z-index: 2;}
        @keyframes groundScroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .workers { position: absolute; bottom: 87px; left: 0; display: flex; align-items: flex-end; gap: 54px; width: 790px; animation: workersScroll 13s linear infinite; z-index: 3;}
        .worker { width: 58px;}
        .machine { width: 92px;}
        @keyframes workersScroll { from { transform: translateX(100%); } to { transform: translateX(-100%); } }
        .car { position: absolute; bottom: 86px; left: 53vw; transform: translateX(-50%); width: 170px; animation: carBounce 1.05s ease-in-out infinite alternate; z-index: 4;}
        @keyframes carBounce { to { transform: translate(-50%, -7px);} }
        .form-wrapper {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          pointer-events: none;
        }
        .kpi-form {
          min-width: 330px;
          max-width: 375px;
          max-height: 495px;
          width: 94vw;
          background: #fff;
          border-radius: 19px;
          padding: 2.1rem 2.0rem 2.0rem 2.0rem;
          box-shadow: 0 7px 36px #1d1a1a22, 0 1.5px 14px 0 #e6000022;
          display: flex; flex-direction: column; align-items: stretch;
          opacity: 0;
          transform: scale(.97) translateY(20px);
          transition: all .7s cubic-bezier(.77,0,.18,1);
          border: 1.5px solid #e2e6ef;
          position: relative;
          overflow-y: auto;
          pointer-events: auto;
        }
        .kpi-in {
          opacity: 1;
          transform: scale(1) translateY(0);
          animation: formPop .6s cubic-bezier(.56,-0.37,.61,1.29);
        }
        @keyframes formPop {
          0% { opacity:0; transform: scale(.93) translateY(28px);}
          75% { opacity:1; transform: scale(1.03) translateY(-8px);}
          100% { opacity:1; transform: scale(1) translateY(0);}
        }
        .kpi-form h1 {
          margin: 0 0 1.0rem 0;
          font-size: 1.18rem;
          font-weight: 900;
          letter-spacing: .07rem;
          text-align: center;
        }
        .red-detail { color: #e60000; }
        .fields { display: flex; flex-direction: column; gap: 1.02rem; margin-bottom: 0.95rem; }
        .input-group { display: flex; flex-direction: column; gap: 0.20rem; }
        .input-group label { color: #161a23; font-weight: 700; font-size: 1rem; margin-bottom: 1px; }
        .input-group input[type="text"], .input-group input[type="number"], .input-group textarea {
          padding: 0.79rem 1rem;
          border-radius: 8px;
          border: 2px solid #e60000;
          font-size: 1.02rem;
          color: #222;
          font-family: inherit;
          font-weight: 700;
          background: #fff;
          transition: border 0.18s, box-shadow 0.18s;
          outline: none;
        }
        .input-group input[type="text"]:focus,
        .input-group input[type="number"]:focus,
        .input-group textarea:focus {
          border-color: #b00000;
          background: #f8f9fa;
        }
        /* ==== Custom Upload ==== */
        .custom-upload {
          display: flex; align-items: center; gap: 0.68rem;
          margin-top: 2px;
        }
        .upload-btn {
          background: #e60000;
          color: #fff;
          border: none;
          padding: 0.55rem 1.13rem;
          border-radius: 7px;
          font-weight: 800;
          font-size: 1rem;
          box-shadow: 0 1px 9px #e6000012;
          cursor: pointer;
          transition: background .15s;
        }
        .upload-btn:hover, .upload-btn:focus { background: #b00000; }
        .file-label {
          font-size: 0.95rem;
          color: #666;
          font-weight: 500;
          max-width: 120px;
          overflow-x: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .preview-wrap { text-align: center; }
        .preview {
          margin-top: 0.50rem;
          width: 92%;
          border-radius: 10px;
          border: 2px solid #e60000;
        }
        .submit-btn {
          margin-top: 1.3rem;
          padding: 1.08rem 0;
          background: #e60000;
          border: none;
          color: #fff;
          font-size: 1.13rem;
          font-weight: 800;
          border-radius: 12px;
          box-shadow: 0 3.5px 18px #e6000023, 0 1px 4px #e6000010;
          cursor: pointer;
          width: 100%;
          letter-spacing: .07rem;
          transition: background .13s;
          outline: none;
          border-bottom: 4px solid #b00000;
        }
        .submit-btn:active,
        .submit-btn:focus { background: #b00000; }
        .modal-overlay {
          position: fixed; z-index: 9999; top: 0; left: 0; right: 0; bottom: 0;
          width: 100vw; height: 100vh;
          display: flex; align-items: center; justify-content: center;
          background: rgba(30,30,30,0.13); transition: background 0.18s; pointer-events: all;
        }
        .status-modal {
          background: #fff; border-radius: 14px; padding: 2.2rem 2.3rem;
          box-shadow: 0 8px 24px #0002; font-size: 1.09rem; font-weight: 700; min-width: 230px; max-width: 96vw; text-align: center; border: 2.2px solid #e60000; color: #194579; animation: pop .22s;
        }
        .status-modal.success { border: 2.2px solid #3bb233; color: #217a26; }
        .status-modal.error   { border: 2.2px solid #e60000; color: #e60000; }
        .status-modal.loading { border: 2.2px dashed #194579; }
        .loader {
          display: inline-block;
          width: 22px;
          height: 22px;
          border: 4px solid #e60000;
          border-top: 4px solid #fff;
          border-radius: 50%;
          animation: spin 0.85s linear infinite;
          margin-right: 13px;
          vertical-align: -6px;
        }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        /* === SCROLLBAR BONITA NO FORMULÁRIO === */
        .kpi-form::-webkit-scrollbar {
          width: 11px;
          background: transparent;
        }
        .kpi-form::-webkit-scrollbar-thumb {
          background: #e60000;
          border-radius: 10px;
          border: 3px solid #fff;
        }
        .kpi-form::-webkit-scrollbar-track {
          background: transparent;
        }
        /* Para Firefox */
        .kpi-form {
          scrollbar-color: #e60000 #fff;
          scrollbar-width: thin;
        }
        @media (max-width: 700px) {
          .form-wrapper { padding: 0; }
          .kpi-form { min-width: 0; width: 100vw; max-width: 99vw; max-height: 83vh; padding: 2.1rem 0.5rem; }
        }
      `}</style>
    </>
  )
}
