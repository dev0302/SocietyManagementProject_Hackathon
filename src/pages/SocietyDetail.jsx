import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Button from "@/components/ui/button";
import PrivateRoute from "@/components/core/auth/PrivateRoute";
import Input from "@/components/ui/input";
import { getSocietyEvents } from "@/services/operations/eventAPI";
import { deleteSociety } from "@/services/operations/collegeAPI";
import {
  updateSociety,
  getSocietyStudents,
  uploadSocietyStudentsExcel,
  getSocietyMembers,
  exportSocietyMembersExcel,
} from "@/services/operations/societyAPI";
import { ROLES } from "@/config/roles";
import { Trash2, Pencil, Upload, Download, Users, FileSpreadsheet } from "lucide-react";

function SocietyDetail() {
  const { state } = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const [society, setSociety] = useState(state || null);
  const societyId = society?._id || id;

  useEffect(() => {
    if (state) setSociety(state);
  }, [state]);
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [eventFilter, setEventFilter] = useState("upcoming");
  const [eventCategory, setEventCategory] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const canDelete = user?.role === ROLES.ADMIN;
  const facultyCoordinatorId = society?.facultyCoordinator?._id || society?.facultyCoordinator;
  const canEdit = user?.role === ROLES.FACULTY && user?.id && String(facultyCoordinatorId) === String(user.id);
  const canManageStudents =
    (user?.role === ROLES.ADMIN || (user?.role === ROLES.FACULTY && user?.id && String(facultyCoordinatorId) === String(user.id)));

  const [roster, setRoster] = useState([]);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [uploadingExcel, setUploadingExcel] = useState(false);
  const fileInputRef = React.useRef(null);

  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [showMemberDetails, setShowMemberDetails] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);

  const handleEditClick = () => {
    setEditForm({
      name: society?.name || "",
      description: society?.description || "",
      logoUrl: society?.logoUrl || "",
      category: society?.category || "TECH",
      facultyName: society?.facultyName || "",
      presidentName: society?.presidentName || "",
      contactEmail: society?.contactEmail || "",
    });
    setShowEditForm(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!societyId) return;
    setSaving(true);
    try {
      const res = await updateSociety(societyId, editForm);
      if (res?.success && res?.data) {
        toast.success("Society updated successfully.");
        setSociety(res.data);
        setShowEditForm(false);
      } else {
        toast.error(res?.message || "Failed to update society.");
      }
    } catch (err) {
      toast.error(err?.message || "Failed to update society.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!societyId) return;
    setDeleting(true);
    try {
      const res = await deleteSociety(societyId);
      if (res?.success) {
        toast.success("Society deleted successfully.");
        navigate("/admin/college");
      } else {
        toast.error(res?.message || "Failed to delete society.");
      }
    } catch (err) {
      toast.error(err?.message || "Failed to delete society.");
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  useEffect(() => {
    if (!societyId) return;
    const load = async () => {
      setLoadingEvents(true);
      try {
        const params = {};
        if (eventFilter) params.filter = eventFilter;
        if (eventCategory) params.category = eventCategory;
        const res = await getSocietyEvents(societyId, params);
        if (res.success) setEvents(res.data || []);
      } catch {
        setEvents([]);
      } finally {
        setLoadingEvents(false);
      }
    };
    load();
  }, [societyId, eventFilter, eventCategory]);

  useEffect(() => {
    if (!societyId || !canManageStudents) return;
    const load = async () => {
      setLoadingRoster(true);
      try {
        const res = await getSocietyStudents(societyId);
        if (res.success) setRoster(res.data || []);
      } catch {
        setRoster([]);
      } finally {
        setLoadingRoster(false);
      }
    };
    load();
  }, [societyId, canManageStudents]);

  useEffect(() => {
    if (!societyId || !canManageStudents) return;
    const load = async () => {
      setLoadingMembers(true);
      try {
        const res = await getSocietyMembers(societyId);
        if (res.success) setMembers(res.data || []);
      } catch {
        setMembers([]);
      } finally {
        setLoadingMembers(false);
      }
    };
    load();
  }, [societyId, canManageStudents]);

  const handleDownloadTemplate = () => {
    const headers = ["name", "branch", "sem", "year", "department", "position"];
    const csv = [headers.join(","), "John Doe,CSE,3,2,Technical,Member"].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "society_students_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadMembersExcel = async () => {
    if (!societyId) return;
    setExportingExcel(true);
    try {
      const response = await exportSocietyMembersExcel(societyId);
      const blob = response?.data instanceof Blob ? response.data : new Blob([response?.data || ""]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `society_${(society?.name || "members").replace(/[^a-z0-9_-]/gi, "_")}_members.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Excel downloaded.");
    } catch (err) {
      toast.error(err?.message || "Failed to download Excel.");
    } finally {
      setExportingExcel(false);
    }
  };

  const handleExcelUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !societyId) return;
    setUploadingExcel(true);
    try {
      const res = await uploadSocietyStudentsExcel(societyId, file);
      if (res.success) {
        setRoster(res.data || []);
        toast.success(res.message || "Students uploaded.");
      } else {
        toast.error(res.message || "Upload failed.");
      }
    } catch (err) {
      toast.error(err?.message || "Upload failed.");
    } finally {
      setUploadingExcel(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <PrivateRoute>
      <div className="flex min-h-screen flex-col bg-slate-950 text-slate-50">
        <Navbar />
        <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
          <div className="mb-6">
            <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
              ← Back
            </Button>
          </div>

          {society ? (
            <Card>
              <CardHeader>
                <div className="flex items-start gap-4">
                  {society.logoUrl && (
                    <img
                      src={society.logoUrl}
                      alt={society.name}
                      className="h-16 w-16 rounded-lg border border-slate-800 object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <CardTitle className="text-xl">{society.name}</CardTitle>
                    {society.category && (
                      <CardDescription className="mt-1">
                        {society.category}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {canEdit && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditClick()}
                      >
                        <Pencil className="mr-1 h-4 w-4" />
                        Edit society
                      </Button>
                    )}
                    {canDelete && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                        onClick={() => setShowDeleteConfirm(true)}
                        disabled={deleting}
                      >
                        <Trash2 className="mr-1 h-4 w-4" />
                        Delete society
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-300">
                {society.description && (
                  <div>
                    <p className="mb-1 font-medium text-slate-200">About</p>
                    <p>{society.description}</p>
                  </div>
                )}
                {society.contactEmail && (
                  <div>
                    <p className="mb-1 font-medium text-slate-200">Contact</p>
                    <p>{society.contactEmail}</p>
                  </div>
                )}
                {(society.facultyName || society.presidentName) && (
                  <div>
                    <p className="mb-1 font-medium text-slate-200">Leadership</p>
                    <p>
                      {society.facultyName && `Faculty: ${society.facultyName}`}
                      {society.facultyName && society.presidentName && " • "}
                      {society.presidentName && `President: ${society.presidentName}`}
                    </p>
                  </div>
                )}
                {society._id && (
                  <div className="rounded-md border border-slate-800 bg-slate-900/50 px-3 py-2">
                    <p className="text-[11px] font-medium text-slate-400">Society ID</p>
                    <p className="font-mono text-xs text-sky-300">{society._id}</p>
                  </div>
                )}

                {canManageStudents && societyId && (
                  <>
                  <div className="mt-6 border-t border-slate-800 pt-6">
                    <p className="mb-3 font-medium text-slate-200">Enrolled members (students in this society)</p>
                    <p className="mb-3 text-xs text-slate-500">
                      All students enrolled in this society (President, Heads, Core, Members). Export to Excel with name, branch, sem, position, email.
                    </p>
                    <div className="mb-3 flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowMemberDetails((v) => !v)}
                      >
                        <Users className="mr-1 h-4 w-4" />
                        {showMemberDetails ? "Hide" : "View"} details of each student
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={exportingExcel || loadingMembers}
                        onClick={handleDownloadMembersExcel}
                      >
                        <FileSpreadsheet className="mr-1 h-4 w-4" />
                        {exportingExcel ? "Downloading…" : "Download Excel"}
                      </Button>
                    </div>
                    {showMemberDetails && (
                      <>
                        {loadingMembers ? (
                          <p className="text-xs text-slate-500">Loading members…</p>
                        ) : members.length === 0 ? (
                          <p className="text-xs text-slate-500">No enrolled members yet.</p>
                        ) : (
                          <div className="overflow-x-auto rounded-md border border-slate-800">
                            <table className="w-full min-w-[500px] text-left text-xs">
                              <thead>
                                <tr className="border-b border-slate-800 bg-slate-900/70">
                                  <th className="px-3 py-2 font-medium text-slate-300">Name</th>
                                  <th className="px-3 py-2 font-medium text-slate-300">Email</th>
                                  <th className="px-3 py-2 font-medium text-slate-300">Branch</th>
                                  <th className="px-3 py-2 font-medium text-slate-300">Sem</th>
                                  <th className="px-3 py-2 font-medium text-slate-300">Year</th>
                                  <th className="px-3 py-2 font-medium text-slate-300">Position</th>
                                  <th className="px-3 py-2 font-medium text-slate-300">Department</th>
                                </tr>
                              </thead>
                              <tbody>
                                {members.map((row) => (
                                  <tr key={row._id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                                    <td className="px-3 py-2 text-slate-200">{row.name}</td>
                                    <td className="px-3 py-2 text-slate-400">{row.email || "—"}</td>
                                    <td className="px-3 py-2 text-slate-400">{row.branch || "—"}</td>
                                    <td className="px-3 py-2 text-slate-400">{row.sem || "—"}</td>
                                    <td className="px-3 py-2 text-slate-400">{row.year || "—"}</td>
                                    <td className="px-3 py-2 text-slate-400">{row.position || "—"}</td>
                                    <td className="px-3 py-2 text-slate-400">{row.department || "—"}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <div className="mt-6 border-t border-slate-800 pt-6">
                    <p className="mb-3 font-medium text-slate-200">Student roster (Excel upload)</p>
                    <p className="mb-3 text-xs text-slate-500">
                      Upload a CSV or Excel file with columns: name, branch, sem, year, department, position.
                    </p>
                    <div className="mb-3 flex flex-wrap gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        className="hidden"
                        onChange={handleExcelUpload}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={uploadingExcel}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="mr-1 h-4 w-4" />
                        {uploadingExcel ? "Uploading…" : "Upload Excel/CSV"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleDownloadTemplate}
                      >
                        <Download className="mr-1 h-4 w-4" />
                        Download template
                      </Button>
                    </div>
                    {loadingRoster ? (
                      <p className="text-xs text-slate-500">Loading roster…</p>
                    ) : roster.length === 0 ? (
                      <p className="text-xs text-slate-500">No students in roster. Upload an Excel/CSV to add.</p>
                    ) : (
                      <div className="overflow-x-auto rounded-md border border-slate-800">
                        <table className="w-full min-w-[400px] text-left text-xs">
                          <thead>
                            <tr className="border-b border-slate-800 bg-slate-900/70">
                              <th className="px-3 py-2 font-medium text-slate-300">Name</th>
                              <th className="px-3 py-2 font-medium text-slate-300">Branch</th>
                              <th className="px-3 py-2 font-medium text-slate-300">Sem</th>
                              <th className="px-3 py-2 font-medium text-slate-300">Year</th>
                              <th className="px-3 py-2 font-medium text-slate-300">Department</th>
                              <th className="px-3 py-2 font-medium text-slate-300">Position</th>
                            </tr>
                          </thead>
                          <tbody>
                            {roster.map((row) => (
                              <tr key={row._id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                                <td className="px-3 py-2 text-slate-200">{row.name}</td>
                                <td className="px-3 py-2 text-slate-400">{row.branch || "—"}</td>
                                <td className="px-3 py-2 text-slate-400">{row.sem || "—"}</td>
                                <td className="px-3 py-2 text-slate-400">{row.year || "—"}</td>
                                <td className="px-3 py-2 text-slate-400">{row.department || "—"}</td>
                                <td className="px-3 py-2 text-slate-400">{row.position || "—"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                  </>
                )}

                {societyId && (
                  <div className="mt-6 border-t border-slate-800 pt-6">
                    <p className="mb-3 font-medium text-slate-200">Society events</p>
                    <div className="mb-3 flex flex-wrap gap-2">
                      {["upcoming", "today", "yesterday", "tomorrow", "past"].map((f) => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => setEventFilter(f)}
                          className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
                            eventFilter === f ? "bg-sky-500/20 text-sky-300" : "bg-slate-800 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                      <span className="mx-1 text-slate-600">|</span>
                      {["", "TECH", "NON_TECH"].map((c) => (
                        <button
                          key={c || "all"}
                          type="button"
                          onClick={() => setEventCategory(c)}
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            eventCategory === c ? "bg-sky-500/20 text-sky-300" : "bg-slate-800 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          {c || "All"}
                        </button>
                      ))}
                    </div>
                    {loadingEvents ? (
                      <p className="text-xs text-slate-500">Loading events…</p>
                    ) : events.length === 0 ? (
                      <p className="text-xs text-slate-500">No events found.</p>
                    ) : (
                      <div className="space-y-2">
                        {events.map((ev) => (
                          <div
                            key={ev._id}
                            className="rounded-md border border-slate-800 bg-slate-900/50 px-3 py-2"
                          >
                            <p className="text-sm font-medium text-slate-100">{ev.title}</p>
                            {ev.description && (
                              <p className="mt-0.5 line-clamp-2 text-xs text-slate-400">{ev.description}</p>
                            )}
                            <p className="mt-1 text-[11px] text-slate-500">
                              {ev.date ? new Date(ev.date).toLocaleString() : ""}
                              {ev.venue && ` • ${ev.venue}`}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {showEditForm && canEdit && (
                  <div className="mt-6 border-t border-slate-800 pt-6">
                    <p className="mb-3 font-medium text-slate-200">Edit society</p>
                    <form onSubmit={handleSaveEdit} className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-xs text-slate-400">Name</label>
                        <Input
                          value={editForm.name}
                          onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-slate-400">Description</label>
                        <textarea
                          value={editForm.description}
                          onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
                          className="w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm"
                          rows={3}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-slate-400">Logo URL</label>
                        <Input
                          value={editForm.logoUrl}
                          onChange={(e) => setEditForm((p) => ({ ...p, logoUrl: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-slate-400">Category</label>
                        <select
                          value={editForm.category}
                          onChange={(e) => setEditForm((p) => ({ ...p, category: e.target.value }))}
                          className="w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm"
                        >
                          <option value="TECH">Tech</option>
                          <option value="NON_TECH">Non-tech</option>
                        </select>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                          <label className="text-xs text-slate-400">Faculty name</label>
                          <Input
                            value={editForm.facultyName}
                            onChange={(e) => setEditForm((p) => ({ ...p, facultyName: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-slate-400">President name</label>
                          <Input
                            value={editForm.presidentName}
                            onChange={(e) => setEditForm((p) => ({ ...p, presidentName: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-slate-400">Contact email</label>
                        <Input
                          type="email"
                          value={editForm.contactEmail}
                          onChange={(e) => setEditForm((p) => ({ ...p, contactEmail: e.target.value }))}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" disabled={saving}>
                          {saving ? "Saving…" : "Save changes"}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setShowEditForm(false)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : null}

          {showDeleteConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="relative z-50 w-full max-w-md rounded-lg border border-slate-800 bg-slate-900 p-6 shadow-lg">
                <h2 className="text-lg font-semibold text-slate-50">Delete society</h2>
                <p className="mt-2 text-sm text-slate-400">
                  Are you sure you want to delete &quot;{society?.name}&quot;? This will remove it from your
                  college. This action cannot be undone.
                </p>
                <div className="mt-4 flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} disabled={deleting}>
                    Cancel
                  </Button>
                  <Button
                    className="bg-red-600 hover:bg-red-700"
                    onClick={handleDelete}
                    disabled={deleting}
                  >
                    {deleting ? "Deleting…" : "Delete"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {!society && (
            <Card>
              <CardContent className="py-12 text-center text-slate-400">
                <p>Society details not available.</p>
                <p className="mt-1 text-xs">
                  Please navigate from the college interface to view society information.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => navigate("/admin/college")}
                >
                  Go to college interface
                </Button>
              </CardContent>
            </Card>
          )}
        </main>
        <Footer />
      </div>
    </PrivateRoute>
  );
}

export default SocietyDetail;
