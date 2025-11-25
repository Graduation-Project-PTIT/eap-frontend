import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";

interface DiagramFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
  order: string;
  onOrderChange: (value: string) => void;
  onClear: () => void;
}

const DiagramFilters = ({
  search,
  onSearchChange,
  sortBy,
  onSortByChange,
  order,
  onOrderChange,
  onClear,
}: DiagramFiltersProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      {/* Search */}
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search diagrams..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-10"
        />
        {search && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
            onClick={() => onSearchChange("")}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Sort By */}
      <Select value={sortBy} onValueChange={onSortByChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="createdAt">Date Created</SelectItem>
          <SelectItem value="upvoteCount">Most Upvoted</SelectItem>
          <SelectItem value="viewCount">Most Viewed</SelectItem>
        </SelectContent>
      </Select>

      {/* Order */}
      <Select value={order} onValueChange={onOrderChange}>
        <SelectTrigger className="w-full sm:w-[140px]">
          <SelectValue placeholder="Order" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="desc">Descending</SelectItem>
          <SelectItem value="asc">Ascending</SelectItem>
        </SelectContent>
      </Select>

      {/* Clear Filters */}
      {(search || sortBy !== "createdAt" || order !== "desc") && (
        <Button variant="outline" onClick={onClear} className="w-full sm:w-auto">
          Clear Filters
        </Button>
      )}
    </div>
  );
};

export default DiagramFilters;
