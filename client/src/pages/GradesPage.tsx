import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { apiRequest } from "../api/client";
import { endpoints } from "../api/endpoints";
import type { Student } from "../data/mockStudents";

type GradeApiRecord = {
  _id: string;
  student: Student | null;
  subject: string;
  score: number;
  term: string;
  feedback?: string;
};

const subjects = ["Mathematics", "Science", "English", "History", "ICT"];



function getGradeTone(score: number): "success" | "warning" | "neutral" {
    if (score >= 85) return "success";
    if (score >= 75) return "warning";
    return "neutral";
}

export function GradesPage() {
    const [grades, setGrades] = useState<GradeApiRecord[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [query, setQuery] = useState("");
    const [subjectFilter, setSubjectFilter] = useState("all");
    const [editingGrade, setEditingGrade] = useState<GradeApiRecord | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    async function loadGradesData() {
        try {
            setIsLoading(true);
            setError("");

            const [gradeData, studentData] = await Promise.all([
            apiRequest<GradeApiRecord[]>(endpoints.grades),
            apiRequest<Student[]>(endpoints.students)
            ]);

            setGrades(gradeData.filter((grade) => grade.student));
            setStudents(studentData);
        } catch (error) {
            setError(error instanceof Error ? error.message : "Failed to load grades.");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
    loadGradesData();
    }, []);

    const filteredGrades = useMemo(() => {
        return grades.filter((grade) => {
        const studentName = grade.student
        ? `${grade.student.firstName} ${grade.student.lastName}`.toLowerCase()
        : "";
        const matchesQuery =
            studentName.includes(query.toLowerCase()) ||
            grade.subject.toLowerCase().includes(query.toLowerCase()) ||
            grade.term.toLowerCase().includes(query.toLowerCase());

        const matchesSubject =
            subjectFilter === "all" || grade.subject === subjectFilter;

        return matchesQuery && matchesSubject;
        });
    }, [grades, query, subjectFilter]);

    const averageScore = useMemo(() => {
        if (!filteredGrades.length) return 0;

        const total = filteredGrades.reduce((sum, grade) => sum + grade.score, 0);
        return Math.round(total / filteredGrades.length);
    }, [filteredGrades]);

    function openAddModal() {
        setEditingGrade(null);
        setIsModalOpen(true);
    }

    function openEditModal(grade: GradeApiRecord) {
        setEditingGrade(grade);
        setIsModalOpen(true);
    }

    async function handleDelete(gradeId: string) {
        const confirmed = confirm("Delete this grade record?");
        if (!confirmed) return;

        try {
            await apiRequest(`${endpoints.grades}/${gradeId}`, {
            method: "DELETE"
            });

            await loadGradesData();
        } catch (error) {
            setError(error instanceof Error ? error.message : "Failed to delete grade.");
        }
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const payload = {
            student: String(formData.get("studentId")),
            subject: String(formData.get("subject")),
            score: Number(formData.get("score")),
            term: String(formData.get("term")),
            feedback: String(formData.get("feedback"))
        };

        if (editingGrade) {
            await apiRequest(`${endpoints.grades}/${editingGrade._id}`, {
                method: "PATCH",
                body: JSON.stringify(payload)
            });
        } else {
            await apiRequest(endpoints.grades, {
                method: "POST",
                body: JSON.stringify(payload)
            });
        }

        setIsModalOpen(false);
        await loadGradesData();
    }

    return (
        <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
        >
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
            <p className="text-sm font-semibold text-[var(--accent)]">Academic Tracking</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                Grades
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                Record, review, and edit grades by student, subject, and term.
            </p>
            </div>

            <Card className="p-4">
            <p className="text-sm font-medium text-[var(--muted)]">Average Score</p>
            <p className="mt-1 text-3xl font-bold text-[var(--accent)]">
                {averageScore}%
            </p>
            </Card>
        </section>

        <Card className="p-5">
            <div className="mb-5 grid gap-3 md:grid-cols-[1fr_200px_auto]">
            <Input
                placeholder="Search grades..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
            />

            <select
                className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-[var(--text)]"
                value={subjectFilter}
                onChange={(event) => setSubjectFilter(event.target.value)}
            >
                <option value="all">All subjects</option>
                {subjects.map((subject) => (
                <option key={subject} value={subject}>
                    {subject}
                </option>
                ))}
            </select>

            <Button onClick={openAddModal}>
                <span className="inline-flex items-center gap-2">
                <FiPlus />
                Add Grade
                </span>
            </Button>
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
            ) : filteredGrades.length ? (
            <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] border-separate border-spacing-y-2 text-left text-sm">
                <thead className="text-[var(--muted)]">
                    <tr>
                    <th className="px-3 py-2">Student</th>
                    <th className="px-3 py-2">Subject</th>
                    <th className="px-3 py-2">Term</th>
                    <th className="px-3 py-2">Score</th>
                    <th className="px-3 py-2">Feedback</th>
                    <th className="px-3 py-2 text-right">Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {filteredGrades.map((grade) => (
                    <tr key={grade._id} className="rounded-xl bg-[var(--surface)]">
                        <td className="rounded-l-xl px-3 py-3 font-semibold">
                        {grade.student
                        ? `${grade.student.firstName} ${grade.student.lastName}`
                        : "Unknown Student"}
                        </td>
                        <td className="px-3 py-3">{grade.subject}</td>
                        <td className="px-3 py-3">{grade.term}</td>
                        <td className="px-3 py-3">
                        <Badge tone={getGradeTone(grade.score)}>{grade.score}%</Badge>
                        </td>
                        <td className="px-3 py-3 text-[var(--muted)]">
                        {grade.feedback || "No feedback"}
                        </td>
                        <td className="rounded-r-xl px-3 py-3">
                        <div className="flex justify-end gap-2">
                            <Button
                            variant="secondary"
                            onClick={() => openEditModal(grade)}
                            aria-label="Edit grade"
                            >
                            <FiEdit2 />
                            </Button>
                            <Button
                            variant="secondary"
                            onClick={() => handleDelete(grade._id)}
                            aria-label="Delete grade"
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
                No grades match your filters.
            </div>
            )}
        </Card>

        {isModalOpen ? (
            <Modal
            title={editingGrade ? "Edit Grade" : "Add Grade"}
            onClose={() => setIsModalOpen(false)}
            >
            <form className="space-y-4" onSubmit={handleSubmit}>
                <select
                name="studentId"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-[var(--text)]"
                defaultValue={editingGrade?.student?._id || ""}
                required
                >
                <option value="">Select student</option>
                {students.map((student) => (
                    <option key={student._id} value={student._id}>
                        {student.firstName} {student.lastName}
                    </option>
                ))}
                </select>

                <div className="grid gap-3 sm:grid-cols-2">
                <select
                    name="subject"
                    className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-[var(--text)]"
                    defaultValue={editingGrade?.subject || ""}
                    required
                >
                    <option value="">Select subject</option>
                    {subjects.map((subject) => (
                    <option key={subject} value={subject}>
                        {subject}
                    </option>
                    ))}
                </select>

                <Input
                    name="score"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Score"
                    defaultValue={editingGrade?.score}
                    required
                />
                </div>

                <Input
                name="term"
                placeholder="Term, e.g. Q1"
                defaultValue={editingGrade?.term}
                required
                />

                <Input
                name="feedback"
                placeholder="Feedback"
                defaultValue={editingGrade?.feedback}
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
                    {editingGrade ? "Save Changes" : "Create Grade"}
                </Button>
                </div>
            </form>
            </Modal>
        ) : null}
        </motion.div>
    );
}