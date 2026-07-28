/**
 * Seed script — populates ams-* tables with realistic IT company data.
 * Safe to re-run: skips items that already exist (checks by email / category name / serial number).
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
    DynamoDBDocumentClient,
    PutCommand, GetCommand, ScanCommand
} = require("@aws-sdk/lib-dynamodb");

const raw    = new DynamoDBClient({
    region: process.env.AWS_REGION,
    credentials: { accessKeyId: process.env.ACCESS_KEY, secretAccessKey: process.env.SECRET_KEY }
});
const client = DynamoDBDocumentClient.from(raw);

const now   = () => new Date().toISOString();
const date  = (y, m, d) => `${y}-${String(m).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
const log   = (icon, msg) => console.log(`${icon}  ${msg}`);

// ─────────────────────────────────────────────────────────────────────────────
// 1. CATEGORIES
// ─────────────────────────────────────────────────────────────────────────────
const CATEGORIES = [
    { name: "Laptop",              description: "Portable computing devices"           },
    { name: "Desktop",             description: "Tower and all-in-one workstations"    },
    { name: "Monitor",             description: "Display screens and panels"           },
    { name: "Mobile Phone",        description: "Company-issued smartphones"           },
    { name: "Tablet",              description: "iPad and Android tablets"             },
    { name: "Keyboard & Mouse",    description: "Input peripherals"                    },
    { name: "Network Equipment",   description: "Switches, routers and access points"  },
    { name: "Server",              description: "Rack and blade servers"               },
    { name: "Storage Device",      description: "External drives and NAS units"        },
    { name: "Printer / Scanner",   description: "Printing and scanning hardware"       },
    { name: "UPS",                 description: "Uninterruptible power supplies"       },
    { name: "Headset",             description: "Audio headsets and earphones"         },
];

// ─────────────────────────────────────────────────────────────────────────────
// 2. EMPLOYEES  (password: Pass@1234 for all)
// ─────────────────────────────────────────────────────────────────────────────
const EMPLOYEES = [
    { email: "ravi.kumar@techcorp.in",     fullname: "Ravi Kumar",        role: "manager",  department: "Engineering"        },
    { email: "priya.mehta@techcorp.in",    fullname: "Priya Mehta",       role: "employee", department: "Engineering"        },
    { email: "arjun.nair@techcorp.in",     fullname: "Arjun Nair",        role: "employee", department: "Engineering"        },
    { email: "sneha.pillai@techcorp.in",   fullname: "Sneha Pillai",      role: "employee", department: "QA"                 },
    { email: "vijay.sharma@techcorp.in",   fullname: "Vijay Sharma",      role: "manager",  department: "IT Infrastructure"  },
    { email: "deepa.iyer@techcorp.in",     fullname: "Deepa Iyer",        role: "employee", department: "IT Infrastructure"  },
    { email: "karthik.rao@techcorp.in",    fullname: "Karthik Rao",       role: "employee", department: "DevOps"             },
    { email: "anita.desai@techcorp.in",    fullname: "Anita Desai",       role: "hr",       department: "HR"                 },
    { email: "rohit.joshi@techcorp.in",    fullname: "Rohit Joshi",       role: "employee", department: "Sales"              },
    { email: "meena.chandra@techcorp.in",  fullname: "Meena Chandra",     role: "manager",  department: "Finance"            },
];

// ─────────────────────────────────────────────────────────────────────────────
// 3. ASSETS  (serial numbers are unique identifiers — used for dedup check)
// ─────────────────────────────────────────────────────────────────────────────
// Assets are defined with category names; category_ids are resolved after seeding categories.
const ASSET_DEFS = [
    // Laptops
    { name: "Dell Latitude 5540",       category: "Laptop",            brand: "Dell",    model: "Latitude 5540",      serial: "SN-DL-001", purchase_date: date(2023,3,15), purchase_cost: 68000, warranty_expiry: date(2026,3,14), status: "assigned"  },
    { name: "Dell Latitude 5540",       category: "Laptop",            brand: "Dell",    model: "Latitude 5540",      serial: "SN-DL-002", purchase_date: date(2023,3,15), purchase_cost: 68000, warranty_expiry: date(2026,3,14), status: "assigned"  },
    { name: "HP EliteBook 840 G10",     category: "Laptop",            brand: "HP",      model: "EliteBook 840 G10",  serial: "SN-HP-003", purchase_date: date(2023,6,20), purchase_cost: 75000, warranty_expiry: date(2026,6,19), status: "assigned"  },
    { name: "HP EliteBook 840 G10",     category: "Laptop",            brand: "HP",      model: "EliteBook 840 G10",  serial: "SN-HP-004", purchase_date: date(2023,6,20), purchase_cost: 75000, warranty_expiry: date(2026,6,19), status: "available" },
    { name: "Lenovo ThinkPad X1 Carbon",category: "Laptop",            brand: "Lenovo",  model: "ThinkPad X1 Carbon", serial: "SN-LN-005", purchase_date: date(2022,11,1), purchase_cost: 92000, warranty_expiry: date(2025,10,31),status: "maintenance"},
    { name: "Apple MacBook Pro 14",     category: "Laptop",            brand: "Apple",   model: "MacBook Pro M3",     serial: "SN-AP-006", purchase_date: date(2024,1,10), purchase_cost:148000, warranty_expiry: date(2026,1,9),  status: "assigned"  },
    { name: "Apple MacBook Pro 14",     category: "Laptop",            brand: "Apple",   model: "MacBook Pro M3",     serial: "SN-AP-007", purchase_date: date(2024,1,10), purchase_cost:148000, warranty_expiry: date(2026,1,9),  status: "available" },

    // Desktops
    { name: "Dell OptiPlex 7010",       category: "Desktop",           brand: "Dell",    model: "OptiPlex 7010",      serial: "SN-DO-008", purchase_date: date(2022,5,12), purchase_cost: 45000, warranty_expiry: date(2025,5,11), status: "assigned"  },
    { name: "HP Z2 Tower G9 Workstation",category:"Desktop",           brand: "HP",      model: "Z2 Tower G9",        serial: "SN-HW-009", purchase_date: date(2023,9,5),  purchase_cost: 95000, warranty_expiry: date(2026,9,4),  status: "available" },

    // Monitors
    { name: "LG 27\" 4K IPS Monitor",  category: "Monitor",           brand: "LG",      model: "27UK850-W",          serial: "SN-LG-010", purchase_date: date(2022,8,18), purchase_cost: 28000, warranty_expiry: date(2025,8,17), status: "assigned"  },
    { name: "LG 27\" 4K IPS Monitor",  category: "Monitor",           brand: "LG",      model: "27UK850-W",          serial: "SN-LG-011", purchase_date: date(2022,8,18), purchase_cost: 28000, warranty_expiry: date(2025,8,17), status: "assigned"  },
    { name: "Dell UltraSharp 24",       category: "Monitor",           brand: "Dell",    model: "U2422H",             serial: "SN-DM-012", purchase_date: date(2023,2,10), purchase_cost: 22000, warranty_expiry: date(2026,2,9),  status: "available" },
    { name: "Samsung 32\" Curved",      category: "Monitor",           brand: "Samsung", model: "C32G55T",            serial: "SN-SM-013", purchase_date: date(2023,7,22), purchase_cost: 24000, warranty_expiry: date(2026,7,21), status: "assigned"  },

    // Mobile Phones
    { name: "iPhone 15 Pro",            category: "Mobile Phone",      brand: "Apple",   model: "iPhone 15 Pro 256GB",serial: "SN-IP-014", purchase_date: date(2023,10,5), purchase_cost: 89000, warranty_expiry: date(2024,10,4), status: "assigned"  },
    { name: "Samsung Galaxy S24",       category: "Mobile Phone",      brand: "Samsung", model: "Galaxy S24 128GB",   serial: "SN-SG-015", purchase_date: date(2024,2,1),  purchase_cost: 62000, warranty_expiry: date(2025,1,31), status: "assigned"  },
    { name: "Samsung Galaxy S24",       category: "Mobile Phone",      brand: "Samsung", model: "Galaxy S24 128GB",   serial: "SN-SG-016", purchase_date: date(2024,2,1),  purchase_cost: 62000, warranty_expiry: date(2025,1,31), status: "available" },

    // Network Equipment
    { name: "Cisco Catalyst 2960-X",    category: "Network Equipment", brand: "Cisco",   model: "WS-C2960X-24TS-L",  serial: "SN-CS-017", purchase_date: date(2021,4,10), purchase_cost:125000, warranty_expiry: date(2026,4,9),  status: "available" },
    { name: "Ubiquiti UniFi AP AC Pro", category: "Network Equipment", brand: "Ubiquiti",model: "UAP-AC-PRO",         serial: "SN-UB-018", purchase_date: date(2022,1,15), purchase_cost: 12000, warranty_expiry: date(2025,1,14), status: "available" },
    { name: "Ubiquiti UniFi AP AC Pro", category: "Network Equipment", brand: "Ubiquiti",model: "UAP-AC-PRO",         serial: "SN-UB-019", purchase_date: date(2022,1,15), purchase_cost: 12000, warranty_expiry: date(2025,1,14), status: "available" },

    // Servers
    { name: "Dell PowerEdge R750",      category: "Server",            brand: "Dell",    model: "PowerEdge R750",     serial: "SN-SV-020", purchase_date: date(2021,8,20), purchase_cost:380000, warranty_expiry: date(2026,8,19), status: "available" },
    { name: "HPE ProLiant DL380 Gen10", category: "Server",            brand: "HP",      model: "ProLiant DL380 G10", serial: "SN-SV-021", purchase_date: date(2020,12,1), purchase_cost:420000, warranty_expiry: date(2025,11,30),status: "maintenance"},

    // Storage
    { name: "WD My Cloud EX2 Ultra",    category: "Storage Device",    brand: "WD",      model: "WDBVBZ0160JCH",     serial: "SN-ST-022", purchase_date: date(2022,3,5),  purchase_cost: 18000, warranty_expiry: date(2025,3,4),  status: "available" },
    { name: "Seagate Backup Plus 4TB",  category: "Storage Device",    brand: "Seagate", model: "STDR4000100",        serial: "SN-ST-023", purchase_date: date(2023,5,14), purchase_cost:  6500, warranty_expiry: date(2025,5,13), status: "available" },

    // Printer
    { name: "HP LaserJet Pro M404dn",   category: "Printer / Scanner", brand: "HP",      model: "M404dn",             serial: "SN-PR-024", purchase_date: date(2022,9,10), purchase_cost: 16000, warranty_expiry: date(2025,9,9),  status: "available" },

    // UPS
    { name: "APC Smart-UPS 1500VA",     category: "UPS",               brand: "APC",     model: "SMT1500IC",          serial: "SN-UP-025", purchase_date: date(2022,6,1),  purchase_cost: 22000, warranty_expiry: date(2025,5,31), status: "available" },

    // Headsets
    { name: "Jabra Evolve2 55",         category: "Headset",           brand: "Jabra",   model: "Evolve2 55 UC",      serial: "SN-HS-026", purchase_date: date(2023,4,12), purchase_cost:  9500, warranty_expiry: date(2026,4,11), status: "assigned"  },
    { name: "Sony WH-1000XM5",          category: "Headset",           brand: "Sony",    model: "WH-1000XM5",         serial: "SN-HS-027", purchase_date: date(2023,8,5),  purchase_cost: 12000, warranty_expiry: date(2026,8,4),  status: "assigned"  },

    // Tablets
    { name: "iPad Pro 12.9\" M2",       category: "Tablet",            brand: "Apple",   model: "iPad Pro M2 256GB",  serial: "SN-TB-028", purchase_date: date(2023,11,20),purchase_cost: 98000, warranty_expiry: date(2025,11,19),status: "assigned"  },
];

// Assignments: (serial → employee email). Only for status:"assigned" assets.
const ASSIGNMENT_MAP = {
    "SN-DL-001": "priya.mehta@techcorp.in",
    "SN-DL-002": "arjun.nair@techcorp.in",
    "SN-HP-003": "karthik.rao@techcorp.in",
    "SN-AP-006": "ravi.kumar@techcorp.in",
    "SN-DO-008": "vijay.sharma@techcorp.in",
    "SN-LG-010": "priya.mehta@techcorp.in",
    "SN-LG-011": "arjun.nair@techcorp.in",
    "SN-SM-013": "sneha.pillai@techcorp.in",
    "SN-IP-014": "ravi.kumar@techcorp.in",
    "SN-SG-015": "rohit.joshi@techcorp.in",
    "SN-HS-026": "deepa.iyer@techcorp.in",
    "SN-HS-027": "karthik.rao@techcorp.in",
    "SN-TB-028": "meena.chandra@techcorp.in",
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
async function scanAll(table) {
    const result = await client.send(new ScanCommand({ TableName: table }));
    return result.Items ?? [];
}

async function put(table, item) {
    await client.send(new PutCommand({ TableName: table, Item: item }));
}

// ─────────────────────────────────────────────────────────────────────────────
// SEED
// ─────────────────────────────────────────────────────────────────────────────
async function seed() {

    console.log("\n══════════════════════════════════════════════");
    console.log("  AMS — Seed Script");
    console.log("══════════════════════════════════════════════\n");

    // ── 1. Categories ────────────────────────────────────────
    console.log("── Categories ──");
    const existingCats = await scanAll("ams-asset-categories");
    const catNameMap   = {};   // name → category_id

    for (const cat of existingCats) catNameMap[cat.name] = cat.category_id;

    for (const c of CATEGORIES) {
        if (catNameMap[c.name]) {
            log("⏭ ", `Category exists: ${c.name}`);
            continue;
        }
        const id = uuidv4();
        await put("ams-asset-categories", { category_id: id, name: c.name, description: c.description, created_at: now() });
        catNameMap[c.name] = id;
        log("✅", `Category created: ${c.name}`);
    }

    // ── 2. Employees ─────────────────────────────────────────
    console.log("\n── Employees ──");
    const defaultPassword = await bcrypt.hash("Pass@1234", 10);

    for (const emp of EMPLOYEES) {
        const existing = await client.send(new GetCommand({ TableName: "ams-users", Key: { email: emp.email } }));
        if (existing.Item) { log("⏭ ", `Employee exists: ${emp.email}`); continue; }
        await put("ams-users", {
            email:      emp.email,
            fullname:   emp.fullname,
            role:       emp.role,
            department: emp.department,
            status:     "active",
            password:   defaultPassword,
            created_at: now()
        });
        log("✅", `Employee created: ${emp.fullname} (${emp.email})`);
    }

    // ── 3. Assets ────────────────────────────────────────────
    console.log("\n── Assets ──");
    const existingAssets = await scanAll("ams-assets");
    const existingSerials = new Set(existingAssets.map(a => a.serial_number));
    const serialToAssetId = {};

    for (const a of existingAssets) serialToAssetId[a.serial_number] = a.asset_id;

    for (const def of ASSET_DEFS) {
        if (existingSerials.has(def.serial)) {
            log("⏭ ", `Asset exists: ${def.serial}`);
            serialToAssetId[def.serial] = existingAssets.find(a => a.serial_number === def.serial)?.asset_id;
            continue;
        }
        const asset_id   = uuidv4();
        const category_id = catNameMap[def.category];
        const assignedTo  = def.status === "assigned" ? ASSIGNMENT_MAP[def.serial] : undefined;

        const item = {
            asset_id, category_id,
            name:            def.name,
            brand:           def.brand,
            model:           def.model,
            serial_number:   def.serial,
            purchase_date:   def.purchase_date,
            purchase_cost:   def.purchase_cost,
            warranty_expiry: def.warranty_expiry,
            status:          def.status,
            notes:           "",
            created_at:      now()
        };
        if (assignedTo) item.assigned_to = assignedTo;

        await put("ams-assets", item);
        serialToAssetId[def.serial] = asset_id;
        log("✅", `Asset created: ${def.name} [${def.serial}] — ${def.status}`);
    }

    // ── 4. Assignments ───────────────────────────────────────
    console.log("\n── Assignments ──");
    const existingAssignments = await scanAll("ams-asset-assignments");
    // Dedup by asset_id + employee_email + status active
    const assignedPairs = new Set(
        existingAssignments
            .filter(a => a.status === "active")
            .map(a => `${a.asset_id}::${a.employee_email}`)
    );

    for (const [serial, empEmail] of Object.entries(ASSIGNMENT_MAP)) {
        const asset_id = serialToAssetId[serial];
        if (!asset_id) { log("⚠️ ", `Asset ID not found for serial: ${serial}`); continue; }

        const pair = `${asset_id}::${empEmail}`;
        if (assignedPairs.has(pair)) {
            log("⏭ ", `Assignment exists: ${serial} → ${empEmail}`);
            continue;
        }

        // Determine a realistic assigned date based on the asset def
        const assetDef = ASSET_DEFS.find(d => d.serial === serial);
        // Assignment ~30 days after purchase
        const purchaseParts = assetDef?.purchase_date?.split("-").map(Number) ?? [2023,1,1];
        const assignedDate  = new Date(purchaseParts[0], purchaseParts[1] - 1, purchaseParts[2] + 30).toISOString();

        await put("ams-asset-assignments", {
            assignment_id:   uuidv4(),
            asset_id,
            employee_email:  empEmail,
            assigned_by:     "admin@company.com",
            assigned_date:   assignedDate,
            return_date:     null,
            status:          "active",
            notes:           ""
        });
        log("✅", `Assignment: ${serial} → ${empEmail}`);
    }

    // ── Summary ──────────────────────────────────────────────
    console.log("\n══════════════════════════════════════════════");
    console.log("  Seed complete ✔");
    console.log("  Default employee password: Pass@1234");
    console.log("══════════════════════════════════════════════\n");
}

seed().catch(err => { console.error("Seed failed:", err); process.exit(1); });
