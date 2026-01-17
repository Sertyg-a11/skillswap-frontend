import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import Card from "../../shared/ui/Card";
import Field from "../../shared/ui/Field";
import Input from "../../shared/ui/Input";
import Button from "../../shared/ui/Button";
import Alert from "../../shared/ui/Alert";
import Badge from "../../shared/ui/Badge";
import Spinner from "../../shared/ui/Spinner";

const SEARCH_TYPES = [
  { value: "ALL", label: "All", description: "Search username and skills" },
  { value: "USERNAME", label: "Username", description: "Search by display name" },
  { value: "SKILL", label: "Skill", description: "Search by skill name" },
];

function UserResultCard({ user, onMessage }) {
  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
          <span className="text-lg font-medium text-slate-600">
            {user.displayName?.charAt(0)?.toUpperCase() || "?"}
          </span>
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-slate-900 truncate">
                {user.displayName}
              </h3>
              {user.bio && (
                <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                  {user.bio}
                </p>
              )}
            </div>
            <Button
              onClick={() => onMessage(user)}
              className="flex-shrink-0"
            >
              Message
            </Button>
          </div>

          {/* Skills */}
          {user.skills && user.skills.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {user.skills.slice(0, 5).map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-blue-50 text-blue-700 border border-blue-200"
                >
                  {skill.name}
                  {skill.level && (
                    <span className="text-blue-500">({skill.level})</span>
                  )}
                </span>
              ))}
              {user.skills.length > 5 && (
                <span className="text-xs text-slate-500">
                  +{user.skills.length - 5} more
                </span>
              )}
            </div>
          )}

          {/* Relevance indicator */}
          {user.relevanceScore >= 0.9 && (
            <div className="mt-2 flex items-center gap-1 text-xs text-green-600">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Best match
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export default function SearchPage() {
  const { api } = useAuth();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState("ALL");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const canSearch = query.trim().length >= 2;

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!canSearch) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.searchUsers(query.trim(), searchType);
      setResults(response);
    } catch (err) {
      console.error("Search failed:", err);
      setError(err.message || "Search failed. Please try again.");
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const handleMessage = useCallback(async (user) => {
    try {
      // Send an initial message to start the conversation
      await api.sendMessage(user.id, `Hi ${user.displayName}! I found your profile and would like to connect.`);
      // Navigate to conversations
      navigate("/app/conversations");
    } catch (err) {
      console.error("Failed to start conversation:", err);
      setError(err.message || "Failed to start conversation");
    }
  }, [api, navigate]);

  const handleClear = () => {
    setQuery("");
    setResults(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Find Users</h1>
        <p className="mt-1 text-sm text-slate-600">
          Search for users by username or skills to start a conversation
        </p>
      </div>

      {/* Search Form */}
      <Card className="p-5">
        <form onSubmit={handleSearch} className="space-y-4">
          {/* Search Type Tabs */}
          <div className="flex gap-2 border-b border-slate-200 pb-3">
            {SEARCH_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setSearchType(type.value)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  searchType === type.value
                    ? "bg-blue-100 text-blue-700"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <Field
            label="Search query"
            hint={`Type at least 2 characters. ${
              searchType === "SKILL"
                ? "Example: Java, React, Python"
                : searchType === "USERNAME"
                ? "Example: John, Developer"
                : "Search across usernames and skills"
            }`}
          >
            <div className="relative">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  searchType === "SKILL"
                    ? "e.g. Spring Boot, Machine Learning"
                    : searchType === "USERNAME"
                    ? "e.g. John Doe"
                    : "Search users..."
                }
                className="pr-10"
              />
              {query && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          </Field>

          {/* Search Button */}
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={!canSearch || loading}>
              {loading ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Searching...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  Search
                </>
              )}
            </Button>

            {results && (
              <span className="text-sm text-slate-500">
                {results.totalResults} result{results.totalResults !== 1 ? "s" : ""} found
              </span>
            )}
          </div>
        </form>

        {/* Error */}
        {error && (
          <div className="mt-4">
            <Alert>{error}</Alert>
          </div>
        )}
      </Card>

      {/* Results */}
      {loading && (
        <div className="flex justify-center py-12">
          <Spinner label="Searching for users..." />
        </div>
      )}

      {!loading && results && (
        <div className="space-y-4">
          {results.results.length === 0 ? (
            <Card className="p-8 text-center">
              <svg
                className="w-12 h-12 mx-auto text-slate-300 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="text-lg font-medium text-slate-900">No users found</h3>
              <p className="text-sm text-slate-500 mt-1">
                Try adjusting your search query or search type
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              <h2 className="text-sm font-medium text-slate-700">
                Showing {results.results.length} user{results.results.length !== 1 ? "s" : ""}
                {results.query && (
                  <span className="text-slate-500"> for "{results.query}"</span>
                )}
              </h2>

              {results.results.map((user) => (
                <UserResultCard
                  key={user.id}
                  user={user}
                  onMessage={handleMessage}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Initial state */}
      {!loading && !results && !error && (
        <Card className="p-8 text-center text-slate-500">
          <svg
            className="w-16 h-16 mx-auto text-slate-300 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <p className="text-lg font-medium">Start searching</p>
          <p className="text-sm mt-1">
            Enter a search term above to find users
          </p>
        </Card>
      )}
    </div>
  );
}
