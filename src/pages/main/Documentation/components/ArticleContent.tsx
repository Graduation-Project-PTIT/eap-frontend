import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface ArticleContentProps {
  title: string;
  difficulty: string;
  readTime: string;
  content: React.ReactNode;
}

const ArticleContent = ({ title, difficulty, readTime, content }: ArticleContentProps) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-100 text-green-800 border-green-200";
      case "Intermediate":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Advanced":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="space-y-2">
          <CardTitle className="text-2xl">{title}</CardTitle>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className={getDifficultyColor(difficulty)}>
              {difficulty}
            </Badge>
            <span className="text-sm text-muted-foreground">{readTime}</span>
          </div>
        </div>
        <Separator />
      </CardHeader>
      <CardContent className="prose prose-gray max-w-none dark:prose-invert">{content}</CardContent>
    </Card>
  );
};

export default ArticleContent;
