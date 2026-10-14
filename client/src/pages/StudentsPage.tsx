import { motion } from "framer-motion";
import { FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { mockStudents, type Student } from "../data/mockStudents";
import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../api/client";
import { endpoints } from "../api/endpoints";

const pageSize = 5;

function getStudentId(student: Student) {
  return student._id || student.id || "";
}

export function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
      const matchesQuery =
        fullName.includes(query.toLowerCase()) ||
        student.guardianEmail.toLowerCase().includes(query.toLowerCase());

      const matchesGrade =
        gradeFilter === "all" || String(student.gradeLevel) === gradeFilter;

      return matchesQuery && matchesGrade;
    });
  }, [students, query, gradeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / pageSize));
  const visibleStudents = filteredStudents.slice((page - 1) * pageSize, page * pageSize);

  function openAddModal() {
    setEditingStudent(null);
    setIsModalOpen(true);
  }

  function openEditModal(student: Student) {
    setEditingStudent(student);
    setIsModalOpen(true);
  }

  async function handleDelete(studentId: string) {
    const confirmed = confirm("Delete this student?");
    if (!confirmed) return;

    try {
      await apiRequest(`${endpoints.students}/${studentId}`, {
        method: "DELETE"
      });

      await loadStudents();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to delete student.");
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const payload = {
      firstName: String(formData.get("firstName")),
      lastName: String(formData.get("lastName")),
      gradeLevel: Number(formData.get("gradeLevel")),
      guardianEmail: String(formData.get("guardianEmail")),
      status: String(formData.get("status")) as Student["status"]
    };

    if (!payload.firstName || !payload.lastName || !payload.gradeLevel) {
      return;
    }

    try {
      if (editingStudent) {
        await apiRequest<Student>(`${endpoints.students}/${editingStudent._id}`, {
          method: "PATCH",
          body: JSON.stringify(payload)
        });
      } else {
        await apiRequest<Student>(endpoints.students, {
          method: "POST",
          body: JSON.stringify(payload)
        });
      }

      setIsModalOpen(false);
      await loadStudents();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to save student.");
    }

    setIsModalOpen(false);
  }

  async function loadStudents() {
    try {
      setIsLoading(true);
      setError("");

      const data = await apiRequest<Student[]>(endpoints.students);
      setStudents(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to load students.");
      setStudents(mockStudents);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadStudents();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-[var(--accent)]">Records</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Students
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            Search, filter, add, edit, and manage student records.
          </p>
        </div>

        <Button onClick={openAddModal}>
          <span className="inline-flex items-center gap-2">
            <FiPlus />
            Add Student
          </span>
        </Button>
      </section>

      <Card className="p-5">
        <div className="mb-5 grid gap-3 md:grid-cols-[1fr_180px]">
          <Input
            placeholder="Search by student or guardian email..."
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
          />

          <select
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-[var(--text)]"
            value={gradeFilter}
            onChange={(event) => {
              setGradeFilter(event.target.value);
              setPage(1);
            }}
          >
            <option value="all">All grades</option>
            <option value="9">Grade 9</option>
            <option value="10">Grade 10</option>
            <option value="11">Grade 11</option>
            <option value="12">Grade 12</option>
          </select>
        </div>

        {error ? (
          <p className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </p>
        ) : null}

        {isLoading ? (
          <div className="space-y-3">
            <div className="h-12 animate-pulse rounded-xl bg-[var(--surface)]" />
            <div className="h-12 animate-pulse rounded-xl bg-[var(--surface)]" />
            <div className="h-12 animate-pulse rounded-xl bg-[var(--surface)]" />
          </div>
        ) : visibleStudents.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-separate border-spacing-y-2 text-left text-sm">
              <thead className="text-[var(--muted)]">
                <tr>
                  <th className="px-3 py-2">Student</th>
                  <th className="px-3 py-2">Grade</th>
                  <th className="px-3 py-2">Guardian Email</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {visibleStudents.map((student) => (
                  <tr key={getStudentId(student)} className="rounded-xl bg-[var(--surface)]">
                    <td className="rounded-l-xl px-3 py-3 font-semibold">
                      {student.firstName} {student.lastName}
                    </td>
                    <td className="px-3 py-3">Grade {student.gradeLevel}</td>
                    <td className="px-3 py-3 text-[var(--muted)]">
                      {student.guardianEmail}
                    </td>
                    <td className="px-3 py-3">
                      <Badge tone={student.status === "active" ? "success" : "neutral"}>
                        {student.status}
                      </Badge>
                    </td>
                    <td className="rounded-r-xl px-3 py-3">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="secondary"
                          onClick={() => openEditModal(student)}
                          aria-label={`Edit ${student.firstName}`}
                        >
                          <FiEdit2 />
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => handleDelete(getStudentId(student))}
                          aria-label={`Delete ${student.firstName}`}
                        >
                          <FiTrash2 />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-2xl border border-[var(--border)] p-8 text-center text-sm text-[var(--muted)]">
            No students match your filters.
          </div>
        )}

        <div className="mt-5 flex items-center justify-between text-sm text-[var(--muted)]">
          <span>
            Page {page} of {totalPages}
          </span>

          <div className="flex gap-2">
            <Button
              variant="secondary"
              disabled={page === 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              disabled={page === totalPages}
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>

      {isModalOpen ? (
        <Modal
          title={editingStudent ? "Edit Student" : "Add Student"}
          onClose={() => setIsModalOpen(false)}
        >
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                name="firstName"
                placeholder="First name"
                defaultValue={editingStudent?.firstName}
                required
              />
              <Input
                name="lastName"
                placeholder="Last name"
                defaultValue={editingStudent?.lastName}
                required
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                name="gradeLevel"
                type="number"
                min="1"
                max="12"
                placeholder="Grade"
                defaultValue={editingStudent?.gradeLevel}
                required
              />
              <select
                name="status"
                className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-[var(--text)]"
                defaultValue={editingStudent?.status || "active"}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <Input
              name="guardianEmail"
              type="email"
              placeholder="Guardian email"
              defaultValue={editingStudent?.guardianEmail}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingStudent ? "Save Changes" : "Create Student"}
              </Button>
            </div>
          </form>
        </Modal>
      ) : null}
    </motion.div>
  );
}