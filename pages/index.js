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

  // clouds
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
        .app, html, body { margin: 0; padding: 0; box-sizing: border-box; background: #6fb2f7; }
        .app { position: relative; width: 100vw; height: 100vh; overflow: hidden; font-family: 'Inter', Arial, sans-serif; }
        .pixel-art { image-rendering: pixelated; }
        .sky { position: absolute; inset: 0;
          background: linear-gradient(180deg, #2e7dd8 0%, #72c3fc 55%, #ffffff 100%);
          z-index: 0;
        }
        .cloud { position: absolute; width: 180px; height: 100px; background: url('/cloud-pixel.png') no-repeat center; background-size: contain; opacity: 0.83; animation: cloudsMove linear infinite; z-index: 1;}
        .cloud1 { top: 12%; left: -150px; animation-duration: 37s;}
        .cloud2 { top: 26%; left: -600px; animation-duration: 48s;}
        .cloud3 { top: 6%;  left: -1100px; animation-duration: 42s;}
        .cloud4 { top: 32%; left: -1700px; animation-duration: 53s;}
        .cloud5 { top: 18%; left: -2100px; animation-duration: 57s;}
        @keyframes cloudsMove { from { transform: translateX(0); } to { transform: translateX(120vw); } }
        .logo-cloud { position: absolute; width: 108px; left: 8vw; top: 10%; z-index: 2; animation: logoCloudFloat 39s linear infinite;}
        @keyframes logoCloudFloat {
          0%   { left: 8vw;   top:10%;  opacity:1;}
          12%  { left: 18vw;  top:15%; }
          41%  { left: 33vw;  top:13%; }
          60%  { left: 65vw;  top:16%; }
          80%  { left: 90vw;  top:10%; }
          100% { left: 115vw; top:11%; opacity:0.1;}
        }
        .ground { position: absolute; bottom: 0; left: 0; width: 200%; height: 88px; background: url('/chao-pixel.png') repeat-x bottom; background-size: auto 88px; animation: groundScroll 13s linear infinite; z-index: 2;}
        @keyframes groundScroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .workers { position: absolute; bottom: 87px; left: 0; display: flex; align-items: flex-end; gap: 54px; width: 790px; animation: workersScroll 13s linear infinite; z-index: 3;}
        .worker { width: 58px;}
        .machine { width: 92px;}
        @keyframes workersScroll { from { transform: translateX(100%); } to { transform: translateX(-100%); } }
        .car { position: absolute; bottom: 86px; left: 53vw; transform: translateX(-50%); width: 170px; animation: carBounce 1.05s ease-in-out infinite alternate; z-index: 4;}
        @keyframes carBounce { to { transform: translate(-50%, -7px);} }
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
          border-radius: 19px;
          padding: 2.6rem 2.2rem 2.2rem 2.2rem;
          box-shadow: 0 7px 44px #16447540, 0 1.5px 14px 0 #e6000022;
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
        .kpi-in {
          opacity: 1;
          transform: scale(1) translateY(0);
          animation: formPop .68s cubic-bezier(.56,-0.37,.61,1.29);
        }
        @keyframes formPop {
          0% { opacity:0; transform: scale(.94) translateY(38px);}
          75% { opacity:1; transform: scale(1.03) translateY(-9px);}
          100% { opacity:1; transform: scale(1) translateY(0);}
        }
        .kpi-form h1 {
          margin: 0 0 2.1rem 0;
          font-size: 1.35rem;
          font-weight: 800;
          letter-spacing: .1rem;
          text-align: center;
        }
        .fields {
          display: flex;
          flex-direction: column;
          gap: 1.15rem;
          margin-bottom: 1.3rem;
        }
        .input-group {
          display: flex;
          flex-direction: column;
          gap: 0.33rem;
        }
        .input-group label {
          color: #e60000;
          font-weight: 700;
          font-size: 1.05rem;
          margin-bottom: 1px;
        }
        .input-group input[type="text"], .input-group input[type="number"], .input-group textarea {
          padding: 0.9rem 1rem;
          border-radius: 8px;
          border: 1.7px solid #c5cbe0;
          font-size: 1.04rem;
          color: #233;
          font-family: inherit;
          font-weight: 700;
          letter-spacing: .4px;
          background: #f8fafc;
          transition: border 0.17s, box-shadow 0.18s;
          outline: none;
          box-shadow: 0 1.5px 7px #e6000025;
        }
        .input-group input[type="text"]:focus, .input-group input[type="number"]:focus, .input-group textarea:focus {
          border-color: #e60000;
          background: #fff;
          box-shadow: 0 3px 14px #e6000033, 0 2px 4px #e6000015;
        }
        .input-group input[type="file"] { margin-top: 2px; color: #e60000; font-weight: 700;}
        .preview-wrap { text-align: center; }
        .preview {
          margin-top: 0.59rem;
          width: 92%;
          border-radius: 11px;
          border: 2px solid #e60000;
        }
        .kpi-form button[type="submit"] {
          margin-top: 2rem;
          padding: 1.14rem 0;
          background: #e60000;
          border: none;
          color: #fff;
          font-size: 1.17rem;
          font-weight: 800;
          border-radius: 11px;
          box-shadow: 0 3.5px 18px #e6000034, 0 1px 4px #e6000020;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          letter-spacing: .09rem;
          transition: background .16s;
        }
        .kpi-form button[type="submit"]:hover,
        .kpi-form button[type="submit"]:focus {
          background: #b00000;
        }
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
          .form-wrapper { align-items: flex-start; }
          .kpi-form { min-width: 0; width: 97vw; max-height: 94vh; }
          .kpi-form::-webkit-scrollbar { display: none; }
          .status-modal { padding: 1.1rem 0.8rem; font-size: 1.07rem; min-width: 0; width: 98vw;}
        }
      `}</style>
    </>
  )
}
