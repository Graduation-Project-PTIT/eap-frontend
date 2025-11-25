import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDiagrams, type DiagramResponse } from "@/api/services/diagram-service";
import { useDebounce } from "@/hooks/use-debounce";
import DiagramCard from "./components/DiagramCard";
import DiagramFilters from "./components/DiagramFilters";
import { ChevronLeft, ChevronRight, Database } from "lucide-react";

const DiagramGallery = () => {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(0);
  const pageSize = 12;

  // Debounce search input to reduce API calls
  const debouncedSearch = useDebounce(search, 500);

  // Reset to first page when search changes
  useEffect(() => {
    setPage(0);
  }, [debouncedSearch]);

  const { data, isLoading, error } = useDiagrams({
    search: debouncedSearch || undefined,
    sortBy,
    order,
    page,
    size: pageSize,
  });

  const handleClearFilters = () => {
    setSearch("");
    setSortBy("createdAt");
    setOrder("desc");
    setPage(0);
  };

  const handleNextPage = () => {
    if (data && page < data.totalPages - 1) {
      setPage(page + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 0) {
      setPage(page - 1);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database className="h-6 w-6" />
              <CardTitle>Diagram Gallery</CardTitle>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Browse and explore shared ERD diagrams from the community
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Filters */}
          <DiagramFilters
            search={search}
            onSearchChange={setSearch}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            order={order}
            onOrderChange={(value) => setOrder(value as "asc" | "desc")}
            onClear={handleClearFilters}
          />

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <p className="text-destructive">Failed to load diagrams. Please try again.</p>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/4 mt-2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Diagrams Grid */}
          {!isLoading && data && data.content.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.content.map((diagram: DiagramResponse) => (
                  <DiagramCard key={diagram.id} diagram={diagram} />
                ))}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Showing {page * pageSize + 1} to{" "}
                  {Math.min((page + 1) * pageSize, data.totalElements)} of {data.totalElements}{" "}
                  diagrams
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevPage}
                    disabled={page === 0}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <span className="text-sm">
                    Page {page + 1} of {data.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={page >= data.totalPages - 1}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* Empty State */}
          {!isLoading && data && data.content.length === 0 && (
            <div className="text-center py-12">
              <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No diagrams found</h3>
              <p className="text-muted-foreground">
                {search ? "Try adjusting your search criteria" : "Be the first to share a diagram!"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DiagramGallery;
