import { useState } from "react";
import { useAuth } from "../auth/useAuth";
import Card from "../../shared/ui/Card";
import Button from "../../shared/ui/Button";
import Spinner from "../../shared/ui/Spinner";
import Alert from "../../shared/ui/Alert";

function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}

export default function PrivacyPage() {
  const { api, logout } = useAuth();

  const [loadingExport, setLoadingExport] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  async function onExport() {
    setError(null);
    setLoadingExport(true);
    try {
      const bundle = await api.exportGdpr();
      downloadJson("skillswap-gdpr-export.json", bundle);
    } catch (e) {
      setError(e?.message || "Failed to export GDPR data.");
    } finally {
      setLoadingExport(false);
    }
  }

  async function onDeleteAccount() {
    const ok = window.confirm(
      "This will delete your account (soft delete). You will be logged out. Continue?"
    );
    if (!ok) return;

    setError(null);
    setDeleting(true);
    try {
      await api.deleteMe();
      await logout();
    } catch (e) {
      setError(e?.message || "Failed to delete account.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Privacy</h1>
        <p className="mt-1 text-sm text-slate-600">
          Export your data or delete your account.
        </p>
      </div>

      {error ? <Alert title="Privacy action failed">{error}</Alert> : null}

      <Card className="p-5">
        <div className="text-sm font-semibold text-slate-900">GDPR export</div>
        <div className="mt-1 text-sm text-slate-600">
          Downloads a JSON file with your profile, skills, and privacy events from <span className="font-mono text-xs">/api/gdpr/export</span>.
        </div>

        <div className="mt-4">
          <Button onClick={onExport} disabled={loadingExport}>
            {loadingExport ? <Spinner label="Exporting..." /> : "Download GDPR export"}
          </Button>
        </div>
      </Card>

      <Card className="p-5 border border-rose-200">
        <div className="text-sm font-semibold text-rose-900">Delete account</div>
        <div className="mt-1 text-sm text-rose-800">
          This triggers <span className="font-mono text-xs">DELETE /api/users/me</span>
        </div>

        <div className="mt-4">
          <Button variant="danger" onClick={onDeleteAccount} disabled={deleting}>
            {deleting ? <Spinner label="Deleting..." /> : "Delete my account"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
