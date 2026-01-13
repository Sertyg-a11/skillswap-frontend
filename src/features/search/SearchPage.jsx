import { useMemo, useState } from "react";
import Card from "../../shared/ui/Card";
import Field from "../../shared/ui/Field";
import Input from "../../shared/ui/Input";
import Button from "../../shared/ui/Button";
import Alert from "../../shared/ui/Alert";
import Badge from "../../shared/ui/Badge";

export default function SearchPage() {
  const [skill, setSkill] = useState("");
  const [error, setError] = useState(null);

  const canSearch = useMemo(() => skill.trim().length >= 2, [skill]);

  function onSubmit(e) {
    e.preventDefault();
    setError(null);

    // Placeholder because you don't have the endpoint yet.
    // When ready, replace with: api.searchUsers({ skill })
    if (!canSearch) return;
    setError("Search is not connected yet (missing backend endpoint). Add a search endpoint and wire it here.");
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Search</h1>
        <p className="mt-1 text-sm text-slate-600">
          Find users by skill and request a swap (will be wired once the backend search/exchange endpoints exist).
        </p>
      </div>

      <Card className="p-5">
        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Skill to search" hint="Type at least 2 characters. Example: Java, React, Docker">
            <Input value={skill} onChange={(e) => setSkill(e.target.value)} placeholder="e.g. Spring Boot" />
          </Field>

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={!canSearch}>
              Search
            </Button>
            <Badge>MVP UI ready</Badge>
          </div>
        </form>

        {error ? (
          <div className="mt-4">
            <Alert title="Not implemented">{error}</Alert>
          </div>
        ) : null}

        <div className="mt-6 text-sm text-slate-600">
          Backend suggestion (user-service):
          <div className="mt-2 rounded-md border border-slate-200 p-3 bg-slate-50 font-mono text-xs text-slate-700">
            GET /api/search/users?skill=Spring%20Boot
          </div>
        </div>
      </Card>
    </div>
  );
}
