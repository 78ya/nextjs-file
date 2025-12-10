import { notFound } from "next/navigation";
import { useState } from "react";

function isDev() {
  return process.env.NODE_ENV === "development";
}

export default function Page() {
  if (!isDev()) return notFound();
  return <TokenTester />;
}

// Client-side UI for invoking /token APIs (dev-only)
function TokenTester() {
  const [adminToken, setAdminToken] = useState("");
  const [createBody, setCreateBody] = useState<{ token?: string; ttlSeconds?: number | undefined }>({});
  const [patchBody, setPatchBody] = useState<{ id: string; status: "disabled" | "active" }>({
    id: "",
    status: "disabled",
  });
  const [deleteId, setDeleteId] = useState("");
  const [output, setOutput] = useState<string>("");

  async function callApi(method: "POST" | "PATCH" | "DELETE", body: unknown) {
    setOutput("loading...");
    try {
      const res = await fetch("/token", {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      setOutput(JSON.stringify({ status: res.status, json }, null, 2));
    } catch (err: any) {
      setOutput(`error: ${err?.message ?? String(err)}`);
    }
  }

  return (
    <div style={{ fontFamily: "sans-serif", padding: 24, maxWidth: 640, margin: "0 auto" }}>
      <h1>Token API Tester (dev only)</h1>
      <div style={{ margin: "12px 0" }}>
        <label>
          Admin Token:
          <input
            type="password"
            value={adminToken}
            onChange={(e) => setAdminToken(e.target.value)}
            style={{ width: "100%", padding: 8, marginTop: 4 }}
            placeholder="Bearer ADMIN_TOKEN"
          />
        </label>
      </div>

      <section style={{ border: "1px solid #ddd", padding: 12, marginBottom: 12 }}>
        <h3>Create Token (POST /token)</h3>
        <label>
          Plain token (optional):
          <input
            type="text"
            value={createBody.token ?? ""}
            onChange={(e) =>
              setCreateBody((prev) => ({
                ...prev,
                token: e.target.value || undefined,
              }))
            }
            style={{ width: "100%", padding: 8, marginTop: 4 }}
            placeholder="leave empty to auto-generate"
          />
        </label>
        <label style={{ display: "block", marginTop: 8 }}>
          ttlSeconds (optional):
          <input
            type="number"
            value={createBody.ttlSeconds ?? ""}
            onChange={(e) =>
              setCreateBody((prev) => ({
                ...prev,
                ttlSeconds: e.target.value ? Number(e.target.value) : undefined,
              }))
            }
            style={{ width: "100%", padding: 8, marginTop: 4 }}
            placeholder="e.g. 3600"
          />
        </label>
        <button style={{ marginTop: 8 }} onClick={() => callApi("POST", createBody)}>
          Create
        </button>
      </section>

      <section style={{ border: "1px solid #ddd", padding: 12, marginBottom: 12 }}>
        <h3>Update Status (PATCH /token)</h3>
        <label>
          Token ID:
          <input
            type="text"
            value={patchBody.id}
            onChange={(e) => setPatchBody((prev) => ({ ...prev, id: e.target.value }))}
            style={{ width: "100%", padding: 8, marginTop: 4 }}
            placeholder="token id"
          />
        </label>
        <label style={{ display: "block", marginTop: 8 }}>
          Status:
          <select
            value={patchBody.status}
            onChange={(e) =>
              setPatchBody((prev) => ({ ...prev, status: e.target.value as "disabled" | "active" }))
            }
            style={{ width: "100%", padding: 8, marginTop: 4 }}
          >
            <option value="disabled">disabled</option>
            <option value="active">active</option>
          </select>
        </label>
        <button style={{ marginTop: 8 }} onClick={() => callApi("PATCH", patchBody)}>
          Update
        </button>
      </section>

      <section style={{ border: "1px solid #ddd", padding: 12, marginBottom: 12 }}>
        <h3>Delete (DELETE /token)</h3>
        <label>
          Token ID:
          <input
            type="text"
            value={deleteId}
            onChange={(e) => setDeleteId(e.target.value)}
            style={{ width: "100%", padding: 8, marginTop: 4 }}
            placeholder="token id"
          />
        </label>
        <button style={{ marginTop: 8 }} onClick={() => callApi("DELETE", { id: deleteId })}>
          Delete
        </button>
      </section>

      <section style={{ border: "1px solid #ddd", padding: 12 }}>
        <h3>Response</h3>
        <pre
          style={{
            background: "#f7f7f7",
            padding: 12,
            minHeight: 120,
            whiteSpace: "pre-wrap",
            wordBreak: "break-all",
          }}
        >
          {output}
        </pre>
      </section>
    </div>
  );
}

