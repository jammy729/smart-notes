
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";

interface Template {
  id: string;
  name: string;
  type: string;
  content: string;
  createdAt: string;
}

const TemplateManager = () => {
  const [templates, setTemplates] = useState<Template[]>([
    {
      id: "1",
      name: "Standard SOAP Note",
      type: "soap",
      content: `SUBJECTIVE:
{patient_complaint}

OBJECTIVE:
Vitals: {vitals}
Physical Exam: {physical_exam}

ASSESSMENT:
{assessment}

PLAN:
{plan}`,
      createdAt: "2024-01-15"
    },
    {
      id: "2",
      name: "Cardiology Consultation",
      type: "consultation",
      content: `CARDIOLOGY CONSULTATION

Chief Complaint: {chief_complaint}
History: {history}
Cardiac Risk Factors: {risk_factors}
Physical Examination: {physical_exam}
EKG: {ekg_findings}
Assessment and Plan: {assessment_plan}`,
      createdAt: "2024-01-10"
    }
  ]);

  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    type: "consultation",
    content: ""
  });

  const templateTypes = [
    { value: "consultation", label: "Consultation Note" },
    { value: "soap", label: "SOAP Note" },
    { value: "followup", label: "Follow-up Email" },
    { value: "discharge", label: "Discharge Summary" },
  ];

  const handleCreateTemplate = () => {
    if (!newTemplate.name || !newTemplate.content) return;
    
    const template: Template = {
      id: Date.now().toString(),
      ...newTemplate,
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    setTemplates([...templates, template]);
    setNewTemplate({ name: "", type: "consultation", content: "" });
    setIsCreating(false);
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(templates.filter(t => t.id !== id));
  };

  const handleEditTemplate = (id: string) => {
    setEditingId(id);
  };

  const handleSaveEdit = (id: string, updatedTemplate: Partial<Template>) => {
    setTemplates(templates.map(t => 
      t.id === id ? { ...t, ...updatedTemplate } : t
    ));
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Custom Templates</CardTitle>
              <CardDescription>Manage your personalized report templates</CardDescription>
            </div>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Template
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isCreating && (
            <Card className="mb-6 border-dashed">
              <CardHeader>
                <CardTitle className="text-lg">Create New Template</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Template Name</label>
                    <Input
                      placeholder="e.g., Pediatric Consultation"
                      value={newTemplate.name}
                      onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Template Type</label>
                    <select
                      className="w-full p-2 border rounded-md"
                      value={newTemplate.type}
                      onChange={(e) => setNewTemplate({...newTemplate, type: e.target.value})}
                    >
                      {templateTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Template Content</label>
                  <Textarea
                    placeholder="Enter your template content with variables like {patient_name}, {chief_complaint}, etc."
                    className="min-h-[200px] font-mono"
                    value={newTemplate.content}
                    onChange={(e) => setNewTemplate({...newTemplate, content: e.target.value})}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateTemplate}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Template
                  </Button>
                  <Button variant="outline" onClick={() => setIsCreating(false)}>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template) => (
              <Card key={template.id} className="relative">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary">
                          {templateTypes.find(t => t.value === template.type)?.label}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Created {template.createdAt}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditTemplate(template.id)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteTemplate(template.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {editingId === template.id ? (
                    <div className="space-y-4">
                      <Textarea
                        className="min-h-[150px] font-mono text-sm"
                        defaultValue={template.content}
                        onChange={(e) => {
                          const updatedContent = e.target.value;
                          // Store the updated content temporarily
                        }}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleSaveEdit(template.id, {})}
                        >
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <pre className="text-sm bg-gray-50 p-3 rounded overflow-auto max-h-40">
                      {template.content}
                    </pre>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TemplateManager;
