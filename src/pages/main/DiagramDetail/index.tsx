import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDiagram, useDeleteDiagram } from "@/api/services/diagram-service";
import { ArrowLeft, Eye, Calendar, Edit, Trash2, Download } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "@/lib/toast";
import VoteButtons from "./components/VoteButtons";
import ERDDiagram from "@/components/erd/diagram-view";
import getNodesForDiagram from "@/components/erd/utils/getNodesForDiagram";
import { getEdgesForDiagram } from "@/components/erd/utils/getEdgesForDiagram";
import getLayoutedElements from "@/components/erd/utils/getLayoutedElements";
import { useMemo, useState } from "react";
import { getCurrentUser } from "aws-amplify/auth";
import Editor from "@monaco-editor/react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const DiagramDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: diagram, isLoading, error } = useDiagram(id!);
  const deleteMutation = useDeleteDiagram();

  // Get current user
  useMemo(async () => {
    try {
      const user = await getCurrentUser();
      setCurrentUserId(user.userId);
    } catch {
      setCurrentUserId(null);
    }
  }, []);

  const isOwner = diagram && currentUserId && diagram.userId === currentUserId;

  const { nodes, edges } = useMemo(() => {
    if (!diagram?.schemaJson?.entities) {
      return { nodes: [], edges: [] };
    }
    const initialNodes = getNodesForDiagram(diagram.schemaJson.entities);
    return getLayoutedElements(initialNodes, getEdgesForDiagram(initialNodes));
  }, [diagram]);

  const handleDelete = async () => {
    if (!id) return;

    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Diagram deleted successfully");
      navigate("/diagrams");
    } catch {
      toast.error("Failed to delete diagram");
    }
  };

  const handleDownloadDDL = () => {
    if (!diagram) return;

    const blob = new Blob([diagram.ddlScript], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${diagram.title.replace(/\s+/g, "_")}_ddl.sql`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case "public":
        return "bg-green-500/10 text-green-500";
      case "private":
        return "bg-gray-500/10 text-gray-500";
      case "class":
        return "bg-blue-500/10 text-blue-500";
      default:
        return "bg-gray-500/10 text-gray-500";
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-96 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !diagram) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-destructive">Failed to load diagram. Please try again.</p>
            <Button variant="outline" onClick={() => navigate("/diagrams")} className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Gallery
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Button variant="ghost" size="sm" onClick={() => navigate("/diagrams")}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </div>
              <CardTitle className="text-2xl">{diagram.title}</CardTitle>
              <div className="flex items-center gap-3 mt-3 flex-wrap">
                <Badge className={getVisibilityColor(diagram.visibility)}>
                  {diagram.visibility}
                </Badge>
                {diagram.domain && <Badge variant="outline">{diagram.domain}</Badge>}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <VoteButtons
                diagramId={diagram.id}
                upvoteCount={diagram.upvoteCount}
                downvoteCount={diagram.downvoteCount}
                userVote={diagram.userVote}
                isOwner={!!isOwner}
              />
              {isOwner && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/diagrams/${id}/edit`)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Metadata */}
          <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground flex-wrap">
            {diagram.author && <span>by {diagram.author.username}</span>}
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{diagram.viewCount} views</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDistanceToNow(new Date(diagram.createdAt), { addSuffix: true })}</span>
            </div>
          </div>

          {/* Description */}
          {diagram.description && (
            <p className="mt-4 text-muted-foreground">{diagram.description}</p>
          )}
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="diagram" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="diagram">Diagram</TabsTrigger>
              <TabsTrigger value="ddl">DDL Script</TabsTrigger>
            </TabsList>

            {/* Diagram Tab */}
            <TabsContent value="diagram" className="mt-6">
              <Card className="h-[600px] overflow-hidden">
                <ERDDiagram initialNodes={nodes} initialEdges={edges} />
              </Card>
            </TabsContent>

            {/* DDL Script Tab */}
            <TabsContent value="ddl" className="mt-6">
              <div className="flex items-center justify-end mb-3">
                <Button variant="outline" size="sm" onClick={handleDownloadDDL}>
                  <Download className="h-4 w-4 mr-2" />
                  Download SQL
                </Button>
              </div>
              <Card className="overflow-hidden">
                <div className="h-[600px]">
                  <Editor
                    height="600px"
                    defaultLanguage="sql"
                    value={diagram.ddlScript}
                    options={{
                      readOnly: true,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      fontSize: 14,
                      lineNumbers: "on",
                      renderLineHighlight: "all",
                      scrollbar: {
                        vertical: "visible",
                        horizontal: "visible",
                      },
                    }}
                    theme="vs-dark"
                  />
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your diagram.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DiagramDetail;
