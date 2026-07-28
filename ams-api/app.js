const express = require("express");
const cors = require("cors");

require("dotenv").config();

const auth          = require("./routes/auth");
const dashboard     = require("./routes/dashboard");
const employees     = require("./routes/employee");
const assets        = require("./routes/assets");
const categories    = require("./routes/categories");
const assignments   = require("./routes/assignments");
const maintenance   = require("./routes/maintenance");
const repairRequests= require("./routes/repairRequests");
const vendors       = require("./routes/vendors");
const purchases     = require("./routes/purchases");
const profile       = require("./routes/profile");

const app = express();

app.use(cors());
app.use(express.json());

// ── Routes ─────────────────────────────────────────────
app.use("/api/auth",            auth);
app.use("/api/dashboard",       dashboard);
app.use("/api/employees",       employees);
app.use("/api/assets",          assets);
app.use("/api/categories",      categories);
app.use("/api/assignments",     assignments);
app.use("/api/maintenance",     maintenance);
app.use("/api/repair-requests", repairRequests);
app.use("/api/vendors",         vendors);
app.use("/api/purchases",       purchases);
app.use("/api/profile",         profile);

// ── 404 fallback ────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ success: false, message: "Route not found" });
});

app.listen(process.env.PORT, () => {
    console.log(`AMS API running on port ${process.env.PORT}`);
});
