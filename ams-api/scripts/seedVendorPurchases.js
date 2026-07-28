require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

const { v4: uuidv4 } = require("uuid");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand, ScanCommand } = require("@aws-sdk/lib-dynamodb");

const raw    = new DynamoDBClient({ region: process.env.AWS_REGION, credentials: { accessKeyId: process.env.ACCESS_KEY, secretAccessKey: process.env.SECRET_KEY } });
const client = DynamoDBDocumentClient.from(raw);

const now  = () => new Date().toISOString();
const d    = (y, m, day) => `${y}-${String(m).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
const log  = (i, m) => console.log(`${i}  ${m}`);

// ── Vendors ──────────────────────────────────────────────────────
const VENDORS = [
    { name: "Dell Technologies",     contact_person: "Sanjay Kapoor",   email: "enterprise@dell.in",       phone: "+91 98100 11223", address: "Bengaluru, Karnataka",  website: "https://dell.com",          category: "Hardware",        notes: "Preferred laptop & server vendor. 3-yr warranty on all orders." },
    { name: "HP India",              contact_person: "Preethi Nair",    email: "biz@hp.in",                phone: "+91 99200 33445", address: "Mumbai, Maharashtra",   website: "https://hp.com",            category: "Hardware",        notes: "Workstations, printers, peripherals. AMC contract active." },
    { name: "Lenovo India",          contact_person: "Arjun Mehrotra",  email: "b2b@lenovo.co.in",         phone: "+91 97300 55667", address: "Chennai, Tamil Nadu",   website: "https://lenovo.com",        category: "Hardware",        notes: "ThinkPad line preferred for dev team." },
    { name: "Apple India",           contact_person: "Kavita Sharma",   email: "enterprise@apple.co.in",   phone: "+91 96400 77889", address: "Delhi, NCR",            website: "https://apple.com/business",category: "Hardware",        notes: "MacBook Pro for design & senior management." },
    { name: "Cisco Systems India",   contact_person: "Rajan Pillai",    email: "sales@cisco.co.in",        phone: "+91 98500 99001", address: "Bengaluru, Karnataka",  website: "https://cisco.com",         category: "Networking",      notes: "Network switches, routers, Webex licenses." },
    { name: "Ubiquiti India Dist.",  contact_person: "Deepak Rao",      email: "ubiquiti@technet.co.in",   phone: "+91 95600 12345", address: "Pune, Maharashtra",     website: "https://ui.com",            category: "Networking",      notes: "UniFi access points and switches distributor." },
    { name: "Microsoft India",       contact_person: "Sunita Verma",    email: "enterprise@microsoft.co.in",phone:"+91 98700 34567", address: "Hyderabad, Telangana",  website: "https://microsoft.com",     category: "Software",        notes: "M365 Business Premium licenses, Azure subscription." },
    { name: "APC by Schneider",      contact_person: "Manoj Gupta",     email: "apc@schneider.co.in",      phone: "+91 97800 56789", address: "Noida, Uttar Pradesh",  website: "https://apc.com",           category: "Hardware",        notes: "UPS systems and PDU units for server room." },
    { name: "Jabra India",           contact_person: "Nisha Reddy",     email: "b2b@jabra.co.in",          phone: "+91 96900 78901", address: "Bengaluru, Karnataka",  website: "https://jabra.com",         category: "Peripherals",     notes: "Headsets for remote/hybrid workforce." },
    { name: "Seagate India",         contact_person: "Vikram Nair",     email: "ent@seagate.co.in",        phone: "+91 98000 90123", address: "Mumbai, Maharashtra",   website: "https://seagate.com",       category: "Hardware",        notes: "External storage and NAS solutions." },
];

// ── Purchases (vendor name → items) ─────────────────────────────
const PURCHASE_DEFS = [
    {
        vendor: "Dell Technologies",
        po: "PO-2023-001", invoice: "INV-DELL-4521",
        purchase_date: d(2023,3,10), delivery_date: d(2023,3,25),
        payment_status: "paid", payment_date: d(2023,4,1),
        notes: "Q1 laptop refresh for engineering team.",
        items: [
            { name: "Dell Latitude 5540 (i7/16GB/512GB)",  qty: 5,  unit_price: 68000 },
            { name: "Dell UltraSharp 24\" Monitor U2422H", qty: 5,  unit_price: 22000 },
            { name: "Dell USB-C Docking Station WD22TB4",  qty: 5,  unit_price: 14000 },
        ]
    },
    {
        vendor: "HP India",
        po: "PO-2023-002", invoice: "INV-HP-8871",
        purchase_date: d(2023,6,15), delivery_date: d(2023,6,28),
        payment_status: "paid", payment_date: d(2023,7,5),
        notes: "EliteBook procurement for managers + workstation.",
        items: [
            { name: "HP EliteBook 840 G10 (i5/16GB)",      qty: 4,  unit_price: 75000 },
            { name: "HP Z2 Tower G9 Workstation",           qty: 1,  unit_price: 95000 },
            { name: "HP LaserJet Pro M404dn",               qty: 1,  unit_price: 16000 },
        ]
    },
    {
        vendor: "Apple India",
        po: "PO-2024-001", invoice: "INV-APPLE-3312",
        purchase_date: d(2024,1,8), delivery_date: d(2024,1,12),
        payment_status: "paid", payment_date: d(2024,1,15),
        notes: "MacBook Pro for senior developers and design lead.",
        items: [
            { name: "Apple MacBook Pro 14\" M3 (16GB/512GB)", qty: 2, unit_price: 148000 },
            { name: "iPad Pro 12.9\" M2 256GB",               qty: 1, unit_price: 98000  },
        ]
    },
    {
        vendor: "Cisco Systems India",
        po: "PO-2021-001", invoice: "INV-CISCO-9901",
        purchase_date: d(2021,4,5), delivery_date: d(2021,4,20),
        payment_status: "paid", payment_date: d(2021,5,1),
        notes: "Network infrastructure upgrade — data center switch.",
        items: [
            { name: "Cisco Catalyst 2960-X 24-Port Switch", qty: 1, unit_price: 125000 },
        ]
    },
    {
        vendor: "Ubiquiti India Dist.",
        po: "PO-2022-001", invoice: "INV-UBI-2201",
        purchase_date: d(2022,1,10), delivery_date: d(2022,1,18),
        payment_status: "paid", payment_date: d(2022,1,25),
        notes: "WiFi expansion — floor 2 & 3 access points.",
        items: [
            { name: "Ubiquiti UniFi AP AC Pro",              qty: 3, unit_price: 12000 },
        ]
    },
    {
        vendor: "Microsoft India",
        po: "PO-2024-002", invoice: "INV-MSFT-5567",
        purchase_date: d(2024,4,1), delivery_date: d(2024,4,1),
        payment_status: "paid", payment_date: d(2024,4,1),
        notes: "Annual Microsoft 365 Business Premium renewal — 15 seats.",
        items: [
            { name: "Microsoft 365 Business Premium (Annual, per user)", qty: 15, unit_price: 12600 },
        ]
    },
    {
        vendor: "APC by Schneider",
        po: "PO-2022-002", invoice: "INV-APC-1102",
        purchase_date: d(2022,5,28), delivery_date: d(2022,6,5),
        payment_status: "paid", payment_date: d(2022,6,10),
        notes: "UPS for server room.",
        items: [
            { name: "APC Smart-UPS 1500VA LCD",              qty: 1, unit_price: 22000 },
        ]
    },
    {
        vendor: "Jabra India",
        po: "PO-2023-003", invoice: "INV-JABRA-881",
        purchase_date: d(2023,4,10), delivery_date: d(2023,4,15),
        payment_status: "paid", payment_date: d(2023,4,20),
        notes: "Headsets for remote dev and customer support team.",
        items: [
            { name: "Jabra Evolve2 55 UC Wireless",          qty: 2, unit_price: 9500  },
            { name: "Sony WH-1000XM5 Wireless NC",           qty: 2, unit_price: 12000 },
        ]
    },
    {
        vendor: "Dell Technologies",
        po: "PO-2021-002", invoice: "INV-DELL-3301",
        purchase_date: d(2021,8,15), delivery_date: d(2021,9,2),
        payment_status: "paid", payment_date: d(2021,9,10),
        notes: "Server for primary data center rack.",
        items: [
            { name: "Dell PowerEdge R750 (2×Xeon/128GB/6TB)", qty: 1, unit_price: 380000 },
        ]
    },
    {
        vendor: "Samsung India",  // not in vendors list — will be skipped gracefully
        po: "PO-2023-004", invoice: "INV-SAM-7721",
        purchase_date: d(2023,7,20), delivery_date: d(2023,7,25),
        payment_status: "paid", payment_date: d(2023,7,28),
        notes: "Monitor + phones for sales team.",
        items: [
            { name: 'Samsung 32" Curved Monitor C32G55T',    qty: 2, unit_price: 24000 },
            { name: "Samsung Galaxy S24 128GB",              qty: 2, unit_price: 62000 },
        ]
    },
    // Pending payment — current year
    {
        vendor: "Lenovo India",
        po: "PO-2024-003", invoice: "",
        purchase_date: d(2024,5,5), delivery_date: d(2024,5,20),
        payment_status: "pending", payment_date: null,
        notes: "ThinkPad X1 Carbon for new architect hire. Invoice awaited.",
        items: [
            { name: "Lenovo ThinkPad X1 Carbon Gen 11",      qty: 1, unit_price: 92000 },
        ]
    },
    {
        vendor: "HP India",
        po: "PO-2020-001", invoice: "INV-HP-5544",
        purchase_date: d(2020,12,1), delivery_date: d(2020,12,15),
        payment_status: "paid", payment_date: d(2021,1,5),
        notes: "ProLiant server for DR site.",
        items: [
            { name: "HPE ProLiant DL380 Gen10 (2×Xeon/64GB/4TB)", qty: 1, unit_price: 420000 },
        ]
    },
];

async function scanAll(table) {
    const r = await client.send(new ScanCommand({ TableName: table }));
    return r.Items ?? [];
}

async function seed() {
    console.log("\n══════════════════════════════════════════════");
    console.log("  Vendor & Purchase Seed");
    console.log("══════════════════════════════════════════════\n");

    // ── Vendors ──────────────────────────────────────────────
    console.log("── Vendors ──");
    const existingVendors = await scanAll("ams-vendors");
    const vendorNameMap   = Object.fromEntries(existingVendors.map(v => [v.name, v.vendor_id]));

    for (const v of VENDORS) {
        if (vendorNameMap[v.name]) {
            log("⏭ ", `Vendor exists: ${v.name}`);
            continue;
        }
        const id = uuidv4();
        await client.send(new PutCommand({
            TableName: "ams-vendors",
            Item: { vendor_id: id, ...v, status: "active", created_at: now(), updated_at: now() }
        }));
        vendorNameMap[v.name] = id;
        log("✅", `Vendor created: ${v.name}`);
    }

    // ── Purchases ─────────────────────────────────────────────
    console.log("\n── Purchases ──");
    const existingPO = await scanAll("ams-purchases");
    const existingPONums = new Set(existingPO.map(p => p.po_number).filter(Boolean));

    for (const def of PURCHASE_DEFS) {
        if (existingPONums.has(def.po)) {
            log("⏭ ", `PO exists: ${def.po}`);
            continue;
        }
        const vendor_id = vendorNameMap[def.vendor];
        if (!vendor_id) {
            log("⚠️ ", `Vendor not found, skipping: ${def.vendor}`);
            continue;
        }
        const total = def.items.reduce((s, it) => s + it.qty * it.unit_price, 0);
        await client.send(new PutCommand({
            TableName: "ams-purchases",
            Item: {
                purchase_id:    uuidv4(),
                vendor_id,
                po_number:      def.po,
                invoice_number: def.invoice,
                purchase_date:  def.purchase_date,
                delivery_date:  def.delivery_date,
                payment_status: def.payment_status,
                payment_date:   def.payment_date,
                items:          def.items,
                total_amount:   total,
                notes:          def.notes,
                created_by:     "admin@company.com",
                created_at:     now(),
                updated_at:     now(),
            }
        }));
        log("✅", `Purchase created: ${def.po} — ${def.vendor} — ₹ ${total.toLocaleString("en-IN")}`);
    }

    console.log("\n══════════════════════════════════════════════");
    console.log("  Seed complete ✔");
    console.log("══════════════════════════════════════════════\n");
}

seed().catch(err => { console.error("Seed failed:", err); process.exit(1); });
