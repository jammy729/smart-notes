
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Download, Send, Copy, Wand2, Shield, AlertTriangle } from "lucide-react";
import { useRecordings } from "@/hooks/useRecordings";
import { useReports, useGenerateReport } from "@/hooks/useReports";
import { useTemplates } from "@/hooks/useTemplates";
import { toast } from "sonner";

const ReportGenerator = () => {
  const [selectedReport, setSelectedReport] = useState("");
  const [selectedRecording, setSelectedRecording] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [customInstructions, setCustomInstructions] = useState("");
  const [aiProvider, setAiProvider] = useState("openai");
  const [apiKey, setApiKey] = useState("");
  
  const { data: recordings } = useRecordings();
  const { data: templates } = useTemplates();
  const generateReportMutation = useGenerateReport();

  const reportTypes = [
    { value: "consultation", label: "Consultation Note" },
    { value: "soap", label: "SOAP Note" },
    { value: "followup", label: "Follow-up Email" },
    { value: "discharge", label: "Discharge Summary" },
  ];

  const aiProviders = [
    { value: "openai", label: "OpenAI GPT-4" },
    { value: "groq", label: "Groq Llama" },
    { value: "anthropic", label: "Claude" },
  ];

  const generateReport = async () => {
    if (!selectedRecording || !selectedReport) {
      toast.error("Please select a recording and report type");
      return;
    }

    if (!apiKey) {
      toast.error("Please enter your AI API key");
      return;
    }

    try {
      await generateReportMutation.mutateAsync({
        recordingId: selectedRecording,
        reportType: selectedReport,
        templateId: selectedTemplate || undefined,
        aiProvider,
        apiKey,
        customInstructions
      });
      
      toast.success("Report generated successfully!");
    } catch (error) {
      toast.error("Failed to generate report");
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      {/* HIPAA Compliance Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-blue-800">HIPAA Compliance Notice</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-2">Important: Patient Data Protection</p>
              <ul className="list-disc list-inside space-y-1">
                <li>All patient data is encrypted in transit and at rest</li>
                <li>AI processing occurs through secure, HIPAA-compliant channels</li>
                <li>API keys are handled securely and not stored permanently</li>
                <li>Generated reports are stored with full encryption</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5" />
            AI Configuration
          </CardTitle>
          <CardDescription>Configure your AI provider for report generation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">AI Provider</label>
              <Select value={aiProvider} onValueChange={setAiProvider}>
                <SelectTrigger>
                  <SelectValue placeholder="Select AI provider" />
                </SelectTrigger>
                <SelectContent>
                  {aiProviders.map((provider) => (
                    <SelectItem key={provider.value} value={provider.value}>
                      {provider.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">API Key</label>
              <Input
                type="password"
                placeholder="Enter your API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Custom Instructions (Optional)</label>
            <Textarea
              placeholder="Add specific instructions for the AI (e.g., focus on certain aspects, use specific terminology)"
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Report Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Generate Report
          </CardTitle>
          <CardDescription>Generate AI-powered medical reports from your recordings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Recording Session</label>
              <Select value={selectedRecording} onValueChange={setSelectedRecording}>
                <SelectTrigger>
                  <SelectValue placeholder="Select recording" />
                </SelectTrigger>
                <SelectContent>
                  {recordings?.map((recording) => (
                    <SelectItem key={recording.id} value={recording.id}>
                      {recording.title} - {recording.patients?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Report Type</label>
              <Select value={selectedReport} onValueChange={setSelectedReport}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Template (Optional)</label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No template</SelectItem>
                  {templates?.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={generateReport} 
            disabled={!selectedRecording || !selectedReport || !apiKey || generateReportMutation.isPending}
            className="w-full"
            size="lg"
          >
            {generateReportMutation.isPending ? (
              <>
                <Wand2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Report with AI...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2" />
                Generate Report with AI
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportGenerator;
