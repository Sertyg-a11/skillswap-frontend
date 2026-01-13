import Card from "../../shared/ui/Card";
import Badge from "../../shared/ui/Badge";

export default function ConversationsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Home</h1>
        <p className="mt-1 text-sm text-slate-600">
          Your conversations and pending skill exchange requests will appear here.
        </p>
      </div>

      <Card className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-slate-900">Conversations</div>
            <div className="mt-1 text-sm text-slate-600">
              Not wired yet (you will add message-service + exchange endpoints).
            </div>
          </div>
          <Badge>MVP placeholder</Badge>
        </div>

        <div className="mt-4 rounded-md border border-slate-200 p-4 text-sm text-slate-700 bg-slate-50">
          Suggested next backend endpoints:
          <ul className="list-disc ml-5 mt-2 text-slate-700">
            <li>GET /api/conversations</li>
            <li>GET /api/conversations/:id/messages</li>
            <li>POST /api/conversations/:id/messages</li>
            <li>POST /api/exchanges (request exchange)</li>
            <li>POST /api/exchanges/:id/accept (confirm exchange)</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
