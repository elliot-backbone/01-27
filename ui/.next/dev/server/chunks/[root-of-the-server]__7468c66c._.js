module.exports = [
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/Desktop/backbone-v9/ui/pages/api/actions/today.js [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>handler
]);
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';
async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({
            error: 'Method not allowed'
        });
    }
    try {
        const response = await fetch(`${BACKEND_URL}/api/actions/today`);
        if (!response.ok) {
            const error = await response.json().catch(()=>({
                    error: 'Backend error'
                }));
            return res.status(response.status).json(error);
        }
        const data = await response.json();
        return res.status(200).json(data);
    } catch (err) {
        console.error('Backend connection error:', err.message);
        return res.status(503).json({
            error: 'Backend unavailable',
            message: 'Ensure backend is running on port 4000'
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__7468c66c._.js.map