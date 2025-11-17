import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Loader2, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { useBatches, type MassEvaluationBatch } from "@/api/services/mass-evaluation-service";
import BatchStatusBadge from "./components/BatchStatusBadge";
import CreateBatchDialog from "./components/CreateBatchDialog";
import ROUTES from "@/constants/routes";
import { formatDistanceToNow } from "date-fns";

const MassEvaluationList = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Fetch batches
  const { data, isLoading, error } = useBatches({
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const batches = data?.data || [];

  // Filter batches by search query
  const filteredBatches = batches.filter((batch) =>
    batch.questionDescription.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Pagination
  const totalPages = Math.ceil(filteredBatches.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBatches = filteredBatches.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  const handleFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleSearch = () => {
    setSearchQuery(searchInput);
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
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const handleRowClick = (batchId: string) => {
    navigate(ROUTES.MASS_EVALUATION.DETAIL.replace(":batchId", batchId));
  };

  const handleCreateSuccess = (batch: MassEvaluationBatch) => {
    setIsCreateDialogOpen(false);
    navigate(ROUTES.MASS_EVALUATION.DETAIL.replace(":batchId", batch.id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mass Evaluation</h1>
          <p className="text-muted-foreground">Manage and monitor your batch evaluations</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Batch
        </Button>
      </div>

      {/* Batches Table */}
      <Card>
        <CardHeader>
          <CardTitle>Batches ({filteredBatches.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by description..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
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
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-destructive">
              Error loading batches. Please try again.
            </div>
          ) : filteredBatches.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No batches found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Create your first batch to get started"}
              </p>
              {!searchQuery && statusFilter === "all" && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Batch
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Avg Score</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedBatches.map((batch) => (
                      <TableRow
                        key={batch.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleRowClick(batch.id)}
                      >
                        <TableCell className="font-medium max-w-md">
                          <p className="truncate" title={batch.questionDescription}>
                            {batch.questionDescription}
                          </p>
                        </TableCell>
                        <TableCell>
                          <BatchStatusBadge status={batch.status} />
                        </TableCell>
                        <TableCell>
                          {(() => {
                            const totalTasks = batch.totalTasks || 0;
                            const completedTasks = batch.completedTasks || 0;
                            const failedTasks = batch.failedTasks || 0;
                            const finishedTasks = completedTasks + failedTasks;
                            const progress =
                              totalTasks > 0 ? (finishedTasks / totalTasks) * 100 : 0;

                            return (
                              <div className="flex items-center gap-2">
                                <span className="text-sm">
                                  {finishedTasks} / {totalTasks}
                                </span>
                                <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-primary transition-all"
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })()}
                        </TableCell>
                        <TableCell>
                          {batch.averageScore !== null ? (
                            <span className="font-semibold">{batch.averageScore.toFixed(1)}</span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {batch.createdAt
                            ? formatDistanceToNow(
                                new Date(
                                  batch.createdAt.endsWith("Z")
                                    ? batch.createdAt
                                    : batch.createdAt + "Z",
                                ),
                                { addSuffix: true },
                              )
                            : "N/A"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between p-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredBatches.length)} of{" "}
                  {filteredBatches.length} batches
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

      {/* Create Dialog */}
      <CreateBatchDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
};

export default MassEvaluationList;
