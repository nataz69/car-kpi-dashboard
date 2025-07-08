// pages/api/enviar-kpi.js

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      // Repasse o body para o Apps Script
      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbyEiNs6ttPbr6XPggLIHBqtNCHkgjjITw8-HOI6IpUck8359HWkq4AW8QZgA1sTbDZq/exec",
        {
          method: "POST",
          body: JSON.stringify(req.body),
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = await response.json();
      res.status(200).json(data);
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
