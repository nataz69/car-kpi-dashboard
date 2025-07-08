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

  // nuvens
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
        {/* Trabalhadores e máquina */}
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

        {/* FORMULÁRIO */}
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
              if (!file) {
                setLoading(false);
                setStatusMsg({ type: "error", text: "Por favor, selecione uma foto." });
                return;
              }

              // Converte imagem para base64
              const toBase64 = file => new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
              });

              const base64 = await toBase64(file);
              const base64Data = base64.split(',')[1];
              const photoType = file.type;
              const photoName = file.name || "painel.jpg";

              // ENVIA para API intermediária Next.js (sem CORS)
              const res = await fetch("/api/enviar-kpi", {
                method: "POST",
                body: JSON.stringify({
                  obra: formData.get('obra'),
                  plate: formData.get('plate'),
                  model: formData.get('model'),
                  responsible: formData.get('responsible'),
                  km: formData.get('km'),
                  photoBase64: base64Data,
                  photoType,
                  photoName
                }),
                headers: {
                  "Content-Type": "application/json"
                }
              });

              const result = await res.json();
              if (result.success) {
                setLoading(false);
                setStatusMsg({ type: "success", text: "Enviado com sucesso! Foto salva no Drive." });
                e.target.reset();
                setPreviewSrc(null);
                setTimeout(() => setStatusMsg(null), 2000); // some a mensagem de sucesso
              } else {
                setLoading(false);
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
                <label htmlFor="plate">Placa</label>
                <input id="plate" name="plate" type="text" required placeholder="ABC-1234"/>
              </div>
              <div className="input-group">
                <label htmlFor="model">Veículo/Modelo</label>
                <input id="model" name="model" type="text" required placeholder="Ford Cargo"/>
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
                <label htmlFor="photo">Foto do Painel</label>
                <input
                  id="photo"
                  name="photo"
                  type="file"
                  required
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
        </div>
        <iframe name="hiddenFrame" style={{ display: 'none' }} />
      </div>
      {/* OVERLAY para carregando/sucesso/erro */}
      {(loading || statusMsg) && (
        <div className="overlay">
          <div className={`status-modal ${loading ? "loading" : statusMsg?.type}`}>
            {loading
              ? <><div className="loader" /> Enviando, aguarde...</>
              : statusMsg?.text
            }
          </div>
        </div>
      )}
      <style jsx>{`
        .app, html, body { margin: 0; padding: 0; box-sizing: border-box; height: 100vh; }
        .app {
          position: relative;
          width: 100vw;
          height: 100vh;
          overflow-y: auto;  /* permite rolar vertical no mobile */
          overflow-x: hidden;
          font-family: 'Inter', Arial, sans-serif;
        }
        .pixel-art { image-rendering: pixelated; }
        .sky { position: absolute; inset: 0;
          background: linear-gradient(180deg, #2e7dd8 0%, #72c3fc 55%, #ffffff 100%);
          z-index: 0;
        }
        /* ANIMAÇÃO DEGRADÊ DA NUVEM */
        .cloud {
          position: absolute;
          width: 180px; height: 100px;
          background: url('/cloud-pixel.png') no-repeat center;
          background-size: contain;
          animation: cloudsMove linear infinite;
          z-index: 1;
          -webkit-mask-image: linear-gradient(90deg, #000 80%, transparent 99%);
          mask-image: linear-gradient(90deg, #000 80%, transparent 99%);
        }
        @keyframes cloudsMove {
          from { transform: translateX(0); opacity: 1; }
          to   { transform: translateX(120vw); opacity: 0; }
        }
        .logo-cloud { position: absolute; width: 108px; left: 8vw; top: 10%; z-index: 2; animation: logoCloudFloat 39s linear infinite;}
        @keyframes logoCloudFloat {
          0%   { left: 8vw;   top:10%;  opacity:1;}
          12%  { left: 18vw;  top:15%;}
          41%  { left: 33vw;  top:13%;}
          60%  { left: 65vw;  top:16%;}
          80%  { left: 90vw;  top:10%;}
          100% { left: 115vw; top:11%; opacity:0.1;}
        }
        .ground { position: absolute; bottom: 0; left: 0; width: 200%; height: 88px; background: url('/chao-pixel.png') repeat-x bottom; background-size: auto 88px; animation: groundScroll 13s linear infinite; z-index: 2;}
        @keyframes groundScroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .workers { position: absolute; right:7vw; left: auto; display: flex; align-items: flex-end; gap: 54px; width: 790px; animation: workersScroll 13s linear infinite; z-index: 3;}
        .workers { bottom: 70px; }
        .worker { width: 58px;}
        .machine { width: 125px; }
        @keyframes workersScroll { from { transform: translateX(100%); } to { transform: translateX(-100%); } }
        .car { position: absolute; left: 53vw; transform: translateX(-50%); width: 170px; animation: carBounce 1.05s ease-in-out infinite alternate; z-index: 4;}
        .car { bottom: 69px; }
        @keyframes carBounce { to { transform: translate(-50%, -7px);} }

        .form-wrapper {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          z-index: 10;
        }
        .kpi-form {
          min-width: 355px;
          max-width: 370px;
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
        }
        .kpi-in {
          opacity: 1;
          transform: scale(1) translateY(0);
          animation: formPop .58s cubic-bezier(.56,-0.37,.61,1.29);
        }
        @keyframes formPop {
          0% { opacity:0; transform: scale(.94) translateY(38px);}
          75% { opacity:1; transform: scale(1.03) translateY(-9px);}
          100% { opacity:1; transform: scale(1) translateY(0);}
        }
        .form-title {
          margin: 0 0 1.4rem 0;
          font-size: 1.26rem;
          font-weight: 800;
          letter-spacing: .01rem;
          color: #222;
          text-align: center;
        }
        .red-detail { color: #e60000; font-weight: 800; }
        .fields {
          display: flex;
          flex-direction: column;
          gap: 1.1rem;
          margin-bottom: 1.15rem;
        }
        .input-group {
          display: flex;
          flex-direction: column;
          gap: 0.22rem;
        }
        .input-group label {
          color: #222;
          font-weight: 600;
          font-size: 1.01rem;
          margin-bottom: 2px;
          transition: color .2s;
        }
        .input-group input[type="text"]:focus + label,
        .input-group input[type="number"]:focus + label {
          color: #e60000;
        }
        .input-group input[type="text"],
        .input-group input[type="number"] {
          padding: 0.82rem 0.9rem;
          border-radius: 8px;
          border: 1.5px solid #e60000;
          font-size: 1.02rem;
          color: #222;
          background: #fafbfc;
          font-family: inherit;
          font-weight: 600;
          letter-spacing: .3px;
          transition: border 0.2s, box-shadow 0.22s;
          outline: none;
          box-shadow: 0 1.5px 7px #e6000020;
        }
        .input-group input[type="text"]:focus,
        .input-group input[type="number"]:focus {
          border-color: #111;
          box-shadow: 0 3px 14px #e6000033, 0 2px 4px #e6000015;
        }
        .input-group input[type="file"] { margin-top: 2px; color: #e60000; font-weight: 600;}
        .input-group input[type="file"]::-webkit-file-upload-button {
          color: #fff;
          background: #e60000;
          border: none;
          border-radius: 7px;
          padding: 6px 14px;
          cursor: pointer;
          font-weight: 600;
          transition: background 0.2s;
        }
        .input-group input[type="file"]:hover::-webkit-file-upload-button {
          background: #bb0000;
        }
        .preview-wrap { text-align: center; }
        .preview {
          margin-top: 0.59rem;
          width: 92%;
          max-width: 330px;
          max-height: 190px;
          object-fit: contain;
          border-radius: 11px;
          border: 2px solid #e60000;
          background: #fafafa;
        }
        button[type="submit"] {
          margin-top: .65rem;
          background: #e60000;
          color: #fff;
          font-size: 1.13rem;
          font-weight: bold;
          padding: .83rem 0;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          box-shadow: 0 2px 12px #e6000035;
          letter-spacing: 1px;
          transition: background 0.18s, box-shadow 0.18s, transform 0.18s;
        }
        button[type="submit"]:hover, button[type="submit"]:focus {
          background: #bb0000;
          box-shadow: 0 6px 18px #e6000040;
          transform: scale(1.03) translateY(-2px);
        }

        /* OVERLAY MODAL */
        .overlay {
          position: fixed;
          inset: 0;
          background: rgba(22, 33, 50, 0.23);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.22s;
        }
        .status-modal {
          background: #fff;
          border-radius: 17px;
          padding: 2.2rem 2.3rem;
          box-shadow: 0 8px 42px #2226;
          font-size: 1.14rem;
          font-weight: 700;
          color: #194579;
          text-align: center;
          min-width: 240px;
          max-width: 96vw;
          animation: pop .22s;
        }
        @keyframes pop {
          from { transform: scale(.85); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }
        .status-modal.success { border: 2.2px solid #3bb233; color: #217a26; }
        .status-modal.error   { border: 2.2px solid #e60000; color: #e60000; }
        .status-modal.loading { border: 2.2px dashed #194579; color: #194579; }

        .loader {
          border: 3.2px solid #e6e6e6;
          border-top: 3.2px solid #e60000;
          border-radius: 50%;
          width: 28px;
          height: 28px;
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
      `}
      </style>
    </>
  )
}
