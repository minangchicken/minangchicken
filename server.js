const express = require("express");
const fetch = require("node-fetch");

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// CORS Middleware
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// Log Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  if (req.method === "POST") console.log("Body:", req.body);
  next();
});

// GET /api/absensi
app.get("/api/absensi", async (req, res) => {
  try {
    const params = new URLSearchParams(req.query);
    const url = `https://script.google.com/macros/s/AKfycbzq6o_ZETi5HfSMaVFgRBxM2eTfqRDu3DIGnUm-pRhCfaUuqaZXmVxFtfKI93CdG0e_/exec?${params.toString()}`;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Gagal ambil data dari GAS" });
  }
});

// POST /api/absensi
app.post("/api/absensi", async (req, res) => {
  try {
    const response = await fetch("https://script.google.com/macros/s/AKfycbzq6o_ZETi5HfSMaVFgRBxM2eTfqRDu3DIGnUm-pRhCfaUuqaZXmVxFtfKI93CdG0e_/exec", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body)
    });
    const result = await response.json();
    res.json(result);
  } catch (error) {
    console.error("Error forwarding POST to GAS:", error);
    res.status(500).json({ success: false, message: "Gagal menghubungi GAS" });
  }
});

// GET /api/bahanstok=getBahanData
app.get("/api/bahanstok", async (req, res) => {
  const action = req.query.action;

  if (action === "getBahanData") {
    const GAS_URL = "https://script.google.com/macros/s/AKfycbzq6o_ZETi5HfSMaVFgRBxM2eTfqRDu3DIGnUm-pRhCfaUuqaZXmVxFtfKI93CdG0e_/exec?action=getBahanData";
    try {
      const response = await fetch(GAS_URL);
      const result = await response.json();
      res.json(result);
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  } else {
    res.status(400).json({ success: false, message: "Invalid action" });
  }
});

// GET /api/getBahanBakuInput
app.get("/api/bahanstokinput", async (req, res) => {
  const action = req.query.action;

  if (action === "getBahanBakuInput") {
    const GAS_URL = "https://script.google.com/macros/s/AKfycbzq6o_ZETi5HfSMaVFgRBxM2eTfqRDu3DIGnUm-pRhCfaUuqaZXmVxFtfKI93CdG0e_/exec?action=getBahanBakuInput";
    try {
      const response = await fetch(GAS_URL);
      const result = await response.json();
      res.json(result);
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  } else {
    res.status(400).json({ success: false, message: "Invalid action" });
  }
});

// POST /api/output-stok
app.post("/api/output-stok", async (req, res) => {
  try {
    // Kirim JSON langsung, bukan form-urlencoded
    const response = await fetch("https://script.google.com/macros/s/AKfycbzq6o_ZETi5HfSMaVFgRBxM2eTfqRDu3DIGnUm-pRhCfaUuqaZXmVxFtfKI93CdG0e_/exec", {
      method: "POST",
      headers: { "Content-Type": "application/json" },  // pastikan header JSON
      body: JSON.stringify(req.body)
    });
    const result = await response.json();
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
// POST /api/input-stok
app.post("/api/input-stok", async (req, res) => {
  try {
    const payload = {
      ...req.body,
      action: "addNewInputData" // ini penting untuk diarahkan di doPost GAS
    };

    const response = await fetch("https://script.google.com/macros/s/AKfycbzq6o_ZETi5HfSMaVFgRBxM2eTfqRDu3DIGnUm-pRhCfaUuqaZXmVxFtfKI93CdG0e_/exec", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    res.json(result);
  } catch (err) {
    console.error("Error forwarding input-stok to GAS:", err);
    res.status(500).json({ success: false, message: "Gagal menghubungi GAS (input-stok)" });
  }
});
// GET /api/output-stok-harian => mengambil data output stok dari GAS
app.get("/api/output-stok-harian", async (req, res) => {
  try {
    const GAS_URL = "https://script.google.com/macros/s/AKfycbzq6o_ZETi5HfSMaVFgRBxM2eTfqRDu3DIGnUm-pRhCfaUuqaZXmVxFtfKI93CdG0e_/exec?action=getOutputStok";

    const response = await fetch(GAS_URL);
    if (!response.ok) {
      const text = await response.text();
      console.error(`Error from GAS: Status ${response.status} - Response: ${text}`);
      return res.status(500).json({ success: false, message: "Error dari GAS: " + text });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Gagal mengambil data output stok:", error);
    res.status(500).json({ success: false, message: "Gagal mengambil data output stok" });
  }
});

// POST /api/keuangan
app.post("/api/keuangan", async (req, res) => {
  try {
    const GAS_URL = "https://script.google.com/macros/s/AKfycbzq6o_ZETi5HfSMaVFgRBxM2eTfqRDu3DIGnUm-pRhCfaUuqaZXmVxFtfKI93CdG0e_/exec";

    const payload = {
      ...req.body,
      action: "submitKeuangan"
    };

    const response = await fetch(GAS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    res.json(result);
  } catch (err) {
    console.error("Error proxy keuangan:", err);
    res.status(500).json({ success: false, message: "Gagal mengirim data ke Google Apps Script (keuangan)" });
  }
});

// POST /api/upload-struk => kirim file base64 ke GAS
app.post("/api/upload-struk", async (req, res) => {
  try {
    const { file, fileName, mimeType, outlet, tanggal } = req.body;

    if (!file || !mimeType) {
      return res.status(400).json({ success: false, message: "Parameter file dan mimeType wajib diisi" });
    }

    const form = new URLSearchParams({
      file,
      fileName: fileName || `struk.${mimeType === "application/pdf" ? "pdf" : "jpg"}`,
      mimeType,
      outlet: outlet || "Outlet",
      tanggal: tanggal || new Date().toISOString()
    });

    const response = await fetch("https://script.google.com/macros/s/AKfycbzq6o_ZETi5HfSMaVFgRBxM2eTfqRDu3DIGnUm-pRhCfaUuqaZXmVxFtfKI93CdG0e_/exec", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: form.toString()
    });

    const result = await response.json();
    res.json(result);
  } catch (error) {
    console.error("Error upload struk ke GAS:", error);
    res.status(500).json({ success: false, message: "Gagal upload struk ke GAS" });
  }
});

// GET /api/potongan?action=getPotongan
app.get("/api/data-user", async (req, res) => {
  const action = req.query.action;

  if (action === "getNamaUser") {
    try {
      const GAS_URL = "https://script.google.com/macros/s/AKfycbzq6o_ZETi5HfSMaVFgRBxM2eTfqRDu3DIGnUm-pRhCfaUuqaZXmVxFtfKI93CdG0e_/exec?action=getNamaUser";
      const response = await fetch(GAS_URL);
      const result = await response.json();
      res.json(result);
    } catch (err) {
      console.error("Gagal ambil data potongan:", err);
      res.status(500).json({ success: false, message: "Gagal ambil data potongan dari GAS" });
    }
  } else {
    res.status(400).json({ success: false, message: "Action tidak valid" });
  }
});

// POST /api/potongan
app.post("/api/potongan", async (req, res) => {
  try {
    const payload = {
      ...req.body,
      action: "addNewPotongan"
    };

    const response = await fetch("https://script.google.com/macros/s/AKfycbzq6o_ZETi5HfSMaVFgRBxM2eTfqRDu3DIGnUm-pRhCfaUuqaZXmVxFtfKI93CdG0e_/exec", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    res.json(result);
  } catch (error) {
    console.error("Gagal kirim potongan ke GAS:", error);
    res.status(500).json({ success: false, message: "Gagal kirim data potongan ke GAS" });
  }
});

// POST /api/biaya-oprasional
app.post("/api/biaya-oprasional", async (req, res) => {
  try {
    const payload = {
      ...req.body,
      action: "submitBiayaOprasional" // pastikan action sama dengan handler di GAS
    };

    const response = await fetch("https://script.google.com/macros/s/AKfycbzq6o_ZETi5HfSMaVFgRBxM2eTfqRDu3DIGnUm-pRhCfaUuqaZXmVxFtfKI93CdG0e_/exec", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    res.json(result);
  } catch (err) {
    console.error("Error forwarding submitBiayaOprasional to GAS:", err);
    res.status(500).json({ success: false, message: "Gagal mengirim data submitBiayaOprasional ke GAS" });
  }
});

// GET /api/rekap => alias dari getRiwayatAbsensi
app.get("/api/rekapabsensi", async (req, res) => {
  try {
    const params = new URLSearchParams(req.query);
    const GAS_URL = `https://script.google.com/macros/s/AKfycbzq6o_ZETi5HfSMaVFgRBxM2eTfqRDu3DIGnUm-pRhCfaUuqaZXmVxFtfKI93CdG0e_/exec?action=getRiwayatAbsensi&${params.toString()}`;

    const response = await fetch(GAS_URL);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error dari GAS: Status ${response.status} - Response: ${errorText}`);
      return res.status(500).json({
        success: false,
        message: "Gagal mengambil data rekap absensi dari GAS",
        details: errorText,
      });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error mengambil data rekap absensi:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server saat mengambil data rekap absensi",
    });
  }
});
// POST /api/update-metode-pembayaran
app.post("/api/update-metode-pembayaran", async (req, res) => {
  try {
    const {
      tanggal,
      outlet,
      namaBahan,
      metodePembayaran,
      namaStaff,
      qty,
      satuan,
      hargaJual,
      hargaTotal
    } = req.body;

    // Validasi minimum parameter wajib
    if (!tanggal || !outlet || !namaBahan || !metodePembayaran) {
      return res.status(400).json({
        success: false,
        message: "Parameter 'tanggal', 'outlet', 'namaBahan', dan 'metodePembayaran' wajib diisi"
      });
    }

    const GAS_URL = "https://script.google.com/macros/s/AKfycbzq6o_ZETi5HfSMaVFgRBxM2eTfqRDu3DIGnUm-pRhCfaUuqaZXmVxFtfKI93CdG0e_/exec";

    const payload = {
      action: "updateMetodePembayaran",
      tanggal,
      outlet,
      namaBahan,
      metodePembayaran,
      namaStaff,
      qty,
      satuan,
      hargaJual,
      hargaTotal,
      sheet: "OUTPUT" // Sesuai nama sheet di GAS
    };

    const response = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    res.json(result);
  } catch (err) {
    console.error("Gagal update metode pembayaran:", err);
    res.status(500).json({
      success: false,
      message: "Gagal menghubungi GAS untuk update metode pembayaran"
    });
  }
});

// GET /api/data-keuangan?action=getDataKeuangan
app.get("/api/data-keuangan", async (req, res) => {
  const action = req.query.action;

  if (action === "getDataKeuangan") {
    try {
      const params = new URLSearchParams(req.query);
      const GAS_URL = `https://script.google.com/macros/s/AKfycbzq6o_ZETi5HfSMaVFgRBxM2eTfqRDu3DIGnUm-pRhCfaUuqaZXmVxFtfKI93CdG0e_/exec?${params.toString()}`;

      const response = await fetch(GAS_URL);
      if (!response.ok) {
        const text = await response.text();
        console.error(`Error from GAS: Status ${response.status} - Response: ${text}`);
        return res.status(500).json({ success: false, message: "Error dari GAS: " + text });
      }

      const data = await response.json();
      res.json(data);
    } catch (err) {
      console.error("Error proxy getDataKeuangan:", err);
      res.status(500).json({ success: false, message: "Gagal mengambil data keuangan dari GAS" });
    }
  } else {
    res.status(400).json({ success: false, message: "Action tidak valid" });
  }
});


app.get("/", (req, res) => {
  res.send("<h1>Server is running</h1><p>You can use the /api/* endpoints.</p>");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server berjalan di port ${PORT}`);
});