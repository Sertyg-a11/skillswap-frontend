import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/useAuth";
import Card from "../../shared/ui/Card";
import Field from "../../shared/ui/Field";
import Input from "../../shared/ui/Input";
import Textarea from "../../shared/ui/Textarea";
import Button from "../../shared/ui/Button";
import Spinner from "../../shared/ui/Spinner";
import Alert from "../../shared/ui/Alert";
import Badge from "../../shared/ui/Badge";

export default function ProfilePage() {
  const { api } = useAuth();

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [addingSkill, setAddingSkill] = useState(false);

  const [error, setError] = useState(null);

  const [me, setMe] = useState(null);
  const [skills, setSkills] = useState([]);

  // Profile form
  const [displayName, setDisplayName] = useState("");
  const [timeZone, setTimeZone] = useState("");
  const [bio, setBio] = useState("");

  // Preferences form (assumes booleans exist in UserDto; if not, UI still works but will default false)
  const [allowMatching, setAllowMatching] = useState(false);
  const [allowEmails, setAllowEmails] = useState(false);

  // Skill add form
  const [skillName, setSkillName] = useState("");
  const [skillLevel, setSkillLevel] = useState("");
  const [skillCategory, setSkillCategory] = useState("");
  const [skillDescription, setSkillDescription] = useState("");

  const canAddSkill = useMemo(() => skillName.trim().length > 0, [skillName]);

  async function loadAll() {
    setError(null);
    setLoading(true);
    try {
      const [meRes, skillsRes] = await Promise.all([api.me(), api.mySkills()]);
      setMe(meRes);
      setSkills(Array.isArray(skillsRes) ? skillsRes : []);

      setDisplayName(meRes?.displayName || "");
      setTimeZone(meRes?.timeZone || "");
      setBio(meRes?.bio || "");

      setAllowMatching(Boolean(meRes?.allowMatching));
      setAllowEmails(Boolean(meRes?.allowEmails));
    } catch (e) {
      setError(e?.message || "Failed to load profile.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSaveProfile(e) {
    e.preventDefault();
    setError(null);
    setSavingProfile(true);
    try {
      const updated = await api.updateProfile({
        displayName,
        timeZone: timeZone || null,
        bio: bio || null,
      });
      setMe(updated);
    } catch (e2) {
      setError(e2?.message || "Failed to save profile.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function onSavePrefs(e) {
    e.preventDefault();
    setError(null);
    setSavingPrefs(true);
    try {
      const updated = await api.updatePreferences({
        allowMatching,
        allowEmails,
      });
      setMe(updated);
    } catch (e2) {
      setError(e2?.message || "Failed to save preferences.");
    } finally {
      setSavingPrefs(false);
    }
  }

  async function onAddSkill(e) {
    e.preventDefault();
    if (!canAddSkill) return;

    setError(null);
    setAddingSkill(true);
    try {
      const created = await api.addSkill({
        name: skillName.trim(),
        level: skillLevel || null,
        category: skillCategory || null,
        description: skillDescription || null,
      });

      setSkills((prev) => [created, ...prev]);

      setSkillName("");
      setSkillLevel("");
      setSkillCategory("");
      setSkillDescription("");
    } catch (e2) {
      setError(e2?.message || "Failed to add skill.");
    } finally {
      setAddingSkill(false);
    }
  }

  if (loading) {
    return (
      <div className="py-8">
        <Spinner label="Loading profile..." />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Profile</h1>
        <p className="mt-1 text-sm text-slate-600">
          Manage your public profile, preferences, and skills.
        </p>
      </div>

      {error ? <Alert title="Something went wrong">{error}</Alert> : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-slate-900">Public profile</div>
              <div className="mt-1 text-sm text-slate-600">This is what others will see.</div>
            </div>
            <Badge>ID: {me?.id ? String(me.id).slice(0, 8) : "n/a"}</Badge>
          </div>

          <form onSubmit={onSaveProfile} className="mt-4 space-y-4">
            <Field label="Display name">
              <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={100} />
            </Field>

            <Field label="Time zone" hint="Example: Europe/Amsterdam">
              <Input value={timeZone} onChange={(e) => setTimeZone(e.target.value)} maxLength={64} />
            </Field>

            <Field label="Bio" hint="Max length depends on backend validation. Keep it concise for MVP.">
              <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} />
            </Field>

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={savingProfile}>
                {savingProfile ? "Saving..." : "Save profile"}
              </Button>
              <Button type="button" variant="secondary" onClick={loadAll}>
                Refresh
              </Button>
            </div>
          </form>
        </Card>

        <Card className="p-5">
          <div className="text-sm font-semibold text-slate-900">Preferences</div>
          <div className="mt-1 text-sm text-slate-600">
            These flags should match your `UpdatePreferencesRequest`.
          </div>

          <form onSubmit={onSavePrefs} className="mt-4 space-y-4">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                className="mt-1"
                checked={allowMatching}
                onChange={(e) => setAllowMatching(e.target.checked)}
              />
              <div>
                <div className="text-sm font-medium text-slate-800">Allow matching</div>
                <div className="text-xs text-slate-500">Let others discover you via search and matching.</div>
              </div>
            </label>

            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                className="mt-1"
                checked={allowEmails}
                onChange={(e) => setAllowEmails(e.target.checked)}
              />
              <div>
                <div className="text-sm font-medium text-slate-800">Allow emails</div>
                <div className="text-xs text-slate-500">Allow transactional notifications by email.</div>
              </div>
            </label>

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={savingPrefs}>
                {savingPrefs ? "Saving..." : "Save preferences"}
              </Button>
            </div>
          </form>
        </Card>
      </div>

      <Card className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-slate-900">My skills</div>
            <div className="mt-1 text-sm text-slate-600">
              Add the skills you can teach or want to exchange.
            </div>
          </div>
          <Badge>{skills.length} total</Badge>
        </div>

        <form onSubmit={onAddSkill} className="mt-4 grid gap-3 md:grid-cols-2">
          <Field label="Name">
            <Input value={skillName} onChange={(e) => setSkillName(e.target.value)} maxLength={100} />
          </Field>
          <Field label="Level">
            <Input value={skillLevel} onChange={(e) => setSkillLevel(e.target.value)} maxLength={32} placeholder="Beginner / Intermediate / Advanced" />
          </Field>
          <Field label="Category">
            <Input value={skillCategory} onChange={(e) => setSkillCategory(e.target.value)} maxLength={64} placeholder="Backend / Frontend / DevOps" />
          </Field>
          <Field label="Description">
            <Input value={skillDescription} onChange={(e) => setSkillDescription(e.target.value)} maxLength={2000} placeholder="What can you help with?" />
          </Field>

          <div className="md:col-span-2 flex items-center gap-3">
            <Button type="submit" disabled={!canAddSkill || addingSkill}>
              {addingSkill ? "Adding..." : "Add skill"}
            </Button>
          </div>
        </form>

        <div className="mt-5 border-t border-slate-200 pt-4">
          {skills.length === 0 ? (
            <div className="text-sm text-slate-600">No skills yet. Add your first one above.</div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {skills.map((s) => (
                <div key={s.id} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-sm font-semibold text-slate-900">{s.name}</div>
                    <Badge>{s.level || "n/a"}</Badge>
                  </div>
                  <div className="mt-1 text-xs text-slate-500">{s.category || "Uncategorized"}</div>
                  {s.description ? <div className="mt-2 text-sm text-slate-700">{s.description}</div> : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
