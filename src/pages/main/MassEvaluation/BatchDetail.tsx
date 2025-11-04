import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Eye, RotateCw, Search, ChevronLeft, ChevronRight } from "lucide-react";
import {
  useBatch,
  useRetryTask,
  type MassEvaluationTask,
} from "@/api/services/mass-evaluation-service";
import BatchStatusBadge from "./components/BatchStatusBadge";
import TaskDetailDialog from "./components/TaskDetailDialog";
import ROUTES from "@/constants/routes";
import { formatDistanceToNow } from "date-fns";
import { toast } from "@/lib/toast";

const BatchDetail = () => {
  const { batchId } = useParams<{ batchId: string }>();
  const [selectedTask, setSelectedTask] = useState<MassEvaluationTask | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { data: batch, isLoading, error } = useBatch(batchId!);
  const retryTaskMutation = useRetryTask();

  const tasks = batch?.tasks || [];

  // Calculate completed and total tasks
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(
    (t) => t.status === "completed" || t.status === "failed",
  ).length;

  // Filter tasks by status and search query
  const filteredTasks = tasks.filter((task) => {
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    const matchesSearch = task.fileKey.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTasks = filteredTasks.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  const handleFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleLimitChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const handleViewTask = (task: MassEvaluationTask) => {
    setSelectedTask(task);
  };

  const handleRetryTask = async (task: MassEvaluationTask) => {
    try {
      await retryTaskMutation.mutateAsync(task.id);
      toast.success("Task retry initiated");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to retry task";
      toast.error(message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !batch) {
    return (
      <div className="space-y-4">
        <Link
          to={ROUTES.MASS_EVALUATION.ROOT}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Batches
        </Link>
        <div className="text-center py-12 text-destructive">
          Error loading batch details. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        to={ROUTES.MASS_EVALUATION.ROOT}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Batches
      </Link>

      {/* Batch Overview */}
      <Card>
        <CardHeader className="">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <CardTitle className="text-2xl">Batch #{batch.id.slice(0, 8)}</CardTitle>
              <BatchStatusBadge status={batch.status} />
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">
                  {completedTasks} / {totalTasks} tasks
                </span>
                <span className="text-muted-foreground">•</span>
                <span className="font-medium">
                  {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
                </span>
              </div>
            </div>
            {batch.averageScore !== null && (
              <div className="text-right">
                <div className="text-xs text-muted-foreground">Average Score</div>
                <div className="font-bold text-primary text-xl">
                  {batch.averageScore.toFixed(1)}
                </div>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="">
          {/* Description and metadata in one row */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <span className="text-sm font-semibold">Description: </span>
              <span className="text-sm text-muted-foreground">{batch.questionDescription}</span>
            </div>
            <div className="text-sm text-muted-foreground shrink-0">
              Created{" "}
              {batch.createdAt
                ? formatDistanceToNow(
                    new Date(
                      batch.createdAt.endsWith("Z") ? batch.createdAt : batch.createdAt + "Z",
                    ),
                    { addSuffix: true },
                  )
                : "N/A"}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Tasks ({filteredTasks.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by file key..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearchChange(searchQuery);
                  }
                }}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={handleFilterChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => handleSearchChange(searchQuery)}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>

          {/* Table */}
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No tasks found</div>
          ) : (
            <div className="space-y-4">
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40%]">File</TableHead>
                      <TableHead className="w-[15%]">Status</TableHead>
                      <TableHead className="w-[10%] text-center">Score</TableHead>
                      <TableHead className="w-[15%]">Created</TableHead>
                      <TableHead className="w-[20%] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedTasks.map((task) => (
                      <TableRow key={task.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell className="font-medium w-[40%]">{task.fileKey}</TableCell>
                        <TableCell className="w-[15%]">
                          <BatchStatusBadge status={task.status} />
                        </TableCell>
                        <TableCell className="w-[10%] text-center">
                          {task.status === "completed" && task.score !== null ? (
                            <span className="font-bold text-primary">{task.score}</span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="w-[15%] text-muted-foreground">
                          {task.createdAt
                            ? formatDistanceToNow(
                                new Date(
                                  task.createdAt.endsWith("Z")
                                    ? task.createdAt
                                    : task.createdAt + "Z",
                                ),
                                { addSuffix: true },
                              )
                            : "N/A"}
                        </TableCell>
                        <TableCell className="w-[20%] text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleViewTask(task)}>
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            {task.status === "failed" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRetryTask(task)}
                                disabled={retryTaskMutation.isPending}
                              >
                                <RotateCw className="h-4 w-4 mr-1" />
                                Retry
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredTasks.length)} of{" "}
                  {filteredTasks.length} tasks
                </div>
                <div className="flex items-center gap-2">
                  <Select value={itemsPerPage.toString()} onValueChange={handleLimitChange}>
                    <SelectTrigger className="w-[70px] h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {getPageNumbers().map((page, index) =>
                    page === "..." ? (
                      <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
                        ...
                      </span>
                    ) : (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page as number)}
                        className="min-w-[36px]"
                      >
                        {page}
                      </Button>
                    ),
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Task Detail Dialog */}
      <TaskDetailDialog
        task={selectedTask}
        open={!!selectedTask}
        onOpenChange={(open) => !open && setSelectedTask(null)}
      />
    </div>
  );
};

export default BatchDetail;
