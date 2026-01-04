import type { DBEntity } from "@/api/services/evaluation-service";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Edit3, Plus, Save, Trash2 } from "lucide-react";
import type { ERDEntity } from "../erd-diagram-view/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EditEntityDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;

  defaultEntity: DBEntity | ERDEntity;
  editedEntity: DBEntity | ERDEntity;
  availableEntities: string[];
  onEntityDelete: () => void;
  setEditedEntity: (entity: DBEntity | ERDEntity) => void;

  // Atribute functions
  addAttribute: () => void;
  removeAttribute: (index: number) => void;
  updateAttribute: (index: number, field: string, value: unknown) => void;

  // Handle save
  handleSave: () => void;
}

const EditEntityDialog = ({
  isOpen,
  onOpenChange,

  defaultEntity,
  editedEntity,
  availableEntities,
  onEntityDelete,
  setEditedEntity,

  addAttribute,
  removeAttribute,
  updateAttribute,

  handleSave,
}: EditEntityDialogProps) => {
  return (
    <div className="flex items-center space-x-2">
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Edit3 className="h-4 w-4 mr-2" />
            Edit Entity
          </Button>
        </DialogTrigger>
        <DialogContent className="min-h-[50vh] max-h-[50vh] min-w-[50vw] flex flex-col justify-between">
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle>Edit Entity: {defaultEntity.name}</DialogTitle>
            </DialogHeader>
            <div>
              <label className="text-sm font-medium">Entity Name</label>
              <Input
                value={editedEntity.name}
                onChange={(e) => setEditedEntity({ ...editedEntity, name: e.target.value })}
                placeholder="Entity name"
              />
            </div>

            <div className="overflow-auto max-h-[35vh]">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Attributes</label>
                <Button variant="outline" size="sm" onClick={addAttribute}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Attribute
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>PK</TableHead>
                    <TableHead>FK</TableHead>
                    <TableHead>Unique</TableHead>
                    <TableHead>Nullable</TableHead>
                    <TableHead>FK Table</TableHead>
                    <TableHead>FK Column</TableHead>
                    <TableHead>Relation</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {editedEntity.attributes.map((attr, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Input
                          value={attr.name}
                          onChange={(e) => updateAttribute(index, "name", e.target.value)}
                          className="w-full"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={attr.type}
                          onChange={(e) => updateAttribute(index, "type", e.target.value)}
                          className="w-full"
                        />
                      </TableCell>
                      <TableCell>
                        <Checkbox
                          checked={attr.primaryKey}
                          onCheckedChange={(checked) =>
                            updateAttribute(index, "primaryKey", checked)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Checkbox
                          checked={attr.foreignKey}
                          onCheckedChange={(checked) =>
                            updateAttribute(index, "foreignKey", checked)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Checkbox
                          checked={attr.unique}
                          onCheckedChange={(checked) => updateAttribute(index, "unique", checked)}
                        />
                      </TableCell>
                      <TableCell>
                        <Checkbox
                          checked={attr.nullable}
                          onCheckedChange={(checked) => updateAttribute(index, "nullable", checked)}
                        />
                      </TableCell>
                      <TableCell>
                        {attr.foreignKey && (
                          <Select
                            value={attr.foreignKeyTable || ""}
                            onValueChange={(value) =>
                              updateAttribute(index, "foreignKeyTable", value)
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select table" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableEntities
                                .filter((name) => name !== defaultEntity.name)
                                .map((name) => (
                                  <SelectItem key={name} value={name}>
                                    {name}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>
                      <TableCell>
                        {attr.foreignKey && (
                          <Input
                            value={attr.foreignKeyAttribute || ""}
                            onChange={(e) =>
                              updateAttribute(index, "foreignKeyAttribute", e.target.value)
                            }
                            placeholder="id"
                            className="w-full"
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        {attr.foreignKey && (
                          <Select
                            value={attr.relationType || "many-to-one"}
                            onValueChange={(value) => updateAttribute(index, "relationType", value)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="one-to-one">One-to-One</SelectItem>
                              <SelectItem value="one-to-many">One-to-Many</SelectItem>
                              <SelectItem value="many-to-one">Many-to-One</SelectItem>
                              <SelectItem value="many-to-many">Many-to-Many</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAttribute(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          <div className="flex justify-between pt-4">
            <Button variant="destructive" onClick={onEntityDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Entity
            </Button>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EditEntityDialog;
