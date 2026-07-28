require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

const { v4: uuidv4 } = require("uuid");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand, ScanCommand } = require("@aws-sdk/lib-dynamodb");

const raw    = new DynamoDBClient({ region: process.env.AWS_REGION, credentials: { accessKeyId: process.env.ACCESS_KEY, secretAccessKey: process.env.SECRET_KEY } });
const client = DynamoDBDocumentClient.from(raw);

const now = () => new Date().toISOString();
const d   = (y, m, day) => `${y}-${String(m).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
const log = (i, m) => console.log(`${i}  ${m}`);

async function scanAll(table) {
    const r = await client.send(new ScanCommand({ TableName: table }));
    return r.Items ?? [];
}

async function seed() {
    console.log("\n══════════════════════════════════════════════");
    console.log("  Maintenance & Repair Seed");
    console.log("══════════════════════════════════════════════\n");

    // ── Load assets to build serial → asset_id map ──────────
    const assets   = await scanAll("ams-assets");
    const bySerial = Object.fromEntries(assets.map(a => [a.serial_number, a.asset_id]));

    const id = (serial) => bySerial[serial];

    // ─────────────────────────────────────────────────────────
    // MAINTENANCE LOGS
    // ─────────────────────────────────────────────────────────
    const existing = await scanAll("ams-maintenance-logs");
    if (existing.length > 0) {
        console.log(`⏭  Maintenance logs already exist (${existing.length} records). Skipping.\n`);
    } else {
        console.log("── Maintenance Logs ──");

        const LOGS = [
            // ── Completed logs ─────────────────────────────
            {
                asset: "SN-DL-001", type: "service",
                description: "Annual preventive maintenance — thermal paste replaced, fans cleaned, SSD health checked.",
                vendor: "Dell Technologies", cost: 2500,
                scheduled_date: d(2023,9,10), completed_date: d(2023,9,10),
                status: "completed", logged_by: "vijay.sharma@techcorp.in"
            },
            {
                asset: "SN-HP-003", type: "repair",
                description: "Keyboard keys unresponsive — replaced keyboard unit.",
                vendor: "HP India", cost: 3800,
                scheduled_date: d(2023,11,5), completed_date: d(2023,11,7),
                status: "completed", logged_by: "vijay.sharma@techcorp.in"
            },
            {
                asset: "SN-CS-017", type: "inspection",
                description: "Network switch quarterly inspection — port utilisation audit, firmware updated to 15.2(7)E6.",
                vendor: "Cisco Systems India", cost: 0,
                scheduled_date: d(2024,1,15), completed_date: d(2024,1,15),
                status: "completed", logged_by: "deepa.iyer@techcorp.in"
            },
            {
                asset: "SN-SV-020", type: "service",
                description: "Server preventive maintenance — RAID health check, dust cleaning, BIOS updated.",
                vendor: "Dell Technologies", cost: 8500,
                scheduled_date: d(2023,8,20), completed_date: d(2023,8,22),
                status: "completed", logged_by: "vijay.sharma@techcorp.in"
            },
            {
                asset: "SN-PR-024", type: "repair",
                description: "Paper jam issue — pickup roller and separation pad replaced.",
                vendor: "HP India", cost: 1800,
                scheduled_date: d(2024,2,8), completed_date: d(2024,2,8),
                status: "completed", logged_by: "anita.desai@techcorp.in"
            },
            {
                asset: "SN-UP-025", type: "inspection",
                description: "UPS battery health test — capacity at 87%, within acceptable range.",
                vendor: "APC by Schneider", cost: 0,
                scheduled_date: d(2023,12,1), completed_date: d(2023,12,1),
                status: "completed", logged_by: "vijay.sharma@techcorp.in"
            },
            {
                asset: "SN-DL-002", type: "upgrade",
                description: "RAM upgraded from 8GB to 16GB for developer workload requirements.",
                vendor: "Dell Technologies", cost: 4200,
                scheduled_date: d(2024,1,10), completed_date: d(2024,1,10),
                status: "completed", logged_by: "ravi.kumar@techcorp.in"
            },
            {
                asset: "SN-AP-007", type: "service",
                description: "macOS upgrade to Sonoma 14 — Time Machine backup verified before update.",
                vendor: "", cost: 0,
                scheduled_date: d(2024,3,5), completed_date: d(2024,3,5),
                status: "completed", logged_by: "karthik.rao@techcorp.in"
            },

            // ── In-progress (these assets should stay in maintenance status) ──
            {
                asset: "SN-LN-005", type: "repair",
                description: "Display panel flickering at random intervals — display cable and inverter board suspected. Sent to Lenovo authorised service centre.",
                vendor: "Lenovo India", cost: 0,
                scheduled_date: d(2024,4,18), completed_date: null,
                status: "in-progress", logged_by: "vijay.sharma@techcorp.in"
            },
            {
                asset: "SN-SV-021", type: "repair",
                description: "HPE ProLiant DL380 Gen10 — RAID controller failure. Replacement controller ordered, awaiting delivery.",
                vendor: "HP India", cost: 0,
                scheduled_date: d(2024,4,20), completed_date: null,
                status: "in-progress", logged_by: "vijay.sharma@techcorp.in"
            },

            // ── Scheduled (upcoming) ────────────────────────
            {
                asset: "SN-UB-018", type: "inspection",
                description: "Quarterly WiFi performance audit — signal strength mapping and channel optimisation.",
                vendor: "Ubiquiti India Dist.", cost: 0,
                scheduled_date: d(2024,6,10), completed_date: null,
                status: "scheduled", logged_by: "deepa.iyer@techcorp.in"
            },
            {
                asset: "SN-UB-019", type: "inspection",
                description: "Quarterly WiFi performance audit — signal strength mapping and channel optimisation.",
                vendor: "Ubiquiti India Dist.", cost: 0,
                scheduled_date: d(2024,6,10), completed_date: null,
                status: "scheduled", logged_by: "deepa.iyer@techcorp.in"
            },
            {
                asset: "SN-UP-025", type: "service",
                description: "Annual UPS battery replacement — scheduled as part of 3-year maintenance plan.",
                vendor: "APC by Schneider", cost: 6500,
                scheduled_date: d(2024,6,1), completed_date: null,
                status: "scheduled", logged_by: "vijay.sharma@techcorp.in"
            },
            {
                asset: "SN-HW-009", type: "service",
                description: "HP Z2 Tower G9 annual service — clean internals, check cooling system, verify storage health.",
                vendor: "HP India", cost: 3000,
                scheduled_date: d(2024,5,28), completed_date: null,
                status: "scheduled", logged_by: "vijay.sharma@techcorp.in"
            },
        ];

        for (const l of LOGS) {
            const asset_id = id(l.asset);
            if (!asset_id) { log("⚠️ ", `Asset not found: ${l.asset}`); continue; }
            await client.send(new PutCommand({
                TableName: "ams-maintenance-logs",
                Item: {
                    log_id:         uuidv4(),
                    asset_id,
                    type:           l.type,
                    description:    l.description,
                    vendor:         l.vendor,
                    cost:           l.cost,
                    scheduled_date: l.scheduled_date,
                    completed_date: l.completed_date,
                    status:         l.status,
                    logged_by:      l.logged_by,
                    created_at:     now(),
                }
            }));
            log("✅", `Maintenance log: [${l.status}] ${l.asset} — ${l.type}`);
        }
    }

    // ─────────────────────────────────────────────────────────
    // REPAIR REQUESTS
    // ─────────────────────────────────────────────────────────
    const existingRepairs = await scanAll("ams-repair-requests");
    if (existingRepairs.length > 0) {
        console.log(`\n⏭  Repair requests already exist (${existingRepairs.length} records). Skipping.\n`);
    } else {
        console.log("\n── Repair Requests ──");

        const REPAIRS = [
            // ── Open / critical ─────────────────────────────
            {
                asset: "SN-LN-005", priority: "critical",
                title: "Display flickering — laptop unusable",
                description: "Screen flickers randomly, sometimes goes completely blank. Affects daily work. Already sent for service but user needs replacement in the meantime.",
                reported_by: "arjun.nair@techcorp.in",
                assigned_to: "vijay.sharma@techcorp.in",
                status: "in-progress", resolution: ""
            },
            {
                asset: "SN-SV-021", priority: "critical",
                title: "RAID controller failure — DR server offline",
                description: "HPE ProLiant DL380 Gen10 DR server is offline. RAID controller failure confirmed by HP. System unavailable. Replacement controller on order.",
                reported_by: "karthik.rao@techcorp.in",
                assigned_to: "vijay.sharma@techcorp.in",
                status: "in-progress", resolution: ""
            },
            {
                asset: "SN-IP-014", priority: "high",
                title: "iPhone 15 Pro — battery draining rapidly",
                description: "Battery drops from 100% to 20% within 3 hours of normal usage. Battery health shows 78% in settings. Needs replacement.",
                reported_by: "ravi.kumar@techcorp.in",
                assigned_to: null,
                status: "open", resolution: ""
            },

            // ── Open / medium ────────────────────────────────
            {
                asset: "SN-DL-001", priority: "medium",
                title: "Laptop running hot during video calls",
                description: "CPU temperature spikes to 95°C during Microsoft Teams calls. Fan noise is excessive. Thermal throttling observed.",
                reported_by: "priya.mehta@techcorp.in",
                assigned_to: "vijay.sharma@techcorp.in",
                status: "open", resolution: ""
            },
            {
                asset: "SN-SM-013", priority: "medium",
                title: "Monitor has dead pixels in bottom-right corner",
                description: "Cluster of approximately 8 dead pixels visible at 1920×1080. Distracting during code review. Under warranty.",
                reported_by: "sneha.pillai@techcorp.in",
                assigned_to: null,
                status: "open", resolution: ""
            },
            {
                asset: "SN-LG-010", priority: "low",
                title: "Monitor stand wobbles — needs tightening",
                description: "The VESA mount screws on the monitor stand have loosened. Screen wobbles when keyboard is used.",
                reported_by: "priya.mehta@techcorp.in",
                assigned_to: null,
                status: "open", resolution: ""
            },

            // ── Resolved ─────────────────────────────────────
            {
                asset: "SN-HP-003", priority: "medium",
                title: "Keyboard unresponsive — keys not registering",
                description: "Multiple keys on the keyboard stopped working intermittently. Spill damage suspected.",
                reported_by: "karthik.rao@techcorp.in",
                assigned_to: "vijay.sharma@techcorp.in",
                status: "resolved",
                resolution: "Keyboard unit replaced under AMC contract. Tested and confirmed working. Closed."
            },
            {
                asset: "SN-PR-024", priority: "low",
                title: "Printer paper jam — recurring",
                description: "Printer jams on every 3rd-4th print. Tried clearing manually but issue persists.",
                reported_by: "anita.desai@techcorp.in",
                assigned_to: "vijay.sharma@techcorp.in",
                status: "resolved",
                resolution: "Pickup roller and separation pad replaced. Printed 50-page test without jam. Resolved."
            },
            {
                asset: "SN-CS-017", priority: "low",
                title: "Switch port 12 showing intermittent link-down",
                description: "Port 12 on the Cisco Catalyst 2960-X is flapping. Connected device losing network intermittently.",
                reported_by: "deepa.iyer@techcorp.in",
                assigned_to: "deepa.iyer@techcorp.in",
                status: "resolved",
                resolution: "SFP module replaced on port 12. Link stable for 48hrs. Closed."
            },

            // ── Closed ───────────────────────────────────────
            {
                asset: "SN-DL-002", priority: "low",
                title: "Laptop slow — request for RAM upgrade",
                description: "Developer reports Chrome + IDE + Docker all running simultaneously causes heavy slowdown. Requesting RAM upgrade.",
                reported_by: "arjun.nair@techcorp.in",
                assigned_to: "vijay.sharma@techcorp.in",
                status: "closed",
                resolution: "RAM upgraded from 8GB to 16GB. Performance confirmed satisfactory by user."
            },
        ];

        for (const r of REPAIRS) {
            const asset_id = id(r.asset);
            if (!asset_id) { log("⚠️ ", `Asset not found: ${r.asset}`); continue; }
            await client.send(new PutCommand({
                TableName: "ams-repair-requests",
                Item: {
                    request_id:  uuidv4(),
                    asset_id,
                    title:       r.title,
                    description: r.description,
                    priority:    r.priority,
                    reported_by: r.reported_by,
                    assigned_to: r.assigned_to ?? null,
                    status:      r.status,
                    resolution:  r.resolution,
                    created_at:  now(),
                    updated_at:  now(),
                }
            }));
            log("✅", `Repair request: [${r.priority}/${r.status}] ${r.asset} — ${r.title.substring(0, 45)}`);
        }
    }

    console.log("\n══════════════════════════════════════════════");
    console.log("  Seed complete ✔");
    console.log(`  Maintenance logs : 14 records`);
    console.log(`  Repair requests  : 10 records`);
    console.log("══════════════════════════════════════════════\n");
}

seed().catch(err => { console.error("Seed failed:", err); process.exit(1); });
